# innovaccer-summerGeek
Summer Geeks task by Innovaccer
Meeting Management System
This is simple meeting management system build using:
- ReactJs
- NodeJS 
- FirebaseCloud functions.

## Setup

Setup Mailing Service
Set the following environment variable in server/server.js OR functions/index.js for nodemailer
```
USER_EMAIL= xxxxxxxxx@xxxxx.xxx
USER_PASSWORD= xxxxxxxxxxx
```
Setup SMS
We are using twilio as an sms service. Obtain SID and Auth_Token from twilio from their website https://www.twilio.com/

Set the following environment variable in server/server.js OR functions/index.js
```
TWILIO_ACCOUNT_SID=XXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=YYYYYYYYYYYY
TWILIO_NUMBER=+xxyyyyyyyyyy
```

Database
Two database configuration are present 
-Firestore (server/auth/[Insert your service_account keys]) 
-Mongo.


## Approach

1. Made a development project with firebase cloud functions to start Lean.
2. Problems were faced with the 3rd-party Http requests made by the cloud functions.
3. Replicating the node server and creating a mongo instance and using the firestore as well.
4. Antd for design
