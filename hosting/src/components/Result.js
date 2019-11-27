import { Result, Button } from 'antd';
import React, {Component, Fragment} from 'react';

export default class ResultUse extends Component {
    render() {
        return (
            <Fragment>
                <Result
                    status="success"
                    title="Successfully Recorded Event"
                    extra={[
                    <a href='/'><Button type="primary" key="console">
                        Go Console
                    </Button></a>
                     ]} 
                />

            </Fragment>
        )
    }
}
 