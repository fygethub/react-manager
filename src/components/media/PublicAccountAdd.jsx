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

import '../../asssets/css/media/public-account-page.less';
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


    handleCancle = (e) => {
        this.props.router.go(-1);
    };

    handleSubmit = (e) => {

        e.preventDefault();
        const {query:{mediaId}} = this.props.location;
        this.props.form.validateFields((err, val) => {
            if (!err) {
                val.mediaId = mediaId;
                App.api('/adm/media/link_mp', {
                    'app': JSON.stringify(val),
                    'fileElement': val.certificate
                }).then((res) => {
                    this.props.router.push('app/media/medias');
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
            <div className="public-account-page">
                <BreadcrumbCustom first="首页" second="公众号设置"/>
                <Card>
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
                                    required: true, message: '输入密码!',
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
                                    required: false, message: '上传证书!',
                                }],
                            })(<div className="file-upload">
                                    <span>上传证书</span>
                                    <input type="file" placeholder="请选择文件"/>
                                </div>
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
                </Card>
            </div>
        )
    }

}

const PublicAccountAddWrap = Form.create()(PublicAccountAdd);
export default PublicAccountAddWrap;
