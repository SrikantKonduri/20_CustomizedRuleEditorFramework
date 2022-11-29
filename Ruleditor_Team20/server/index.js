require('dotenv').config()
const express = require("express")
const bodyparser = require("body-parser")
const apiprocessor = require("./routes/apiprocessroutes")
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5001
const mongoose = require('mongoose')
app.use(cors());
app.options('*', cors());
app.use(bodyparser.text())
app.use(bodyparser.urlencoded({ extended: true }))
app.use('/api',apiprocessor)
mongoose.connect(process.env.DATABASE_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connection to MongoDB successfull...")).catch((err) => console.log("Unable to connect to MongoDB...", err));

app.listen(port, function () {console.log("Started application on port %d", port)});
module.exports= app