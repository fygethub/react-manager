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

const URL_LIST = 'adm/app/apps';
const TABLE_NAME = '店铺列表';

const MenuItem = Menu.Item;
const FormItem = Form.Item;
const Option = Select.Option;

class Apps extends React.Component {
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
        };

        this.columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: '平台',
                dataIndex: 'platform',
                key: 'platform',
            },
            {
                title: '最小版本',
                dataIndex: 'minVersion',
                key: 'minVersion'
            }, {
                title: '外部Id',
                dataIndex: 'externalId',
                key: 'externalId'
            }, {
                title: '备注',
                dataIndex: 'notes',
                key: 'notes'
            }, {
                title: '操作',
                dataIndex: 'opt',
                className: 'txt-right',
                width: '80px',
                render: (obj, record) => {

                    return <Dropdown overlay={<Menu>
                        <MenuItem key="0">
                            <a href="javascript:;"
                               onClick={() => {
                                   App.go('app/apps/releases/' + record.id)
                               }}> 版本管理</a>
                        </MenuItem>
                        <MenuItem key="1">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.handleEdit(record.id);
                               }}> 编辑</a>
                        </MenuItem>
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
        document.onkeydown = (e) => {
            if (e.keyCode == 13) {
                this.loadData();
            }
        };

    }

    componentWillUnmount() {
        document.onkeydown = null;
    }


    tableOnchange = (pagination) => {
        this.setState({
            table: {
                ...this.state.table,
                pageSize: pagination.pageSize,
                current: pagination.current,
            }
        }, this.loadData);
    };


    loadData = () => {
        this.setState({
            loading: true,
        });
        App.api(URL_LIST, {
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
        App.api('adm/app/app', {
            id,
        }).then(({id, platform, minVersion, externalId, notes}) => {
            setFieldsValue({id, platform, minVersion, externalId, notes});
            this.setState({
                confirmLoading: false,
            });
        })
    };


    handleAdd = () => {
        this.setState({
            loading: true,
        });
        let {validateFields, setFieldsValue} = this.props.form;
        validateFields((err, {id, platform, minVersion, externalId, notes}) => {
            if (!err) {
                let data = {};
                data.id = id;
                data.platform = platform;
                data.minVersion = minVersion;
                data.minVersion = minVersion;
                data.externalId = externalId;
                data.notes = notes;
                App.api('adm/app/app_save', {app: JSON.stringify(data), id: this.state.id}).then(() => {
                    message.success('修改成功');
                    setFieldsValue({
                        id: null,
                        platform: '',
                        minVersion: '',
                        externalId: '',
                        notes: '',
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
        let {validateFields, setFieldsValue} = this.props.form;
        Modal.confirm({
            title: '删除',
            content: '确认删除吗?',
            onOk: () => {
                this.setState({
                    loading: true,
                });
                App.api('adm/app/app_remove', {
                    id,
                }).then(() => {
                    message.success('删除成功');
                    setFieldsValue({
                        id: '',
                        platform: '',
                        minVersion: '',
                        externalId: '',
                        notes: '',
                    });
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
            <div className="userDataList">
                <BreadcrumbCustom first={TABLE_NAME} second={TABLE_NAME}/>
                <Row style={{margin: '10px 0'}}>
                    <Col span={20}>
                        <Button type='primary' onClick={() => {
                            this.setState({
                                addModalVisible: true,
                            })
                        }}>创建</Button>
                    </Col>
                </Row>
                <Modal
                    confirmLoading={this.state.confirmLoading}
                    title='添加'
                    visible={this.state.addModalVisible}
                    onOk={this.handleAdd}
                    onCancel={() => {
                        setFieldsValue({
                            id: null,
                            platform: '',
                            minVersion: '',
                            externalId: '',
                            notes: '',
                        });
                        this.setState({
                            addModalVisible: false,
                            mediaId: '',
                        })
                    }}
                >
                    <Form>
                        <Form.Item
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            hasFeedback
                            label="ID">
                            {getFieldDecorator('id', {
                                rules: [{required: true}]
                            })(
                                <Input placeholder="id"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            hasFeedback
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="平台">
                            {getFieldDecorator('platform', {
                                rules: [{required: true}],
                            })(
                                <Select>
                                    <Option value={'ios'}>IOS</Option>
                                    <Option value={'android'}>Android</Option>
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="最小版本">
                            {getFieldDecorator('minVersion', {})(
                                <Input placeholder="最小版本"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="外部Appid">
                            {getFieldDecorator('externalId', {})(
                                <Input placeholder="外部AppId"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="备注">
                            {getFieldDecorator('notes', {})(
                                <Input placeholder="备注"/>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
                <div className="table">
                    <Row gutter={24}>
                        <Col>
                            <div className="gutter-box">
                                <Card title={TABLE_NAME}>
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
            </div>
        )
    }
}

export default Form.create()(Apps);
