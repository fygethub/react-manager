import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom';
import {
    message, Card, Row,
    Col, Table, Input, Button,
    Icon, Dropdown, Modal,
    Form, Select,
    InputNumber,
    Menu,
}  from 'antd';

import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';
const URL_LIST = 'adm/app/releases';

const MenuItem = Menu.Item;
const FormItem = Form.Item;
const Option = Select.Option;
class Releases extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: {
                dataSource: [],
                offset: 0,
                total: 0,
                pageSize: 10,
                current: 0,
            },
            id: null,
            loading: false,
            visible: false,
            addModalVisible: false,
        }

        this.columns = [
            {
                title: '版本号',
                dataIndex: 'version',
                key: 'version',
            },
            {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                render: (state, record) => <span>{state == 2 ? '审核通过' : state == 1 ?
                        '提交审核' : state == 4 ? '审核失败' + ' :' + record.declineNotes : '已上线'}</span>
            },
            {
                title: 'Release Notes',
                dataIndex: 'releaseNotes.zh_CN',
                key: 'releaseNotes.zh_CN'
            }, {
                title: '操作',
                dataIndex: 'opt',
                className: 'txt-right',
                width: '80px',
                render: (obj, record) => {

                    return <Dropdown overlay={<Menu>
                        <MenuItem key="8">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.handleEdit(record.id);
                               }}> 编辑</a>
                        </MenuItem>
                        <MenuItem key="1">
                            <a href={record.file && record.file.url}
                            > 下载</a>
                        </MenuItem>
                        {record.state == 1 && <MenuItem key="5">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.review(record.id, true);
                               }}> 审核通过</a>
                        </MenuItem>}
                        {record.state == 1 && <MenuItem key="6">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.review(record.id, false);
                               }}> 审核不通过</a>
                        </MenuItem>}
                        {record.state == 2 && <MenuItem key="7">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.release(record.id);
                               }}> 上线</a>
                        </MenuItem>}
                        <Menu.Divider/>
                        <MenuItem key="2">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.handleDelete(record.id);
                               }}> 删除</a>
                        </MenuItem>
                    </Menu>} trigger={['click']}>
                        <a className="color-info" href="javascript:;">
                            操作 <Icon type="down"/>
                        </a>
                    </Dropdown>
                }
            }
        ];
    }

    componentDidMount() {
        this.loadData();
    }

    review = (id, isPass) => {
        Modal.confirm({
            title: '审核确认',
            onOk: () => {
                this.setState({
                    loading: true,
                });
                App.api('adm/app/release_review', {
                    id: id,
                    approved: isPass,
                    declineNotes: this.state.declineNotes,
                }).then(() => {
                    this.loadData();
                })
            },
            onCancel: () => {
                this.setState({
                    declineNotes: null,
                })
            },
            content: !isPass ? <div>
                    不通过理由:
                    <Input onChange={(e) => {
                        this.setState({
                            declineNotes: e.target.value,
                        })
                    }}/>
                </div> : '确认通过'
        })


    };

    release = (id) => {
        this.setState({
            loading: true,
        });
        App.api('adm/app/release_sale', {id}).then(() => {
            message.success('上线成功');
            this.setState({
                loading: false,
            })
        })
    };

    loadData = () => {
        this.setState({
            loading: true,
        });
        if (!this.props.params.appId) {
            return;
        }
        App.api(URL_LIST, {
            appId: this.props.params.appId,
            offset: this.state.table.pageSize * (this.state.table.current - 1),
            limit: this.state.table.pageSize,
        }).then((result) => {
            this.setState({
                loading: false,
                table: {
                    ...this.state.table,
                    dataSource: result.items,
                    pageSize: result.limit,
                    offset: result.offset,
                    total: result.total,
                }
            })
        })
    };

    handleEdit = (id) => {
        let {validateFields, setFieldsValue} = this.props.form;
        this.setState({
            confirmLoading: true,
            addModalVisible: true,
            id,
        });
        App.api('adm/app/release', {
            id,
        }).then((data) => {
            setFieldsValue({version: data.version, releaseNotes: data.releaseNotes['zh_CN']});
            this.setState({
                confirmLoading: false,
                id: data.id,
            });
        })
    };


    handleAdd = () => {
        this.setState({
            loading: true,
        });
        let {validateFields, setFieldsValue} = this.props.form;
        validateFields((err, {version, file, releaseNotes}) => {
            if (!err) {
                let data = {};
                data.app = {
                    id: this.props.params.appId,
                };
                data.version = version;
                data.file = file;
                data.releaseNotes = {
                    'zh_CN': releaseNotes,
                };
                App.api('adm/app/release_save', {release: JSON.stringify({...data, id: this.state.id})})
                    .then(() => {
                        message.success('修改成功');
                        setFieldsValue({
                            version: '',
                            file: null,
                            releaseNotes: '',
                        });
                        this.setState({
                            loading: false,
                            addModalVisible: false,
                        }, this.loadData)
                    })
            }
        })
    };

    handleDelete = (id) => {
        Modal.confirm({
            title: '删除',
            content: '确认删除吗?',
            onOk: () => {
                this.setState({
                    loading: true,
                });
                App.api('adm/app/release_remove', {
                    id,
                }).then(() => {
                    message.success('删除成功');
                    this.setState({
                        loading: false,
                    }, this.loadData)
                })
            }
        })

    };


    render() {
        const {getFieldDecorator, setFieldsValue} = this.props.form;

        const media = this.state.media;
        const pagination = {
            total: this.state.table.total,
            current: ~~this.state.table.offset / 10 + 1,
            showSizeChanger: true,
        };

        return (
            <div>
                <BreadcrumbCustom first={'应用'} second={'版本管理'}/>
                <Card>
                    <Row style={{margin: '10px 0'}}>
                        <Col span={8}>
                            <Input value={this.props.params.appId} disabled/>
                        </Col>
                        <Col span={8}>
                            <Button type='primary' onClick={() => {
                                this.setState({
                                    addModalVisible: true,
                                })
                            }}>发布新版本</Button>
                        </Col>
                    </Row>
                    <Modal
                        confirmLoading={this.state.confirmLoading}
                        title='添加'
                        visible={this.state.addModalVisible}
                        onOk={this.handleAdd}
                        onCancel={() => {
                            setFieldsValue({
                                version: '',
                                file: null,
                                releaseNotes: '',
                            });
                            this.setState({
                                addModalVisible: false,
                                mediaId: '',
                                file: null,
                            })
                        }}
                    >
                        <Form>
                            <Form.Item
                                wrapperCol={{span: 8, offset: 4}}
                                labelCol={{span: 8}}
                                hasFeedback
                                label="版本号">
                                {getFieldDecorator('version', {
                                    rules: [{required: true}]
                                })(
                                    <Input placeholder="version"/>
                                )}
                            </Form.Item>
                            <Form.Item
                                hasFeedback
                                wrapperCol={{span: 8, offset: 4}}
                                labelCol={{span: 8}}
                                label="文件(iOS平台无需上传)">
                                {getFieldDecorator('file', {
                                    message: '备注必须填写',
                                })(
                                    <div className="antd-input" style={{border: '1px solid #d9d9d9'}}>
                                        <span>{this.state.file ? this.state.file : '上传文件'}</span>
                                        <Input type={'file'} style={{
                                            position: 'absolute',
                                            left: 0, right: 0, bottom: 0, top: 0,
                                            opacity: 0,
                                        }} onChange={(e) => {
                                            this.setState({
                                                file: e.target.value,
                                            })
                                        }}/>
                                    </div>
                                )}
                            </Form.Item>

                            <Form.Item
                                hasFeedback
                                wrapperCol={{span: 8, offset: 4}}
                                labelCol={{span: 8}}
                                label="notes">
                                {getFieldDecorator('releaseNotes', {
                                    rules: [{required: true}],
                                    message: '备注必须填写',
                                })(
                                    <Input.TextArea style={{minHeight: 20}} autosize/>
                                )}
                            </Form.Item>
                        </Form>
                    </Modal>
                    <div className="table">
                        <Row gutter={24}>
                            <Col>
                                <div className="gutter-box">
                                    <Card title={'版本管理'}>
                                        <Table
                                            loading={this.state.loading}
                                            rowKey={record => record.id}
                                            columns={this.columns}
                                            pagination={pagination}
                                            onChange={this.tableOnchange}
                                            dataSource={this.state.table.dataSource}
                                        />
                                    </Card>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </div>
        )
    }
}

export default Form.create()(Releases);

