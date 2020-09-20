const express = require('express');
const Event = require('../models/event');
const constants = require('../constants');
const User = require('../models/user');
const { model } = require('mongoose');
const Group = require('../models/group');

const router = express.Router();


router.post('/:groupId/addEvent', function (req, res, next) {
    Event.create(req.body).then(function (event) {
        Group.findOneAndUpdate(
            { [constants.groupId]: req.params.groupId },
            { $push: { [constants.groupEvents]: event[constants.eventId] } },
            { new: true },
            function (error, success) {
                if (error) {
                    console.log("ERROR");
                    console.log(error);
                }
                else {
                    console.log('Success');
                    console.log(success);
                }
            }
        )
        res.send(event);
    }).catch(next);
});

router.get('/:eventId', function (req, res, next) {
    Event.findOne({ [constants.eventId]: req.params.eventId }).then(function (event) {
        res.send(event);
    }).catch(next);
});



router.post('/')



module.exports = router;