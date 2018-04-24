import React from 'react';
import {
    message, Card, Row,
    Col, Table, Input, Button,
    Icon, Dropdown, Modal,
    Form, Select, InputNumber,
    Menu,
    Transfer,
}
    from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import Sping from '../../common/Sping.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';
import './cssMedia/media.less';
import {Link} from 'react-router';
import jrQrcode from  'jr-qrcode';

const URL_LIST = 'adm/media/medias';
const TABLE_NAME = '店铺列表';

const wakkaaLogo = require('../../asssets/images/common/wakkaa-logo.png');
const MenuItem = Menu.Item;
const FormItem = Form.Item;
const Option = Select.Option;

@Sping
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
            q: '',
            loading: false,
            mobile: '',
            imgBase64: '',
            media: {},
            features: [],
            financeVisible: false,
            showPresentFlow: false,
            showUpdateMobile: false,
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
                        <MenuItem key="1">
                            <a href="javascript:;" onClick={() => this.detailModal(record.id, 2)}>账号详情</a>
                        </MenuItem>
                        <Menu.Divider/>
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

                        <MenuItem key="8">
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    showMediaKeep: true,
                                    mediaId: record.id,
                                })
                            }}>新增店铺管理员</a>
                        </MenuItem>
                        <Menu.Divider/>
                        <MenuItem key="9">
                            <a href="javascript:;" onClick={() => {
                                this.setState({
                                    showUpdateMobile: true,
                                    mediaId: record.id,
                                })
                            }}>修改手机号</a>
                        </MenuItem>
                        <MenuItem key="10">
                            <a onClick={() => App.go(`/app/ckjr/records/${record.id}`)}>数据迁移</a>
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

    startLoading = () => {
        this.props.startLoading();
    };

    stopLoading = () => {
        this.props.stopLoading();
    };

    submitUpdateMobiel = () => {
        if (!this.state.media.mobile || this.state.media.mobile.length < 11) {
            message.info('请输入正确手机号');
            return;
        }
        let mobile = this.state.media.mobile;

        if (mobile.split('-')[1]) {
            mobile = mobile.split('-')[1];
        }

        App.api('adm/media/update_ownermobile ', {
            mediaId: this.state.media.id,
            mobile,
        }).then(() => {
            message.success('修改成功');
            this.setState({
                mobileUpdateVisible: false,
            });
        })
    };
    submitUpdateName = () => {
        if (!this.state.media.realName) {
            message.info('请输入姓名');
            return;
        }
        let realName = this.state.media.realName;

        App.api('adm/media/update_ownername', {
            mediaId: this.state.media.id,
            name: realName,
        }).then(() => {
            message.success('修改成功');
            this.setState({
                nameUpdateVisible: false,
            });
        })
    };

    handleShowPresentFlow = () => {
        this.setState({
            showPresentFlow: true,
        });
    };

    updateAdminKeeper = () => {
        this.props.form.validateFields((err, values) => {
            if (err && (err.adminName || err.password || err.name)) {
                let errorMsg = true;
                Object.keys(err).forEach(key => {
                    if (errorMsg) {
                        message.warning(err[key].errors[0].message);
                        errorMsg = false;
                    }
                });
                return;
            }

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
            q: this.state.q,
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
        });

        App.api('adm/media/features').then((features) => {
            this.setState({
                features
            })
        })
    };

    detailModal = (mediaId, visible = 1) => {
        this.startLoading();
        App.api('adm/media/media', {
            mediaId
        }).then(media => {

            if (visible === 'funnel') {
                this.setState({
                    selectedKeys: media.features,
                    mediaId,
                })
            }
            this.setState({
                media,
                selectedKeys: media.features,
                visible: visible === 1,
                financeVisible: visible === 2,
                amountVisible: visible === 3,
                featuresVisible: visible === 'funnel',
            }, () => {
                this.stopLoading();
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
                    mediaId: this.state.media.id,
                    cancel,
                }).then(() => {
                    model.destroy();
                    this.setState({
                        media: {
                            ...this.state.media,
                            state: cancel ? 1 : 2,
                        }
                    })
                });
            },
            onCancel: () => {
                model.destroy();
            },
        });

    };

    submitPresentFlow = () => {
        if (!this.state.amount) {
            message.info('输入充值金额');
            return;
        }

        App.api('adm/media/present_flow', {
            mediaId: this.state.media.id,
            amount: this.state.amount,
        }).then(() => {
            message.success('充值成功');
            let flowBalance = this.state.media.flowBalance;
            flowBalance = (flowBalance - 0) + this.state.amount;
            this.setState({
                media: {
                    ...this.state.media,
                    flowBalance,
                },
                showPresentFlow: false,
                amount: 0,
            });
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

    wxQrcode = (id) => {
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
            mediaId: id,
            show_qrcode: true,
        })
    };

    handleAmount = (mediaId) => {
        App.api('adm/finance/media_withdraw', {
            mediaId,
            amount: this.state.withdrawAmount * 100,
        }).then(res => {
            message.success('提现成功');
            let balance = this.state.media.balance - this.state.withdrawAmount * 100;
            this.setState({
                media: {
                    ...this.state.media,
                    balance,
                },
                amountVisible: false,
            })
        })
    };

    showQrcode = (val) => {
        this.setState({show_qrcode: val ? val : false})
    };

    handleChange = (targetKeys, direction, moveKeys) => {
        this.setState({
            selectedKeys: targetKeys,
            saveTransferVisible: true,
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
                <Modal
                    visible={this.state.show_qrcode}
                    title="微信扫码"
                    width='330px'
                    onCancel={() => this.showQrcode()}
                    footer={null}>
                    <div>
                        <h3>店铺地址:  {this.state.mediaId && App.getShopURL(this.state.mediaId)}</h3>
                        <img src={this.state.imgBase64} id='qrcode' style={{width: '300px', height: '300px'}}/>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.showPresentFlow}
                    title="流量充值"
                    onOk={this.submitPresentFlow}
                    onCancel={() => this.setState({showPresentFlow: false, amount: 0})}>
                    <p>充值账户:{this.state.mediaId}</p>
                    <Input addonAfter="元"
                           value={(this.state.amount || 0) / 100 }
                           onChange={(e) => this.setState({amount: e.target.value * 100})}/>
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
                                <Input value={this.state.q} onChange={(e) => {
                                    this.setState({
                                        q: e.target.value,
                                    })
                                }} placeholder="店铺名"/>
                            </Form.Item>
                            <Form.Item>
                                <Button type='primary' htmlType='submit' onClick={this.loadData}>搜索</Button>
                                &nbsp;
                                &nbsp;
                                <Button type='danger' onClick={() => App.go('/app/media/media-create')}>创建</Button>
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
                                <InputNumber value={this.state.withdrawAmount}
                                             onChange={e => this.setState({withdrawAmount: e})}/>
                            </Col>
                        </Row>
                    </Card>
                </Modal>
                <Modal
                    confirmLoading={this.state.confirmLoading}
                    visible={this.state.financeVisible}
                    footer={false}
                    onCancel={() => this.setState({financeVisible: false,})}
                    title="店铺详情">
                    <Card bordered={false}>
                        <Row className={'media-row-border-bottom media-modal-row'}>
                            <Col span={6}>
                                <img
                                    className="media-info-avatar"
                                    src={ media.img || wakkaaLogo}
                                    alt=""/>
                            </Col>
                            <Col span={12}>
                                <Row>
                                    <Col span={6}>
                                        <div>店铺名称:</div>
                                    </Col>
                                    <Col span={12}>
                                        {media.name}
                                    </Col>
                                    <Col span={6}>
                                        <Button type='primary'>
                                            <a href="javascript:;"
                                               onClick={() => this.cancelModal(media.id, media.state !== 1)
                                               }> {media.state === 1 ? '封禁店铺' : '解封店铺'}</a>
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <div>店铺Id:</div>
                                    </Col>
                                    <Col span={18}>
                                        {media.id}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <div>到期时间:</div>
                                    </Col>
                                    <Col span={18}>
                                        {U.date.format(new Date(media.validThru), 'yyyy-MM-dd hh:mm:ss')}
                                    </Col>
                                </Row>
                                <Row type={'flex'} align={'middle'}>
                                    <Col span={6}>
                                        <div>绑定姓名:</div>
                                    </Col>
                                    {!this.state.nameUpdateVisible && <Col span={18}>
                                        {media.realName}<a href="javascript:void(0)" onClick={() => {
                                        this.setState({
                                            nameUpdateVisible: true,
                                        })
                                    }}> 修改</a>
                                    </Col>}
                                    {this.state.nameUpdateVisible && <Col span={8}>
                                        <Input value={media.realName}
                                               onChange={(e) => this.setState({
                                                   media: {
                                                       ...media,
                                                       realName: e.target.value
                                                   }
                                               })}/>
                                    </Col>}
                                    {this.state.nameUpdateVisible && <Col span={4} offset={1}>
                                        <a href="javascript:void(0)" onClick={() => {
                                            this.submitUpdateName()
                                        }}> 修改</a>
                                    </Col>}
                                    {this.state.nameUpdateVisible && <Col span={4}>
                                        <a href="javascript:void(0)" onClick={() => {
                                            this.setState({
                                                nameUpdateVisible: false,
                                            })
                                        }}> 取消</a>
                                    </Col>}
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <div>剩余时间:</div>
                                    </Col>
                                    <Col span={18}>
                                        {media.remainingDays} 天
                                        <a onClick={() => {
                                            this.setState({
                                                accDayFeeVisible: true,
                                            })
                                        }}> 续费</a>
                                    </Col>
                                </Row>
                                {this.state.accDayFeeVisible &&
                                <Row
                                    type={'flex'}
                                    align={'middle'}>
                                    <Col span={8}>
                                        <Select style={{width: '100%'}} onChange={(e) => {
                                            this.setState({
                                                days: e.target ? e.target.value : e,
                                            })
                                        }}>
                                            <Option value={'0'}>不续费</Option>
                                            <Option value={'7'}>7天</Option>
                                            <Option value={'30'}>一个月</Option>
                                            <Option value={'90'}>3个月</Option>
                                            <Option value={'180'}>半年</Option>
                                            <Option value={'365'}>一年</Option>
                                        </Select>
                                    </Col>
                                    <Col span={6} offset={1}>
                                        <a href="javascript:void(0)" onClick={() => {
                                            this.setState({
                                                confirmLoading: true,
                                            });
                                            this.state.days != 0 && App.api('adm/media/upgrade', {
                                                mediaId: this.state.media.id,
                                                days: this.state.days,
                                                grade: 4,
                                            }).then(() => {
                                                message.info('充值成功');
                                                let media = this.state.media;
                                                media.remainingDays = parseInt(media.remainingDays) + parseInt(this.state.days || 0);
                                                media.validThru = new Date(media.validThru).getTime() + parseInt(this.state.days) * 24 * 60 * 60 * 1000;
                                                this.setState({
                                                    media,
                                                    accDayFeeVisible: false,
                                                    confirmLoading: false,
                                                })
                                            })
                                        }}>确定</a>
                                    </Col>
                                    <Col span={4}>
                                        <a href="javascript:void(0)" onClick={() => this.setState({
                                            accDayFeeVisible: false,
                                        })}>取消</a>
                                    </Col>
                                </Row>}
                            </Col>

                        </Row>
                        <Row className={'media-row-border-bottom media-modal-row'}>
                            <Col span={24}>
                                {media.weixin && media.weixin.avatar && <Row>
                                    <Col span={6}>
                                        <div>绑定微信头像:</div>
                                    </Col>
                                    <Col span={6}>
                                        <img
                                            style={{width: 40, height: 40}}
                                            src={media.weixin.avatar} alt=""/>
                                    </Col>
                                </Row>}
                                <Row>
                                    <Col span={6}>
                                        <div>绑定微信号:</div>
                                    </Col>
                                    <Col span={6}>
                                        {media.weixin && media.weixin.nick}
                                    </Col>
                                </Row>
                                <Row type={'flex'} align={'middle'}>
                                    <Col span={6}>
                                        <span>绑定人手机号:</span>
                                    </Col>
                                    {!this.state.mobileUpdateVisible && <Col span={12}>
                                        {media.mobile}<a href="javascript:void(0)" onClick={() => {
                                        this.setState({
                                            mobileUpdateVisible: true,
                                        })
                                    }}> 修改</a>
                                    </Col>}
                                    {this.state.mobileUpdateVisible && <Col>
                                        <Input value={media.mobile}
                                               onChange={(e) => this.setState({
                                                   media: {
                                                       ...media,
                                                       mobile: e.target.value
                                                   }
                                               })}/>
                                    </Col>}
                                    {this.state.mobileUpdateVisible && <Col span={4} offset={1}>
                                        <a href="javascript:void(0)" onClick={() => {
                                            this.submitUpdateMobiel()
                                        }}> 修改</a>
                                    </Col>}
                                    {this.state.mobileUpdateVisible && <Col span={4}>
                                        <a href="javascript:void(0)" onClick={() => {
                                            this.setState({
                                                mobileUpdateVisible: false,
                                            })
                                        }}> 取消</a>
                                    </Col>}
                                </Row>
                            </Col>
                        </Row>
                        <Row className='media-row-border-bottom media-modal-row'>
                            <Col span={24}>
                                <Row>
                                    <Col span={6}>
                                        <div>账户总收入:</div>
                                    </Col>
                                    <Col span={6}>
                                        {media.income / 100 + '元'}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <div>账户余额:</div>
                                    </Col>
                                    <Col span={6}>
                                        {media.balance / 100 + '元'}<a onClick={() => {
                                        this.setState({
                                            amountVisible: true,
                                        })
                                    }}> 提现</a>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        <div>流量余额:</div>
                                    </Col>
                                    <Col span={6}>
                                        {media.flowBalance / 100 + '元'}
                                        <a onClick={this.handleShowPresentFlow}> 充值</a>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='media-modal-row'>
                            <Col span={24}>
                                <Row>
                                    {this.state.features &&
                                    <Transfer
                                        dataSource={this.state.features}
                                        titles={['功能列表', '已开通']}
                                        operations={['添加', '取消']}
                                        notFoundContent={'没有条目'}
                                        targetKeys={this.state.selectedKeys}
                                        onChange={this.handleChange}
                                        render={item => item.name}
                                    />}
                                </Row>
                                {this.state.saveTransferVisible && <Row style={{marginTop: 10}}>
                                    <Col span={4} style={{textAlign: 'left'}}>
                                        <Button
                                            type={'primary'}
                                            onClick={() => {
                                                App.api('adm/media/update_features', {
                                                    mediaId: this.state.media.id,
                                                    features: this.state.selectedKeys
                                                }).then(() => {
                                                    message.info('修改成功');
                                                });
                                            }}> 保存</Button>
                                    </Col>
                                </Row>}
                            </Col>
                        </Row>
                    </Card>
                </Modal>
            </div>
        )
    }
}

export default Form.create()(Medias);


