import React,{Component} from 'react';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

const Option = Select.Option;
const FormItem = Form.Item;
const TextArea = Input.TextArea;

class AdminsAdd extends Component {

    constructor(props) {
        super(props);
        this.state={
            tableName: 'api_config',
            typeArr: []
        }
    }

    componentDidMount() {
        App.api('adm/system/configtypes').then((data) => {
            this.setState({typeArr: data});
        })
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
                val.tableName = this.state.tableName;
                console.info(val);
                App.api('/adm/system/saveconfig',val).then((res) => {
                    this.props.router.push('app/system/config');
                });
            }
        });
    }

    render() {
        const {typeArr} = this.state;
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
            <Form onSubmit={this.handleSubmit} style={{marginTop: "30px"}}>
                <FormItem
                    {...formItemLayout}
                    label="键"
                    hasFeedback
                >
                    {getFieldDecorator('key', {
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
                    label="类型"
                    hasFeedback
                >
                    {getFieldDecorator('type', {
                        rules: [{
                            required: true, message: 'Please input your E-mail!',
                        }],
                        initialValue: 'string'
                    })(
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={this.handleChange}
                        >
                            {typeArr.map((v, i) => {
                                return (<Option key={i.toString(36) + i} value={v}>{v}</Option>);
                            })
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="值"
                    hasFeedback
                >
                    {getFieldDecorator('value', {
                        rules: [{
                            required: true, message: '请输入!',
                        }],
                    })(
                        <TextArea />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="备注"
                    hasFeedback
                >
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true, message: 'Please input your E-mail!',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" style={{marginRight: '8px'}}>保存</Button>
                    <Button type="primary" htmlType="reset" onClick={this.handleCancle}>取消</Button>
                </FormItem>
            </Form>
        )
    }

}

const AdminsAddWrap = Form.create()(AdminsAdd);

export default AdminsAddWrap;
