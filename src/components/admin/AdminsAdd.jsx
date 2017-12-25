import React,{Component} from 'react';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

const Option = Select.Option;
const FormItem = Form.Item;

class AdminsAdd extends Component {

    constructor(props) {
        super(props);
        this.state={
            roots: [{
                'id': '1',
                'name': 'Root'
            },{
                'id': '2',
                'name': 'test'
            }]
        }
    }

    handleChange = (value) =>  {
        console.log(`selected ${value}`);
    }

    handleCancle = (e) => {
        this.props.router.go(-1);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,val) => {
            console.info(val);
            if(!err){
                val.groups = val.groups.map((v,i) => ({'id': v}));
                console.info(val);
                App.api('/adm/admin/save',{'admin': JSON.stringify(val)}).then((res) => {
                    this.props.router.push('app/admin/admins');
                });
            }
        });
    }

    render() {
        const roots = [{
            'id': '1',
            'name': 'Root'
        },{
            'id': '2',
            'name': 'test'
        }];
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 6,
                },
            },
        };

        return(
            <div>
                <BreadcrumbCustom first="管理员" second="管理员列表"/>

                <Card>
                    <Form onSubmit={this.handleSubmit} style={{marginTop: "30px"}}>
                        <FormItem
                            {...formItemLayout}
                            label="名称"
                            hasFeedback
                        >
                            {getFieldDecorator('name', {
                                rules: [{
                                    type: 'string', message: '请输入有效的值!',
                                }, {
                                    required: 'true', message: '请输入有效值',
                                }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="E-mail"
                            hasFeedback
                        >
                            {getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'The input is not valid E-mail!',
                                }, {
                                    required: 'true', message: 'Please input your E-mail!',
                                }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem
                            {...formItemLayout}
                            label="管理组"
                            hasFeedback
                        >
                            {getFieldDecorator('groups', {
                                rules: [{
                                    required: 'true', message: '请选择权限分组!',
                                }],
                                initialValue: ['1', '2'],
                            })(
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    onChange={this.handleChange}
                                >
                                    {roots.map((v, i) => {
                                        return (<Option key={i.toString(36) + i} value={`${v.id}`}>{`${v.name}`}</Option>);
                                    })
                                    }
                                </Select>
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit" style={{marginRight: '8px'}}>保存</Button>
                            <Button type="primary" htmlType="reset" onClick={this.handleCancle}>取消</Button>
                        </FormItem>
                    </Form>
                </Card>
            </div>
        )
    }

}

const AdminsAddWrap = Form.create()(AdminsAdd);

export default AdminsAddWrap;
