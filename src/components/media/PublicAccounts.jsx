import React from 'react';
import Axios from 'axios';
import cookie from 'js-cookie';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

export default class Apps extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            current: 1,
            pageSize: 10,
            total: 0,
            dataSource: [],
            columns: [{
                title: '序号',
                dataIndex: 'id',
                render: (col, row, i) => i + 1
            }, {
                title: '公众号ID',
                dataIndex: 'appId',
            }, {
                title: '商户号',
                dataIndex: 'merchant.mchId',
            }, {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                width: 200,
                render: (col, row, i) => (<div style={{textAlign: "left"}}>
                    <Link to={{
                        pathname: `/app/media/maps/edit/${row.appId}`,
                        query: {mediaId: `${this.props.params.id}`}
                    }}>编辑</Link>
                    <span className="ant-divider"/>
                    <Popconfirm title="确认解绑吗?" onConfirm={() => this.confirmDelete(row.id)} onCancel={this.cancel}
                                okText="Yes" cancelText="No">
                        <a href="#">解绑</a>
                    </Popconfirm>
                    <span className="ant-divider"/>
                    <a href="javascript:;" onClick={() => {
                        this.showMsgMobile(row.appId)
                    }}>配置消息</a>
                </div>)
            }]
        }

    }

    showMsgMobile = (appid) => {
        Modal.confirm({
            title: '配置消息',
            onOk: () => {
                App.api('adm/media/init_templatemsg', {
                    appId: appid,
                }).then((res) => {
                    message.success(`新增模板${res.addCount}个,失败${res.errorCount}个`);
                })
            },
        })
    };

    getPublicAccounts = () => {
        const {pageSize, current} = this.state;
        const {params:{id}} = this.props;
        App.api('adm/media/mps', {
            offset: pageSize * (current - 1),
            limit: pageSize,
            mediaId: id,
        }).then((data) => {
            console.log(data)
            this.setState({
                dataSource: data,
                pageSize: data.limit,
                offset: data.offset,
                total: data.total,
                loading: false
            })
        })
    }

    componentDidMount() {
        //mediaId
        const {params:{id}} = this.props;
        this.getPublicAccounts();
    }

    confirmDelete = (id) => {
        App.api('adm/media/unlink_mp', {
            appId: id
        }).then((data) => {
            this.getPublicAccounts();
        })

    }

    tableOnChange = (pagination, filters, sortor) => {
        this.setState({
            pageSize: pagination.pageSize,
            current: pagination.current,
        }, () => this.getPublicAccounts());
    }

    render() {
        console.info(this.props);
        const {columns, dataSource, total, pageSize, offset} = this.state;
        const pagination = {
            total: total,
            current: ~~offset / 10 + 1,
            pageSize: pageSize,
            showSizeChanger: true,
        };
        //mediaId
        const {params:{id}} = this.props;
        return (
            <div>
                <BreadcrumbCustom first="店铺" second="公众号"/>
                <Row style={{margin: '10px 0'}}>
                    <Col span={20}>

                    </Col>
                    <Col span={2} offset={2}>
                        <Button size={'large'} type={'primary'} onClick={() => {
                            this.props.router.push('/app/media/maps/add?mediaId=' + id)
                        }}>添加</Button>
                    </Col>
                </Row>
                <Card>
                    <Table
                        rowKey={(row) => row.appId}
                        columns={columns}
                        dataSource={dataSource}
                        pagination={pagination}
                        onChange={this.tableOnChange}
                        loading={this.state.loading}
                        scroll={{x: columns.map(({width}) => width || 100).reduce((l, f) => (l + f))}}
                    />
                </Card>
            </div>
        )
    }
}
