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
import {Link} from 'react-router';
import jrQrcode from  'jr-qrcode';

const URL_LIST = 'adm/media/medias';
const TABLE_NAME = '店铺列表';

const wakkaaLogo = require('../../asssets/images/common/wakkaa-logo.png');
const MenuItem = Menu.Item;
const FormItem = Form.Item;
const Option = Select.Option;

class Medias extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputText: '',
            table: {
                dataSource: [],
                offset: 0,
                total: 0,
                pageSize: 10,
                current: 0,
            },
            imgBase64: '',
            media: {},
            financeVisible: false,
            showPresentFlow: false,
            visible: false,
            amountVisible: false,
        };

        this.columns = [
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'LOGO',
                dataIndex: 'img',
                key: 'img',
                render: (img) => {
                    return <div className="table-avatar">
                        <img src={img || wakkaaLogo} alt="avatar"/>
                    </div>
                },
            },
            {
                title: '名称',
                dataIndex: 'name',
                key: 'name'
            }, {
                title: '剩余天数',
                dataIndex: 'remainingDays',
                key: 'remainingDays',
                render: (val) => val > 0 ? <span style={{color: '#0f0'}}>{val}</span> :
                    <span style={{color: 'red'}}>{val}</span>
            },
            {
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
            },
            {
                title: '状态',
                dataIndex: 'state',
                key: 'state',
                render: (state) => <span>{state == 1 ? <b className="color-success">正常</b> :
                    <b className="color-danger">封禁</b> }</span>
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
                dataIndex: 'opt',
                className: 'txt-right',
                width: '80px',
                render: (obj, record) => {

                    return <Dropdown overlay={<Menu>
                        <MenuItem key="0">
                            <a href="javascript:;"
                               onClick={() => this.cancelModal(record.id, record.state !== 1)
                               }> {record.state === 1 ? '封禁' : '解封'}</a>
                        </MenuItem>
                        <MenuItem key="1">
                            <a href="javascript:;" onClick={() => this.detailModal(record.id, 2)}>账号详情</a>
                        </MenuItem>
                        <Menu.Divider/>
                        <MenuItem key="2">
                            <a href="javascript:;" onClick={() => this.detailModal(record.id, 1)}>续费升/降级</a>
                        </MenuItem>
                        <MenuItem key="3">
                            <a href="javascript:;" onClick={() => this.detailModal(record.id, 3)}>手动提现</a>
                        </MenuItem>
                        <MenuItem key="4">
                            <a href="javascript:;" onClick={() => this.wxQrcode(record.id)}>查看店铺二维码</a>
                        </MenuItem>
                        <Menu.Divider/>

                        <MenuItem key="5">
                            <Link to={`/app/media/maps/map/${record.id}`}>公众号设置</Link>
                        </MenuItem>
                        <MenuItem key="6">
                            <a href="javascript:;" onClick={() => this.unlinkWx(record.id)}>微信解绑</a>
                        </MenuItem>
                        <Menu.Divider/>

                        <MenuItem key="7">
                            <a href="javascript:;" onClick={() => this.handleShowPresentFlow(record.id)}>流量充值</a>
                        </MenuItem>
                        <MenuItem key="8">
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    showMediaKeep: true,
                                    mediaId: record.id,
                                })
                            }}>新增店铺管理员</a>
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

    submitPresentFlow = () => {
        App.api('adm/media/present_flow', {
            mediaId: this.state.mediaId,
            amount: this.state.amount,
        }).then(() => {
            message.success('充值成功');
            this.setState({
                mediaId: null,
                showPresentFlow: false,
                amount: 0,
            });
        })
    };

    handleShowPresentFlow = (mediaId) => {
        this.setState({
            mediaId,
            showPresentFlow: true,
        });
    };

    updateAdminKeeper = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                let errorMsg = true;
                Object.keys(err).forEach(key => {
                    if (errorMsg) {
                        message.warning(err[key].errors[0].message);
                        errorMsg = false;
                    }
                });
            }
            if (!err) {
                let data = {
                    mediaId: values.mediaId,
                    admin: JSON.stringify({
                        username: values.adminName,
                        password: values.password,
                        name: values.name,
                    })
                };

                App.api('adm/media/create_admin', data).then(() => {
                    message.success('修改成功');
                    this.props.form.setFieldsValue({
                        adminName: '',
                        password: '',
                        name: '',
                    });
                    this.setState({
                        showMediaKeep: false,
                    }, this.loadData)
                })
            }
        })
    };

    unlinkWx = (mediaId) => {
        Modal.confirm({
            title: '解绑确认',
            onOk: () => {
                App.api('adm/media/unlink_wx', {
                    mediaId,
                }).then(() => {
                    message.success('解绑成功');
                })
            }
        });

    };


    loadData = () => {
        App.api(URL_LIST, {
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

    detailModal = (mediaId, visible = 1) => {
        App.api('adm/media/media', {
            mediaId
        }).then(media => {
            this.setState({
                media,
                visible: visible === 1,
                financeVisible: visible === 2,
                amountVisible: visible === 3,
            })
        })
    };


    cancelModal = (mediaId, cancel) => {
        let model = Modal.confirm({
            title: '提示',
            okText: '确定',
            content: '确定解/禁封操作吗?',
            cancelText: '取消',
            onOk: () => {
                App.api('adm/media/block', {
                    mediaId,
                    cancel,
                }).then(() => {
                    this.loadData();
                    model.destroy();
                });
            },
            onCancel: () => {
                model.destroy();
            },
        });

    };

    handleSearch = (e) => {
        e.preventDefault();
        const {form: {validateFields}} = this.props;
        validateFields((err, val) => {
            if (!err) {
                App.api(URL_LIST, {
                    offset: this.state.table.pageSize * (this.state.table.current - 1),
                    limit: this.state.table.pageSize,
                    ...val,
                }).then((result) => {
                    this.setState({
                        table: {
                            ...this.state.table,
                            dataSource: result.items,
                            pageSize: result.limit,
                            offset: result.offset,
                            total: result.total,
                        },
                    })
                })
            }
        });


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
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                App.api('adm/media/upgrade', {
                    mediaId: values.id,
                    grade: values.grade,
                    days: values.days,
                }).then(() => {
                    message.success('修改成功');
                    this.setState({
                        visible: false,
                        media: {},
                    }, this.loadData)
                })
            }
        })
    };

    wxQrcode = (id) => {
        //message.info('OPPS~ 未实现');
        let imgBase64 = jrQrcode.getQrBase64(App.getShopURL(id), {
            padding: 10,   // 二维码四边空白（默认为10px）
            width: 256,  // 二维码图片宽度（默认为256px）
            height: 256,  // 二维码图片高度（默认为256px）
            correctLevel: jrQrcode.QRErrorCorrectLevel.H,    // 二维码容错level（默认为高）
            reverse: false,        // 反色二维码，二维码颜色为上层容器的背景颜色
            background: "#ffffff",    // 二维码背景颜色（默认白色）
            foreground: "#000000"     // 二维码颜色（默认黑色）
        });
        this.setState({
            imgBase64,
            show_qrcode: true,
        })
    };


    handleAmount = (mediaId) => {
        App.api('adm/finance/media_withdraw', {
            mediaId,
            amount: this.state.amount * 100,
        }).then(res => {
            message.success('提现成功');
            this.setState({
                amountVisible: false,
            })
        })
    };

    showQrcode = (val) => {
        this.setState({show_qrcode: val ? val : false})
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
                <Modal
                    visible={this.state.showPresentFlow}
                    title="流量充值"
                    onOk={this.submitPresentFlow}
                    onCancel={() => this.setState({showPresentFlow: false, mediaId: null, amount: 0})}>
                    <p>充值账户:{this.state.mediaId}</p>
                    <Input addonAfter="元"
                           onChange={(e) => this.setState({amount: e.target.value * 100})}/>
                </Modal>
                <Modal
                    visible={this.state.show_qrcode}
                    title="微信扫码"
                    width='330px'
                    onCancel={() => this.showQrcode()}
                    footer={null}>
                    <img src={this.state.imgBase64} id='qrcode' style={{width: '300px', height: '300px'}}/>
                </Modal>
                <Modal
                    title='增加店铺管理员'
                    visible={this.state.showMediaKeep}
                    onOk={this.updateAdminKeeper}
                    onCancel={() => this.setState({
                        showMediaKeep: false,
                        mediaId: '',
                    })}
                >
                    <Form>
                        <Form.Item
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="店铺ID">
                            {getFieldDecorator('mediaId', {
                                initialValue: this.state.mediaId,
                            })(
                                <Input disabled placeholder="店铺ID"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            hasFeedback
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="姓名">
                            {getFieldDecorator('name', {
                                rules: [{required: true}],
                            })(
                                <Input placeholder="姓名"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            hasFeedback
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="登录名">
                            {getFieldDecorator('adminName', {
                                rules: [{required: true}],
                            })(
                                <Input placeholder="用户名"/>
                            )}
                        </Form.Item>
                        <Form.Item
                            hasFeedback
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="密码">
                            {getFieldDecorator('password', {
                                rules: [{required: true}],
                            })(
                                <Input type='password' placeholder="密码"/>
                            )}
                        </Form.Item>
                    </Form>
                </Modal>
                <Row style={{margin: '10px 0'}}>
                    <Col span={20}>
                        <Form layout="inline">
                            <Form.Item>
                                {getFieldDecorator('q')(
                                    <Input placeholder="店铺名"/>
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button type='primary' htmlType='submit' onClick={this.handleSearch}>搜索</Button>
                                &nbsp;
                                &nbsp;
                                <Button type='danger' onClick={() => App.go('app/media/media-create')}>创建</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>

                <div className="table">
                    <Row gutter={24}>
                        <Col>
                            <div className="gutter-box">
                                <Card title={TABLE_NAME}>
                                    <Table
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
                <Modal
                    title={'提现'}
                    visible={this.state.amountVisible}
                    onOk={() => this.handleAmount(this.state.media.id)}
                    onCancel={() => this.setState({amountVisible: false,})}
                >
                    <Card>
                        <Row gutter={8}>
                            <Col span={8}> 店铺ID </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.id}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 店铺名称 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.weixin && media.weixin.nick}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 总收入 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.income / 100 + '元'}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 账户余额 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.balance / 100 + '元'}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 提现金额 </Col>
                            <Col span={12} offset={4}>
                                <InputNumber value={this.state.amount}
                                             onChange={e => this.setState({amount: e})}/>
                            </Col>
                        </Row>
                    </Card>
                </Modal>
                <Modal
                    title={'详情'}
                    visible={this.state.financeVisible}
                    onOk={() => {
                        this.setState({financeVisible: false,});
                        message.info('待添加');
                    }}
                    onCancel={() => this.setState({financeVisible: false,})}
                >
                    <Card>
                        <Row gutter={8}>
                            <Col span={8}> 店铺ID </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.id}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 店铺名称 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.weixin && media.weixin.nick}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 套餐 </Col>
                            <Col span={12} offset={4}><Input readOnly
                                                             value={['', '', '基础版', '专业版', '企业版'][media.grade]}/></Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 微信头像 </Col>
                            <Col span={12} offset={4}>
                                <img src={(media.weixin && media.weixin.avatar) || wakkaaLogo} alt="Avatar"
                                     style={{width: 40, height: 40}}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 微信昵称 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.weixin && media.weixin.nick}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 绑定手机号 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.mobile}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 绑定人姓名 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.realName}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 总收入 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.income / 100 + '元'}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 流量余额 </Col>
                            <Col span={12} offset={4}>
                                <Input readOnly value={media.flowBalance / 100 + '元'}/>
                            </Col>
                        </Row>
                        <Row gutter={8}>
                            <Col span={8}> 账户余额 </Col>
                            <Col span={12} offset={4}>
                                <InputNumber readOnly value={media.balance / 100 + '元'}/>
                            </Col>
                        </Row>
                    </Card>
                </Modal>
                <Modal
                    title={'详情'}
                    visible={this.state.visible}
                    onOk={this.handleSubmit}
                    onCancel={() => this.setState({visible: false,})}
                >
                    <Form >
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label="头像"
                        >
                            <div className="avatar">
                                <img
                                    src={(media.weixin && media.weixin.avatar) ? media.weixin.avatar : wakkaaLogo}
                                    alt="avatar"/>
                            </div>
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            label='店铺ID'
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('id', {
                                initialValue: media.id,
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            label="店铺名称"
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('nick', {
                                initialValue: media.weixin && media.weixin.nick,
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                        <FormItem
                            label="选择套餐"
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('grade', {
                                rules: [{required: true}],
                                initialValue: media.grade + '',
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
                            label='到期日'
                            labelCol={{span: 4}}
                        >
                            {getFieldDecorator('duration', {
                                initialValue: U.date.format(new Date(media.validThru), 'yyyy-MM-dd hh:mm:ss'),
                                rules: [{required: true}]
                            })(
                                <Input disabled/>
                            )}
                        </FormItem>
                        <FormItem
                            wrapperCol={{span: 8, offset: 4}}
                            labelCol={{span: 4}}
                            label='续费日期'
                        >
                            {getFieldDecorator('days', {
                                rules: [{required: true}],
                                initialValue: '0',
                            })(
                                <Select>
                                    <Option value={'0'}>不续费</Option>
                                    <Option value={'7'}>7天</Option>
                                    <Option value={'30'}>一个月</Option>
                                    <Option value={'90'}>3个月</Option>
                                    <Option value={'180'}>半年</Option>
                                    <Option value={'365'}>一年</Option>
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(Medias);
