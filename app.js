const express = require('express');
const bodyParser = require('body-parser');
require('@google-cloud/debug-agent').start();
const app = express();
const recordRouter = require('./routes/record');

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use(recordRouter)

app.get("/", (req, res) => {
    console.log("Response success")
    res.send("Response Success!")
})

// Start the server
const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is up and listening on " + PORT)
})
