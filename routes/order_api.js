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
                resolve(order);
            }
        });
    });
}


router.get('/:orderId', function (req, res, next) {

    getOrder(req.params.orderId, function (orderResult) {
        if (orderResult.status === 'error') {
            res.status(500).send({
                'isSuccess': false,
                result: orderResult.error,
            });
        } else {
            if (orderResult.result === null) {
                res.status(404).send({
                    message: 'Could not find order with orderid' + req.params.orderId,
                })
            }
            else
                res.send(orderResult.result);
        }
    });
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