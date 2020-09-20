const express = require('express');
const Group = require('../models/group');
const constants = require('../constants');
const User = require('../models/user');
const Order = require('../models/order');
const { itemName } = require('../constants');
const router = express.Router();


// Add new order
router.post('/:eventId/addOrder', function (req, res, next) {
    Order.create(req.body).then(function (order) {
        // Add order to orders array in event
        Event.findOneAndUpdate(
            { [constants.eventId]: req.params.eventId },
            { $push: { [constants.orders]: order[constants.orderId] } },
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
        ).then(function (event) {

            // Update the final order of the event
            var finalOrder = event[constants.finalOrder];
            var isPresent = false;
            finalOrder.forEach(forder => {
                if (forder[constants.itemName] === order[constants.itemName]) {

                    forder[constants.quantity] += order[constants.quantity];
                    forder[constants.totalCost] += order[constants.quantity] * order[constants.cost];
                    isPresent = true;
                    // break;
                }

            });

            if (!isPresent) {
                finalOrder.push({
                    [constants.itemName]: order[itemName],
                    [constants.quantity]: order[constants.quantity],
                    [constants.cost]: order[constants.cost],
                    [constants.totalCost]: order[constants.totalCost]
                })
            }


            Event.findOneAndUpdate(
                { [constants.eventId]: event[constants.eventId] },
                { [constants.finalOrder]: finalOrder },
                { new: true },
                function (err, succ) {
                    if (err)
                        console.log(err);
                    else
                        console.log(succ);
                }
            ).then(function (event_final) {
                console.log(event_final);
                res.send(order);

            });



        })
    }).catch(next);

});


router.get('/:groupId', function (req, res, next) {
    Group.findOne({ [constants.groupId]: req.params.groupId }).then(function (group) {
        res.send(group);
    }).catch(next);
})





module.exports = router;