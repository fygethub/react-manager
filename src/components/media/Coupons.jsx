import React from 'react';
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
    Menu,
    Dropdown,
    Select,
    InputNumber
} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

import Clipboard from 'react-clipboard.js';

const data_list_url = 'adm/media/coupons';
const Option = Select.Option;
const FormItem = Form.Item;
const MenuItem = Menu.Item;

class Coupons extends React.Component {
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
            loading: true,
            state: '0',
            visible: false,
            model: '',
            record: {},
        };

        this.columns = [
            {
                title: '序号',
                dataIndex: 'id',
                key: 'id',
                render: (col, row, i) => i + 1
            }, {
                title: '有效期',
                dataIndex: 'expire',
                key: 'expire',
                render: (expire) => {
                    return <span>{U.date.format(new Date(expire), 'yyyy-MM-dd hh:mm:ss')}</span>
                }

            }, {

                title: '有效天数',
                dataIndex: 'duration',
                key: 'duration',
                render: (val) => val > 0 ? <span style={{color: '#0f0'}}>{val}</span> :
                    <span style={{color: 'red'}}>{val}</span>
            }, {
                title: '等级',
                dataIndex: 'grade',
                key: 'grade',
                render: (grade) => {
                    switch (grade) {
                        case 2:
                            return <span>基础版</span>;
                        case 3:
                            return <span>专业版</span>;
                        case 4:
                            return <span>企业版</span>;
                    }
                }
            }, {
                title: '店铺',
                dataIndex: 'media',
                key: 'media',
                render: (media) => <span>{media ? <b>{media.name}</b> :
                    <b>--</b> }</span>
            }, {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                render: (state) => <span>{state == 1 ? <b className="color-success">未使用</b> :
                    state == 2 ? <b className="color-danger">已使用</b> : <b className="color-warn">已过期</b> }</span>
            }, {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: (obj, record) => {

                    return <Dropdown overlay={<Menu>
                        <MenuItem key="0">
                            <a href="javascript:;" onClick={() => {
                                if (record.media) {
                                    message.info('优惠券已使用,不能删除');
                                    return;
                                }
                                this.handleDelete(record.code);
                            }}
                            > 删除</a>
                        </MenuItem>
                        <MenuItem key="1">
                            <a href="javascript:;"
                               onClick={() => {
                                   this.setState({
                                       copyUrlVisible: true,
                                       code: record.code,
                                   })
                               }}
                            > 生成连接</a>
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
        }
    }

    handleDelete = (code) => {
        Modal.confirm({
            title: '提示',
            content: '删除优惠券?',
            onOk: () => {
                App.api('adm/media/remove_coupon', {
                    code,
                }).then(() => {
                    message.success('删除成功');
                    this.loadData();
                })
            },
            onCancel: () => {

            }
        })
    };


    loadData = () => {
        this.setState({
            loading: true,
        });
        App.api(data_list_url, {
            offset: this.state.table.offset,
            limit: this.state.table.pageSize,
            state: this.state.state,
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


    tableOnchange = (pagination) => {
        this.setState({
            table: {
                ...this.state.table,
                pageSize: pagination.pageSize,
                current: pagination.current,
            }
        }, this.loadData);

    };


    /*打开modle面板*/
    showModal = () => {
        this.setState({
            visible: true,
        })
    };

    /*关闭面板*/
    hideModel = () => {
        this.setState({
            visible: false,
        })
    };

    hideUrlModel = () => {
        this.setState({
            copyUrlVisible: false,
        })
    };

    onSearchSelect = (state) => {
        this.setState({
            state,
        })
    };

    handleSubmit = () => {
        let _this = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (values.duration == 0 || !values.duration) {
                    message.info('赠送时长应大于0');
                }
                App.api('adm/media/create_coupon', {
                    ...values
                }).then(() => {
                    message.success('创建成功');
                    this.hideModel();
                    this.loadData();
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
            current: ~~(this.state.table.offset / 10) + 1,
            showSizeChanger: true,
        };
        const type = this.state.model;
        const record = this.state.record;

        let _this = this;

        return (
            <div className="userDataList">
                <BreadcrumbCustom first="店铺" second="优惠券列表"/>
                <Modal
                    title={'复制连接给好友'}
                    visible={this.state.copyUrlVisible}
                    footer={null}
                    onCancel={this.hideUrlModel}
                >
                    <Row>
                        <Col span={18}><Input readOnly defaultValue={App.getCouponsUrl(this.state.code)}/></Col>
                        <Col span={4}> <Clipboard data-clipboard-text={App.getCouponsUrl(this.state.code)}
                                                  style={{background: 'none'}} onSuccess={() => {
                            message.success('复制成功');
                            this.setState({
                                copyUrlVisible: false,
                                code: '',
                            })
                        }}>
                            <span className="ant-btn" style={{
                                color: '#fff',
                                lineHeight: '25px',
                                backgroundColor: '#108ee9',
                                borderColor: '#108ee9',
                            }}>复制连接
                            </span>
                        </Clipboard></Col>
                    </Row>
                </Modal>
                <Modal
                    title={'添加优惠券'}
                    visible={this.state.visible}
                    onOk={this.handleSubmit}
                    onCancel={this.hideModel}
                    className={'donate'}
                >
                    <Form >
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
                                initialValue: '7',
                                rules: [{required: true, message: 'Please input your time above 0'}]
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
                            wrapperCol={{span: 8, offset: 16}}
                            labelCol={{span: 4}}
                        >
                        </FormItem>
                    </Form>
                </Modal>
                <Row style={{margin: '10px 0'}}>
                    <Col span={8}>
                        <Select style={{width: '90%'}}
                                value={this.state.state}
                                onSelect={this.onSearchSelect}>
                            <Option value='0'>全部</Option>
                            <Option value='1'>未使用</Option>
                            <Option value='2'>已使用</Option>
                            <Option value='3'>已过期</Option>
                        </Select>
                    </Col>
                    <Col span={12}>
                        <Button type='primary' htmlType='submit' onClick={this.loadData}>搜索</Button>
                        &nbsp;
                        &nbsp;
                        <Button type='danger' onClick={this.showModal}>创建</Button>
                    </Col>
                </Row>
                <div className="table">
                    <Row gutter={24}>
                        <Col>
                            <div className="gutter-box">
                                <Card title="优惠券列表">
                                    <Table
                                        loading={this.state.loading}
                                        rowKey={record => record.code}
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

export default Form.create()(Coupons);
