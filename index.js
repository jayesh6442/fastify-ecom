import Fastify from "fastify";

const fastify = Fastify({
    logger: true
})


fastify.get("/one", async (req, res) => {
    res.send("hi there we are in the fastify ")
})




fastify.listen({ port: 3000 }, err => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});