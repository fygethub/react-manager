import React from 'react';
import PropTypes from 'prop-types';
import {Form, Icon, Input, Button, Checkbox} from 'antd';
import App from '../../common/App.jsx';

const FormItem = Form.Item;
class SystemConfigWrap extends React.Component {

    handleTest = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            console.log(values);
            if (!err) {
                App.api('adm/admin/groups', {
                    limit: 20
                }).then((data) => console.log(data));

                App.api('adm/system/configs', {
                    limit: 20,
                    tableName: 'api_config',
                    offset: 0
                }).then((data) => console.log(data));


            }
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return <Form onSubmit={this.handleTest}>
            <FormItem>
                {getFieldDecorator('userName', {rules: [{require: true, message: 'please input your username'}]})(
                    <Input prefix={<Icon type="user" style={{fontSize: 13}}/>} placeholder="Username"/>
                )}
            </FormItem>
            <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button">
                    Log in
                </Button>
            </FormItem>
        </Form>
    }
}

const SystemConfig = Form.create()(SystemConfigWrap);

export default SystemConfig;
