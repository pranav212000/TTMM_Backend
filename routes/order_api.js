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
                console.log(order);
                resolve(order);
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
    Order.findOneAndDelete(
        { [constants.orderId]: req.query.orderId },
        function (error) {
            if (error) {
                res.send({ isSuccess: false });
            } else
                res.send({ isSuccess: true });
        }
    );
});

// Edit the order
router.put('/editOrder/:orderId', function (req, res, next) {
    Order.findOneAndUpdate(
        { [constants.orderId]: req.params.orderId },
        req.body,
        { new: true },
        function (error, order) {

        });

});


// TODO handle transaction on addition of order


module.exports = {
    router: router,
    getOrder: getOrder
};