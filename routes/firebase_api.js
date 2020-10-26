var admin = require('firebase-admin');
const express = require('express');
const router = express.Router();

router.post('/sendNotification', function (req, res, next) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "privateKey": process.env.FIREBASE_PRIVATE_KEY,
            "clientEmail": process.env.FIREBASE_CLIENT_EMAIL,
            "projectId": process.env.FIREBASE_PROJECT_ID
        }),
        databaseURL: "https://my-firebase-app.firebaseio.com"
    });

    // This registration token comes from the client FCM SDKs.
    var registrationToken = "cUaOkQIZTZKaIZFZWLABLs:APA91bFxPmZdeg_e8XufrPhkvSnzNH-Lkks6GoHqZAttTtVP74E0RImaOnXezjhgVv1UO90PKZ1Qt0XcSxQ6M5WpzIBERpgli_mO_lGFOpPi8505E9mAVdLUfspBmCEMUWIp-s5mEuye";

    var message = {

        android: {
            "notification": {
                "body": "Body of Your Notification",
                "title": "Title of Your Notification",
                "click_action": "FLUTTER_NOTIFICATION_CLICK",

            },
        },
        "data": {
            "title": "From POSTMAN",
            "body": "Foreground message"
        },
        token: registrationToken
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            res.send({ isSuccess: true });
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            res.send({ isSuccess: false });
            console.log('Error sending message:', error);
        });


});


module.exports = router;