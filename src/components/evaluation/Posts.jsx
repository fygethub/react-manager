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
import jrQrcode from  'jr-qrcode';
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
            table: {
                dataSource: [],
                offset: 0,
                total: 0,
                pageSize: 10,
                current: 0,
            }
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
                },
                loading: false,
            })
        })
    }


    wxQrcode = (mediaId, str) => {
        let mediaUrl = App.getShopURL(mediaId);
        let url = mediaUrl + str;

        let imgBase64 = jrQrcode.getQrBase64(url, {
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
            show_qrcode: true,
            courseUrl: url,
        })
    };

    courseQRCode = (course) => {
        let str = '#/community/' + course.id;

        if (!str) {
            return;
        }
        this.wxQrcode(course.media.id, str);
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
            current: ~~this.state.table.offset / 10 + 1,
            showSizeChanger: true,
        };

        return (
            <div>
                <BreadcrumbCustom first="课程&社群管理" second="社群管理列表"/>
                <Modal
                    visible={this.state.show_qrcode}
                    title="微信扫码"
                    width='330px'
                    onCancel={() => this.setState({show_qrcode: false})}
                    footer={null}>
                    <div>
                        <h3>课程地址: {this.state.courseUrl}</h3>
                        <img src={this.state.imgBase64} id='qrcode' style={{width: '300px', height: '300px'}}/>
                    </div>
                </Modal>
                <Card>
                    <Table
                        rowKey={(row, index) => index}
                        columns={[{
                            title: '图片',
                            dataIndex: 'imgs',
                            key: 'imgs',
                            width: 250,
                            render: (imgs) => {
                                if (!imgs) {
                                    return <span>无</span>;
                                }
                                return (
                                    <ul>
                                        {imgs.map((img) =>
                                            <li style={{margin: '0 10px', display: 'inline-block'}}>
                                                <img
                                                    key={img.url}
                                                    src={img.url}
                                                    alt="图片"
                                                    style={{maxHeight: 50, maxWidth: 50}}/>
                                            </li>)}
                                    </ul>)
                            }
                        }, {
                            title: '评论内容',
                            dataIndex: 'text',
                            key: 'text'
                        }, {
                            title: '点赞数',
                            dataIndex: 'favorNum',
                            key: 'favorNum',
                        }, {
                            title: '所属社群',
                            dataIndex: 'community.title',
                            key: 'community.title'
                        }, {
                            title: '所属店铺名称',
                            dataIndex: 'community.media.name',
                            key: 'community.media.name'
                        }, {
                            title: '评论时间',
                            dataIndex: 'updatedAt',
                            key: 'updatedAt',
                            render: (updatedAt) => U.date.format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')
                        }, {
                            title: '操作',
                            dataIndex: 'option',
                            key: 'option',
                            width: 200,
                            render: (obj, record) => {
                                return <Dropdown overlay={<Menu>
                                    <Menu.Item>
                                        <a onClick={() => {
                                            Modal.confirm({
                                                title: '提示',
                                                content: '是否删除当前评论?',
                                                onOk: () => {
                                                    App.api('adm/community/remove_post', {postId: record.id}).then(() => {
                                                        message.info('删除成功');
                                                        this.loadData();
                                                    })
                                                }
                                            })
                                        }}>删除</a>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <a onClick={() => {
                                            this.courseQRCode(record.community);
                                        }}>查看社群</a>
                                    </Menu.Item>
                                </Menu>} trigger={['click']}>
                                    <a className="ant-dropdown-link" href="javascript:;">
                                        操作 <Icon type="down"/>
                                    </a>
                                </Dropdown>
                            }
                        }]}
                        dataSource={this.state.table.dataSource}
                        pagination={pagination}
                        onChange={this.tableOnchange}
                        loading={this.state.loading}
                    />
                </Card>
            </div>
        )
    }
}
