/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, message, Select, InputNumber, Button} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
import FontEditor from './FontEditor';
import OSSWrap from '../../../common/OSSWrap.jsx';
import App from '../../../common/App.jsx';
import PictureEditor from './PictureEditor';
// import html2canvas from 'html2canvas';

const SubMenu = Menu.SubMenu;

const Option = Select.Option;

const backgroundSize = {
    '1': {
        width: 750,
        height: 423,
    },
    '2': {
        width: 750,
        height: 1000,
    },
    '3': {
        width: 750,
        height: 750,
    },
    '4': {
        width: 750,
        height: 423,
    }
};

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
            clear: 0,
            canvas: false,
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
        this.initData = this.initData.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.initStyle = {
            h: 750,
            w: 750,
            x: 0,
            y: 0,
            movable: 1,
            text: '未编辑文字',
            align: 1,
            fontFamily: '宋体',
            fontSize: 16,
            fontColor: '000000'
        };
        this.timer_save = -1;
    }

    componentDidMount() {
        const _this = this;
        this.initData();
    }

    initData = () => {
        let id = this.props.params.id;
        let state = localStorage.getItem('state') && JSON.parse(localStorage.getItem('state'));
        if (state) {
            this.setState({
                ...state,
            });
            return;
        }

        if (id !== 'no') {
            App.api('adm/compound/detail', {
                compoundId: id,
            }).then(data => {
                let dragItems = ['img_background', 'img_layer'];
                let deltaPositions = this.state.deltaPositions;
                if (!data.layer) {
                    data.layer = {width: this.initStyle.w, height: this.initStyle.h};
                }
                data.layer.w = data.layer.width;
                data.layer.h = data.layer.height;
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
            this.handleReset();
        }
    };


    handleReset = () => {
        let deltaPositions = {};
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
    };

    onStart = (key) => () => {
        this.setState({openKeys: [key]})
    };

    onOpenChange = (openKeys) => {
        let deltaPositions = this.state.deltaPositions;

        if (typeof openKeys == 'string') {
            this.state.dragItems.forEach((item) => {
                deltaPositions[item] && [deltaPositions[item]['zIndex'] = '0'];
            });

            deltaPositions[openKeys]['zIndex'] = '1';
            this.setState({
                openKeys: [openKeys],
                deltaPositions,
            });
            return;
        }

        const openkey = openKeys.filter((key) => key !== this.state.openKeys[0]);
        if (openkey.length > 0) {
            this.state.dragItems.forEach((item) => {
                deltaPositions[item]['zIndex'] = '0';
            });
            deltaPositions[openkey[0]] && [deltaPositions[openkey[0]]['zIndex'] = '1'];
        }
        this.setState({
            openKeys: openkey,
            deltaPositions
        });
    };


    handleOnStop = (key) => (e, item) => {
        let deltaPositions = this.state.deltaPositions;
        this.state.dragItems.forEach((item) => {
            deltaPositions[item]['zIndex'] = '0';
        });
        deltaPositions[key]['zIndex'] = '1';
        deltaPositions[key].x = item.lastX;
        deltaPositions[key].y = item.lastY;
        this.setState({deltaPositions});
    };

    changeDeltaStyles = (position, attr) => (e) => {
        let deltaPositions = this.state.deltaPositions;

        if (typeof e == 'object') {
            deltaPositions[position][attr] = e.target.value;
            this.setState({
                deltaPositions
            });
            return;
        }

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

    componentWillUpdate(nextProps, nextState) {
        clearTimeout(this.timer_save);
        this.timer_save = setTimeout(() => {
            localStorage.setItem('state', JSON.stringify(nextState));
        }, 2000);

    }

    uploadConstructor = (value) => (e) => {
        console.log(e);
        let hotspots = [];
        let background = {};
        let layer = {};
        let category = this.state.category;
        let title = this.state.title;
        let priority = this.state.priority;
        let state = this.state.state;
        let createdAt = new Date().toISOString();
        let _this = this;
        let save_other = value == 'other';
        let deltaPositions = this.state.deltaPositions;
        let judge = true;
        let id = this.props.params.id;
        this.state.dragItems.forEach((item) => {
            let editItem = deltaPositions[item];
            if (item.indexOf('text') > -1) {
                if (editItem['fontColor'].indexOf('#') > -1) {
                    editItem['fontColor'] = editItem['fontColor'].replace(/#/, '');
                }
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
                layer.movable = editItem.movable;
                layer.x = editItem.x;
                layer.y = editItem.y;
                layer.url = this.state.deltaPositions[item].url || '';
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
        };

        if (layer.url) {
            uploadDate.layer = layer;
        }

        if (this.state.preview.url) {
            uploadDate.preview = this.state.preview
        }

        if (!save_other && id) {
            uploadDate.id = this.state.id;
        }

        judge && App.api('adm/compound/save', {
            compound: JSON.stringify({
                ...uploadDate
            })
        }).then(() => {
            message.info('保存成功!');
            localStorage.removeItem('state');
        }, (data) => message.error('字段:' + data && data.data && data.data.key));

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
            attr = attr == 'fontColor' ? ['color', value = '#' + (value + '').replace(/#/g, '')][0] : attr;
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
            let deltaPositions = this.state.deltaPositions;
            let background = this.state.deltaPositions['img_background'];
            if (info == 'category') {
                background.w = backgroundSize[e].width;
                background.h = backgroundSize[e].height;
            }

            this.setState({
                [info]: e,
                deltaPositions,
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

    drawPicture = () => {
        /* let _this = this;
         e.preventDefault();
         e.stopPropagation();
         e.nativeEvent.stopImmediatePropagation();
         this.setState({
         canvas: true,
         }, () => {
         html2canvas(document.body)
         .then(function (canvas) {
         document.querySelector('.canvas').appendChild(canvas);
         });
         });*/

    };

    render() {
        const {deltaPosition, deltaPositions} = this.state;
        const dragHandlers = {onStop: this.onStop};
        const _this = this;
        return (
            <div className="drags-edit">
                {/*  <div className="canvas" style={{display: this.state.canvas ? 'block' : 'none'}}>
                 /!*<canvas id="canvas" style={{width: 300, height: 300}}/>*!/
                 </div>*/}

                <div className="uplaodMain">
                    <img src={this.state.preview && this.state.preview.url} alt="img"/>
                </div>
                <div className="gutter-example button-demo">
                    <BreadcrumbCustom first="UI" second="合成图编辑"/>
                    <div className="selectItem">
                        <Select value={this.state.category + ''} style={{width: '50%'}}
                                onChange={this.editMsg('category')}>
                            <Option value="1">课程</Option>
                            <Option value="2">专栏</Option>
                            <Option value="3">商品</Option>
                            <Option value="4">轮播图</Option>
                        </Select>

                        <Select value={_this.state.openKeys} style={{width: '50%'}}
                                onChange={_this.onOpenChange}>
                            { _this.state.dragItems.map((item) => {
                                let text = '';
                                if (item.indexOf('background') > -1) {
                                    text = 'background';
                                }
                                if (item.indexOf('layer') > -1) {
                                    text = 'layer';
                                }

                                return <Option key={item}
                                               value={item}>{text || this.state.deltaPositions[item] && this.state.deltaPositions[item].text}</Option>
                            })
                            }
                        </Select>
                    </div>
                    <div className="menu_selectItem">
                        <input className="edit-remove"
                               placeholder="title"
                               value={this.state.title}
                               onChange={this.editMsg('title')}/>

                        <div>
                            上传设计图
                            <input type="file"
                                   style={{position: 'absolute', left: 0, top: 0, opacity: 0}}
                                   className="edit-remove"
                                   onChange={this.uploadDesign}/>
                        </div>
                    </div>

                    <div className="draw-board" id="draw-board">
                        { _this.state.dragItems.map((item) => {
                            let doms = '';
                            let id = App.uuid();
                            if (item.indexOf('text') > -1) {
                                doms = <FontEditor id={id}
                                                   initText={this.state.deltaPositions[item].text || item}
                                                   fontColor={this.state.deltaPositions[item].fontColor}
                                                   textAlign={_this.state.deltaPositions[item].align}
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
                                title={<span><Icon type="bars"/>基本操作</span>}>
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
                                    title={<span><Icon type="edit"/>{item}</span>}>
                                    { _this.editStyles.map((attr) => {
                                        let sel = '';
                                        if (attr == 'fontFamily') {
                                            sel = <Select
                                                value={deltaPositions[item][attr] || '宋体'}
                                                style={{width: '100%'}}
                                                onChange={_this.changeDeltaStyles(item, attr)}>
                                                <Option value="宋体">宋体</Option>
                                                <Option value="微软雅黑">微软雅黑</Option>
                                                <Option value="黑体">黑体</Option>
                                                <Option value="fantasy">fantasy</Option>
                                                <Option value="Helvetica Neue For Number">Helvetica Neue For
                                                    Number</Option>
                                                <Option value="BlinkMacSystemFont">BlinkMacSystemFont</Option>
                                            </Select>
                                        }
                                        if (attr == 'fontColor') {
                                            sel = <input type="text"
                                                         value={deltaPositions[item][attr]}
                                                         onChange={_this.changeDeltaStyles(item, attr)}/>
                                        }

                                        if (attr == 'backgroundColor') {
                                            sel = <Select
                                                value={deltaPositions[item][attr] || 'transparent'}
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
                                                value={deltaPositions[item][attr] + '' || '1'}
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
                            <Button className="button"
                                    onClick={this.uploadConstructor('no')}>{this.props.params.id !== 'no' || this.state.id ? '修改' : '保存'}</Button>
                            {(this.props.params.id !== 'no' || this.state.id) &&
                            <Button className="button" onClick={this.uploadConstructor('other')}>另存为</Button>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Drags;
