import React from 'react';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';


const Option = Select.Option;
const FormItem = Form.Item;
class searchForm extends React.Component {

    handleSubmit = (e) => {
        e.preventDefault();
        const {handleSearch,form:{validateFields}} = this.props;
        validateFields((err, values) => {
            console.log(values);
            if (!err) {
                handleSearch(values);
            }
        })
    };

    render() {
        const selectType = [{name: '昵称',value: 'nick'},
            {name: '手机号',value: 'mobile'},
            {name: 'ID',value: 'id'}];
        const {getFieldDecorator} = this.props.form;
        return <Form layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item>
                {getFieldDecorator('type', {initialValue: 'id'})(
                    <Select>
                        {
                            selectType.map((val,i) => (
                                <Option key={i} value={val.value}>{val.name}</Option>
                                )
                            )
                        }
                    </Select>
                )}
            </Form.Item>
            <Form.Item>
                {getFieldDecorator('q')(
                    <Input />
                )}
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" >
                    搜索
                </Button>
            </Form.Item>
        </Form>
    }
}

const SearchFormWrap = Form.create()(searchForm);

class Users extends React.Component {
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
            visible: false,
            model: '',
            record: {},
        };

        this.columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: '昵称',
                dataIndex: 'nick',
                key: 'nick',
            },
            {
                title: '头像',
                dataIndex: 'avatar',
                key: 'avatar',
                render: (text, record, index) => {
                    return <div className="table-avatar">
                        <img src={record.avatar} alt=""/>
                    </div>
                },
            },
            {
                title: '姓名',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: '手机',
                dataIndex: 'mobile',
                key: 'mobile',
            },
            {
                title: '店铺',
                dataIndex: 'media',
                key: 'media',
                render: (media) => <span>{media && media.name}</span>
            },
            {
                title: '注册时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (text, record, index) => {
                    return <span>{U.date.format(new Date(record.createdAt), 'yyyy-MM-dd hh:mm:ss')}</span>
                }

            }, {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: this.renderAction,
                width: 200,
                fixed: 'right',
            }
        ];
    }

    componentDidMount() {
        this.loadData();
        document.onkeydown = (e) => {
            if (e.keyCode == 13) {
                this.onSearch();
            }
        }
    }

    loadData = () => {
        App.api('adm/user/users', {
            offset: this.state.table.pageSize * (this.state.table.current - 1),
            limit: this.state.table.pageSize,
        }).then((result) => {
            this.setState({
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

    handleSearch = (search) => {

        App.api('adm/user/users', {
            offset: this.state.table.pageSize * (this.state.table.current - 1),
            limit: this.state.table.pageSize,
            ...search,
        }).then((result) => {
            this.setState({
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


    tableOnchange = (pagination) => {
        this.setState({
            table: {
                ...this.state.table,
                pageSize: pagination.pageSize,
                current: pagination.current,
            }
        }, this.loadData);

    };

    renderAction = (text, record) => {
        return <div>
            <a onClick={this.showModal('donate', record)}>赠送店铺</a>
        </div>
    };

    /*打开modle面板*/
    showModal = (modal = 'donate', record) => () => {
        this.setState({
            visible: true,
            model: modal,
            record: record,
        })
    };

    /*关闭面板*/
    hideModel = () => {
        this.setState({
            visible: false,
        })
    };


    handleSubmit = () => {
        let _this = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                App.api('adm/user/present_media', {
                    ...values
                }).then(() => {
                    message.success('成功');
                    _this.hideModel();
                })
            }
        })
    };

    render() {
        const {getFieldDecorator, setFieldsValue} = this.props.form;
        const FormItem = Form.Item;
        const Option = Select.Option;
        const pagination = {
            total: this.state.table.total,
            current: ~~this.state.table.offset / 10 + 1,
            showSizeChanger: true,
        };
        const type = this.state.model;
        const record = this.state.record;

        let _this = this;

        return (
            <div className="userDataList">
                <BreadcrumbCustom first="用户" second="用户列表"/>
                <Modal
                    title={'赠送店铺'}
                    visible={this.state.visible}
                    onOk={this.handleSubmit}
                    onCancel={this.hideModel}
                    className={'donate'}
                >
                    <Form >
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            label="头像"
                            labelCol={{span: 4}}
                        >
                            <div className="avatar">
                                <img src={record.avatar} alt="avatar"/>
                            </div>
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            label='Id'
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('userId', {
                                initialValue: record.id,
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            label="昵称"
                            labelCol={{span: 4}}
                        >
                            <Input value={record.nick} disabled/>
                        </FormItem>
                        <FormItem
                            label="赠送套餐"
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('grade', {
                                rules: [{required: true}],
                                initialValue: '2',
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
                            label='赠送时长'
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('duration', {
                                initialValue: 365,
                                rules: [{required: true, message: 'Please input your time above 0'}]
                            })(
                                <InputNumber style={{width: '100%'}} min={0}/>
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 16}}
                            labelCol={{span: 4}}
                        >
                        </FormItem>
                    </Form>
                </Modal>
                <Row style={{margin: '10px 0'}}>
                    <Col span = {20}>
                        <SearchFormWrap handleSearch = {this.handleSearch} />
                    </Col>
                </Row>
                <div className="table">
                    <Row gutter={24}>
                        <Col>
                            <div className="gutter-box">
                                <Card title="用户列表管理">
                                    <Table
                                        rowKey={record => record.nick}
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

export default Form.create()(Users);
