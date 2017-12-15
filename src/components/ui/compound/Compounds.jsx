import React from 'react';
import antd from 'antd';
import {Row, Col, Button, message, Popconfirm, Card, Tooltip, Select, Menu, Dropdown, Icon, Table} from 'antd';
import {hashHistory} from 'react-router';
import U from '../../../common/U';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import '../../../asssets/css/ui/compound.less';
import App from '../../../common/App.jsx';
import enmu from '../../../common/Ctype'

export default class Compounds extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            category: 1,
            table: {
                dataSource: [],
                offset: 0,
                total: 0,
                pageSize: 10,
                current: 1,
                expandedRowKeys: [],
            },

            imgLoaded: false,
        };

        this.columns = [
            {title: 'id', dataIndex: 'id', width: 150, key: 'id'},
            {title: '名称', dataIndex: 'title', width: 150, key: 'title'},
            {
                title: '创建时间',
                dataIndex: 'createdAt',
                width: 150,
                key: 'createdAt',
                render: (text) => <span>{U.date.format(new Date(text), 'yyyy-MM-dd hh:mm:ss')}</span>
            },
            {
                title: '合成图',
                dataIndex: 'img',
                key: 'img',
                width: 150,
                render: text => {
                    if (!this.state.imgLoaded) {
                        //从新计算table高度
                        let img = new Image();
                        img.src = text;
                        img.onload = () => {
                            setTimeout(() => {
                                this.setState({
                                    imgLoaded: true,
                                })
                            }, 1000);

                        };
                    }

                    return <a href={text} target="_blank"><img src={text} style={{width: 40, height: 40}}
                                                               className="img-compound"/></a>;
                }
            },
            {title: '是否上架', dataIndex: 'state', width: 150, key: 'state'},
            {title: '', dataIndex: 'null', key: 'null'},
            {
                title: '操作',
                width: 290,
                dataIndex: 'option',
                key: 'option',
                render: this.renderAction,
            }
        ];

        this.renderAction = this.renderAction.bind(this);
        this.loadData = this.loadData.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
        this.removeCompound = this.removeCompound.bind(this);
        this.updateCompound = this.updateCompound.bind(this);
    }

    componentDidMount() {
        document.getElementsByClassName('img-compound');

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
                    item.img = item.preview.url;
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
        return <Dropdown overlay={<Menu>
            <Menu.Item key="1">
                <Popconfirm placement="left" title=" 删掉吗"
                            onConfirm={this.removeCompound('remove', record)}
                            okText="是的" cancelText="我再想想">
                    <a>删除</a>
                </Popconfirm>
            </Menu.Item>
            <Menu.Divider/>
            <Menu.Item key="2">
                <Popconfirm placement="left" title="上架?"
                            onConfirm={this.removeCompound('enable', record)}
                            okText="确认" cancelText="取消">
                    <a>上架</a>
                </Popconfirm>
            </Menu.Item>
            <Menu.Item key="3">
                <Popconfirm placement="left" title="下架?"
                            onConfirm={this.removeCompound('disable', record)}
                            okText="确认" cancelText="取消">
                    <a>下架</a>
                </Popconfirm>
            </Menu.Item>
            <Menu.Item key="3">
                <a onClick={this.updateCompound(record)}>编辑</a>
            </Menu.Item>
        </Menu>} trigger={['click']}>
            <a className="color-info" href="javascript:;" onClick={(e) => e.stopPropagation()}>
                操作 <Icon type="down"/>
            </a>
        </Dropdown>
    };

    updateCompound = (record) => (e) => {
        localStorage.removeItem('state');
        hashHistory.push('app/ui/drags-new/' + record.id);
    };

    removeCompound = (text, record) => (e) => {
        let summary = '';
        let url = text === 'remove' ? ['adm/compound/remove', summary = '删除成功,恢复不了了哦'][0] :
            text === 'enable' ? ['adm/compound/enable', summary = '上架成功,马上就有用户了'][0] :
                ['adm/compound/disable', summary = '下架成功'][0];

        App.api(url, {
            compoundId: record.id,
        }).then(data => {
            message.success(summary);
            this.loadData();
        })
    };

    setExpandedRowKeys = (record) => {
        let expandedRows = this.state.table.expandedRowKeys;
        let index = expandedRows && expandedRows.findIndex(id => id == record.id);
        if (index > -1) {
            expandedRows.splice(index, 1);
            this.setState({
                table: {
                    ...this.state.table,
                    expandedRowKeys: expandedRows,
                }
            });
            return;
        }

        expandedRows.push(record.id);
        this.setState({
            table: {...this.state.table, expandedRowKeys: expandedRows,}
        })
    };

    expandedToggleAllRow = () => {
        if (this.state.table.expandedRowKeys.length > 0) {
            this.setState({
                table: {
                    ...this.state.table,
                    expandedRowKeys: [],
                }
            });
            return;
        }

        let dataSource = this.state.table.dataSource;
        let expandedRowKeys = dataSource.map(record => record.id);
        this.setState({
            table: {
                ...this.state.table,
                expandedRowKeys,
            }
        });
    };

    expandedRowRender = (record) => {
        let layers = record.layers.map((item, key) => {
            item.key = key;
            item.movable = item.movable == 0 ? '不可移动' : '可以移动';
            return item;
        });
        let columns = [
            {title: '宽', width: 90, dataIndex: 'w', key: 'w'},
            {title: '高', width: 90, dataIndex: 'h', key: 'h'},
            {title: 'x', width: 90, dataIndex: 'x', key: 'x'},
            {title: 'y', width: 90, dataIndex: 'y', key: 'y'},
            {
                title: '图片', width: 90, dataIndex: 'url', key: 'url',
                render: text => <a href={text} target="_blank"><img style={{width: 40, height: 40, lineHeight: '40px'}}
                                                                    src={text}
                                                                    alt="没有图片"/></a>
            },
            {title: '内容', width: 190, dataIndex: 'text', key: 'text'},
            {title: '对齐方式', width: 90, dataIndex: 'align', key: 'align'},
            {title: '倾斜', width: 90, dataIndex: 'italic', key: 'italic'},
            {title: '加粗', width: 90, dataIndex: 'bold', key: 'bold'},
            {title: '是否可移动', width: 90, dataIndex: 'movable', key: 'movable'},
            {title: '字体颜色', width: 90, dataIndex: 'fontColor', key: 'fontColor'},
            {title: '字体', width: 90, dataIndex: 'fontFamily', key: 'fontFamily'},
            {title: '字号', width: 90, dataIndex: 'fontSize', key: 'fontSize'},
            {title: '', width: 90, dataIndex: 'null', key: 'null'},
        ];
        return <Row gutter={16}>
            <Col className="gutter-row" span={24}>
                <div className="gutter-box">
                    <div className="layers">
                        <Table
                            style={{background: 'lightgray'}}
                            pagination={false}
                            size="middle"
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
            },
            imgLoaded: false,
        }, this.loadData);
    };

    render() {
        const pagination = {
            total: this.state.table.total,
            current: this.state.table.current,
            showSizeChanger: true,
        };
        return <div className="compounds">
            <BreadcrumbCustom first="UI" second="合成图列表"/>
            <div className="search">
                <Row gutter={24}>
                    <Col className="gutter-row" span={24}>
                        <div className="gutter-box">
                            <label htmlFor="category">查询类型</label>
                            <Select defaultValue="1" style={{width: '100%'}} onChange={(v) => this.setState({
                                category: v,
                                imgLoaded: false,
                            }, this.loadData)}>
                                <Select.Option value="1">课程</Select.Option>
                                <Select.Option value="2">专栏</Select.Option>
                                <Select.Option value="3">商品</Select.Option>
                                <Select.Option value="4">轮播图</Select.Option>
                                <Select.Option value="5">海报</Select.Option>
                            </Select>
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="table">
                <div className="backgroundantd.Table">
                    <Row gutter={16}>
                        <Col className="gutter-row" span={24}>
                            <div className="gutter-box">
                                <Card title={<div>合成图管理 <Button
                                    onClick={this.expandedToggleAllRow}>
                                    {this.state.table.expandedRowKeys.length == 0 ? '展开全部' : '收起全部'}</Button>
                                </div>}
                                      bordered={false}>
                                    <Table
                                        size="middle"
                                        rowKey={record => record.id}
                                        columns={this.columns}
                                        expandedRowRender={this.expandedRowRender}
                                        expandedRowKeys={this.state.table.expandedRowKeys}
                                        onRowClick={this.setExpandedRowKeys}
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
