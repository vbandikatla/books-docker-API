const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require("./config")

require("./services/cache");
require("./models/Book");

const app = express();
app.use(bodyParser.json());

mongoose.connect(config.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true 
});

require("./routes/book")(app);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
});