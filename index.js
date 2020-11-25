const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()


// Set up express app
const app = express();

app.set('view engine', 'ejs');


// TODO check one before upload
// Connect to mongoDB local host
// mongoose.connect('mongodb://localhost/ttmm', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
// Connect to mongoDB atlas


// Public bulao jisko
// Delete karna hai karao
// Mere saath shart lagaao
// Yeh yeh yeh karke dikhao (DELETE KARKE DIKHAO)
// Yeh phir yeh
// Ab yeh yeh ye karke dikhao
// Yeh karke dikhao
// Chalo yeh karke dikhao 
//  - YO YO HONEY SINGH ft. me ;)
mongoose.connect(process.env.DBURL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });


mongoose.Promise = global.Promise;

// Use body parser
app.use(bodyParser.json());

app.use(express.static('./public'));

// Initialize the routes
app.use('/api/user', require('./routes/user_api'));
app.use('/api/group', require('./routes/group_api'));
app.use('/api/event', require('./routes/event_api').router);
app.use('/api/order', require('./routes/order_api').router);
app.use('/api/transaction', require('./routes/transaction_api').router);
app.use('/api/firebase', require('./routes/firebase_api'));

app.get('/', function (req, res) {
    res.render('home');
});
// Error handling middleware
app.use(function (err, req, res, next) {
    console.log(err.message);
    res.status(422).send({ error: err.message });
});


// listen for requests
app.listen(process.env.PORT || 4000, function () {
    console.log('Listening for requests');
});



// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://ttmm-d9b4f.firebaseio.com"
// });


// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://ttmm-d9b4f.firebaseio.com"
// });
