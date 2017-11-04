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
            groups: [],
            selectInitValue: []
        }
    }

    handleChange = (value) =>  {
        console.log(`selected ${value}`);
    }

    handleCancle = (e) => {

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

    componentDidMount() {
        const {params:{id},form:{setFieldsValue}} = this.props;
        App.api('adm/admin/admin',{id}).then(({name,email,groups}) => {
            this.setState({selectInitValue: groups});
            const groupsAfter = groups.map((v) => v.id);
            setFieldsValue({name,email});
        })
    }

    render() {
        const {selectInitValue} = this.state;
        const groups = [{
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
            <Form onSubmit={this.handleSubmit} style={{marginTop: "50px"}}>
                <FormItem
                    {...formItemLayout}
                    label="名称"
                    hasFeedback
                >
                    {getFieldDecorator('name', {
                        rules: [{
                            type: 'string', message: 'The input is not valid name!',
                        }, {
                            required: true, message: 'Please input your name',
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
                            required: true, message: 'Please input your E-mail!',
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
                            required: true, message: '请选择权限分组!',
                        }],
                        initialValue: ['1','2']
                    })(
                        <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={this.handleChange}
                        >
                            {
                                groups.map((v, i) => {
                                    return (<Option key={i} value={`${v.id}`}>{`${v.name}`}</Option>);
                                })
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">保存</Button>
                    <Button type="primary" htmlType="reset" onClick={this.handleCancle}>取消</Button>
                </FormItem>
            </Form>
        )
    }

}

const AdminsAddWrap = Form.create()(AdminsAdd);

export default AdminsAddWrap;
