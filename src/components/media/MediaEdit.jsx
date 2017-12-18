import React from 'react';
import {
    message, Card, Row,
    Col, Table, Input, Button,
    Icon, Dropdown, Modal,
    Form, Select, InputNumber,
    Menu,
}
    from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';


const Option = Select.Option;
class MediaEdit extends React.Component {
    submit = (e) => {
        e.preventDefault();
        const {form: {validateFields}} = this.props;
        validateFields((err, val) => {
            if (!err) {
                App.api('adm/media/create', {
                    info: JSON.stringify(val),
                }).then((result) => {
                    message.success('创建成功');
                    setTimeout(() => {
                        App.go('app/media/medias');
                    }, 300)
                })
            }
        });


    };

    render() {
        const {getFieldDecorator, setFieldsValue} = this.props.form;
        const FormItem = Form.Item;
        return <div>
            <BreadcrumbCustom first={'创建店铺'}/>
            <Card>
                <Form >
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="店铺名称："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: '请输入店铺名称'}],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label='绑定人手机号：'
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('mobile', {
                            rules: [{
                                validator: (rule, value, callback) => {
                                    if (/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(value)) {
                                        callback();
                                        return;
                                    }
                                    callback('请输入正确的手机号码');
                                }
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="绑定人姓名："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('realName', {
                            rules: [{required: true, message: '请输入真实姓名'}],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        label="选择套餐"
                        wrapperCol={{span: 8, offset: 4}}
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('grade', {
                            rules: [{required: true, message: '请选择套餐'}]
                        })(
                            <Select>
                                <Option value='2'>基础版</Option>
                                <Option value='3'>专业版</Option>
                                <Option value='4'>企业版</Option>
                            </Select>
                        )}

                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        labelCol={{span: 4}}
                        label='套餐时长'
                        hasFeedback
                    >
                        {getFieldDecorator('flowAmount', {
                            rules: [{required: true, message: '请选择套餐时长'}],
                        })(
                            <Select>
                                <Option value={'7'}>7天</Option>
                                <Option value={'30'}>一个月</Option>
                                <Option value={'90'}>3个月</Option>
                                <Option value={'180'}>半年</Option>
                                <Option value={'365'}>一年</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="管理员用户名："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('username', {
                            rules: [{required: true, message: '请输入管理员登录账号'}],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="管理员密码："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('password', {
                            rules: [{required: true, message: '请设置管理员密码'}],
                        })(
                            <Input type='password'/>
                        )}
                    </FormItem>
                    <FormItem>
                        <Button type='primary' onClick={this.submit}>保存</Button>
                    </FormItem>
                </Form>
            </Card>
        </div>
    }
}
export default Form.create()(MediaEdit);
