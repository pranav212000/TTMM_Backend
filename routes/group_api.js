const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const router = express.Router();


router.post('/addGroup', function (req, res, next) {
    Group.create(req.body).then(function (group) {
        var userids = req.body[constants.groupMembers];
        if (userids.length !== 0) {
            console.log(userids.length);
            console.log(userids);
            userids.forEach(uid => {
                User.findOneAndUpdate(
                    { [constants.uid]: uid },
                    { $push: { [constants.groups]: group[constants.groupId] } },
                    { new: true },
                    function (error, success) {
                        if (error)
                            console.log(error);
                        // else
                        //     console.log(success);
                    }
                )
            });
        }
        res.send(group);
    }).catch(next);
});


router.get('/:groupId', function (req, res, next) {
    Group.findOne({ [constants.groupId]: req.params.groupId }).then(function (group) {
        res.send(group);
    }).catch(next);
})



// // Get user data
// router.get('/:uid', function (req, res, next) {
//     User.findOne({ [constants.uid]: req.params.uid }).then(function (user) {
//         res.send(user);
//     }).catch(next);
// });



// // Check if user is present or not      if present -> true
// router.get('/checkUser/:uid', function (req, res, next) {
//     User.find({ [constants.uid]: req.params.uid }).count().then(function (cnt) {
//         if (cnt === 0)
//             res.send(false);
//         else
//             res.send(true);
//     }).catch(next);
// });








module.exports = router;