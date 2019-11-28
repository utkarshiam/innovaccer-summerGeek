const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// app.use(cors());
var cors=require('cors');

app.use(bodyParser.json());
app.use(cors({origin:true,credentials: true}));

const admin = require('firebase-admin');
const serviceAccount = require('./auth/innovaccer-task-840e62de39fe.json'); //credential json from firestore
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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
            // console.log(doc.data());
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
        to: body.emailHost,
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

const sendCheckOutEmail = (body, checkOutTime) => {
    const mailOptions = {
        from: 'Test Nodemailer <testfornodemailer@gmail.com>',
        to: body.email,
        subject: 'Visit Information',
        html: getHtmlTableFromBodyCheckOut(body, checkOutTime)
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
        tableStr += `<tr>` + `<td>Visitor's Name:</td><td>${body.name}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Phone:</td><td>${body.phoneNumber}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Email:</td><td>${body.email}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Name:</td><td>${body.hostName}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Email:</td><td>${body.emailHost}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Phone:</td><td>${body.phoneNumberHost}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Address Visited:</td><td>${body.address}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Check-In-Time:</td><td>${body.checkInTime}</td>` + `</tr>`;
        tableStr += `</table>`;
        return tableStr;
    }
    return '<h5>Issue with body.</h5>';
}

const getHtmlTableFromBodyCheckOut = (body, checkOutTime) => {
    if (body) {
        let tableStr = "";
        tableStr += `<table border='1'>`;
        tableStr += `<tr>` + `<td>Visitor's Name:</td><td>${body.name}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Phone:</td><td>${body.phoneNumber}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Email:</td><td>${body.email}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Name:</td><td>${body.hostName}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Email:</td><td>${body.emailHost}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Host's Phone:</td><td>${body.phoneNumberHost}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Address Visited:</td><td>${body.address}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Check-In-Time:</td><td>${body.checkInTime}</td>` + `</tr>`;
        tableStr += `<tr>` + `<td>Visitor's Check-Out-Time:</td><td>${body.checkOutTime}</td>` + `</tr>`;
        tableStr += `</table>`;
        return tableStr;
    }
    return '<h5>Issue with body.</h5>';
}

app.get('/express_backend', (req, res) => {
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
  });

app.post('/api/handleCheckInInfo', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        console.log(req.body)
        let { body } = req;
        if (body) {
            // body = JSON.parse(body);
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
            console.log('here i am')
            const { name, email, phoneNumber, address, hostName, emailHost, phoneNumberHost, checkInTime } = body;
            const textMessage = {
                body: `Visitor: ${name} \n Visitor Email: ${email} \n Host Name: ${hostName} \n Host Email: ${emailHost} \n Visitor Phone: ${phoneNumber} \n Host Phone: ${phoneNumberHost} \n Address: ${address} \n Check in time: ${checkInTime} `,
                to: '', //verified twilio number
                from: twilioNumber
            }
            return await client.messages.create(textMessage).then((response) => {
                console.log(`SMS-status: ${response.status}`);
                return res.status(200).send({ smsStatus: response.status });
            })
            // return res.status(200).send({ message: 'Working.', resData });
        } else {
            return res.status(400).send({ message: 'Visitor info not saved. Invalid request.' });
        }
    } catch(err) {
        return res.status(500).send({ message: "Error while compiling. " + err });
    }
})

app.post('/api/handleCheckOutInfo', async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    try {
        console.log(req.body)
        let { body } = req;
        // body = body ? JSON.parse(body) : {};
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
                    // console.log(docData, visitInfo)
                }
                return;
            })
            let sendCheckOutEmailPromise = sendCheckOutEmail(visitInfo, checkOutTime);
            await sendCheckOutEmailPromise.then((info) => {
                // let resData = Object.assign(resData, info);
                return;
            });
            console.log("done")
        } else {
            return res.status(400).send({ message: 'Vistor phone-number not available. Invalid request.' });
        }
    } catch(err) {
        return res.status(500).send({ message: "Error while compiling. " + err });
    }
})



const port = process.env.PORT || 3001;

app.listen(port);