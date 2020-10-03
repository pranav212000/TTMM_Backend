const express = require('express');
const Event = require('../models/event');
const constants = require('../constants');
const User = require('../models/user');
const { model } = require('mongoose');
const Group = require('../models/group');
const { eventId } = require('../constants');
const Transaction = require('../models/transaction');
const getOrder = require('./order_api').getOrder;

const router = express.Router();


// router.post('/addTransaction', function (req, res, next) {
//     Transaction.create().then(function (transaction) {
//         res.send(transaction);
//     }).catch(next);
// });


router.post('/paid', function (req, res, next) {
    var body = req.body;

    getEvent(req.query.eventId, function (event) {
        if (event === null) {
            res.status(404).send({ isSuccess: false, error: 'Could not find event' });
        } else {
            var transactionId = event[constants.transactionId];
            Transaction.findOneAndUpdate(
                { [constants.transactionId]: transactionId },
                {
                    $push: {
                        [constants.paid]: {
                            [constants.phoneNumber]: body[constants.phoneNumber],
                            [constants.amount]: body[constants.amount]
                        }
                    },
                    $inc: {
                        [constants.totalPaid]: body[constants.amount]
                    }
                },
                { new: true },
                function (error, transaction) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ isSuccess: false, error: error });
                    } else {
                        res.send(transaction);
                    }

                }
            )
        }
    });
});


function getEvent(eventId, callback) {
    console.log(eventId);
    Event.findOne({ [constants.eventId]: eventId }).then(function (event) {
        console.log(event);
        callback(event);
    });
}



router.post('/spiltEvenly', function (req, res, next) {
    Group.findOne({ [constants.groupEvents]: req.query.eventId }).then(function (group) {
        if (group === null) {
            console.log('Could not find group');
            res.statusCode(404).send({ isSuccess: false, error: 'Could not find the group having event : ' + req.query.eventId });
        } else {
            var members = group[constants.groupMembers];
            console.log(members);
            Transaction.findOne({ [constants.transactionId]: req.query.transactionId })
                .then((transaction) => {
                    if (transaction === null) {
                        console.log('Could not find transaction');
                        res.statusCode(404).send({ isSuccess: false, error: 'Could not find the transaction' });
                    }
                    var totalCost = transaction[constants.totalCost];
                    var paid = transaction[constants.paid];
                    var sharePerMember = totalCost / members.length;
                    var toGive = [];
                    var toGet = [];
                    members.forEach(member => {
                        var result = paid.find(obj => {
                            return obj[constants.phoneNumber] === member;
                        });
                        var paidAmount;
                        if (result === undefined) {
                            paidAmount = 0;
                        } else {
                            paidAmount = result[constants.amount];
                        }
                        console.log(paidAmount);
                        if (paidAmount < sharePerMember)
                            toGive.push({ [constants.phoneNumber]: member, [constants.amount]: sharePerMember - paidAmount });
                        else if (paidAmount > sharePerMember)
                            toGet.push({ [constants.phoneNumber]: member, [constants.amount]: paidAmount - sharePerMember });


                    });


                    transaction[constants.toGive] = toGive;
                    transaction[constants.toGet] = toGet;

                    transaction.markModified([constants.toGive]);
                    transaction.markModified([constants.toGet]);

                    transaction.save(function (error) {
                        if (error) {
                            console.log(error);
                            res.statusCode(500).send({ isSuccess: false, error: error });
                        } else {
                            res.send(transaction);
                        }
                    })


                });
            // Transaction.findOneAndUpdate(
            //     { [constants.transactionId]: req.query.transactionId },
            //     {}
            // )
        }
    }).catch(next);

});





module.exports = router;