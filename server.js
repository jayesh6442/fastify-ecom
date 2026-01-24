// server.js
const Fastify = require('fastify');
const { BoundedQueue } = require('./queue');
const { isDuplicate } = require('./idempotency');
// server.js (add this)
const { startWorker } = require('./worker');

const app = Fastify({ logger: true });

const MAX_QUEUE = 50_000;
const MAX_PAYLOAD_BYTES = 2048;

const queue = new BoundedQueue(MAX_QUEUE);


app.post('/v1/events', {
    schema: {
        body: {
            type: 'object',
            required: ['event_id', 'type', 'timestamp', 'payload'],
            properties: {
                event_id: { type: 'string', minLength: 8 },
                type: { type: 'string' },
                timestamp: { type: 'number' },
                payload: { type: 'object' }
            }
        }
    }
}, async (req, reply) => {
    // size guard
    const bytes = Buffer.byteLength(JSON.stringify(req.body));
    if (bytes > MAX_PAYLOAD_BYTES) {
        return reply.code(413).send({ error: 'payload too large' });
    }

    const { event_id } = req.body;

    // idempotency: accept duplicates without pressure
    if (isDuplicate(event_id)) {
        return reply.code(202).send({ status: 'accepted' });
    }

    // backpressure: accept OR reject, never wait
    const ok = queue.enqueue(req.body);
    if (!ok) {
        return reply.code(429).send({ error: 'queue full, retry later' });
    }

    return reply.code(202).send({ status: 'accepted' });

});

startWorker(queue);

app.get('/internal/metrics', async () => ({
    queueSize: queue.size(),
    rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
}));


app.listen({ port: 3000 }, err => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});
