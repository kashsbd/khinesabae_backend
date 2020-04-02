const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose");
const config = require('./api/config/config');
const userRouter = require('./api/routes/users');
const itemRouter = require('./api/routes/items');
const categoryRouter = require('./api/routes/categories');
const homePageRouter = require('./api/routes/home-page');
const headerPageRouter = require('./api/routes/header-page');

//db config
mongoose.Promise = global.Promise;
mongoose.connect(config.MONGO_PATH, { useNewUrlParser: true, autoIndex: false, useCreateIndex: true, }, (err) => {
    if (err) {
        console.log("Can't connect to db.");
    } else {
        console.log('Connected to db.')
    }
});

let app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app routes
app.use('/users', userRouter);
app.use('/items', itemRouter);
app.use('/categories', categoryRouter);
app.use('/home_page', homePageRouter);
app.use('/header_page', headerPageRouter);


app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

module.exports = { app };
