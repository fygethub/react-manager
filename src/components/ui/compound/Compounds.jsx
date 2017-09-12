import React from 'react';
import antd from 'antd';
import {Row, Col, Button, message, Popconfirm, Card, Tooltip, Select} from 'antd';
import {hashHistory} from 'react-router';
import './compound.less';
import App from '../../../common/App.jsx';
import enmu from '../../../common/Ctype'

let Table = antd.Table;
const Option = Select.Option;
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
            {title: 'cratedAt', dataIndex: 'createdAt', key: 'createdAt'},
            {title: '是否上架', dataIndex: 'state', key: 'state'},
            {
                title: '操作',
                width: 290,
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
        this.updateCompound = this.updateCompound.bind(this);
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

            let items = result.items && result.items.map((item) => {
                    item.layers = item.layers && item.layers.map((layer) => {
                            if (layer.type == enmu.type.text) {
                                layer.bold = layer.bold == enmu.bold.bold ? '加粗' : '正常';
                                layer.italic = layer.italic == enmu.italic.italic ? '倾斜' : '正常';
                                layer.align = layer.align == 1 ? '靠左对齐' : layer.align == 2 ? '居中对齐' : '靠右对齐';
                            }
                            layer.movable = layer.movable == 1 ? '可移动' : '不可移动';
                            layer.type = layer.type == enmu.type.img ? '图片' : '文字';
                            return layer;
                        });
                    item.state = item.state === enmu.state.on ? '上架中' : '已下架';
                    item.createdAt = item.createdAt && new Date(item.createdAt).toISOString();
                    return item;
                });

            this.setState({
                table: {
                    ...this.state.table,
                    dataSource: items,
                    pageSize: result.limit,
                    offset: result.offset,
                    total: result.total,
                }
            })
        })
    };

    renderAction = (text, record) => {
        return <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <Popconfirm placement="left" title="你想好了要删掉吗, 创建一个不容易的."
                        onConfirm={this.removeCompound('remove', record)}
                        okText="是的" cancelText="我再想想">
                <Button>删除</Button>
            </Popconfirm>
            <Popconfirm placement="left" title="做好了吗就上架?.经过老大确认没."
                        onConfirm={this.removeCompound('enable', record)}
                        okText="老大确认了上架!" cancelText="好像没有确认,我再问问">
                <Button>上架</Button>
            </Popconfirm>
            <Popconfirm placement="left" title="为什么下架, 没做好吗? 上架的时候为森马不多想想."
                        onConfirm={this.removeCompound('disable', record)}
                        okText="老大说的下架" cancelText="我就点着玩">
                <Button>下架</Button>
            </Popconfirm>
            <Button onClick={this.updateCompound(record)}>编辑</Button>
        </div>
    };

    updateCompound = (record) => (e) => {
        localStorage.removeItem('state');
        hashHistory.push('app/ui/drags-new/' + record.id);
    };

    removeCompound = (text, record) => (e) => {
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
        const preview = record.preview || {};
        let preview_title = `height:${preview.height} width:${preview.width}`;
        let defaultUrl =
            "https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813__340.jpg";

        let preview_url = preview && preview.url || defaultUrl;
        let layers = record.layers.map((item, key) => {
            item.key = key;
            item.movable = item.movable == 0 ? '不可移动' : '可以移动';
            return item;
        });
        let columns = [
            {title: '宽', dataIndex: 'w', key: 'w'},
            {title: '高', dataIndex: 'h', key: 'h'},
            {title: 'x', dataIndex: 'x', key: 'x'},
            {title: 'y', dataIndex: 'y', key: 'y'},
            {title: 'url', dataIndex: 'url', key: 'url'},
            {title: 'text', dataIndex: 'text', key: 'text'},
            {title: 'align', dataIndex: 'align', key: 'align'},
            {title: 'italic', dataIndex: 'italic', key: 'italic'},
            {title: '加粗', dataIndex: 'bold', key: 'bold'},
            {title: '是否可移动', dataIndex: 'movable', key: 'movable'},
            {title: '字体颜色', dataIndex: 'fontColor', key: 'fontColor'},
            {title: '字体', dataIndex: 'fontFamily', key: 'fontFamily'},
            {title: '字号', dataIndex: 'fontSize', key: 'fontSize'},
        ];
        return <Row gutter={16}>
            <Col className="gutter-row" span={24}>
                <div className="gutter-box">
                    <div className="layer">
                        {/*<div className="background">
                         <div>
                         <span className="name">background:</span>
                         <span><a
                         target="_blank"
                         href={`${background_url ? background_url : ''}`}>{`${background.url ? 'url:[' + background.url + ']' : ''}`}</a></span>
                         </div>
                         <Tooltip placement="top"
                         title={title}>
                         <img
                         className="background-img"
                         src={background_url}
                         />
                         </Tooltip>
                         </div>
                         */}
                        <div className="background">
                            <div>
                                <span className="name">preview:</span>
                                <span><a
                                    target="_blank"
                                    href={`${ preview_url ? preview_url : ''}`}>{`${ preview_url ? 'url:[' + preview_url + ']' : ''}`}</a></span>
                            </div>
                            <Tooltip placement="top"
                                     title={preview_title}>
                                <img
                                    className="background-img"
                                    src={preview_url}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    <div className="layers">
                        <Table
                            dataSource={layers}
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
                            <Select defaultValue="1" style={{width: '100%'}} onChange={(v) => this.setState({
                                category: v,
                            }, this.loadData)}>
                                <Option value="1">课程</Option>
                                <Option value="2">专栏</Option>
                                <Option value="3">商品</Option>
                                <Option value="4">轮播图</Option>
                            </Select>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="table">
                <div className="backgroundTable">
                    <Row gutter={16}>
                        <Col className="gutter-row" span={24}>
                            <div className="gutter-box">
                                <Card title="合成图管理" bordered={false}>
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
