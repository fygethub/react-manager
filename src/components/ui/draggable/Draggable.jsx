/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input, message, Select, InputNumber} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
import FontEditor from './FontEditor';
import OSSWrap from '../../../common/OSSWrap.jsx';
import App from '../../../common/App.jsx';
import PictureEditor from './PictureEditor';
const SubMenu = Menu.SubMenu;

const Option = Select.Option;
class Drags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: '',
            update: false,
            deltaPositions: {},
            openKeys: [],
            dragHandle: '',
            title: '风景图',
            priority: 1,
            preview: {},
            state: 2,
            category: 3,
            dragItems: [],
        };
        this.DrawBoard = null;
        this.editStyles = [
            'h',
            'w',
            'x',
            'y',
            'movable',
            'zIndex',
            'backgroundColor',
            'fontColor',
            'align',
            'fontSize',
            'fontFamily',
        ];
        this.editMsg = this.editMsg.bind(this);
        this.uploadConstructor = this.uploadConstructor.bind(this);
        this.eidtStylesFun = this.eidtStylesFun.bind(this);
        this.addFontEditor = this.addFontEditor.bind(this);
        this.removeFontEditor = this.removeFontEditor.bind(this);
        this.layerUpload = this.layerUpload.bind(this);
        this.uploadDesign = this.uploadDesign.bind(this);
        this.initStyle = {
            h: 200,
            w: 400,
            x: 0,
            y: 0,
            movable: 0,
            text: '未编辑文字',
            align: 1,
            fontFamily: '宋体',
            fontSize: 16,
            fontColor: '000000'
        }
    }

    componentDidMount() {
        const _this = this;
        let deltaPositions = {};
        let id = this.props.params.id;
        if (id !== 'no') {
            App.api('adm/compound/detail', {
                compoundId: id,
            }).then(data => {
                let dragItems = ['img_background', 'img_layer'];
                let deltaPositions = this.state.deltaPositions;
                deltaPositions['img_background'] = {
                    ...this.initStyle,
                    ...data.background,
                };
                deltaPositions['img_layer'] = {
                    ...this.initStyle,
                    ...data.layer,
                };
                data.hotspots.forEach((item, key) => {
                    dragItems.push('text' + key);
                    deltaPositions['text' + key] = {
                        ...this.initStyle,
                        ...item,
                    }
                });
                this.setState({
                    ...data,
                    id,
                    dragItems,
                    deltaPositions,
                })
            })


        } else {
            let dragItems = ['img_background', 'img_layer', 'text_1', 'text_2', 'text_3'];
            dragItems.forEach(item => {
                deltaPositions[item] = {
                    ...this.initStyle
                };
            });
            this.setState({
                dragItems,
                deltaPositions
            });
        }

    }


    onStart = (key) => () => {
        this.setState({openKeys: [key]})
    };

    onOpenChange = (openKeys) => {
        const openkey = openKeys.filter((key) => key !== this.state.openKeys[0]);
        this.setState({openKeys: openkey});
    };


    handleOnStop = (key) => (e, item) => {
        let deltaPositions = this.state.deltaPositions;
        deltaPositions[key].x = item.lastX;
        deltaPositions[key].y = item.lastY;
        this.setState({deltaPositions});
    };

    changeDeltaStyles = (position, attr) => (e) => {
        let deltaPositions = this.state.deltaPositions;

        if (typeof e == 'string') {
            deltaPositions[position][attr] = e;
            this.setState({
                deltaPositions
            });
            return;
        }
        deltaPositions[position][attr] = e - 0;
        this.setState({
            deltaPositions
        })
    };

    uploadConstructor = () => {
        let hotspots = [];
        let background = {};
        let layer = {};
        let category = this.state.category;
        let title = this.state.title;
        let priority = this.state.priority;
        let state = this.state.state;
        let preview = this.state.preview;
        let createdAt = new Date().toISOString();
        let _this = this;
        let deltaPositions = this.state.deltaPositions;
        let judge = true;
        let id = this.state.id;
        this.state.dragItems.forEach((item) => {
            let editItem = deltaPositions[item];
            if (item.indexOf('text') > -1) {
                editItem['fontColor'] = editItem['fontColor'].replace(/#/, '');
                if (editItem['fontColor'].length !== 6) {
                    message.error(item + ':颜色码应该为6位数,请检查');
                    judge = false;
                }
                hotspots.push(editItem);
            }
            if (item.indexOf('background') > -1) {
                background.height = editItem.h;
                background.width = editItem.w;
                background.url = this.state.deltaPositions[item].url || 'http://sandbox-f1.cyjx.com/wk/2017/8/16/5993a6a6cfab571aa9eae830EKPQvRYJ.jpg';
            }
            if (item.indexOf('layer') > -1) {
                layer.height = editItem.h;
                layer.width = editItem.w;
                layer.url = this.state.deltaPositions[item].url || 'http://sandbox-f1.cyjx.com/wk/2017/8/16/5993a64bcfab571aa9eae82e0yph74LP.jpg';
            }
        });
        let uploadDate = {
            title,
            category,
            priority,
            hotspots,
            createdAt,
            background,
            state,
            layer,
        };
        if (this.state.preview.url) {
            uploadDate.preview = this.state.preview
        }
        if (id) {
            uploadDate.id = this.state.id;
            judge && App.api('adm/compound/save', {
                compound: JSON.stringify({
                    ...uploadDate
                })
            }).then((data) => {
                message.info('保存成功!')
            }, (data) => message.error('字段:' + data.data.key));
        } else {
            judge && App.api('adm/compound/save', {
                compound: JSON.stringify({
                    ...uploadDate
                })
            }).then((data) => {
                message.info('保存成功!')
            }, (data) => message.error('字段:' + data.data.key));
        }
    };

    eidtStylesFun = (item) => {
        let styles = {};
        const {deltaPositions} = this.state;
        this.editStyles.forEach((attr) => {
            let value = deltaPositions[item] && deltaPositions[item][attr];
            if (!value) return;
            if (!isNaN(value - 0)) {
                value = value - 0;
            }
            attr = attr == 'h' ? 'height' : attr;
            attr = attr == 'w' ? 'width' : attr;
            if (attr == 'align') {
                attr = 'textAlign';
                value = value == 1 ? 'left' : value == 2 ? 'center' : 'right';
            }
            attr = attr == 'fontColor' ? ['color', value = '#' + (value + '').replace(/#/, '')][0] : attr;
            styles[attr] = value;
        });
        return styles;
    };

    addFontEditor = () => {
        let editLength = this.state.dragItems.filter((item) => item.indexOf('text') > -1).length;
        let key = 'text_' + (editLength + 1);
        let dragItems = this.state.dragItems;
        let deltaPositions = this.state.deltaPositions;
        dragItems.push(key);
        deltaPositions[key] = {...this.initStyle};

        this.setState({
            dragItems,
            deltaPositions,
        });
    };

    removeFontEditor = () => {
        let dragItems = this.state.dragItems;
        let deltaPositions = this.state.deltaPositions;
        if (dragItems.length > 2) {
            delete deltaPositions[key];
            let key = dragItems.pop();
        } else {
            message.info('图层不能删除!')
        }
        this.setState({
            dragItems,
            deltaPositions,
        })
    };

    editMsg = (info) => (e) => {
        if (typeof e == 'string') {
            this.setState({
                [info]: e,
            })
        } else {
            this.setState({
                [info]: e.target.value,
            })
        }

    };

    uploadDesign = (e) => {
        let _this = this;
        let file = e.target.files[0];
        if (!file) {
            return;
        }

        OSSWrap.upload('compound-preview', file).then(function (result) {
            let preview = _this.state.preview;
            preview.url = result.url;
            let image = new Image();
            let width = 0;
            let height = 0;

            image.onload = function () {
                width = image.width;
                height = image.height;
                preview.width = width;
                preview.height = height;
                _this.setState({
                    preview,
                });
            };
            image.src = result.url;
        });

    };

    /*
     * 上传图片
     * @params: layer  图层
     * */
    layerUpload = (layer) => (url) => {
        let deltaPositions = this.state.deltaPositions;
        deltaPositions[layer].url = url;
        this.setState({
            deltaPositions
        })
    };

    fontEditorChange = (item) => (html) => {
        let deltaPositions = this.state.deltaPositions;
        deltaPositions[item].text = html;
        this.setState({deltaPositions})
    }

    render() {
        const {deltaPosition, deltaPositions} = this.state;
        const dragHandlers = {onStop: this.onStop};
        const _this = this;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom first="UI" second="合成图编辑"/>
                <div className="uplaodMain">
                    <img src={this.state.preview && this.state.preview.url} alt="img"/>
                </div>
                <div className="draw-board" id="draw-board">
                    { _this.state.dragItems.map((item) => {
                        let doms = '';
                        let id = App.uuid();
                        if (item.indexOf('text') > -1) {
                            doms = <FontEditor id={id} initText={this.state.deltaPositions[item].text}
                                               onChange={this.fontEditorChange(item)}/>
                        }
                        if (item.indexOf('img') > -1) {
                            doms = <PictureEditor id={id}
                                                  pictureUrl={this.state.deltaPositions[item] && this.state.deltaPositions[item].url}
                                                  layer={item.indexOf('background') > -1 ? 'background' : 'layer'}
                                                  uploadFile={this.layerUpload(item)}/>
                        }

                        return <Draggable
                            key={item}
                            cancel='.no-cursor'
                            onStop={_this.handleOnStop(item)}
                            onStart={_this.onStart(item)}

                            position={{
                                x: deltaPositions[item] && deltaPositions[item].x - 0,
                                y: deltaPositions[item] && deltaPositions[item].y - 0
                            }}>
                            <Card
                                bordered={false}
                                className='dragItem'
                                style={_this.eidtStylesFun(item)}>
                                {doms}
                                {!doms && <div>x: {deltaPositions[item] && deltaPositions[item].x},
                                    y: {deltaPositions[item] && deltaPositions[item].y}</div>
                                }
                            </Card>
                        </Draggable>
                    })
                    }
                </div>

                <div className="line"></div>
                <div className="rightTools">
                    <Menu
                        mode="inline"
                        openKeys={_this.state.openKeys}
                        onOpenChange={_this.onOpenChange}>
                        <SubMenu
                            key="eidt-btn"
                            title="基本操作">
                            <Menu.Item
                                key="eidt-btn-add">
                                <p className="edit-add" onClick={this.addFontEditor}>增加文本框</p>
                            </Menu.Item>
                            <Menu.Item
                                key="eidt-btn-remove">
                                <p className="edit-remove" onClick={this.removeFontEditor}>删除文本框</p>
                            </Menu.Item>

                            <Menu.Item
                                key="editCategory">
                                <Select value={this.state.category + ''} style={{width: '100%'}}
                                        onChange={this.editMsg('category')}>
                                    <Option value="1">课程</Option>
                                    <Option value="2">专栏</Option>
                                    <Option value="3">商品</Option>
                                    <Option value="4">轮播图</Option>
                                </Select>
                            </Menu.Item>
                            <Menu.Item
                                key="editTitle">
                                <input className="edit-remove"
                                       placeholder="title"
                                       value={this.state.title}
                                       onChange={this.editMsg('title')}/>
                            </Menu.Item>
                            <Menu.Item
                                key="uploadDesign">
                                <div style={{position: 'relative',}}>
                                    上传设计图
                                    <input type="file"
                                           style={{position: 'absolute', left: 0, top: 0, opacity: 0}}
                                           className="edit-remove"
                                           onChange={this.uploadDesign}/>
                                </div>

                            </Menu.Item>
                        </SubMenu>
                        { _this.state.dragItems.map((item) => {
                            return <SubMenu
                                key={item}
                                title={<span><Icon type="apple"/>{item}</span>}>
                                { _this.editStyles.map((attr) => {
                                    let sel = '';
                                    if (attr == 'fontFamily') {
                                        sel = <Select
                                            value={deltaPositions[item][attr] || '宋体'}
                                            style={{width: '100%'}}
                                            onChange={_this.changeDeltaStyles(item, attr)}>
                                            <Option value="宋体">宋体</Option>
                                            <Option value="黑体">黑体</Option>
                                            <Option value="fantasy">fantasy</Option>
                                            <Option value="Helvetica Neue For Number">Helvetica Neue For Number</Option>
                                            <Option value="BlinkMacSystemFont">BlinkMacSystemFont</Option>
                                        </Select>
                                    }
                                    if (attr == 'fontColor') {
                                        sel = <input type="color"
                                                     value={'#' + deltaPositions[item][attr]}
                                                     onChange={_this.changeDeltaStyles(item, attr)}/>
                                    }

                                    if (attr == 'backgroundColor') {
                                        sel = <Select
                                            value={deltaPositions[item][attr] || '#ffffff'}
                                            style={{width: '100%'}}
                                            onChange={_this.changeDeltaStyles(item, attr)}>
                                            <Option value="transparent">透明</Option>
                                            <Option value="#ffffff">白色</Option>
                                        </Select>
                                    }
                                    if (attr == 'zIndex') {
                                        sel = <Select
                                            value={deltaPositions[item][attr] || '0'}
                                            style={{width: '100%'}}
                                            onChange={_this.changeDeltaStyles(item, attr)}>
                                            <Option value="0">正常</Option>
                                            <Option value="1">高一层</Option>
                                            <Option value="2">高二层</Option>
                                            <Option value="3">高三层</Option>
                                            <Option value="4">最高层</Option>
                                        </Select>
                                    }
                                    if (attr == 'align') {
                                        sel = <Select
                                            value={deltaPositions[item][attr] + ''}
                                            style={{width: '100%'}}
                                            onChange={_this.changeDeltaStyles(item, attr)}>
                                            <Option value="1">left</Option>
                                            <Option value="2">center</Option>
                                            <Option value="3">right</Option>
                                        </Select>
                                    }

                                    if (attr == 'movable') {
                                        sel = <Select
                                            value={deltaPositions[item][attr] || '1'}
                                            style={{width: '100%'}}
                                            onChange={_this.changeDeltaStyles(item, attr)}>
                                            <Option value="1">可移动</Option>
                                            <Option value="0">不可移动</Option>
                                        </Select>
                                    }

                                    return <Menu.Item key={item + attr}>
                                        <label htmlFor={item + attr} style={{
                                            position: 'absolute',
                                            marginLeft: -40,
                                            width: 40,
                                            overflow: 'hidden'
                                        }}>{attr}</label>
                                        {sel}
                                        {!sel && <InputNumber
                                            id={item + attr}
                                            value={deltaPositions[item] && deltaPositions[item][attr] || ''}
                                            onChange={_this.changeDeltaStyles(item, attr)}/>}
                                    </Menu.Item>
                                })
                                }
                            </SubMenu>
                        })
                        }
                    </Menu>
                    <div className="submit">
                        {/*  <div className="view">
                         /!*{JSON.stringify(this.state.deltaPositions)}*!/
                         </div>*/}
                        <div className="button" onClick={this.uploadConstructor}>提交</div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Drags;
