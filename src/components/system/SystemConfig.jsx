import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

class searchForm extends React.Component {

    handleSubmit = (e) => {
        e.preventDefault();
        const {handleSearch,form:{validateFields}} = this.props;
        validateFields((err, values) => {
            console.log(values);
            if (!err) {
                handleSearch(values.key);

            }
        })
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return <Form layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item>
                {getFieldDecorator('key', {rules: [{require: true, message: 'please input your key'}]})(
                    <Input placeholder="key"/>
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

export default class SystemConfig extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableName: 'api_config',
            loading: true,
            offset: 0,
            current: 0,
            pageSize: 20,
            total: 0,
            dataSource: [],
            columns: [{
                title: '键',
                dataIndex: 'key',
                width: 300
            },{
                title: '类型',
                dataIndex: 'type',
            },{
                title: '值',
                dataIndex: 'value',
                width: 400
            },{
                title: '备注',
                dataIndex: 'name',
            },{
                title: '操作',
                dataIndex: 'option',
                render: (col,row,index) => (
                    <div style={{textAlign:"left"}}>
                        <Link to={{pathname: `/app/system/config/edit/${row.key}`,query: row}} >编辑</Link>
                        <span className = "ant-divider" />
                        <Popconfirm title="确认删除吗?" onConfirm={() => this.confirmDelete(row.key)} onCancel={this.cancel} okText="Yes" cancelText="No">
                            <a href="#">删除</a>
                        </Popconfirm>
                    </div>
                )
            }]
        }
    }

    confirmDelete = (key) => {
        const {tableName} = this.state;
        App.api('adm/system/removeconfig',{
            tableName,key
        }).then((data) => {
            this.getData();
        })
    }

    getData = (key = '') => {
        const {tableName,current,pageSize} = this.state;
        App.api('adm/system/configs', {
            offset: pageSize * (current - 1),
            limit: pageSize,
            tableName,
            key
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
        this.getData();

    }
    onChange = (pagination,filters,sortor) => {
        this.setState({
            pageSize: pagination.pageSize,
            current: pagination.current,
        }, () => this.getData());
    }

    handleSearch = (key) => {
        this.getData(key);
    }
    render() {
        console.log(this.table)
        const {columns,dataSource,total,pageSize,offset,current} = this.state;
        const pagination = {
            total: total,
            current: current,
            pageSize: pageSize,
            showSizeChanger: true,
        };
        return (
            <div className="table">
                <BreadcrumbCustom first="系统" second="系统设置"/>

                <Row style={{margin: '10px 0'}}>
                    <Col span = {20}>
                        <SearchFormWrap handleSearch = {this.handleSearch} />
                    </Col>
                    <Col span = {2} offset = {2}>
                        <Button size={'large'} type = {'primary'} onClick={() => {this.props.router.push('/app/system/config/add')}}>添加</Button>
                    </Col>
                </Row>
                <Card>
                <Table
                    ref = {(table) => {this.table = table}}
                    rowKey = 'key'
                    dataSource = {dataSource}
                    columns = {columns}
                    pagination = {pagination}
                    onChange = {this.onChange}
                    loading = {this.state.loading}
                    scroll = {{x: columns.map(({width}) => width || 100).reduce((l,c) => (l + c))}}
                />
                </Card>
            </div>
        )
    }
}
