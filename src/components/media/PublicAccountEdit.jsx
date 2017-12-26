import React, {Component} from 'react';
import {Link} from 'react-router';
import {
    message,
    Card,
    Row,
    Col,
    Table,
    Input,
    Button,
    Icon,
    Popconfirm,
    Modal,
    Form,
    Select,
    InputNumber,
    Upload
} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

const Option = Select.Option;
const TextArea = Input.TextArea;
const FormItem = Form.Item;

class PublicAccountAdd extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mediaId: ''
        }
    }

    componentDidMount() {
        const {params: {id}, form: {setFieldsValue}} = this.props;
        App.api('/adm/media/mp', {appId: id}).then((res) => {
            let mchId = res.merchant.machId || '';
            let mchKey = res.merchant.mchKey || '';
            let certificate = res.certificate || '';
            let tradeIdPrefix = res.tradeIdPrefix || '';
            setFieldsValue({appId: res.appId, secret: res.secret, mchId, mchKey, certificate, tradeIdPrefix});
        })
    }

    handleCancle = (e) => {
        this.props.router.go(-1);
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, val) => {
            if (!err) {
                App.api('/adm/media/link_mp', {
                    'app': JSON.stringify(val),
                    'fileElement': val.certificate
                }).then((res) => {
                    this.props.router.push('app/admin/admins');
                });
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14},
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

        return (
            <Form onSubmit={this.handleSubmit} style={{marginTop: "30px"}}>
                <FormItem
                    {...formItemLayout}
                    label="公众号ID"
                    hasFeedback
                >
                    {getFieldDecorator('appId', {
                        rules: [{
                            type: 'string', message: 'The input is not valid name!',
                        }, {
                            required: true, message: '请输入有效值',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="公众号secret"
                    hasFeedback
                >
                    {getFieldDecorator('secret', {
                        rules: [{}, {
                            required: true, message: '输入密码',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="公众号代理"
                    hasFeedback
                >
                    {getFieldDecorator('tokenProxy')(
                        <Input type="textarea" autosize={{minRows: 4, maxRows: 8}}/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="商户ID"
                    hasFeedback
                >
                    {getFieldDecorator('mchId')(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="商户key"
                    hasFeedback
                >
                    {getFieldDecorator('mchKey')(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="商户证书"
                    hasFeedback
                >
                    {getFieldDecorator('certificate', {
                        rules: [{
                            required: false, message: '请上传证书',
                        }],
                    })(
                        <Input type="file" placeholder="请选择文件"/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="商户订单前缀"
                    hasFeedback
                >
                    {getFieldDecorator('tradeIdPrefix', {
                        rules: [{
                            required: false, message: '商户订单前缀!',
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

const PublicAccountAddWrap = Form.create()(PublicAccountAdd);
console.info(PublicAccountAddWrap);
export default PublicAccountAddWrap;
