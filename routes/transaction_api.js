const express = require('express');
const Event = require('../models/event');
const constants = require('../constants');
const User = require('../models/user');
const { model } = require('mongoose');
const Group = require('../models/group');
const { eventId, totalPaid, phoneNumber } = require('../constants');
const Transaction = require('../models/transaction');
const getOrder = require('./order_api').getOrder;
const getEventOrders = require('./event_api').getEventOrders;

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

            Transaction.findOne({ [constants.transactionId]: transactionId })
                .then(function (transaction) {
                    if (transaction === null) {
                        console.log('Could not find transaction');
                        res.status(404).send({ isSuccess: false, error: 'Could not find transaction' });
                    }
                    else {
                        var paid = transaction[constants.paid];
                        var paidIndex = paid.findIndex(obj =>
                            obj[constants.phoneNumber] === body[constants.phoneNumber] &&
                            obj[constants.paymentMode] === body[constants.paymentMode]);
                        if (paidIndex === -1) {
                            paid.push({
                                [constants.phoneNumber]: body[constants.phoneNumber],
                                [constants.amount]: body[constants.amount],
                                [constants.paymentMode]: body[constants.paymentMode]

                            });
                            transaction[constants.paid] = paid;
                        } else {
                            var paidAmount = paid[paidIndex][constants.amount];
                            paid[paidIndex][constants.amount] = paidAmount + Number.parseInt(body[constants.amount]);
                            transaction[constants.paid] = paid;
                        }
                        var toGet = transaction[constants.toGet];
                        var toGive = transaction[constants.toGive];

                        var index = toGive.findIndex(ele => ele[constants.phoneNumber] === body[constants.phoneNumber]);


                        if (index === -1) {
                            // TODO search in to get
                            var index1 = toGet.findIndex(ele => ele[constants.phoneNumber] === body[constants.phoneNumber]);
                            if (index === -1) {
                                toGet.push({
                                    [constants.phoneNumber]: body[constants.phoneNumber],
                                    [constants.amount]: body[constants.amount]
                                });
                            } else {
                                toGet[index1][constants.amount] += body[constants.amount];
                            }

                        } else {
                            var amount = toGive[index][constants.amount];
                            if (body[constants.amount] > amount) {       //paid more than toGive => remove from toGive and add to toGet
                                toGive.splice(index, 1);
                                toGet.push({
                                    [constants.phoneNumber]: body[constants.phoneNumber],
                                    [constants.amount]: body[constants.amount] - amount
                                });

                            } else {
                                toGive[index][constants.amount] = amount - body[constants.amount];
                            }
                        }

                        transaction[constants.toGive] = toGive;
                        transaction[constants.toGet] = toGet;
                        transaction[constants.totalPaid] += body[constants.amount];

                        transaction.markModified([constants.toGive]);
                        transaction.markModified([constants.toGet]);
                        transaction.markModified([constants.paid]);


                        transaction.save(function (error) {
                            if (error) {
                                console.log(error);
                                res.status(500).send({ isSuccess: false, error: error });
                            } else {
                                res.send(transaction);
                            }
                        });
                    }


                }).catch(next);



            // Transaction.findOneAndUpdate(
            //     { [constants.transactionId]: transactionId },
            //     {
            //         $push: {
            //             [constants.paid]: {
            //                 [constants.phoneNumber]: body[constants.phoneNumber],
            //                 [constants.amount]: body[constants.amount]
            //             }
            //         },
            //         $inc: {
            //             [constants.totalPaid]: body[constants.amount]
            //         }
            //     },
            //     { new: true },
            //     function (error, transaction) {
            //         if (error) {
            //             console.log(error);
            //             res.status(500).send({ isSuccess: false, error: error });
            //         } else {

            //         }

            //     }
            // )
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


// ASSUMES total cost is correct maybe changed later
router.post('/spiltEvenly', function (req, res, next) {
    Group.findOne({ [constants.groupEvents]: req.query.eventId }).then(function (group) {
        if (group === null) {
            console.log('Could not find group');
            res.status(404).send({ isSuccess: false, error: 'Could not find the group having event : ' + req.query.eventId });
        } else {
            var members = group[constants.groupMembers];
            // console.log(members);
            Transaction.findOne({ [constants.transactionId]: req.query.transactionId })
                .then((transaction) => {
                    if (transaction === null) {
                        console.log('Could not find transaction');
                        res.status(404).send({ isSuccess: false, error: 'Could not find the transaction' });
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
                        // console.log(paidAmount);
                        if (paidAmount < sharePerMember)
                            toGive.push({ [constants.phoneNumber]: member, [constants.amount]: sharePerMember - paidAmount });
                        else if (paidAmount > sharePerMember)
                            toGet.push({ [constants.phoneNumber]: member, [constants.amount]: paidAmount - sharePerMember });


                    });


                    transaction[constants.toGive] = toGive;
                    transaction[constants.toGet] = toGet;
                    transaction[constants.split] = constants.evenly;

                    transaction.markModified([constants.toGive]);
                    transaction.markModified([constants.toGet]);
                    transaction.markModified([constants.split]);

                    transaction.save(function (error) {
                        if (error) {
                            console.log(error);
                            res.status(500).send({ isSuccess: false, error: error });
                        } else {
                            res.send(transaction);
                        }
                    });
                });
        }
    }).catch(next);

});

// TODO SPLIT BY QUANTITY one orders one roti
//! Therse split apis are kept so that in case user change the split mode to even to byorder these can be called.
router.post('/splitByOrder', function (req, res, next) {
    getEventOrders(req.query.eventId, function (result) {
        // console.log(result);
        if (!result.isSuccess) {
            res.status(500).send(result.error);
        } else {
            var orders = result.response;
            var members = [];

            var transTotal = 0;
            orders.forEach(order => {
                var phoneNumbers = order[constants.phoneNumber];

                var totalCost = order[constants.totalCost];
                transTotal += totalCost;
                var sharePerMember = totalCost / phoneNumbers.length;

                phoneNumbers.forEach(phoneNumber => {
                    var index = members.findIndex(member => member[constants.phoneNumber] === phoneNumber);


                    var isPresent = index !== -1;

                    if (isPresent) {
                        members[index][constants.amount] += sharePerMember;
                    } else {
                        members.push({ [constants.phoneNumber]: phoneNumber, [constants.amount]: sharePerMember });
                    }

                });

            });



            Transaction.findOne({ [constants.transactionId]: req.query.transactionId }).then(function (transaction) {

                if (transaction === null) {
                    console.log('Could not find the transaction');
                    res.status(404).send({ isSuccess: false, error: 'Could not find the transaction' });

                } else {

                    transaction[constants.totalCost] = transTotal;
                    var paid = transaction[constants.paid];
                    var toGet = [];
                    var toGive = [];

                    members.forEach(member => {

                        var result = paid.find(obj => {
                            return obj[constants.phoneNumber] === member[constants.phoneNumber];
                        });
                        var paidAmount;
                        if (result === undefined) {
                            paidAmount = 0;
                        } else {
                            paidAmount = result[constants.amount];
                        }
                        if (paidAmount < member[constants.amount]) {
                            toGive.push({
                                [constants.phoneNumber]: member[constants.phoneNumber],
                                [constants.amount]: member[constants.amount] - paidAmount
                            });
                        }
                        else if (paidAmount > member[constants.amount]) {
                            toGet.push({
                                [constants.phoneNumber]: member[constants.phoneNumber],
                                [constants.amount]: paidAmount - member[constants.amount]
                            });
                        }

                    });


                    transaction[constants.toGive] = toGive;
                    transaction[constants.toGet] = toGet;
                    transaction[constants.split] = constants.byOrder;


                    transaction.markModified([constants.totalCost]);
                    transaction.markModified([constants.toGive]);
                    transaction.markModified([constants.toGet]);
                    transaction.markModified([constants.split]);

                    transaction.save(function (error) {
                        if (error) {
                            console.log(error);
                            res.status(500).send({ isSuccess: false, error: error });
                        } else {
                            res.send(transaction);
                        }
                    })

                }


            });

        }
    })
});





module.exports = router;