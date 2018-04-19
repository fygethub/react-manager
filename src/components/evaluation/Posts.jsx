import React from 'react';
import {
    message,
    Card,
    Table,
    Dropdown,
    Menu,
    Button,
    Icon,
    Modal,
    Select,
} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import {App, U} from '../../common/index';

const STATE = {
    up: 2,
    down: 1,
};
export default class Posts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            offset: 0,
            current: 0,
            pageSize: 10,
            total: 0,
            dataSource: [],
            columns: [{
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            }, {
                title: '封面',
                dataIndex: 'community.img',
                key: 'community.img',
                render: (img) => (img ? <img style={{width: 40, height: 40}} src={img} alt=""/> : '暂无')
            }, {
                title: '标题',
                dataIndex: 'community.title',
                key: 'community.title'
            }, {
                title: '简介',
                dataIndex: 'community.intro',
                key: 'community.intro'
            }, {
                title: '状态',
                dataIndex: 'community.state',
                key: 'community.state',
                render: (state) => (state == STATE.up ? '上架' : <span style={{color: 'red'}}>下架</span>)
            }, {
                title: '创建时间',
                dataIndex: 'community.createdAt',
                key: 'community.createdAt',
                render: (createdAt) => U.date.format(new Date(createdAt), 'yyyy-MM-dd HH:mm:ss')
            }, {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                width: 200,
                render: (obj, admin) => {
                    return <Dropdown overlay={<Menu>
                        <Menu.Item>
                            <a>查看</a>
                        </Menu.Item>
                        <Menu.Item>
                            <a>删除</a>
                        </Menu.Item>
                    </Menu>} trigger={['click']}>
                        <a className="ant-dropdown-link" href="javascript:;">
                            操作 <Icon type="down"/>
                        </a>
                    </Dropdown>
                }
            }]
        }
    }

    componentDidMount() {
        this.loadData();
    }


    loadData() {
        const {pageSize, current} = this.state;
        this.setState({
            loading: true,
        });
        App.api('adm/community/posts ', {
            offset: pageSize * (current - 1),
            limit: pageSize,
        }).then((data) => {
            this.setState({
                dataSource: data.items,
                pageSize: data.limit,
                offset: data.offset,
                total: data.total,
                loading: false
            })
        })
    }


    render() {
        const {columns, dataSource, total, pageSize, offset} = this.state;
        const pagination = {
            total: total,
            current: ~~offset / 10 + 1,
            pageSize: pageSize,
            showSizeChanger: true,
        };

        return (
            <div>
                <BreadcrumbCustom first="课程&社群管理" second="社群管理列表"/>

                <Card>
                    <Table
                        rowKey={(row, index) => row.id || index}
                        columns={columns}
                        dataSource={dataSource}
                        pagination={pagination}
                        onChange={this.tableOnChange}
                        loading={this.state.loading}
                    />
                </Card>
            </div>
        )
    }
}
