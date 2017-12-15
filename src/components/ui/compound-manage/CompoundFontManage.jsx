import React from 'react';
import {Row, Col, Button, message, Card, Popconfirm, Select, Input, Icon, Form, Modal,Table} from 'antd';
import {hashHistory} from 'react-router';
import U from '../../../common/U';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import '../../../asssets/css/ui/compound-manage.less';
import App from '../../../common/App.jsx';
import OSSWrap from '../../../common/OSSWrap.jsx';

class CompoundFontManage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            visible: false,
            font: {},
            dataSource: [],
        };

        this.columns = [
            {title: 'id', dataIndex: 'id', key: 'id', width: 190,},
            {title: '名称', dataIndex: 'name', key: 'name', width: 190,},
            {
                title: '大小', dataIndex: 'size', key: 'size', width: 190,
                render: (size) => <span>{size > 1024 ? (~~(size / 1024)) + 'kb' : size + 'B'}</span>

            },
            {
                title: '操作',
                dataIndex: 'Select.Option',
                width: 190,
                key: 'Select.Option',
                render: this.renderAction,
            },
            {title: '', dataIndex: 'null', key: 'null'},
        ];
    }

    componentDidMount() {
        this.loadFontList();
    }

    renderAction = (text, record) => {
        return <div>
            <Popconfirm placement="left" title="你想好了要删掉吗, 创建一个不容易的."
                        onConfirm={this.removeFont(record)}
                        okText="是的" cancelText="我再想想">
                <a>删除</a>
            </Popconfirm>
            <span className = "ant-divider"></span>
            <a href={record.url}>下载</a>
        </div>
    };

    removeFont = (record) => () => {
        App.api('adm/compound/remove_font', {
            id: record.id,
        }).then(res => {
            message.success('删除成功');
            let dataSource = this.state.dataSource;
            dataSource = dataSource.filter(item => item.id != record.id);
            this.setState({
                dataSource
            })
        })
    };

    loadFontList = () => {
        App.api('adm/compound/fonts').then(res => {
            let dataSource = res.map(item => {
                return {
                    id: item.id,
                    name: item.name,
                    size: item.ttf.size,
                    url: item.ttf.url,
                }

            });
            this.setState({
                dataSource,
            })
        })
    };

    fontUpload = (e) => {
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        OSSWrap.upload('font-ttf', file).then((font) => {
            console.log(font);
            console.log(file);
            this.setState({
                font,
                file,
                visible: true,
            })
        });
        App.api('adm/compound/fonts').then(result => {
            console.log(result);
        })
    };

    showModal = () => {
        this.setState({visible: true});
    };
    handleCancel = () => {
        this.setState({visible: false});
    };
    handleCreate = () => {
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            App.api('adm/compound/save_font', {
                font: JSON.stringify({
                    name: values.name,
                    uname: values.uname,
                    ttf: {
                        url: values.url,
                        size: values.size,
                    }
                })
            }).then(res => {
                message.info('上传成功');
                this.loadFontList();
            });

            form.resetFields();
            this.setState({visible: false});
        });
    };
    saveFormRef = (form) => {
        this.form = form;
    };

    render() {

        const {getFieldDecorator} = this.props.form;
        const {visible, file, font} = this.state;
        return (
            <div className="compound-manage-page">
                <BreadcrumbCustom first="ui" second="字体管理"/>
                <div className="manage-font">
                    <div className="manage-header">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Card>
                                    <input type="file" accept = ".ttf,.eot,.woff,.svg" className="manage-font-upload" onChange={this.fontUpload}/>
                                    <Button type="primary" onClick={this.showModal}>
                                        上传字体
                                    </Button>
                                    <Modal
                                        visible={this.state.visible}
                                        title="确认上传信息"
                                        okText="Create"
                                        onCancel={this.handleCancel}
                                        onOk={this.handleCreate}
                                    >
                                        <Form layout="vertical">
                                            <Form.Item label="Name">
                                                {getFieldDecorator('name', {
                                                    rules: [{required: true, message: 'Please input the name!'}],
                                                    initialValue: file && file.name.split('.')[0],
                                                })(
                                                    <Input />
                                                )}
                                            </Form.Item>
                                            <Form.Item label="uname">
                                                {getFieldDecorator('uname', {
                                                    rules: [{required: true, message: 'Please input the uname!'}],
                                                })(
                                                    <Input />
                                                )}
                                            </Form.Item>
                                            <Form.Item label="Url">
                                                {getFieldDecorator('url', {
                                                    rules: [{required: true, message: 'Plaease input the url'}],
                                                    initialValue: font && font.url,
                                                })(<Input disabled/>)}
                                            </Form.Item>
                                            <Form.Item label="Size">
                                                {getFieldDecorator('size', {
                                                    rules: [{required: true, message: 'Plaease input the size'}],
                                                    initialValue: file && file.size,
                                                })(<Input disabled/>)}
                                            </Form.Item>
                                        </Form>
                                    </Modal>
                                    {/*<CollectionCreateForm
                                     ref={this.saveFormRef}
                                     font={this.state.font}
                                     file={this.state.file}
                                     visible={this.state.visible}
                                     onCancel={this.handleCancel}
                                     onCreate={this.handleCreate}
                                     />*/}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    <div className="manage-font-table">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Card>
                                    <Table
                                        rowKey={record => record.id}
                                        columns={this.columns}
                                        size='middle'
                                        dataSource={this.state.dataSource}/>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        )
    }
}


export default Form.create()(CompoundFontManage)

const CollectionCreateForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, form, file, font} = props;
        const {getFieldDecorator} = form;
        return (
            <Modal
                visible={visible}
                title="确认上传信息"
                okText="Create"
                onCancel={onCancel}
                onOk={onCreate}
            >
                <Form layout="vertical">
                    <Form.Item label="Name">
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: 'Please input the name!'}],
                            initialValue: file && file.name.split('.')[0],
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item label="uname">
                        {getFieldDecorator('uname', {
                            rules: [{required: true, message: 'Please input the uname!'}],
                        })(
                            <Input />
                        )}
                    </Form.Item>
                    <Form.Item label="Url">
                        {getFieldDecorator('url', {
                            rules: [{required: true, message: 'Plaease input the url'}],
                            initialValue: font && font.url,
                        })(<Input disabled/>)}
                    </Form.Item>
                    <Form.Item label="Size">
                        {getFieldDecorator('size', {
                            rules: [{required: true, message: 'Plaease input the size'}],
                            initialValue: file && file.size,
                        })(<Input disabled/>)}
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
);
