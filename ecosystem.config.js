module.exports = {
    apps: [{
        name: "chekListBot",
        script: "./app.mjs",
        watch: false,
        node_args: '-r dotenv/config',
        env: {
            ENV: "prod",
        }
    }]
}