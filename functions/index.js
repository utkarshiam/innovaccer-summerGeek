'use strict';
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
const nodemailer = require('nodemailer');

// Nodemailer
let mailTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'testfornodemailer@gmail.com ',
        pass: 'testForNodemailer',
    }
})
const hostEmail = '';  //Enter Test Email ID

// Twilio
const twilio = require('twilio');
const accountSid = ''; // Twilio Account SID
const authToken  = ''; //Twilio Auth Token
const client = new twilio(accountSid, authToken);
const twilioNumber = ''; // Number purchased by twilio

// ===== remote =====
const saveVisitorInfoInFirestore = (body) => {
    let promise = firestore.collection('visitors').doc(body.phoneNumber + '-' + body.checkInTime).set(body, { merge: true }).then(() => {
        console.log('Visitor info saved.');
        return { isVisitorInfoSaved: true };
    }).catch((err) => {
        console.error(`Visitor info not saved. Error:\n${err}`);
        return { isVisitorInfoSaved: false };
    })
    return promise;
}

const saveCheckOutTime = (phoneNumber, checkInTime, checkOutTime) => {
    checkInTime = checkInTime.replace(/"/g, '');
    let docRef = firestore.collection('visitors').doc(phoneNumber + '-' + checkInTime);
    return docRef.update({ checkOutTime }).then(() => {
        return console.log(`checkOutTime updated.`);
    }).catch((err) => {
        return console.error(`checkOutTime not updated. Error:\n${err}`);
    })
}

const getVisitorInfoFromFirestore = (phoneNumber, checkInTime) => {
    checkInTime = checkInTime.replace(/"/g, '');
    let docRef = firestore.collection('visitors').doc(phoneNumber + '-' + checkInTime);
    return docRef.get().then((doc) => {
        console.log(doc.exists);
        if (doc.exists) {
            console.log(doc.data());
            return doc.data();
        }
        return null;
    }).catch((err) => {
        console.log(`Visitor doc not fetched. Error:\n${err}`);
        return null;
    })
}

const sendCheckInEmail = (body) => {
    const mailOptions = {
        from: 'Test Nodemailer <testfornodemailer@gmail.com>',
        to: hostEmail,
        subject: 'Visit Information',
        html: getHtmlTableFromBody(body)
    }
    return new Promise((resolve, reject) => {
        if (body) {
            return mailTransport.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error(`sendCheckInEmail. And error occurred. Error:\n${err}`)
                    return resolve({ isEmailSentToHost: false });
                }
                console.log('sendCheckInEmail. Email sent to host.')
                return resolve({ isEmailSentToHost: true });
            })
        }
        return resolve({ isEmailSentToHost: false });
    })
}

// ===== local =====
const getHtmlTableFromBody = (body) => {
    if (body) {
        let tableStr = "";
        tableStr += `<table border='1'>`;
        tableStr += `<tr>` + `<td>Name:</td><td>${body.name}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Phone:</td><td>${body.phoneNumber}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Email:</td><td>${body.email}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Check-In-Time:</td><td>${body.checkInTime}</td>` + `</tr>`;
        tableStr += `</table>`;
        return tableStr;
    }
    return '<h5>Issue with body.</h5>';
}

exports.handleCheckInInfo = functions.https.onRequest(async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    try {
        let { body } = req;
        if (body) {
            body = JSON.parse(body);
            const now = new Date();
            body.checkOutTime = null;
            let resData = {};
            let infoSavedPromise = saveVisitorInfoInFirestore(body);
            await infoSavedPromise.then((info) => {
                resData = Object.assign({}, info);
                return;
            });
            body.checkInTime = now;
            let sendCheckInEmailPromise = sendCheckInEmail(body);
            await sendCheckInEmailPromise.then((info) => {
                resData = Object.assign(resData, info);
                return;
            });
            return res.status(200).send({ message: 'Working.', resData });
        } else {
            return res.status(400).send({ message: 'Visitor info not saved. Invalid request.' });
        }
    } catch(err) {
        return res.status(500).send({ message: "Error while compiling. " + err });
    }
})

exports.handleCheckOutInfo = functions.https.onRequest(async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    try {
        let { body } = req;
        body = body ? JSON.parse(body) : {};
        let { phoneNumber, checkInTime } = body;
        let visitInfo = null;
        if (phoneNumber && checkInTime) {
            let checkOutTime = JSON.stringify(new Date()).replace(/"/g, '');
            let saveCheckOutTimePromise = saveCheckOutTime(phoneNumber, checkInTime, checkOutTime);
            await saveCheckOutTimePromise.then(() => {
                console.log('Works');
                return;
            });
            let getVisitorInfoFromFirestorePromise = getVisitorInfoFromFirestore(phoneNumber, checkInTime);
            await getVisitorInfoFromFirestorePromise.then((docData) => {
                if (docData) {
                    visitInfo = Object.assign({}, docData);
                    console.log(docData, visitInfo)
                }
                return;
            })
            if (visitInfo) {
                const { name, email } = visitInfo;
                const textMessage = {
                    body: `Name: ${name} \n Email: ${email}`,
                    to: '', // add phone number verified by twilio
                    from: twilioNumber
                }
                return await client.messages.create(textMessage).then((response) => {
                    console.log(`SMS-status: ${response.status}`);
                    return res.status(200).send({ smsStatus: response.status });
                })
            } else {
                return res.status(400).send({ message: 'Issue with visitInfo' });
            }
        } else {
            return res.status(400).send({ message: 'Vistor phone-number not available. Invalid request.' });
        }
    } catch(err) {
        return res.status(500).send({ message: "Error while compiling. " + err });
    }
})
