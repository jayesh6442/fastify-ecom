import Fastify from "fastify";

const fastify = Fastify({
    logger: true
})


fastify.get("/one", async (req, res) => {
    res.send("hi there we are in the fastify ")
})


fastify.listen(3000, () => {
    console.log("Running Server On Port: 3000");
})