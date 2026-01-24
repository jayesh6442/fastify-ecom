// worker.js
function startWorker(queue) {
    const BATCH_SIZE = 5;
    const FLUSH_INTERVAL_MS = 1000;

    setInterval(() => {
        const batch = [];

        while (batch.length < BATCH_SIZE) {
            const item = queue.dequeue();
            if (!item) break;
            batch.push(item);
        }

        if (batch.length > 0) {
            processBatch(batch);
        }
    }, FLUSH_INTERVAL_MS);
}

function processBatch(batch) {
    // Simulate slow DB (300–700ms)
    const delay = 300 + Math.random() * 400;

    setTimeout(() => {
        // Simulate random DB failure
        if (Math.random() < 0.1) {
            console.error("❌ DB write failed for batch:", batch.length);
            return;
        }

        console.log(`✅ DB wrote batch of ${batch.length}`);
    }, delay);
}

module.exports = { startWorker };
