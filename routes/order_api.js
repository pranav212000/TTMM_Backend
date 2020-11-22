const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const Order = require('../models/order');
const { itemName, eventId, orderId } = require('../constants');
const e = require('express');
const router = express.Router();

var getOrder = function (orderId) {
    return new Promise(function (resolve, reject) {
        Order.findOne({ [constants.orderId]: orderId }, function (error, order) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                if (order === null)
                    reject('COULD NOT FIND ORDER');
                else {
                    console.log(order);
                    resolve(order);
                }
            }
        });
    });
}


router.get('/', function (req, res, next) {

    getOrder(req.query.orderId).then((order) => {
        if (order === null) {
            res.status(404).send(null);
        } else {
            res.send(order);
        }
    }).catch((error) => {
        res.send(error);
    })
});


router.delete('/deleteOrder', function (req, res, next) {

    Order.findOne({ [constants.orderId]: req.query.orderId }, function (error, order) {
        if (error) {
            console.log(error);
            res.send({ message: error, isSuccess: false });
        } else {
            if (order === null) {
                console.log('Could not find order');
                res.status(404).send({ message: 'Could not find order', isSuccess: false });
            } else {
                var eventId = order.eventId;
                Event.findOneAndUpdate(
                    { [constants.eventId]: eventId },
                    { $pull: { [constants.orders]: req.query.orderId } },
                    { new: true },
                    function (error, event) {
                        if (error) {
                            console.log(error);
                            res.send({ message: error, isSuccess: false });
                        } else {
                            if (event === null) {
                                res.status(404).send({ message: 'Could not find the event', isSuccess: false });
                            } else {
                                Order.findOneAndDelete(
                                    { [constants.orderId]: req.query.orderId },
                                    function (error) {
                                        if (error) {
                                            console.log(err);
                                            res.send({ isSuccess: false, message: err });
                                        } else {
                                            res.send({ isSuccess: true, message: 'Success' });
                                        }
                                    }
                                )
                            }
                        }
                    }
                );
            }
        }
    });


    // Order.findOneAndDelete(
    //     { [constants.orderId]: req.query.orderId },
    //     function (error) {
    //         if (error) {
    //             res.send({ isSuccess: false });
    //         } else
    //             res.send({ isSuccess: true });
    //     }
    // );
});

// Edit the order
router.put('/updateOrder', function (req, res, next) {

    Order.findOneAndUpdate(
        { [constants.orderId]: req.query.orderId },
        req.body,
        { new: true },
        function (error, order) {
            if (error) {
                console.log(error);
                res.status(500).send(error);
            } else {
                if (order === null) {
                    res.status(404).send({ message: 'Could not find order' });
                } else {
                    res.send(order);
                }
            }

        });
});


router.put('/updateQuantity', function (req, res, next) {

    Order.findOne({ [constants.orderId]: req.query.order }).then(function (order) {
        if (order === null) {
            res.status(404).send({ isSuccess: false, message: 'Could not find the order' });
        } else {
            var members = order[constants.members];

            var index = members.findIndex(obj => obj[constants.phoneNumber] === req.query.phoneNumber);

            if (index !== -1) {
                members[index] = {
                    [constants.phoneNumber]: req.query.phoneNumber,
                    [constants.quantity]: req.query.quantity
                };
            } else {
                members.push({
                    [constants.phoneNumber]: req.query.phoneNumber,
                    [constants.quantity]: req.query.quantity
                });
            }

            order[constants.members] = members;
            order.markModified([constants.members]);
            order.save(function (error) {
                if (error) {
                    console.log(error);
                    res.status(500).send({ isSuccess: false, error: error });
                } else {
                    res.send(order);
                }
            });
        }
    });
});


// TODO handle transaction on addition of order


module.exports = {
    router: router,
    getOrder: getOrder
};