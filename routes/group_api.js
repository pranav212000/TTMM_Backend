const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const getEvent = require('./event_api').getEvent;
const { phoneNumber, groupId } = require('../constants');
const router = express.Router();


router.post('/addGroup', function (req, res, next) {
    if (req.body[constants.groupIconUrl] === null || req.body[constants.groupIconUrl] === "")
        req.body[constants.groupIconUrl] = "https://firebasestorage.googleapis.com/v0/b/ttmm-d9b4f.appspot.com/o/placeholders%2Fgroup_placeholder.png?alt=media&token=e0d875be-8f8f-4ae5-840b-855c549e30ec";
    Group.create(req.body).then(function (group) {
        var phoneNumbers = req.body[constants.groupMembers];
        if (phoneNumbers.length !== 0) {
            console.log(phoneNumbers.length);
            console.log(phoneNumbers);
            phoneNumbers.forEach(phoneNumber => {
                User.findOneAndUpdate(
                    { [constants.phoneNumber]: phoneNumber },
                    { $push: { [constants.groups]: group[constants.groupId] } },
                    { new: true },
                    function (error, success) {
                        if (error) {
                            console.log(error);
                            res.status(500).send({ message: error });
                        }
                        // else
                        //     console.log(success);
                    }
                )
            });
        }
        res.send(group);
    }).catch(next);
});

router.get('/', function (req, res, next) {
    Group.findOne({ [constants.groupId]: req.query.groupId }).then(function (group) {
        res.send(group);
    }).catch(next);
})

var getGroup = function (groupId) {
    return new Promise(function (resolve, reject) {
        Group.findOne({ [constants.groupId]: groupId }, function (error, group) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                if (group === null)
                    resolve({ message: 'Group NOT FOUND!' });
                else
                    resolve(group);
            }
        })
    })
}

router.get('/multiple', function (req, res, next) {
    var groupIds = req.body.groupIds;


    Promise.all(groupIds.map(getGroup))
        .then(groups => res.send(groups))
        .catch(error => res.send(error));
});


router.get('/:groupId/events', function (req, res, next) {
    getGroupEvents(req.params.groupId, function (result) {
        if (result.isSuccess) {
            res.send(result.response);
        } else {
            res.status(result.status).send(result.error);
        }
    });
});


router.get(':groupId/members', function (req, res, next) {
    Group.findOne({ [constants.groupId]: req.params.groupId }).then(function (group) {
        if (group === null) {
            console.log('Could not find the group');
            res.status(404).send({ isSuccess: false, error: "Could not find the group" });
        } else {
            res.send(group[constants.groupMembers]);
        }
    }).catch(next);
});


getGroupEvents = function (groupId, callback) {
    Group.findOne({ [constants.groupId]: groupId }, function (error, group) {
        if (error) {
            console.error(error);
            callback({ isSuccess: false, error: error, status: 500 });
        } else {
            if (group === null) {
                callback({
                    isSuccess: false,
                    error: 'Could not find group with id : ' + req.params.groupId,
                    status: 404
                });
            }
            else {
                var events = group[constants.groupEvents];

                Promise.all(events.map(getEvent))
                    .then(response => {
                        callback({ isSuccess: true, response: response });
                    })
                    .catch(error => {
                        callback({ isSuccess: false, error: error });
                    });
            }

        }
    })
}

module.exports = router;