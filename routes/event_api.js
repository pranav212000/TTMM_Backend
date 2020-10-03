const express = require('express');
const Event = require('../models/event');
const constants = require('../constants');
const User = require('../models/user');
const { model } = require('mongoose');
const Group = require('../models/group');
const { eventId } = require('../constants');
const getOrder = require('./order_api').getOrder;
const Transaction = require('../models/transaction');
const router = express.Router();


router.post('/addEvent', function (req, res, next) {


    Event.create(req.body).then(function (event) {
        Group.findOneAndUpdate(
            { [constants.groupId]: req.query.groupId },
            { $push: { [constants.groupEvents]: event[constants.eventId] } },
            { new: true },
            function (error, success) {
                if (error) {
                    console.log("ERROR");
                    console.log(error);
                }
                else {
                    // console.log('Success');
                    // console.log(success);
                }
            }
        )
        Transaction.create({ [constants.transactionId]: event.transactionId }).then(function (transaction) {
            if (transaction === null) {
                console.log('Transaction not created, transaction Id: ' + event.transactionId);
                res.send({ isSuccess: false, message: 'Could not create transaction' });
            } else {
                res.send(event);
            }
        }).catch(next);
        // res.send(event);
    }).catch(next);
});

router.get('/', function (req, res, next) {
    Event.findOne({ [constants.eventId]: req.query.eventId }).then(function (event) {
        res.send(event);
    }).catch(next);
});



var getEvent = function (eventId) {
    return new Promise(function (resolve, reject) {
        Event.findOne({ [constants.eventId]: eventId }, function (error, event) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                if (event === null)
                    resolve({ message: 'Event NOT FOUND!' });
                else
                    resolve(event);
            }
        })
    })
}


router.get('/multiple', function (req, res, next) {
    var eventIds = req.body.eventIds;


    Promise.all(eventIds.map(getEvent))
        .then(events => res.send(events))
        .catch(error => res.send(error));
})


// Add new order also check if exists and update if already exists!
router.post('/:eventId/addOrder', function (req, res, next) {

    Order.create(req.body).then(function (order) {
        addOrderToEvent(order, req.params.eventId, res);

    }).catch(next);



    // Order.findOne({
    //     [constants.uid]: req.body[constants.uid],
    //     [constants.eventId]: req.body[constants.eventId],
    //     [constants.itemName]: req.body[constants.itemName]
    // }).countDocuments().then(function (cnt) {
    //     if (cnt !== 0) {
    //         Order.findOneAndUpdate(
    //             {
    //                 [constants.uid]: req.body[constants.uid],
    //                 [constants.eventId]: req.body[constants.eventId],
    //                 [constants.itemName]: req.body[constants.itemName]
    //             },
    //             {
    //                 $inc: {
    //                     [constants.quantity]: req.body[constants.quantity],
    //                     [constants.totalCost]: req.body[constants.totalCost]
    //                 },
    //             },
    //             { new: true },
    //             function (error, order) {
    //                 if (error)
    //                     console.log(error);
    //                 else {
    //                     console.log("Order Updated");
    //                     console.log(order);
    //                     addToTransaction(event, order, false);
    //                     res.send(order);
    //                     // console.log('SUCCESS');
    //                     // console.log(order);
    //                     // addToFinalOrder(order, req.params.eventId, res);
    //                 }
    //             }
    //         );
    //     }
    //     else {
    // Order.create(req.body).then(function (order) {
    //     addOrderToEvent(order, req.params.eventId, res);

    // }).catch(next);
    // }
    // }).catch(next);
});

function addOrderToEvent(order, eventId, res) {
    Event.findOneAndUpdate(
        { [constants.eventId]: eventId },
        { $push: { [constants.orders]: order[constants.orderId] } },
        { new: true },
        function (error, event) {
            if (error) {
                console.error(error);
                res.status(500).send({
                    message: 'Failed: to add order to event',
                    isSuccess: false,
                    error: error
                })
            } else {
                console.log("Order add to event");
                console.log({
                    'event': event,
                    'order': order
                });

                addToTransaction(event, order, true, res);
                console.log(event[constants.transactionId]);
                console.log(order[constants.totalCost]);

            }
        }
    )
}


function addToTransaction(event, order, isNew, res) {
    Transaction.findOneAndUpdate(
        { [constants.transactionId]: event[constants.transactionId] },
        { $inc: { [constants.totalCost]: order[constants.totalCost] } },
        { new: true },
        function (error, transaction) {
            if (error) {
                console.log(error);
                res.send({
                    isSuccess: false,
                    error: error
                });
            } else {
                if (transaction === null) {
                    console.log('Could not find transaction');
                    res.status(404).send({
                        isSuccess: false,
                        error: 'Could not find transaction'
                    });
                } else {
                    console.log("Amount added to transaction");
                    console.log(transaction);
                    res.send(order);
                }
            }
        }
    );
}



router.get('/:eventId/orders', function (req, res, next) {
    Event.findOne({ [constants.eventId]: req.params.eventId }, function (error, event) {
        if (error) {
            console.error(error);
            res.status(500).send({
                'isSuccess': false,
                result: error
            });
        } else {
            if (event === null)
                res.status(404).send({
                    message: 'Coud not find the event with event id : ' + req.params.eventId
                });
            else {
                var orders = event[constants.orders];

                Promise.all(orders.map(getOrder))
                    .then(response => {
                        res.send(response);
                    })
                    .catch(error => {
                        res.send(error);
                    });
            }
        }
    });
});



module.exports = router;