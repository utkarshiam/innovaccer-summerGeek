import React, {Component, Fragment} from 'react';
import Header from '../components/Header';
import Form from '../components/Form';
import Desc from '../components/Description';
import Result from '../components/Result';

// import * as remoteActions from '../scripts/remoteActions';
import * as remoteActions from '../scripts/remoteActionsLocal';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: false,
            checkOutStatus: false,
            values: {}
        }
    }
    _sendNumber(phoneNumber, checkInTime) {
        console.log(phoneNumber, checkInTime);
        return remoteActions.sendNumber(phoneNumber, checkInTime);
    }
    _checkStatusCheckOut(value) {
        console.log('Mhm. ' + value);
        this.setState({ checkOutStatus: value });
      }
    _checkStatus(value) {
        console.log('Mhm. ' + value);
        this.setState({ status: value });
      }
    _sendValuesToServer(values) {
        this.setState({ values });
        return remoteActions.sendValuesToServer(values);
    }
    render() {
        let { status, checkOutStatus } = this.state;
        let displaycomp;
        if (status && !checkOutStatus) {
            displaycomp = (
            <main>
                <Desc values={this.state.values} sendNumber={this._sendNumber.bind(this)} checkStatusCheckOut={this._checkStatusCheckOut.bind(this)} />
            </main>)
        } else if (!status && !checkOutStatus) {
            displaycomp = (
            <main>
                <Form sendValuesToServer={this._sendValuesToServer.bind(this)} checkStatus={this._checkStatus.bind(this)} />
            </main>)
        }
        else if(status && checkOutStatus){
            displaycomp = (
                <main>
                    <Result />
                </main>
            )
        }
        return (
            <Fragment>
                <Header/>
                {
                    displaycomp
                }
            </Fragment>
        )
    }
}


export default Home;
