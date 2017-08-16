import React from 'react';
import antd from 'antd';
import {Row, Col, Input, Button, message, Popconfirm, Card, Tooltip} from 'antd';
import './compound.less';
import App from '../../../common/App.jsx';

let Table = antd.Table;
const Search = Input.Search;
export default class Compounds extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            category: 3,
            table: {
                dataSource: [],
                offset: 0,
                total: 0,
                pageSize: 10,
                current: 1,
            },
        };

        this.columns = [
            {title: 'id', dataIndex: 'id', key: 'id'},
            {title: '名称', dataIndex: 'title', key: 'title'},
            {title: 'category', dataIndex: 'category', key: 'category'},
            {title: 'state', dataIndex: 'state', key: 'state'},
            {title: 'priority', dataIndex: 'priority', key: 'priority'},
            {title: 'cratedAt', dataIndex: 'createdAt', key: 'createdAt'},
            {
                title: '操作',
                width: 250,
                dataIndex: 'option',
                key: 'option',
                render: this.renderAction,
                fixed: 'right'
            }
        ];

        this.renderAction = this.renderAction.bind(this);
        this.loadData = this.loadData.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
        this.removeCompound = this.removeCompound.bind(this);
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        App.api('adm/compound/list', {
            category: this.state.category,
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

    renderAction = (text, record) => {
        return <div>
            <Popconfirm placement="left" title="你想好了要删掉吗, 创建一个不容易的."
                        onConfirm={this.removeCompound('remove', record)}
                        okText="是的" cancelText="我再想想">
                <Button>删除</Button>
            </Popconfirm>
            <Popconfirm placement="left" title="做好了吗就上架?.经过老大确认没."
                        onConfirm={this.removeCompound('enable', record)}
                        okText="老大确认上架了" cancelText="好像没有确认">
                <Button>上架</Button>
            </Popconfirm>
            <Popconfirm placement="left" title="为什么下架, 没做好吗? 上架的时候为森马不多想想."
                        onConfirm={this.removeCompound('disable', record)}
                        okText="老大说的下架" cancelText="我就点着玩">
                <Button>下架</Button>
            </Popconfirm>
        </div>
    };

    removeCompound = (text, record) => (e) => {
        console.log(text);
        let summary = '';
        let url = text === 'remove' ? ['adm/compound/remove', summary = '删除成功,恢复不了了哦'][0] :
            text === 'enable' ? ['adm/compound/enable', summary = '上架成功,马上就有用户了'][0] :
                ['adm/compound/disable', summary = '下架成功.... 无f**k说'][0];

        App.api(url, {
            compoundId: record.id,
        }).then(data => {
            message.success(summary);
            this.loadData();
        })
    };

    expandedRowRender = (record) => {
        const background = record.background;
        let title = `height:${background.height} width:${background.width}`;
        let defaultUrl =
            "https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813__340.jpg";
        let background_url = background.url || defaultUrl;
        let layer_url = background.url || defaultUrl;
        let hotspots = record.hotspots.map((item, key) => {
            item.key = key;
            item.movable = item.movable == 0 ? '不可移动' : '可以移动';
            return item;
        });
        let columns = [
            {title: 'align', dataIndex: 'align', key: 'align'},
            {title: '宽', dataIndex: 'w', key: 'w'},
            {title: '高', dataIndex: 'h', key: 'h'},
            {title: 'x', dataIndex: 'x', key: 'x'},
            {title: 'y', dataIndex: 'y', key: 'y'},
            {title: 'text', dataIndex: 'text', key: 'text'},
            {title: '是否可移动', dataIndex: 'movable', key: 'movable'},
            {title: '字体颜色', dataIndex: 'fontColor', key: 'fontColor'},
            {title: '字体', dataIndex: 'fontFamily', key: 'fontFamily'},
            {title: '字号', dataIndex: 'fontSize', key: 'fontSize'},
        ];
        return <Row gutter={16}>
            <Col className="gutter-row" span={24}>
                <div className="gutter-box">
                    <div className="layer">
                        <div className="background">
                            <div>
                                <span className="name">background:</span>
                                <span>{`${background.url ? 'url:' + background.url : ''}`}</span>
                            </div>
                            <Tooltip placement="top"
                                     title={title}>
                                <img
                                    className="background-img"
                                    src={background_url}
                                />
                            </Tooltip>
                        </div>
                        <div className="background">
                            <div>
                                <span className="name">layer:</span>
                                <span>{title}</span>
                            </div>
                            <Tooltip placement="top"
                                     title={title}>
                                <img
                                    className="background-img"
                                    src={layer_url}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="hotspots">
                        <Table
                            dataSource={hotspots}
                            columns={columns}
                        />
                    </div>
                </div>

            </Col>
        </Row>
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

    render() {
        const pagination = {
            total: this.state.table.total,
            current: this.state.table.current,
            showSizeChanger: true,
        };
        return <div className="compounds">
            <div className="search">
                <Row gutter={24}>
                    <Col className="gutter-row" span={24}>
                        <div className="gutter-box">
                            <label htmlFor="category">查询类型</label>
                            <Search
                                id="category"
                                placeholder="category"
                                onSearch={(v) => this.setState({
                                    category: v,
                                }, this.loadData)}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="table">
                <div className="backgroundTable">
                    <div className="backgroundFilter">

                    </div>
                    <Row gutter={16}>
                        <Col className="gutter-row" span={24}>
                            <div className="gutter-box">
                                <Card title="固定列" bordered={false}>
                                    <Table
                                        scroll={{x: 1800}}
                                        rowKey={record => record.id}
                                        columns={this.columns}
                                        expandedRowRender={this.expandedRowRender}
                                        dataSource={this.state.table.dataSource}
                                        onChange={this.tableOnchange}
                                        pagination={pagination}
                                        className="table"/>
                                </Card>
                            </div>
                        </Col>
                    </Row>

                </div>
            </div>
        </div>
    }
}
