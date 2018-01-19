import React from 'react';
import {
    message, Card, Row,
    Col, Table, Input, Button,
    Icon, Dropdown, Modal,
    Form, Select, InputNumber, Tag,
    Menu,
}
    from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

const Option = Select.Option;
class Migrate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            loading: false,
            start: true,
            mediaId: this.props.params.mediaId,
        }
    }

    componentDidMount() {
        this.loadData();
        if (!this.state.start) {
            const {form: {setFieldsValue}} = this.props;
            setFieldsValue({
                mediaId: this.props.params.mediaId,
                config: JSON.stringify({}),
            })
        }
    }

    handleConfig = () => {
        const {form: {validateFields}} = this.props;
        validateFields((err, val) => {
            console.log('config:' + val.config);
            App.api('adm/ckjr/config', {
                mediaId: this.state.mediaId,
                config: val.config,
            }).then(res => {
                message.success('配置成功');
                this.setState({
                    start: false,
                }, this.loadData);
            })
        });
    };

    loadData = () => {
        this.setState({
            loading: true,
        });
        this.state.mediaId && App.api('adm/ckjr/records', {mediaId: this.props.params.mediaId})
            .then(res => {
                this.setState({
                    list: res.items,
                    loading: false,
                })
            })
    };

    startMigrate = () => {
        const {form: {validateFields}} = this.props;
        validateFields((err, val) => {
            if (!val.sessionId) {
                message.info('请填写sessionId');
                return;
            }
            App.api('adm/ckjr/migrate', {
                mediaId: this.props.params.mediaId,
                sessionId: val.sessionId,
            }).then((result) => {
                this.loadData();
            })
        });
    };


    handleShowLog = (id) => {
        App.api('/adm/ckjr/log', {id}, {noParse: true}).then(res => {
            this.setState({
                showContent: true,
                content: res.replace(/\n/gm, '</br>')
            });
        });
    };

    render() {
        const {getFieldDecorator, setFieldsValue} = this.props.form;
        const FormItem = Form.Item;
        return <div>
            <BreadcrumbCustom first={'配置迁移'}/>
            <Modal title={'log'} visible={this.state.showContent}
                   onCancel={() => this.setState({
                       showContent: false,
                   })}
                   onOk={() => this.setState({
                       showContent: false,
                   })}>
                <div dangerouslySetInnerHTML={{__html: this.state.content}}/>
            </Modal>
            <Modal title={'配置'}
                   visible={this.state.start}
                   onCancel={() => this.setState({
                       start: false,
                   })} onOk={() => this.handleConfig()}>
                <FormItem
                    wrapperCol={{span: 10, offset: 4}}
                    label="店铺ID："
                    labelCol={{span: 4}}
                    hasFeedback
                >
                    {getFieldDecorator('mediaId', {
                        initialValue: this.props.params.mediaId,
                        rules: [{required: true, message: '请输入店铺ID'}],
                    })(
                        <Input />
                    )}
                </FormItem>

                <FormItem
                    wrapperCol={{span: 10, offset: 4}}
                    label="配置："
                    labelCol={{span: 4}}
                    hasFeedback
                >
                    {getFieldDecorator('config', {
                        initialValue: '{}'
                    })(
                        <Input.TextArea autosize/>
                    )}
                </FormItem>
            </Modal>
            <Card>
                <Row>
                    <Col span={12}>
                        {getFieldDecorator('sessionId')(
                            <Input placeholder="原系统会话ID"/>
                        )}
                    </Col>
                    <Col span={3} offset={1}>
                        <Button type='primary' onClick={() => {
                            this.startMigrate();
                        }}>开始迁移</Button></Col>
                    <Col span={3} offset={5}>
                        <Button onClick={() => {
                            this.setState({
                                start: !this.state.start,
                            })
                        }}>配置</Button></Col>

                </Row>
                <Row>
                    <Table columns={[{
                        title: 'id',
                        dataIndex: 'id',
                        className: 'txt-center',
                        width: '140px',
                    }, {
                        title: '创建时间',
                        dataIndex: 'createdAt',
                        className: 'txt-center',
                        width: '140px',
                        render: (createdAt) => <span>{U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                    }, {
                        title: '状态',
                        dataIndex: 'state',
                        className: 'txt-left',
                        width: '140px',
                        render: (state) => {
                            switch (state + '') {
                                case '0':
                                    return <Tag>未开始</Tag>;
                                case '1':
                                    return <Tag>进行中</Tag>;
                                case '2':
                                    return <Tag color="blue">成功</Tag>;
                                case '3':
                                    return <Tag color="red">失败</Tag>;
                            }
                        }
                    }, {
                        title: '操作',
                        dataIndex: 'opt',
                        className: 'txt-center',
                        width: '80px',
                        render: (obj, record) => {
                            return <Dropdown overlay={<Menu>
                                <Menu.Item key="0">
                                    <a href="javascript:;" onClick={() => {
                                        this.handleShowLog(record.id);
                                    }}>获取迁移</a>
                                </Menu.Item>
                            </Menu>} trigger={['click']}>
                                <a className="ant-dropdown-link" href="javascript:;">
                                    操作
                                </a>
                            </Dropdown>
                        }
                    }]} rowKey={(record) => record.feature}
                           dataSource={this.state.list}
                           loading={this.state.loading}/>
                </Row>
            </Card>

        </div>
    }
}
export default Form.create()(Migrate);
