export function sendValuesToServer(values) {
    if (values) {
        let options = {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
        }
        options.body = JSON.stringify(values);
        let promise = fetch("https://us-central1-innovacer-task.cloudfunctions.net/handleCheckInInfo", options).then((response) => {
            return response.json();
        }).then((response) => {
            if (response) {
                console.log(JSON.stringify(response, null, 4));
                return { isVisitorInfoSaved: true };
            }
            throw 'Issue with response.';
        }).catch((err) => {
            console.error(`An error occurred. Error:\n${err}`);
            return { isVisitorInfoSaved: false };
        })
        return promise;
    }
    return Promise.reject('Issue with values.');
}

export function sendNumber(phoneNumber, checkInTime) {
    if (phoneNumber && checkInTime) {
        let options = {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
            },
        }
        options.body = JSON.stringify({ phoneNumber, checkInTime });
        let promise = fetch("https://us-central1-innovacer-task.cloudfunctions.net/handleCheckOutInfo", options).then((response) => {
            return response.json();
        }).then((response) => {
            if (response) {
                console.log(JSON.stringify(response, null, 4));
                return { isVisitorCheckedOut: true };
            }
            throw 'Issue with response.';
        }).catch((err) => {
            console.error(`An error occurred. Error:\n${err}`);
            return { isVisitorCheckedOut: false };
        })
        return promise;
    }
    return Promise.reject('Issue with phone-number or checkInTime.');
}
