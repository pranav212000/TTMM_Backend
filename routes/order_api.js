const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const Order = require('../models/order');
const { itemName, eventId, orderId } = require('../constants');
const e = require('express');
const router = express.Router();





router.get('/:orderId', function (req, res, next) {

    Order.findOne({ [constants.orderId]: req.params.orderId }, function (error, order) {
        if (error) {
            console.error(error);
            res.status(500).send({
                'isSuccess': false,
                result: error,

            });
        } else {
            if (order === null) {
                res.status(404).send({
                    message: 'Could not find order with orderid' + req.params.orderId,
                })
            }
            else
                res.send(order);
        }
    })

})




// Edit the order
router.put('/editOrder/:orderId', function (req, res, next) {
    Order.findOneAndUpdate(
        { [constants.orderId]: req.params.orderId },
        req.body,
        { new: true },
        function (error, order) {

        });

});
module.exports = router;