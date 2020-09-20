const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



// Set up express app
const app = express();

// Connect to mongoDb
mongoose.connect('mongodb://localhost/ttmm', {useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true, useFindAndModify: false});

mongoose.Promise = global.Promise;

// Use body parser
app.use(bodyParser.json());


// Initialize the routes
app.use('/api/user', require('./routes/user_api'));
app.use('/api/group', require('./routes/group_api'));
app.use('/api/event', require('./routes/event_api'));
app.use('/api/order', require('./routes/order_api'));

// Error handling middleware
app.use(function(err, req, res, next) {
    // console.log(err);
    res.status(422).send({error: err.message});
});


// listen for requests
app.listen(process.env.port || 4000, function () {
    console.log('Listening for requests');
});
