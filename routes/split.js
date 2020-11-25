const express = require('express');
const Event = require('../models/event');
const constants = require('../constants');
const User = require('../models/user');
const { model } = require('mongoose');
const Group = require('../models/group');
const Cash = require('../models/cash');
const { paid } = require('../constants');


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
                    // console.log(order);
                    resolve(order);
                }
            }
        });
    });
}


var getEventOrders = function (eventId, callback) {
    Event.findOne({ [constants.eventId]: eventId }, function (error, event) {
        if (error) {
            console.error(error);
            callback({ isSuccess: false, error: error, status: 500 });
        } else {
            if (event === null) {
                callback({
                    isSuccess: false,
                    error: 'Could not find event with event id : ' + eventId,
                    status: 404
                });
            }
            else {
                var orders = event[constants.orders];

                Promise.all(orders.map(getOrder))
                    .then(response => {
                        callback({ isSuccess: true, response: response });
                    })
                    .catch(error => {
                        console.log(error);
                        callback({ isSuccess: false, error: error });
                    });
            }
        }
    });
};


var splitByOrder = function (eventId, res, sendResponse) {
    getEventOrders(eventId, function (result) {
        // console.log(result);
        if (!result.isSuccess) {
            if (sendResponse)
                res.status(500).send(result.error);
        } else {
            var orders = result.response;
            var members = [];

            var transTotal = 0;
            orders.forEach(order => {
                var orderMembers = order[constants.members];

                var totalCost = order[constants.totalCost];
                transTotal += totalCost;
                // var sharePerMember = totalCost / orderMembers.length;

                orderMembers.forEach(orderMember => {
                    var index = members.findIndex(member => member[constants.phoneNumber] === orderMember[constants.phoneNumber]);


                    var isPresent = index !== -1;

                    if (isPresent) {
                        members[index][constants.amount] += (orderMember[constants.quantity] * order[constants.cost]);
                    } else {
                        members.push({ [constants.phoneNumber]: orderMember[constants.phoneNumber], [constants.amount]: (orderMember[constants.quantity] * order[constants.cost]) });
                    }

                });

            });

            console.log(members);

            Event.findOne({ [constants.eventId]: eventId }).then(function (event) {
                if (event === null) {
                    console.log('Could not find event with eventId : ' + eventId);
                    if (sendResponse)
                        res.send({ isSuccess: false, error: 'Could not find event with eventId : ' + eventId });
                } else {

                    Transaction.findOne({ [constants.transactionId]: event[constants.transactionId] }).then(function (transaction) {

                        if (transaction === null) {
                            console.log('Could not find the transaction');
                            if (sendResponse)
                                res.status(404).send({ isSuccess: false, error: 'Could not find the transaction' });

                        } else {

                            transaction[constants.totalCost] = transTotal;
                            transaction[constants.totalPaid] = 0;


                            transaction = checkGivenPaidConditions(transaction, members);

                            transaction.markModified([constants.totalCost]);
                            transaction.markModified([constants.totalPaid]);
                            transaction.markModified([constants.toGive]);
                            transaction.markModified([constants.toGet]);
                            transaction.markModified([constants.split]);

                            transaction.save(function (error) {
                                if (error) {
                                    console.log(error);
                                    if (sendResponse)
                                        res.status(500).send({ isSuccess: false, error: error });
                                } else {
                                    if (sendResponse)
                                        res.send(transaction);
                                }
                            })
                        }
                    });
                }
            });
        }
    });
}



var splitEvenly = function (eventId, res, sendResponse) {

    Group.findOne({ [constants.groupEvents]: eventId }).then(function (group) {
        if (group === null) {
            console.log('Could not find group');
            if (sendResponse)
                res.status(404).send({ isSuccess: false, error: 'Could not find the group having event : ' + req.query.eventId });
        } else {
            var groupMembers = group[constants.groupMembers];

            getEventOrders(eventId, function (result) {
                // console.log(result);
                if (!result.isSuccess) {
                    if (sendResponse)
                        res.status(300).send(result);
                } else {
                    var orders = result.response;
                    var transTotal = 0;
                    var members = [];
                    orders.forEach(order => {
                        var orderCost = order[constants.totalCost];
                        transTotal += orderCost;

                        var index = members.findIndex(member => member[constants.phoneNumber] === orderMember[constants.phoneNumber]);

                        var orderMembers = order[constants.members];

                        orderMembers.forEach(orderMember => {
                            var isPresent = index !== -1;

                            if (isPresent) {
                                members[index][constants.amount] += orderCost / groupMembers.length;
                            } else {
                                members.push({ [constants.phoneNumber]: orderMember[constants.phoneNumber], [constants.amount]: orderCost / groupMembers.length });
                            }
                        });


                    });

                    var sharePerMember = transTotal / groupMembers.length;

                    members.forEach(member => {
                        member[constants.amount] = sharePerMember;
                    });

                    console.log(members);

                    Event.findOne({ [constants.eventId]: eventId }).then(function (event) {

                        if (event === null) {
                            console.log('Could not find transaction');
                            if (sendResponse)
                                res.status(404).send({ isSuccess: false, error: 'Could not find the event event id : ' + eventId });
                        } else {
                            // var members = group[constants.groupMembers];
                            // console.log(members);
                            Transaction.findOne({ [constants.transactionId]: event[constants.transactionId] })
                                .then((transaction) => {
                                    if (transaction === null) {
                                        console.log('Could not find transaction');
                                        if (sendResponse)
                                            res.status(404).send({ isSuccess: false, error: 'Could not find the transaction' });
                                    }
                                    var paid = transaction[constants.paid];

                                    transaction[constants.totalCost] = transTotal;
                                    transaction[constants.totalPaid] = 0;
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
                                            transaction[constants.totalPaid] += paidAmount;
                                        }
                                        // console.log(paidAmount);
                                        if (paidAmount < sharePerMember)
                                            toGive.push({ [constants.phoneNumber]: member, [constants.amount]: sharePerMember - paidAmount });
                                        else if (paidAmount > sharePerMember)
                                            toGet.push({ [constants.phoneNumber]: member, [constants.amount]: paidAmount - sharePerMember });
                                    });

                                    transaction = checkGivenPaidConditions(transaction, members);

                                    transaction.markModified([constants.totalCost]);
                                    transaction.markModified([constants.totalPaid]);
                                    transaction.markModified([constants.toGive]);
                                    transaction.markModified([constants.toGet]);
                                    transaction.markModified([constants.split]);

                                    transaction.save(function (error) {
                                        if (error) {
                                            console.log(error);
                                            if (sendResponse)
                                                res.status(500).send({ isSuccess: false, error: error });
                                        } else {
                                            if (sendResponse)
                                                res.send(transaction);
                                        }
                                    });
                                });
                        }
                    });
                }
            });
        }
    });
}



function checkGivenPaidConditions(transaction, members) {
    var paid = transaction[constants.paid];
    var given = transaction[constants.given];
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
            transaction[constants.totalPaid] += paidAmount;
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


    members.forEach(member => {
        var givenIndex = given.findIndex(ele => ele[constants.phoneNumber] === member[constants.phoneNumber]);

        if (givenIndex !== -1) {

            var givenAmount = given[givenIndex][constants.amount];

            var phoneNumber = given[givenIndex][constants.phoneNumber];
            var to = given[givenIndex][constants.to];



            // ! Perform opration on the member present in give i.e. check its toGive and toGet
            var toGiveIndex = toGive.findIndex(ele => ele[constants.phoneNumber] === phoneNumber);
            if (toGiveIndex !== -1) {
                if (toGive[toGiveIndex][constants.amount] > givenAmount) {
                    toGive[toGiveIndex][constants.amount] -= givenAmount
                } else if (toGive[toGiveIndex][constants.amount] == givenAmount) {
                    toGive.splice(toGiveIndex, 1);
                } else {
                    toGet.push({ [constants.phoneNumber]: phoneNumber, [constants.amount]: givenAmount - toGive[toGiveIndex][constants.amount] });
                    toGive.splice(toGiveIndex, 1);
                }
            } else {
                var toGetIndex = toGet.findIndex(ele => ele[constants.phoneNumber] === phoneNumber);

                if (toGetIndex === -1) {
                    toGet.push({ [constants.phoneNumber]: phoneNumber, [constants.amount]: givenAmount - toGive[toGiveIndex][constants.amount] });
                } else {
                    toGet[toGetIndex][constants.amount] += givenAmount;
                }
            }

            // ! Perform operation on the member who is getting amount in given
            toGiveIndex = toGive.findIndex(ele => ele[constants.phoneNumber] === to);
            if (toGiveIndex !== -1) {
                toGive[toGiveIndex][constants.amount] += givenAmount;
            } else {
                var toGetIndex = toGet.findIndex(ele => ele[constants.phoneNumber] === to);
                if (toGetIndex !== -1) {
                    if (toGet[toGetIndex][constants.amount] > givenAmount) {
                        toGet[toGetIndex][constants.amount] -= givenAmount;
                    } else if (toGet[toGetIndex][constants.amount] === givenAmount) {
                        toGet.splice(toGetIndex, 1);
                    } else {
                        toGive.push({ [constants.phoneNumber]: to, [constants.amount]: givenAmount - toGet[toGetIndex][constants.amount] });
                        toGet.splice(toGetIndex, 1);
                    }
                } else {
                    toGive.push({ [constants.phoneNumber]: to, [constants.amount]: givenAmount });
                }
            }
        }
    });
    transaction[constants.toGive] = toGive;
    transaction[constants.toGet] = toGet;
    transaction[constants.split] = constants.byOrder;

    return transaction;
}




module.exports = {
    splitByOrder: splitByOrder,
    splitEvenly: splitEvenly,
    getEventOrders: getEventOrders
};