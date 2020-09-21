const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');



// Set up express app
const app = express();

app.set('view engine', 'ejs');


// TODO check one before upload
// Connect to mongoDB local host
// mongoose.connect('mongodb://localhost/ttmm', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
// Connect to mongoDB atlas
mongoose.connect('mongodb+srv://dbUser:cAfoxVXZNqiXKdID@cluster0.fdsc5.mongodb.net/ttmmdb?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });


mongoose.Promise = global.Promise;

// Use body parser
app.use(bodyParser.json());

app.use(express.static('./public'));

// Initialize the routes
app.use('/api/user', require('./routes/user_api'));
app.use('/api/group', require('./routes/group_api'));
app.use('/api/event', require('./routes/event_api'));
app.use('/api/order', require('./routes/order_api').router);

app.get('/', function (req, res) {
    res.render('home');
});
// Error handling middleware
app.use(function (err, req, res, next) {
    // console.log(err);
    res.status(422).send({ error: err.message });
});


// listen for requests
app.listen(process.env.port || 4000, function () {
    console.log('Listening for requests');
});
