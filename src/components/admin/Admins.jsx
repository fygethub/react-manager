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
    constructor(props){
        super(props);
        this.state={
            loading: true,
            offset: 0,
            current: 0,
            pageSize: 10,
            total: 0,
            dataSource: [],
            columns: [{
                title:'序号',
                dataIndex: 'id',
                key: 'id',
                render: (col,row,i) => i + 1
            },{
                title:'名称',
                dataIndex: 'name',
                key: 'name'
            },{
                title:'Email',
                dataIndex: 'email',
                key: 'email'
            },{
                title:'所在组',
                dataIndex: 'groups',
                key: 'groups',
                render: (col,row,i) => (col.filter((v) =>v.name).map((v) => v.name).join(','))
            },{
                title:'操作',
                dataIndex: 'option',
                key: 'option',
                width: 200,
                render: (col,row,i) => (<div style={{textAlign:"left"}}>
                    <Link to={`/app/admin/admins/edit/${row.id}`}>编辑</Link>
                    <span className = "ant-divider" />
                    <Popconfirm title="确认删除吗?" onConfirm={() => this.confirmDelete(row.id)} onCancel={this.cancel} okText="Yes" cancelText="No">
                        <a href="#">删除</a>
                    </Popconfirm>
                    <span className = "ant-divider" />
                    <Popconfirm title="确认重置密码吗?" onConfirm={() => this.confirmPassword(row.id)} onCancel={this.cancel} okText="Yes" cancelText="No">
                        <a href="#">重置密码</a>
                    </Popconfirm>
                </div>)
            }]
        }

    }
    getAdmins = () => {
        const {pageSize,current} = this.state;
        App.api('adm/admin/admins', {
            offset: pageSize * (current - 1),
            limit: pageSize,
        }).then((data) => {
            console.log(data)
            this.setState({
                    dataSource: data.items,
                    pageSize: data.limit,
                    offset: data.offset,
                    total: data.total,
                    loading: false
            })
        })
    }
    componentDidMount() {
        this.getAdmins();
    }
    confirmDelete = (id) => {
        App.api('adm/admin/remove', {
            id: id
        }).then((data) => {
            this.getAdmins();
        })

    }
    confirmPassword = (id) => {
        App.api('adm/admin/reset_password', {
            id: id
        }).then((data) => {
            console.info(data);
            this.getAdmins();
        })
    }
    tableOnChange = (pagination,filters,sortor) => {
        this.setState({
                pageSize: pagination.pageSize,
                current: pagination.current,
        }, () => this.getAdmins());
    }

    render() {
        console.info(this.props);
        const {columns,dataSource,total,pageSize,offset} = this.state;
        const pagination = {
            total: total,
            current: ~~offset / 10 + 1,
            pageSize: pageSize,
            showSizeChanger: true,
        };
        return (
            <div>
                <BreadcrumbCustom first="管理员" second="管理员列表"/>
                <Row style={{margin: '10px 0'}}>
                    <Col span = {2} offset = {22}>
                        <Button size={'large'} type = {'primary'} onClick={() => {this.props.router.push('/app/admin/admins/add')}}>添加</Button>
                    </Col>
                </Row>
                <Card>
                    <Table
                        rowKey={(row) => row.id}
                        columns={columns}
                        dataSource={dataSource}
                        pagination={pagination}
                        onChange={this.tableOnChange}
                        loading={this.state.loading}
                        scroll={{ x: columns.map(({ width }) => width || 100).reduce((l, f) => (l + f)) }}
                    />
                </Card>
            </div>
        )
    }
}
