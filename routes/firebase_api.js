var admin = require('firebase-admin');
const express = require('express');
const Token = require('../models/registrationToken');
const Cash = require('../models/cash');
const constants = require('../constants');
const User = require('../models/user');


const router = express.Router();
admin.initializeApp({
    credential: admin.credential.cert({
        "privateKey": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
        "projectId": process.env.FIREBASE_PROJECT_ID
    }),
    databaseURL: "https://my-firebase-app.firebaseio.com"
});




router.post('/storeToken', function (req, res, next) {
    var phoneNumber = req.body[constants.phoneNumber];
    var token = req.body[constants.token];

    Token.findOne({ [constants.phoneNumber]: phoneNumber }).then(function (token) {
        if (token === null) {
            Token.create(req.body).then(function (token) {
                res.send({ isSuccess: true, message: 'Token stored' });
            })
        } else {
            if (token[constants.token] === req.body[constants.token])
                res.send({ isSuccess: true, message: 'Token corresponding to the number already exists' });
            else
                res.status(405).send({ isSuccess: false, error: 'Wrong token for the number' });

        }
    }).catch(next);
})



router.post('/sendCashConfirmation', function (req, res, next) {


    Cash.findOne({ [constants.paymentId]: req.body[constants.paymentId] }).then(function (cash) {
        if (cash === null) {
            Cash.create(req.body).then(function (cash) {

                User.findOne({ [constants.phoneNumber]: cash[constants.phoneNumber] }).then(function (user) {
                    if (user === null) {
                        console.log('Could not find user for number : ' + cash[constants.phoneNumber]);
                        res.status(404).send({ isSuccess: false, error: 'Could not find user for number : ' + cash[constants.phoneNumber] });
                    } else {
                        var notificationBody = "You have a cash payment confirmation from " + user[constants.name] + " for amount " + cash[constants.amount];
                        var dataBody = "Have you received \u20B9" + cash[constants.amount] + " from " + user[constants.name] + " in cash?"
                        const payload = {

                            "notification": {
                                "body": notificationBody,
                                "title": "Cash Confirmation",
                                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                                visibility: "public",
                                sound: 'default'
                            }, "data": {
                                "title": "Cash Confirmation",
                                "body": dataBody,
                                "phoneNumber": cash[constants.phoneNumber],
                                "amount": cash[constants.amount].toString(),
                                "to": cash[constants.to],
                                "eventId": cash[constants.eventId],
                                "reconfirmation": "false",
                                [constants.paymentId]: cash[constants.paymentId],
                                "showDialog": "true"
                            },

                        }
                        sendNotification(req.body[constants.to], payload, res);

                    }
                });
            }).catch(next);

        } else {
            if (cash[constants.got] !== [constants.got]) {

                cash[constants.got] = "notConfirmed";

                cash.markModified([constants.got]);
                cash.save(function (error) {
                    if (error) {
                        console.log(error);
                        res.status(500).send({ isSuccess: false, error: error });
                    } else {
                        User.findOne({ [constants.phoneNumber]: cash[constants.phoneNumber] }).then(function (user) {
                            if (user === null) {
                                console.log('Could not find user for number : ' + cash[constants.phoneNumber]);
                                res.status(404).send({ isSuccess: false, error: 'Could not find user for number : ' + cash[constants.phoneNumber] });
                            } else {

                                var payloadBody = "You have a cash payment reconfirmation from " + user[constants.name] + " for amount " + cash[constants.amount];
                                var dataBody = "Have you received \u20B9" + cash[constants.amount] + " from " + user[constants.name] + " in cash?"

                                const payload = {

                                    "notification": {
                                        "body": payloadBody,
                                        "title": "Cash Reconfirmation",
                                        "click_action": "FLUTTER_NOTIFICATION_CLICK",
                                        visibility: "public",
                                        priority: "high",
                                        sound: 'default'
                                    }, "data": {
                                        "title": "Cash Reconfirmation",
                                        "body": dataBody,
                                        "phoneNumber": cash[constants.phoneNumber],
                                        "amount": cash[constants.amount].toString(),
                                        "to": cash[constants.to],
                                        "eventId": cash[constants.eventId],
                                        "reconfirmation": "true",
                                        [constants.paymentId]: cash[constants.paymentId],
                                        "showDialog": "true"

                                    },

                                }

                                // const payload = { notification: { body: 'abc', title: 'abc' }, data: { url: 'string', body: 'string', title: 'string' } }

                                sendNotification(req.body[constants.to], payload, res);
                                // res.send(cash);
                            }
                        });
                    }
                });
            }
        }
    })
});


router.post('/notGotCash', function (req, res, next) {
    Cash.findOne({ [constants.paymentId]: req.query[constants.paymentId] }).then(function (cash) {
        if (cash === null) {
            console.log('Could not find the payment id');
            res.status(404).send({ isSuccess: false, error: 'Could not find the payment' });
        } else {
            cash[constants.got] = constants.notGot;

            cash.markModified([constants.got]);
            cash.save(function (error) {
                if (error) {
                    console.log(error);
                    res.status(500).send({ isSuccess: false, error: error });
                } else {
                    User.findOne({ [constants.phoneNumber]: cash[constants.phoneNumber] }).then(function (user) {
                        if (user === null) {
                            console.log('Could not find user for number : ' + cash[constants.phoneNumber]);
                            res.status(404).send({ isSuccess: false, error: 'Could not find user for number : ' + cash[constants.phoneNumber] });
                        } else {

                            var payloadBody = user[constants.name] + " HAS NOT RECIEVED YOUR CASH" + " for amount " + cash[constants.amount];
                            var dataBody = "Have you received \u20B9" + cash[constants.amount] + " from " + user[constants.name] + " in cash?"

                            const payload = {

                                "notification": {
                                    "body": payloadBody,
                                    "title": "Cash not received",
                                    "click_action": "FLUTTER_NOTIFICATION_CLICK",
                                    visibility: "public",
                                    sound: 'default'
                                }, "data": {
                                    "title": "Cash not received",
                                    "body": payloadBody,
                                    "phoneNumber": cash[constants.phoneNumber],
                                    "amount": cash[constants.amount].toString(),
                                    "to": cash[constants.to],
                                    "eventId": cash[constants.eventId],
                                    "reconfirmation": "false",
                                    [constants.paymentId]: cash[constants.paymentId],
                                    "showDialog": "true"

                                },
                            }
                            sendNotification(cash[constants.phoneNumber], payload, res);
                            // res.send(cash);
                        }
                    });
                }
            });
        }
    }).catch(next);
});



sendNotification = function (phoneNumber, payload, res) {
    Token.findOne({ [constants.phoneNumber]: phoneNumber }).then(function (token) {

        if (token === null) {
            console.log('Cold not find the token for the corresponding phone number' + phoneNumber);
            res.status(404).send({ isSuccess: false, error: 'Cold not find the token for the corresponding phone number' });
        } else {
            var registrationToken = token[constants.token];


            admin.messaging().sendToDevice(registrationToken, payload).then((response) => {
                // Response is a message ID string.
                res.send({ isSuccess: true });
                console.log('Successfully sent message:', response);
            }).catch((error) => {
                res.send({ isSuccess: false });
                console.log('Error sending message:', error);
            });
        }
    });

}





router.post('/sendNotification', function (req, res, next) {


    // This registration token comes from the client FCM SDKs.
    var registrationToken = "cUaOkQIZTZKaIZFZWLABLs:APA91bFxPmZdeg_e8XufrPhkvSnzNH-Lkks6GoHqZAttTtVP74E0RImaOnXezjhgVv1UO90PKZ1Qt0XcSxQ6M5WpzIBERpgli_mO_lGFOpPi8505E9mAVdLUfspBmCEMUWIp-s5mEuye";

    Token.findOne({ [constants.phoneNumber]: req.query[constants.phoneNumber] }).then(function (token) {
        if (token === null) {
            res.status(404).send({ isSuccess: false, error: 'Could not find the token corresponding to phone number : ' + req.query[constants.phoneNumber] });
        } else {

            const payload = {
                android: {
                    "notification": {
                        "body": "Body of Your Notification",
                        "title": "Title of Your Notification",
                        "click_action": "FLUTTER_NOTIFICATION_CLICK",
                        visibility: "public",
                        sound: 'default'
                    }, "data": {
                        "title": "From POSTMAN",
                        "body": "Foreground message"
                    },
                },
                // notification: {
                //     title: 'name',
                //     body: 'messageBody',
                //     ticker: "New Message from SSB Chat",
                //     visibility: "public",
                //     sound: 'default'
                // }
            };

            admin.messaging().sendToDevice(registrationToken, payload).then((response) => {
                // Response is a message ID string.
                res.send({ isSuccess: true });
                console.log('Successfully sent message:', response);
            }).catch((error) => {
                res.send({ isSuccess: false });
                console.log('Error sending message:', error);
            });


        }
    }).catch(next)


    var message = {

        android: {
            "notification": {
                "body": "Body of Your Notification",
                "title": "Title of Your Notification",
                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                visibility: "public",
                sound: 'default'
            }, "data": {
                "title": "From POSTMAN",
                "body": "Foreground message"
            },
        },

        token: registrationToken
    };


    // Send a message to the device corresponding to the provided
    // registration token.

    // admin.messaging().send(message)
    //     .then((response) => {
    //         // Response is a message ID string.
    //         res.send({ isSuccess: true });
    //         console.log('Successfully sent message:', response);
    //     })
    //     .catch((error) => {
    //         res.send({ isSuccess: false });
    //         console.log('Error sending message:', error);
    //     });


});


module.exports = router;