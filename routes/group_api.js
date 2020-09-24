const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const { phoneNumber, groupId } = require('../constants');
const router = express.Router();


router.post('/addGroup', function (req, res, next) {
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


module.exports = router;