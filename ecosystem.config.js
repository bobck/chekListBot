module.exports = {
    apps: [{
        name: "chekListBot",
        script: "app.mjs",
        watch: false,
        node_args: 'ENV=prod -r dotenv/config'
    }]
}