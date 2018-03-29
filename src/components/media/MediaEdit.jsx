import React from 'react';
import {
    message, Card, Row,
    Col, Table, Input, Button,
    Icon, Dropdown, Modal,
    Form, Select, InputNumber,
    Transfer,
    Menu,
}
    from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';


const Option = Select.Option;
class MediaEdit extends React.Component {

    state = {
        features: [],
        selectedKeys: [],
    };

    submit = (e) => {
        e.preventDefault();
        const {form: {validateFields}} = this.props;
        validateFields((err, val) => {
            if (!err) {
                if (this.state.features && this.state.features == 0) {
                    message.info('请选择功能模块');
                    return;
                }
                let features = this.state.features.map(feature => feature.key);
                const {name, mobile, realName, days, flowAmount, usernameUser, passwordUser}  = val;

                let info = {
                    name,
                    mobile,
                    realName,
                    days: ~~days,
                    features,
                    flowAmount: ~~flowAmount,
                    username: usernameUser,
                    password: passwordUser,
                };
                App.api('adm/media/create', {
                    info: JSON.stringify(info),
                }).then((result) => {
                    message.success('创建成功');
                    setTimeout(() => {
                        App.go('app/media/medias');
                    }, 300)
                })
            }
        });


    };


    componentDidMount() {
        App.api('adm/media/features').then((features) => {
            this.setState({
                features
            })
        })
    }

    handleChange = (targetKeys, direction, moveKeys) => {
        console.log(targetKeys);
        this.setState({
            selectedKeys: targetKeys,
        })
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
                        wrapperCol={{span: 8, offset: 4}}
                        label="登录用户名："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('usernameUser', {
                            rules: [{required: true, message: '请输入管理员登录账号'}],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="登录密码："
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('passwordUser', {
                            rules: [{required: true, message: '请设置管理员密码'}],
                        })(
                            <Input type='password'/>
                        )}
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        label="功能选择："
                        labelCol={{span: 4}}
                    >
                        <Transfer
                            dataSource={this.state.features}
                            titles={['功能列表', '已开通']}
                            operations={['添加', '取消']}
                            notFoundContent={'没有条目'}
                            targetKeys={this.state.selectedKeys}
                            onChange={this.handleChange}
                            render={item => item.name}
                        />
                    </FormItem>
                    <FormItem
                        wrapperCol={{span: 8, offset: 4}}
                        labelCol={{span: 4}}
                        label='套餐时长'
                        hasFeedback
                    >
                        {getFieldDecorator('days', {
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
                        label="赠送流量(分)"
                        labelCol={{span: 4}}
                        hasFeedback
                    >
                        {getFieldDecorator('flowAmount', {
                            rules: [{required: true, message: '赠送流量'}],
                        })(
                            <Select>
                                <Option value={'0'}>不赠送</Option>
                                <Option value={'5000'}>50元</Option>
                                <Option value={'10000'}>100元</Option>
                                <Option value={'50000'}>500元</Option>
                                <Option value={'1000000'}>1000元</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem>
                        <Row>
                            <Col span={4} offset={4}>
                                <Button type='primary' onClick={this.submit}>保存</Button>
                            </Col>
                        </Row>
                    </FormItem>
                </Form>
            </Card>
        </div>
    }
}
export default Form.create()(MediaEdit);
