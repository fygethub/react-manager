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
    Tag,
    Row,
    Col,
    Tabs,
    Select,
} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import {App, U} from '../../common/index';
import '../../asssets/css/evaluation/course-detail.less'
import jrQrcode from  'jr-qrcode';

const TabPane = Tabs.TabPane;
const STATE = {
    up: 2,
    down: 1,
};

const COURSE_TYPE = {
    audio: 1,
    video: 2,
    article: 3,
    audioLive: 5,
    videoLive: 6,
};

const LIVESTATE = {
    foreshow: 1,
    streaming: 2,
    paused: 4,
    finished: 6
};
export default class Courses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            course: {},
            loading: true,
            detailVisible: false,
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
        App.api('adm/course/courses', {
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


    tableOnchange = (pagination) => {
        this.setState({
            table: {
                ...this.state.table,
                pageSize: pagination.pageSize,
                current: pagination.current,
            }
        }, this.loadData);

    };

    loadDetail = (courseId) => {
        this.setState({
            loading: true,
        });
        App.api('adm/course/course', {courseId}).then((course) => {
            this.setState({
                course,
                detailVisible: true,
                loading: false,
            })
        })
    };

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
        let str = '';
        switch (course.type) {
            case COURSE_TYPE.video:
            case COURSE_TYPE.audio:
            case COURSE_TYPE.article:
                str = '#/course/' + course.id;
                break;
            case COURSE_TYPE.videoLive:
            case COURSE_TYPE.audioLive:
                str = '#/live-detail/' + course.id;
                break;
        }
        if (!str) {
            return;
        }
        this.wxQrcode(course.media.id, str);
    };

    removeCourse = (courseId) => {
        Modal.confirm({
            title: '提示',
            content: '是否删除当前课程',
            onOk: () => {
                App.api('adm/course/remove_course', {courseId}).then(() => {
                    message.info('删除成功');
                    this.loadData();
                })
            }
        })
    };


    render() {
        const pagination = {
            total: this.state.table.total,
            current: ~~this.state.table.offset / 10 + 1,
            showSizeChanger: true,
        };
        let course = this.state.course;


        return (
            <div>
                <BreadcrumbCustom first="课程&社群管理" second="课程管理列表"/>
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
                <Modal style={{maxWidth: 400, padding: 0}}
                       closable={false}
                       onOk={() => this.setState({detailVisible: false})}
                       onCancel={() => this.setState({detailVisible: false})}
                       visible={this.state.detailVisible}>
                    <div className="course-detail">
                        <h2>{course.title}</h2>
                        {course.type == COURSE_TYPE.audio &&
                        <div className="content-detail">
                            <audio src={course.content.url} controls/>
                        </div>}
                        {course.type == COURSE_TYPE.article && <Tabs defaultActiveKey="1">
                            <TabPane tab={<span>付费内容</span>} key="1">
                                <div className="content-detail" dangerouslySetInnerHTML={{__html: course.content}}/>
                            </TabPane>
                            <TabPane tab={<span>免费内容</span>} key="2">
                                <div className="content-detail" dangerouslySetInnerHTML={{__html: course.freeContent}}/>
                            </TabPane>
                        </Tabs>}
                        {course.type == COURSE_TYPE.videoLive &&
                        <div className="content-detail">
                            <Row>
                                <Col span={4}>开始时间:</Col>
                                <Col span={12}>{U.date.format(new Date(course.createdAt), 'yyyy-MM-dd HH:mm:ss')}</Col>
                            </Row>
                            <Row>
                                <Col span={4}>结束时间:</Col>
                                <Col span={12}>{U.date.format(new Date(course.endAt), 'yyyy-MM-dd HH:mm:ss')}</Col>
                            </Row>
                            {(course.liveState == LIVESTATE.finished ||
                            course.liveState == LIVESTATE.streaming ||
                            course.liveState == LIVESTATE.paused) &&
                            <video draggable={false}
                                   controls
                                   autoPlay
                                   src={course.playbackUrl}
                                   style={{maxWidth: 375}}/>}
                        </div> }
                    </div>
                </Modal>
                <Card>
                    <Table
                        rowKey={(row, index) => row.id || index}
                        columns={[{
                            title: 'ID',
                            dataIndex: 'id',
                            key: 'id',
                        }, {
                            title: '标题',
                            dataIndex: 'title',
                            key: 'title',
                            maxWidth: 350,
                        }, {
                            title: '价格',
                            dataIndex: 'price',
                            key: 'price',
                            render: (price) => price > 0 ? <span>{price}元</span> : <span>免费</span>
                        }, {
                            title: '类型',
                            dataIndex: 'type',
                            key: 'type',
                            render: (type) => {
                                switch (type) {
                                    case COURSE_TYPE.article:
                                        return <span>文章</span>;
                                    case COURSE_TYPE.audio:
                                        return <span>音频</span>;
                                    case COURSE_TYPE.audioLive:
                                        return <span>直播</span>;
                                    case COURSE_TYPE.video:
                                        return <span>视频</span>;
                                    case COURSE_TYPE.videoLive:
                                        return <span>视频直播</span>;
                                }
                            }
                        }, {
                            title: '直播状态',
                            dataIndex: 'liveState',
                            key: 'liveState',
                            render: (liveState) => {
                                switch (liveState) {
                                    case LIVESTATE.finished:
                                        return '已完成';
                                    case LIVESTATE.foreshow:
                                        return '预告';
                                    case LIVESTATE.paused:
                                    case LIVESTATE.streaming:
                                        return '直播中';
                                    default:
                                        return null;
                                }
                            },
                        }, {
                            title: '购买数',
                            dataIndex: 'buyNum',
                            key: 'buyNum',
                        }, {
                            title: '课程状态',
                            dataIndex: 'state',
                            key: 'state',
                            render: (state) => <span>{state == 2 ? '上架' : '下架'}</span>
                        }, {
                            title: '删除状态',
                            dataIndex: 'deleted',
                            key: 'deleted',
                            render: (deleted) => deleted == 1 ? <Tag color="#f50">已删除</Tag> :
                                <Tag color="#2db7f5">正常</Tag>
                        }, {
                            title: '所属店铺名称',
                            dataIndex: 'media.name',
                            key: 'media.name'
                        }, {
                            title: '操作',
                            dataIndex: 'option',
                            key: 'option',
                            width: 200,
                            render: (obj, record) => {
                                let detail_operator = record.type == COURSE_TYPE.article ||
                                    record.type == COURSE_TYPE.video ||
                                    record.type == COURSE_TYPE.video;
                                return <Dropdown overlay={<Menu>
                                    {<Menu.Item>
                                        <a onClick={() => {
                                            this.loadDetail(record.id);
                                        }}>详情</a>
                                    </Menu.Item>}
                                    {<Menu.Item>
                                        <a onClick={() => {
                                            this.courseQRCode(record);
                                        }}>进入课程</a>
                                    </Menu.Item>}
                                    {record.deleted != 1 && <Menu.Item>
                                        <a onClick={() => {
                                            this.removeCourse(record.id);
                                        }}>删除</a>
                                    </Menu.Item>}
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
