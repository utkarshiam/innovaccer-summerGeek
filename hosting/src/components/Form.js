import React, {Component, Fragment} from 'react';

import { Form, Select, Input, Button, notification } from 'antd';

const { Option } = Select;

class FormUse extends Component {

  constructor(props) {
    super(props);
    this.state = ({
        status: false
        })
    }
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
        notification.open({
            message: 'Processing Form details',
            description:
            'Processing Your details.',
            onClick: () => {
            console.log('Notification Clicked!');
            },
        });
        if (!err) {
            values.checkInTime = new Date();
            this.props.sendValuesToServer(values).then((response) => {
                notification.open({
                    message: 'Checked-In',
                    description:
                    'User Checked-In',
                    onClick: () => {
                    console.log('Notification Clicked!');
                    },
                });
                this.props.checkStatus(true);
            }).catch((err) => {
                console.error(`An error occurred. Error:\n${err}`);
            }) 
            
        }
        else {
            console.error(`An error occurred. Error:\n${err}`);
            this.props.checkStatus(false);
        }
    });
  };

  handleSelectChange = value => {
    console.log(value);
    this.props.form.setFieldsValue({
      note: `Hi, ${value === 'male' ? 'man' : 'lady'}!`,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form labelCol={{ span: 5 }} wrapperCol={{ span: 12 }} onSubmit={this.handleSubmit}>
          <h3>Visitor's Info</h3>
        <Form.Item label="Name">
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please input visitor Name!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Phone Number">
          {getFieldDecorator('phoneNumber', {
            rules: [{ required: true, message: 'Please input visitor Phone Number!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Email">
          {getFieldDecorator('email', {
            rules: [{ required: true, message: 'Please input visitor Email!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Address Visited">
          {getFieldDecorator('address', {
            rules: [{ required: true, message: 'Please input Address Visited!' }],
          })(<Input />)}
        </Form.Item>
        <br/><br/>
        <h3>Host's Info</h3>
        <Form.Item label="Host Name">
          {getFieldDecorator('hostName', {
            rules: [{ required: true, message: 'Please input Host Name!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Phone Number Host">
          {getFieldDecorator('phoneNumberHost', {
            rules: [{ required: true, message: 'Please input Host Phone Number!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Email Host">
          {getFieldDecorator('emailHost', {
            rules: [{ required: true, message: 'Please input Host Email!' }],
          })(<Input />)}
        </Form.Item>
        <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
          <Button type="primary" htmlType="submit">
            Check-In
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedApp = Form.create({ name: 'coordinated' })(FormUse);

export default WrappedApp;