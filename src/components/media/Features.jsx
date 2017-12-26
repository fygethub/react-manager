import React from 'react';
import Common from '../../common';
import {
    Row,
    Col,
    Button,
    message,
    Input,
    Popconfirm,
    Card,
    Modal,
    Tooltip,
    Form,
    Select,
    Dropdown,
    Menu,
    Icon,
    Table
} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
const data_url = 'adm/media/features';
const App = Common.App;
const CTYPE = Common.CTYPE;
const U = Common.U;
const Option = Select.Option;
export default class Features extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            list: [],
            options: [],
            addModalVisible: false,
            removeModalVisible: false,
        };
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        this.setState({
            loading: true,
        });
        App.api(data_url).then((list) => {
            this.setState({
                list,
                loading: false,
            })
        })
    };

    toggleModal = (modalName, isVisible) => {
        this.setState({
            [modalName]: isVisible,
        })
    };

    toggleFeature = (isAdd) => {
        this.setState({
            loading: true,
        });
        let api = '';
        if (isAdd) {
            api = 'adm/media/add_feature';
        } else {
            api = 'adm/media/remove_feature';
        }

        if (!this.state.mediaId) {
            message.info('请填写店铺Id');
        }

        App.api(api, {
            feature: this.state.feature,
            mediaId: this.state.mediaId,
        }).then(() => {
            message.success('操作成功');
            this.setState({
                addModalVisible: false,
                removeModalVisible: false,
                feature: '',
                mediaId: '',
            }, this.loadData)
        })
    };


    render() {
        let {list} = this.state;

        return (
            <div>
                <BreadcrumbCustom first="店铺" second="功能开通"/>
                <Modal
                    onCancel={() => {
                        this.toggleModal('addModalVisible', false);
                    }}
                    onOk={this.toggleFeature}
                    visible={this.state.addModalVisible}
                    title='开通店铺'>
                    <Row>
                        <Col span={8}>
                            {this.state.feature}:
                        </Col>
                        <Col span={16}>
                            <Input placeholder="输入店铺id" onChange={(e) => {
                                this.setState({
                                    mediaId: e.target.value,
                                })
                            }}/>
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    visible={this.state.removeModalVisible}
                    onCancel={() => this.toggleModal('removeModalVisible', false)}
                    onOk={() => this.toggleFeature(false)}
                    title='删除'>
                    <Row>
                        <Col span={8}>选择删除的店铺</Col>
                        <Col span={16}>
                            <Select style={{width: '100%'}} onSelect={(value) => {
                                this.setState({
                                    mediaId: value,
                                })
                            }}>
                                {this.state.options.map((option) => {
                                    return <Option key={option} value={option}>{option}</Option>
                                })}
                            </Select>
                        </Col>
                    </Row>

                </Modal>
                <Card>
                    <Table columns={[{
                        title: '功能',
                        dataIndex: 'feature',
                        className: 'txt-center',
                        width: '140px',
                    }, {
                        title: '开通店铺',
                        dataIndex: 'whiteList',
                        className: 'txt-left',
                        width: '140px',
                        render: (whiteList) => <span>{whiteList && whiteList.length > 0 && whiteList.join(',')}</span>
                    }, {
                        title: '操作',
                        dataIndex: 'opt',
                        className: 'txt-center',
                        width: '80px',
                        render: (obj, record) => {
                            return <Dropdown overlay={<Menu>
                                <Menu.Item key="1">
                                    <a href="javascript:;"
                                       onClick={(item) => {
                                           this.toggleModal('addModalVisible', true);
                                           this.setState({
                                               feature: record.feature,
                                           })
                                       }}>开通</a>
                                </Menu.Item>
                                <Menu.Divider/>
                                <Menu.Item key="2">
                                    <a href="javascript:;" onClick={() => {
                                        this.toggleModal('removeModalVisible', true);
                                        this.setState({
                                            options: record.whiteList || [],
                                            feature: record.feature,
                                        })
                                    }}>删除</a>
                                </Menu.Item>
                            </Menu>} trigger={['click']}>
                                <a className="ant-dropdown-link" href="javascript:;">
                                    操作
                                </a>
                            </Dropdown>
                        }
                    }]} rowKey={(record) => record.feature}
                           dataSource={list}
                           loading={this.state.loading}/>
                </Card>
            </div>
        )
    }
}







