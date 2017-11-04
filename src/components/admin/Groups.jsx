import React from 'react';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

export default class AdminGroups extends React.Component {
    constructor(props){
        super(props);
        this.state={
            loading: true,
            offset: 0,
            current: U.page.getCurrentPage(),
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
                title:'权限',
                dataIndex: 'root',
                key: 'root',
                render: (col,row,i) => {
                    switch (col) {
                        case 0 : return '普通管理员';
                        case 1 : return '超级管理员';
                        default: ''
                    }
                }
            },{
                title:'操作',
                dataIndex: 'password',
                key: 'password',
                width: 200,
                render: (col,row,i) => (<div style={{textAlign:"left"}}>
                    <Link to={`/app/admin/groups/edit/${row.id}`}>编辑</Link>
                    <span className = "ant-divider" />
                    <Popconfirm title="确认删除吗?" onConfirm={() => this.confirmDelete(row.id)} onCancel={this.cancel} okText="Yes" cancelText="No">
                        <a href="#">删除</a>
                    </Popconfirm>
                </div>)
            }]
        }

    }
    getAdmins = () => {
        App.api('adm/admin/groups', {
            offset: this.state.pageSize * (this.state.current - 1),
            limit: this.state.pageSize,
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
        U.page.clearPageStrage();
    }
    confirmDelete = (id) => {
        App.api('adm/admin/remove_group', {
            id: id
        }).then((data) => {
            this.getAdmins();
        })

    }

    tableOnChange = (pagination,filters,sortor) => {
        U.page.setCurrentPage(pagination.current);
        this.setState({
            pageSize: pagination.pageSize,
            current: pagination.current,
        }, this.getAdmins());
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
                <Row>
                    <Col span = {2} offset = {22}>
                        <div className="addicon">
                            <Link to={`/app/admin/groups/add`}><Icon type="plus-circle" style={{fontSize:'25px'}} /></Link>
                        </div>
                    </Col>
                </Row>
                <Table
                    rowKey={(row) => row.id}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={this.tableOnChange}
                    loading={this.state.loading}
                    scroll={{ x: columns.map(({ width }) => width || 100).reduce((l, f) => (l + f)) }}
                />
            </div>
        )
    }
}
