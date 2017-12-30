import React from 'react';
import PropTypes from 'prop-types';
import {Menu, Icon, Card, message, Select, InputNumber, Button, Input, Modal, Row, Col} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import '../../../asssets/css/ui/draggable-new.less';
import FontEditor from './FontEditor';
import OSSWrap from '../../../common/OSSWrap.jsx';
import App from '../../../common/App.jsx';
import PictureEditor from './PictureEditor';
import enmu from '../../../common/Ctype';
import U from '../../../common/U';
import Sortable from 'sortablejs';

const Option = Select.Option;

export default class DraggableNew extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            item: null,
            items: [],
            category: 1,
            state: 1,
            title: '',
            preview: {},
            priority: 1,
            visible: false,
            collRightMenu: false,
            fontDataSource: [],
            showPlaceHolder: false,
            isShowSortLabel: false,
        }
    }

    componentDidMount() {
        this.addKeyboard();
        this.createSortAble('sortItems');//属性可拖动
        this.loadFontList();
        let state = localStorage.getItem('state') && JSON.parse(localStorage.getItem('state'));
        if (state) {
            this.setState({
                ...state,
            });
            return;
        }

        let id = this.props.params.id;
        if (id !== 'no' || id != 'id') {
            App.api('adm/compound/detail', {
                compoundId: id,
            }).then(data => {
                let layers = data.layers.map(item => {
                    item.id = App.uuid();
                    return item;
                });
                this.setState({
                    ...data,
                    items: layers,
                })
            });
            return;
        }
    }

    addKeyboard = () => {
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey == true && e.keyCode == 83) {
                this.uploadConstructor('no')();
            }
            if (e.code == 'AltLeft') {
                console.log('alt down');
                let item = this.state.item;
                if (!item)return;
                this.cacheMovable = item.movable;
                this.changeItemStyle('movable')(enmu.movable.umMove);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code == 'AltLeft') {
                console.log('alt up');
                let item = this.state.item;
                if (!item)return;
                this.changeItemStyle('movable')(this.cacheMovable);
            }
        });
    };

    createSortAble = (id) => {
        let el = document.getElementById(id);
        Sortable.create(el, {
            onEnd: (evt) => {
                console.log(evt.oldIndex, evt.newIndex);
                let items = this.state.items;
                let item = items[evt.oldIndex];
                if (evt.oldIndex < evt.newIndex) {
                    items.splice(evt.newIndex + 1, 0, item);
                    items.splice(evt.oldIndex, 1);
                } else {
                    items.splice(evt.newIndex, 0, item);
                    items.splice(evt.oldIndex + 1, 1);
                }
                this.setState({
                    items,
                })
            },
        });
    };


    loadFontList = () => {
        App.api('adm/compound/fonts').then(res => {
            let fontDataSource = res.map(item => {
                return {
                    id: item.id,
                    name: item.name,
                    size: item.ttf.size,
                    url: item.ttf.url,
                }

            });
            fontDataSource.forEach(font => {
                U.CssStyle.dynamicFont(font.name, font.url);
            });
            this.setState({
                fontDataSource,
            })
        })
    };

    createItem = (type) => {
        let items = this.state.items;
        let item = {
            id: App.uuid(),
            type,
            movable: enmu.movable.move,
            w: enmu.len.middle,
            h: enmu.len.middle,
            background: enmu.background.transparent,//1111
        };

        if (type == enmu.type.img) {
            let a = window.prompt('为当前图层取一个名字吧') || App.uuid();
            item = {
                ...item,
                ...enmu.default.img,
                id: a,
            };
        }
        if (type == enmu.type.text) {
            item = {
                ...item,
                ...enmu.default.text,
                bold: enmu.bold.normal,
                italic: enmu.italic.normal,
            }
        }

        items.push(item);
        this.setState({
            items,
        })
    };

    onStop = (id) => (e, item1) => {
        let items = this.state.items.map(item => {
            item.zIndex = 0;
            if (item.id == id) {
                item.x = item1.lastX;
                item.y = item1.lastY;
                item.zIndex = 1;
            }
            return item;
        });
        this.setState({items});
    };

    componentWillUpdate(nextProps, nextState) {
        clearTimeout(this.timer_save);
        this.timer_save = setTimeout(() => {
            localStorage.setItem('state', JSON.stringify(nextState));
        }, 2000);
    }

    onStart = (_item) => (e, item1) => {
        let items = this.state.items.map(item => {
            item.zIndex = 0;
            if (item.id === _item.id) {
                item.zIndex = 1;
            }
            return item;
        });
        this.setState({
            item: _item,
            items,
        })
    };

    deleteItem = (id) => (e) => {
        id = id || (this.state.item && this.state.item.id);
        let items = this.state.items.filter((item) => item.id != id);
        this.setState({
            items,
            item: items[items.length - 1],
            visible: false,
        })
    };

    itemAttrChange = (type) => (text) => {
        let items = this.state.items.map(item => {
            if (item && this.state.item && item.id == this.state.item.id) {
                item[type] = text;
            }
            return item;
        });
        this.setState({
            items,
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
        OSSWrap.upload('compound-preview', file).then((result) => {
            let preview = _this.state.preview;
            preview.url = result.url;
            let image = new Image();
            let width = 0;
            let height = 0;

            image.onload = () => {
                width = image.width;
                height = image.height;
                preview.width = width;
                preview.height = height;
                this.setState({
                    preview,
                });
            };
            image.src = result.url;
        });

    };

    handleClick = (e) => {
        console.log('click ', e);
    };

    changeItemStyle = (type) => (e) => {
        let val = typeof e == 'object' ? e.target.value : e;
        let _item = {};
        let items = this.state.items.map(item => {
            if (item.id == this.state.item.id) {
                item[type] = val;
                _item = item;
            }
            return item;
        });
        this.setState({
            items,
            item: _item,
        })
    };

    onSelectItem = (id) => {
        let item = this.state.items.find(item => item.id === id);
        let items = this.state.items.map(item => {
            item.zIndex = 0;
            if (item.id === id) {
                item.zIndex = 1;
            }
            return item;
        });
        this.setState({
            item,
            items,
        })
    };

    uploadConstructor = (type) => () => {
        let compound = {}, judge = true;
        let layers = this.state.items.map(item => {
            let layer = {};
            for (let key in item) {
                if (key != 'background' && key != 'zIndex' && item.hasOwnProperty(key)) {
                    if (key == 'fontColor' && item['fontColor'].indexOf('#') > -1) {
                        item['fontColor'] = item['fontColor'].replace(/#/, '');
                        if (item['fontColor'].length !== 6) {
                            message.error(item + ':颜色码应该为6位数,请检查');
                            judge = false;
                        }
                    }
                    layer[key] = item[key];
                }
            }
            return layer;
        });

        layers[0].placeholders = this.state.items[0].placeholders;

        compound.title = this.state.title;
        compound.category = this.state.category;
        compound.priority = this.state.priority;
        compound.state = this.state.state;
        compound.layers = layers;
        compound.preview = this.state.preview;
        let save_other = type == 'other';
        let id = this.props.params.id;
        if (!save_other && id) {
            compound.id = this.state.id;
        }

        judge && App.api('adm/compound/save', {
            compound: JSON.stringify(compound)
        }).then(() => {
            message.info('保存成功!');
            localStorage.removeItem('state');
        }, (data) => message.error('字段:' + data && data.data && data.data.key));


    };

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleCancel = (e) => {
        console.log(e);
        this.setState({
            visible: false,
        });
    };

    toggleRightMenu = () => {
        this.setState({
            collRightMenu: !this.state.collRightMenu,
        })
    };

    getBoundRect = (rectBound) => {
        if (this.state.items.length == 0 || this.state.items[0].type != enmu.type.img) {
            message.info('没有图片层 ,or第一次不为图片层');
            return;
        }

        let items = this.state.items;
        let placeholders = [];
        placeholders.push({
            x: rectBound.left,
            y: rectBound.top,
            w: rectBound.width,
            h: rectBound.height,
        });
        items[0].placeholders = placeholders;
        this.setState({
            items
        });

    };

    handlePlaceholder = () => {
        if (this.state.items.length == 0 || this.state.items[0].type != enmu.type.img) {
            message.info('没有图片层 ,or第一次不为图片层');
            return;
        }

        this.setState({
            showPlaceHolder: !this.state.showPlaceHolder,
        });

    };

    toggleSortLabel = () => {
        this.setState({
            isShowSortLabel: !this.state.isShowSortLabel,
        })
    };

    rightOperatorMenu = () => {
        return (
            <Menu.SubMenu
                key="eidt-btn"
                title={<span><Icon type="bars"/>基本操作</span>}>
                <Menu.Item
                    key="font-btn-add">
                    <p className="edit-add" onClick={() => this.createItem(enmu.type.text)}>
                        增加文本框</p>
                </Menu.Item>
                <Menu.Item
                    key="img-btn-add">
                    <p className="edit-add" onClick={() => this.createItem(enmu.type.img)}>增加图片框</p>
                </Menu.Item>
                <Menu.Item
                    key="eidt-btn-remove">
                    <p className="edit-remove" onClick={this.showModal}>
                        删除当前选中</p>
                </Menu.Item>
                <Menu.Item
                    key="sort-btn-add">
                    <p className="edit-add" onClick={this.toggleSortLabel}>
                        {!this.state.isShowSortLabel ? '打开排序' : '关闭排序'}
                    </p>
                </Menu.Item>
                <Menu.Item
                    key="place-btn-add">
                    <p className="edit-add" onClick={this.handlePlaceholder}>
                        { !this.state.showPlaceHolder ? ' 添加选项框' : '保存'}
                    </p>
                </Menu.Item>
            </Menu.SubMenu>
        )
    };


    rightStyleOperatorMenu = (_item) => {
        return (<Menu.SubMenu
            style={{paddingLeft: '10px'}}
            key="sub1"
            title={<span><Icon type="bars"/>属性面板</span>}>
            {Object.keys(_item).map(key => {
                if (key == 'movable' || key == 'bold' || key == 'italic' || key == 'background') {
                    let nor, un;
                    switch (key) {
                        case 'movable':
                            un = '可移动';
                            nor = '不可移动';
                            break;
                        case 'bold':
                            nor = '正常';
                            un = '加粗';
                            break;
                        case 'italic':
                            nor = '正常';
                            un = '倾斜';
                            break;
                        case 'background':
                            nor = '白色';
                            un = '透明';
                            break;
                        default:
                            break;
                    }

                    return (
                        <Menu.Item key={key}>
                            <label htmlFor={key} style={{
                                position: 'absolute',
                                marginLeft: -40,
                                width: 40,
                                overflow: 'hidden'
                            }}>{enmu.nick[key]}</label>
                            <Select
                                onSelect={this.changeItemStyle(key)}
                                value={_item[key] + ''}
                                style={{width: '100%'}}>
                                <Option value={enmu.movable.umMove}>{nor}</Option>
                                <Option value={enmu.movable.move}>{un}</Option>
                            </Select>
                        </Menu.Item>
                    )
                }
                if (key == 'fontFamily') {
                    return (
                        <Menu.Item key={key}>
                            <label htmlFor={key} style={{
                                position: 'absolute',
                                marginLeft: -40,
                                width: 40,
                                overflow: 'hidden'
                            }}>{enmu.nick[key]}</label>
                            <Select
                                onSelect={this.changeItemStyle(key)}
                                value={_item[key] + ''}
                                style={{width: '100%'}}>
                                {
                                    this.state.fontDataSource && this.state.fontDataSource.map(font => (
                                        <Option value={`${font.name}`}
                                                key={`${font.name}`}>
                                            {font.name}
                                        </Option>
                                    ))
                                }
                                <Option value={'"宋体"'}>宋体</Option>
                            </Select>
                        </Menu.Item>
                    )
                }
                if (key == 'align') {
                    return (
                        <Menu.Item key={key}>
                            <label htmlFor={key} style={{
                                position: 'absolute',
                                marginLeft: -40,
                                width: 40,
                                overflow: 'hidden'
                            }}>{enmu.nick[key]}</label>
                            <Select
                                onSelect={this.changeItemStyle(key)}
                                value={_item[key] + ''}
                                style={{width: '100%'}}>
                                <Option value={enmu.align.left + ''}>靠左</Option>
                                <Option value={enmu.align.center + ''}>居中</Option>
                                <Option value={enmu.align.right + ''}>靠右</Option>
                            </Select>
                        </Menu.Item>
                    )
                }
                if (key == 'text' || key == 'url' || key == 'type' || key == 'id' || key == 'fontColor') {
                    if (key !== 'fontColor') {
                        return null;
                    }
                    return (
                        <Menu.Item key={key}>
                            <label htmlFor={key} style={{
                                position: 'absolute',
                                marginLeft: -40,
                                width: 40,
                                overflow: 'hidden'
                            }}>{enmu.nick[key]}</label>
                            <Input disabled={key !== 'fontColor'}
                                   onChange={this.changeItemStyle(key)}
                                   id="type"
                                   value={_item[key]}/>
                        </Menu.Item>)
                }

                return (
                    <Menu.Item key={key}>
                        <label htmlFor={key} style={{
                            position: 'absolute',
                            marginLeft: -40,
                            width: 40,
                            overflow: 'hidden'
                        }}>{enmu.nick[key]}</label>
                        <InputNumber
                            onChange={this.changeItemStyle(key)}
                            id="type"
                            value={this.state.item[key]}/>
                    </Menu.Item>)
            })}
        </Menu.SubMenu>)
    };

    headerOperatorMenu = (_item) => {
        return (
            <Row>
                <Col span={4}>
                    <Select value={this.state.category + ''}
                            style={{width: '80%'}}
                            onChange={this.editMsg('category')}>
                        <Option value="1">课程</Option>
                        <Option value="2">专栏</Option>
                        <Option value="3">商品</Option>
                        <Option value="4">轮播图</Option>
                        <Option value="5">海报</Option>
                    </Select>
                </Col>
                <Col span={8}>
                    <Select value={this.state.item && (this.state.item.id)} onSelect={this.onSelectItem}
                            style={{width: '80%'}}>
                        {this.state.items.filter((v) => v.id).map((item) => {
                            return <Option value={item.id + ''}
                                           key={item.id}>{item.text || item.id}</Option>
                        })}
                    </Select>
                </Col>
                <Col span={4}>
                    <Input style={{width: '80%'}}
                           placeholder="请输入标题"
                           value={this.state.title}
                           onChange={this.editMsg('title')}/>

                </Col>
                <Col span={4}>
                    <span className="ant-input">上传预览图</span>
                    <Input type="file"
                           style={{
                               width: '80%', position: 'absolute',
                               left: 0, right: 0, bottom: 0, top: 0, opacity: 0,
                           }}
                           onChange={this.uploadDesign}/>
                </Col>
            </Row>
        )
    };


    sortItems = () => {
        return (
            <ul className={`sortItems ${this.state.isShowSortLabel && 'slideInUp'}`} id="sortItems">
                <Card onClick={this.toggleSortLabel} style={{textAlign: 'right'}}>
                    关闭
                </Card>
                {
                    this.state.items.map(item => {
                        let prop = {
                            onClick: () => {
                                this.onSelectItem(item.id);
                            },
                            onDoubleClick: () => {
                                this.showModal();
                            },
                            key: item.id + 'sort',
                            className: 'sort-item',
                        };

                        return <li {...prop}>
                            <Card>
                                {item.type === enmu.type.img ? <img
                                        className="sortImg"
                                        src={item.url}
                                        alt=""/> : <p>{item.text}</p>   }
                            </Card>
                        </li>

                    })
                }
            </ul>
        )
    };

    resizeCallback = (size) => {
        console.log(size);
        this.changeItemStyle('w')(size.width);
        this.changeItemStyle('h')(size.height);
    };

    render() {
        let _item = this.state.item || {};
        let _items = this.state.items;
        return (
            <div className="drags-new-edit">
                <Modal
                    title="提示"
                    visible={this.state.visible}
                    onOk={this.deleteItem(_item.id)}
                    onCancel={this.handleCancel}
                >
                    <p>是否删除 {_item.text || <img src={_item.url} alt="" style={{width: 100}}/>}</p>
                </Modal>
                <BreadcrumbCustom first="UI" second="合成图编辑"/>
                <Placeholders getBoundRect={this.state.showPlaceHolder && this.getBoundRect}
                              visible={this.state.showPlaceHolder }/>
                <div className="uplaodMain">
                    <img src={this.state.preview && this.state.preview.url} alt=""/>
                </div>
                {this.sortItems()}
                <div className="operator">
                    {this.headerOperatorMenu(_item)}
                    <div className="flex">
                        <div className="content-operator">
                            { _items.map((item) => {
                                let fn = {};
                                if (item.type == enmu.type.text) {
                                    fn.textChange = this.itemAttrChange('text');
                                } else {
                                    fn.setPictureUrl = this.itemAttrChange('url');
                                    fn.defaultUrl = item.url;
                                }
                                return (
                                    <DraggableItem onStart={() => this.onSelectItem(item.id)}
                                                   onStop={this.onStop(item.id)}
                                                   {...fn}
                                                   resizeCallback={(size) => {
                                                       this.resizeCallback(size)
                                                   }}
                                                   blinblin={this.state.item && this.state.item.id == item.id}
                                                   dragStyle={{x: item.x, y: item.y}}
                                                   cardStyle={{
                                                       position: 'absolute',
                                                       background: item.background == enmu.background.white ? '#fff' : 'transparent',
                                                       width: item.w,
                                                       height: item.h,
                                                       zIndex: item.zIndex,
                                                       fontFamily: item.fontFamily,
                                                       align: item.align == enmu.align.left ? 'left' : item.align == enmu.align.center ? 'center' : 'right',
                                                       fontSize: item.fontSize,
                                                       fontStyle: item.italic == enmu.italic.italic ? 'italic' : 'normal',
                                                       fontWeight: item.bold == enmu.bold.bold ? 'bold' : 'normal',
                                                   }}
                                                   align={item.align - 0}
                                                   movable={item.movable + ''}
                                                   item={item}
                                                   cType={item.type}
                                                   key={item.id}/>)
                            })}
                        </div>
                        <div className="right-operator" id="right-operator"
                             style={{width: !this.state.collRightMenu ? 200 : 0}}>
                            <div className="toggle-right-operator"
                                 onClick={this.toggleRightMenu}/>
                            <Menu
                                onClick={this.handleClick}
                                defaultSelectedKeys={['1']}
                                defaultOpenKeys={['sub1']}
                                mode="inline">
                                {this.rightOperatorMenu()}
                                {this.rightStyleOperatorMenu(_item)}
                            </Menu>
                            <div className="submit">
                                <Button className="button"
                                        onClick={this.uploadConstructor('no')}>{this.props.params.id !== 'no' || this.state.id ? '修改' : '保存'}</Button>
                                {(this.props.params.id !== 'no' || this.state.id) &&
                                <Button className="button" onClick={this.uploadConstructor('other')}>另存为</Button>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class Placeholders extends React.Component {

    static propTypes = {
        visible: PropTypes.bool,
        relateQuery: PropTypes.string.isRequired,
        getBoundRect: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    };

    static defaultProps = {
        relateQuery: '.content-operator',
    };

    constructor(props) {
        super(props);
        this.state = {
            style: {
                top: 80,
                left: 0,
            },
            rectStyle: {
                top: 0,
                left: 0,
                width: 0,
                height: 0,
            }
        };
        this.rectDone = false;//矩形框是否画完;
        this.offsetRectX = 0;
        this.offsetRectY = 0;
    }

    componentDidMount() {
        this.relateQuery = document.querySelector(this.props.relateQuery);
        this.placeHolderPage = document.querySelector('#placeHolder');
        this.placeRect = document.querySelector('#placeholder-rect');
        this.calcStyle();
        this.pageMouseHandle();
        this.rectMouseHandle();
    }

    componentWillReceiveProps() {
        this.calcStyle();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !U.shalloEqual(this.state, nextState);
    }

    rectMouseHandle = () => {

        this.placeRect.addEventListener('mousedown', (e) => {
            this.rectDone = true;
            this.rectMouseDown = true;
            this.offsetRectX = e.offsetX;
            this.offsetRectY = e.offsetY;
        });

        this.placeRect.addEventListener('mousemove', (e) => {
            if (this.rectDone && this.rectMouseDown) {
                console.log('...page move move rect', e.offsetX, e.offsetY, this.offsetRectX, this.offsetRectY);

                this.setState({
                    rectStyle: {
                        ...this.state.rectStyle,
                        left: this.state.rectStyle.left + (e.offsetX - this.offsetRectX),
                        top: this.state.rectStyle.top + (e.offsetY - this.offsetRectY),
                    }
                }, () => {
                    this.props.getBoundRect && this.props.getBoundRect(this.state.rectStyle);
                });

            }
        });
    };

    pageMouseHandle = () => {
        this.pageMouseDown = false;
        this.placeHolderPage.addEventListener('mousedown', (e) => {
            console.log('..page down');
            if (!this.rectMouseDown) {
                this.pageMouseDown = true;
                this.rectDone = false;
                this.setState({
                    rectStyle: {
                        ...this.state.rectStyle,
                        left: e.offsetX,
                        top: e.offsetY,
                        width: 0,
                        height: 0,
                    }
                })
            }
        });

        document.addEventListener('mouseup', (e) => {
            this.pageMouseDown = false;
            if (this.rectMouseDown) {
                this.rectMouseDown = false;
            }
            this.props.getBoundRect && this.props.getBoundRect(this.state.rectStyle);
        });

        this.placeHolderPage.addEventListener('mousemove', (e) => {
            if (this.pageMouseDown && !this.rectDone) {
                let width = e.offsetX - this.state.rectStyle.left;
                let height = e.offsetY - this.state.rectStyle.top;
                this.setState({
                    rectStyle: {
                        ...this.state.rectStyle,
                        width,
                        height,
                    }
                })
            }
        })
    };

    calcStyle = () => {
        const react = this.relateQuery.getBoundingClientRect();
        this.setState({
            style: {
                width: this.relateQuery.clientWidth,
                height: this.relateQuery.clientHeight,
                ...this.state.style,
            }
        })
    };

    render() {
        const pageStyle = {
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,.28)',
            zIndex: 999,
            ...this.state.style,
            display: this.props.visible ? 'block' : 'none',
        };
        const rectStyle = {
            position: 'absolute',
            backgroundColor: 'rgba(0,255,0,.2)',
            cursor: 'move',
            ...this.state.rectStyle,
        };
        return (
            <div className="placeholder-page" style={pageStyle} id="placeHolder">
                <div
                    className="rect"
                    id="placeholder-rect"
                    style={rectStyle}/>
            </div>
        )
    }
}

class DraggableItem extends React.Component {
    static propTypes = {
        cType: PropTypes.number.isRequired,
        onStop: PropTypes.func,
        onStart: PropTypes.func,
        blinblin: PropTypes.bool,
        movable: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
        ]),
        setPictureUrl: PropTypes.func,
        textChange: PropTypes.func,
        cardStyle: PropTypes.object,
        dragStyle: PropTypes.object,
        item: PropTypes.object,
        defaultUrl: PropTypes.string,
    };

    render() {
        return (
            <Draggable
                cancel='.no-cursor'
                position={this.props.dragStyle}
                onStop={this.props.onStop}
                disabled={this.props.movable == enmu.movable.umMove }
            >
                <div onClick={!(this.props.movable == enmu.movable.umMove) && this.props.onStart}
                     style={this.props.cardStyle}
                     className={`dragItem ${this.props.blinblin ? 'animate-flow' : ''}`}>
                    {this.props.cType == enmu.type.text ?
                        <FontEditor cardStyle={this.props.cardStyle}
                                    textAlign={this.props.align}
                                    onFocuse={this.props.onStart}
                                    onChange={this.props.textChange}
                                    initText={this.props.item.text}
                                    resizeCallback={this.props.resizeCallback}
                                    fontColor={this.props.item.fontColor}/> :
                        <PictureEditor defaultUrl={this.props.defaultUrl}
                                       uploadFile={this.props.setPictureUrl}/>}
                </div>
            </Draggable>
        )
    }
}

