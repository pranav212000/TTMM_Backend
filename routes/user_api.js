const express = require('express');
const User = require('../models/user');
const Group = require('../models/group');
const constants = require('../constants');
const router = express.Router();


router.post('/addUser', function (req, res, next) {
    User.create(req.body).then(function (user) {
        console.log("User added");
        res.send(user);
    }).catch(next);
});


// Get user data
router.get('/:uid', function (req, res, next) {
    User.findOne({ [constants.uid]: req.params.uid }).then(function (user) {
        res.send(user);
    }).catch(next);
});



// Check if user is present or not      if present -> true
router.get('/checkUser/:uid', function (req, res, next) {
    User.find({ [constants.uid]: req.params.uid }).count().then(function (cnt) {
        if (cnt === 0)
            res.send(false);
        else
            res.send(true);
    }).catch(next);
});








module.exports = router;