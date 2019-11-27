import { Descriptions, Button, notification } from 'antd';
import React, {Component, Fragment} from 'react';

export default class DescUse extends Component {
    executeOnClick(phoneNumber, checkInTime){
        this.props.sendNumber(phoneNumber, checkInTime)
        .then((res)=> {
            notification.open({
                message: 'Checked-Out',
                description:
                'User Checked-Out',
                onClick: () => {
                console.log('Notification Clicked!');
                },
            });
            console.log("out yo")
            this.props.checkStatusCheckOut(true)
        }).catch((err)=> {
            console.log(err);
        })
    }
    render() {
        const { values } = this.props;
        const { name, email, phoneNumber, address, hostName } = values;
        let { checkInTime } = values;
        checkInTime = JSON.stringify(checkInTime);
        return (
            <Fragment>
                <Descriptions title="User Info" bordered>
                    <Descriptions.Item label="Name">{name}</Descriptions.Item>
                    <Descriptions.Item label="Email-ID">{email}</Descriptions.Item>
                    <Descriptions.Item label="Address Visited">{address}</Descriptions.Item>
                    <Descriptions.Item label="Host Name">{hostName}</Descriptions.Item>
                    <Descriptions.Item label="Phone Number" span={2}>{phoneNumber}</Descriptions.Item>
                    <Descriptions.Item label="Check-In Time" span={2}>{checkInTime}</Descriptions.Item>
                </Descriptions>
                <br/><br/>
                <Button onClick={() => {this.executeOnClick(phoneNumber, checkInTime)}}>Check-Out</Button>
            </Fragment>
        )
    }
}
 