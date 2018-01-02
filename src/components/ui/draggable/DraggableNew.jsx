import React from 'react';
import PropTypes from 'prop-types';
import {Menu, Icon, Card, message, Select, Tooltip, InputNumber, Button, Input, Modal, Row, Col} from 'antd';
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
import Placeholders from './placeHolder/Placeholders';
import CacheState from './CacheState';
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
                }, this.storeState)
            });
            return;
        }

    }

    storeState = () => {
        CacheState.pushState(this.state);
    };

    rollback = () => {
        let state = CacheState.getPrevState();
        state && this.setState({
            ...this.state,
            ...state,
        })
    };

    rollPrev = () => {
        let state = CacheState.getNextState();
        state && this.setState({
            ...this.state,
            ...state,
        })
    };

    addKeyboard = () => {
        document.addEventListener('keydown', (e) => {

            if (e.shiftKey && e.keyCode == 83) {
                this.uploadConstructor('no')();
            }

            if (e.metaKey && !e.shiftKey && e.keyCode == 90) {
                this.rollback();
            }

            if (e.metaKey && e.shiftKey && e.keyCode == 90) {
                this.rollPrev()
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
                }, this.storeState)
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
            background: enmu.background.transparent,
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
                w: enmu.len.small,
                h: enmu.len.small,
                ...enmu.default.text,
                bold: enmu.bold.normal,
                italic: enmu.italic.normal,
            }
        }

        items.push(item);
        this.setState({
            item,
            items,
        }, this.storeState)
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
        this.setState({items}, this.storeState);
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
        }, this.storeState)
    };

    deleteItem = (id) => (e) => {
        id = id || (this.state.item && this.state.item.id);
        let items = this.state.items.filter((item) => item.id != id);
        this.setState({
            items,
            item: items[items.length - 1],
            visible: false,
        }, this.storeState)
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
        }, this.storeState)
    };

    editMsg = (info) => (e) => {
        if (typeof e == 'string') {
            this.setState({
                [info]: e,
            }, this.storeState)
        } else {
            this.setState({
                [info]: e.target.value,
            }, this.storeState)
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
                }, this.storeState);
            };
            image.src = result.url;
        });

    };

    changeItemStyle = (type) => (e) => {
        let val = typeof e == 'object' ? e.target.value : e;
        let _item = {};
        val = isNaN(parseInt(val)) ? val : parseInt(val);
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
        }, this.storeState)
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
        }, this.storeState)
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
        }, this.storeState);

    };

    handlePlaceholder = () => {
        if (this.state.items.length == 0 || this.state.items[0].type != enmu.type.img) {
            message.info('没有图片层 ,or第一层不为图片层');
            return;
        }

        this.setState({
            showPlaceHolder: !this.state.showPlaceHolder,
        }, this.storeState);

    };

    toggleSortLabel = () => {
        this.setState({
            isShowSortLabel: !this.state.isShowSortLabel,
        }, this.storeState)
    };

    headerOperatorMenu = () => {
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


    //拖动排序
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

    //底部固定工具栏
    bottomToolBar = () => {

        return (
            <ul className="bottom-tool-bar">
                <li>
                    <Tooltip placement="top" trigger="hover"
                             title={'撤销'}>
                         <span
                             className="item"
                             onClick={ this.rollback}>
                             <Icon type="verticle-right"/>

                            </span>
                    </Tooltip>
                    <Tooltip placement="top" trigger="hover"
                             title={'前进'}>
                         <span
                             className="item"
                             onClick={this.rollPrev}>
                               <Icon type="verticle-left"/>
                            </span>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip placement="top" trigger="hover"
                             title={'增加文本层'}>
                         <span
                             className="item"
                             onClick={() => this.createItem(enmu.type.text)}>
                               <Icon type="plus-square"/>
                            </span>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip placement="top" trigger="hover"
                             title={'增加图片层'}>
                         <span
                             className="item"
                             onClick={() => this.createItem(enmu.type.img)}>
                              <Icon type="plus-square-o"/>
                            </span>
                    </Tooltip>
                </li>
                <li>
                    <Tooltip placement="top" trigger="hover"
                             title={!this.state.isShowSortLabel ? '打开排序' : '关闭排序'}>
                        {!this.state.isShowSortLabel && <span
                            className="item"
                            onClick={this.toggleSortLabel}>
                           <Icon type="up-square"/>
                        </span>}
                        {this.state.isShowSortLabel && <span
                            className="item"
                            onClick={this.toggleSortLabel}>
                             <Icon type="down-square"/>
                        </span>}
                    </Tooltip>
                </li>
                <li>
                    <Tooltip placement="top" trigger="hover"
                             title={!this.state.showPlaceHolder ? '添加选项框' : '保存'}>
                        {!this.state.showPlaceHolder && <span
                            className="item"
                            onClick={this.handlePlaceholder}>
                           <Icon type="plus"/>
                        </span>}
                        {this.state.showPlaceHolder && <span
                            className="item"
                            onClick={this.handlePlaceholder}>
                             <Icon type="check-circle-o"/>
                        </span>}
                    </Tooltip>
                </li>
                <div className="submit">
                    <Button className="button"
                            onClick={this.uploadConstructor('no')}>{this.props.params.id !== 'no' || this.state.id ? '修改' : '保存'}</Button>
                    {(this.props.params.id !== 'no' || this.state.id) &&
                    <Button className="button" onClick={this.uploadConstructor('other')}>另存为</Button>}
                </div>
            </ul>
        )
    };

    //快捷工具栏
    miniToolBar = (item) => {
        if (!item)return;
        let isText = item.type == enmu.type.text;
        return (
            this.state.item && this.state.item.id == item.id ?
                <ul className="mini-tool-bar no-cursor"
                    style={{width: item.w, left: item.x, top: item.y - 50, minWidth: isText ? 500 : 300}}>
                    {!isText && <li>
                        <Tooltip placement="top"
                                 title={'width:' + item.w + 'px'}>
                            <InputNumber value={item.w} style={{width: 50}}
                                         onChange={this.changeItemStyle('w')}/>
                        </Tooltip>
                        <Tooltip placement="top"
                                 title={'height:' + item.h + 'px'}>
                            <InputNumber value={item.h} style={{width: 50}}
                                         onChange={this.changeItemStyle('h')}/>
                        </Tooltip>
                        <Tooltip placement="top"
                                 title={'x:' + item.x + 'px'}>
                            <InputNumber value={item.x} style={{width: 50}}
                                         onChange={this.changeItemStyle('x')}/>
                        </Tooltip>
                        <Tooltip placement="top"
                                 title={'y:' + item.y + 'px'}>
                            <InputNumber value={item.y} style={{width: 50}}
                                         onChange={this.changeItemStyle('y')}/>
                        </Tooltip>
                    </li>}

                    {isText && <li>
                        <Tooltip placement="top" trigger="hover"
                                 title={'align' + item.align}>
                            <Select
                                onSelect={this.changeItemStyle('align')}
                                value={item.align + ''}
                                style={{width: 60}}>
                                <Option value={enmu.align.left + ''}>靠左</Option>
                                <Option value={enmu.align.center + ''}>居中</Option>
                                <Option value={enmu.align.right + ''}>靠右</Option>
                            </Select>
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={'background'}>
                            <Select
                                onSelect={this.changeItemStyle('background')}
                                value={typeof item.background == 'number' ? item.background + '' : enmu.background.transparent + ''}
                                style={{width: 60}}>
                                <Option value={enmu.background.transparent + ''}>透明</Option>
                                <Option value={enmu.background.white + ''}>白色</Option>
                            </Select>
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={'字体大小:' + item.fontSize}>
                            <Select style={{width: 50}}
                                    value={item.fontSize + ''}
                                    onSelect={this.changeItemStyle('fontSize')}>
                                {enmu.fontSizeList.map(size => {
                                    return <Option key={size}>
                                        {size}
                                    </Option>
                                })}
                            </Select>
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={'字体颜色'}>
                            <Input type='color'
                                   value={item.fontColor || '#ffffff'}
                                   onChange={this.changeItemStyle('fontColor')}/>
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={item.italic ? '倾斜' : '正常'}>
                            { item.italic == 1 && <span
                                className="item"
                                style={{fontStyle: 'italic'}}
                                onClick={() => {
                                    this.changeItemStyle('italic')(enmu.italic.normal);
                                }}> I   </span>}
                            {item.italic == 0 && <span
                                className="item"
                                onClick={() => {
                                    this.changeItemStyle('italic')(enmu.italic.italic);
                                }}> I  </span>}
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={item.bold ? '加粗' : '正常'}>
                            { item.bold == 1 && <span
                                className="item"
                                style={{fontWeight: '900'}}
                                onClick={() => {
                                    this.changeItemStyle('bold')(enmu.bold.normal);
                                }}>B</span>}
                            {item.bold == 0 && <span
                                className="item"
                                onClick={() => {
                                    this.changeItemStyle('bold')(enmu.bold.bold);
                                }}>B</span>}
                        </Tooltip>
                        <Select
                            onSelect={this.changeItemStyle('fontFamily')}
                            value={item.fontFamily + ''}
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
                    </li>}

                    <li>
                        <Tooltip placement="top" trigger="hover"
                                 title={item.movable ? '点击锁定' : '点击解除锁定'}>
                            { item.movable == 1 && <span
                                className="item"
                                onClick={() => {
                                    this.changeItemStyle('movable')(enmu.movable.umMove);
                                    message.info('已锁定');
                                }}>
                               <Icon type="unlock"/>
                            </span>}
                            {item.movable == 0 && <span
                                className="item"
                                onClick={() => {
                                    this.changeItemStyle('movable')(enmu.movable.move);
                                    message.info('已解除锁定');
                                }}>
                                <Icon type="lock"/>
                            </span>}
                        </Tooltip>
                        <Tooltip placement="top" trigger="hover"
                                 title={'删除当前'}>
                         <span
                             className="item"
                             onClick={this.showModal}>
                               <Icon type="delete"/>
                            </span>
                        </Tooltip>
                    </li>
                </ul> : null
        )
    };

    resizeCallback = (size) => {
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
                    {this.bottomToolBar()}
                    <div className="flex">
                        <div className="content-operator">
                            { this.miniToolBar(this.state.item)}
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
                                                   key={item.id}>

                                    </DraggableItem>)
                            })}
                        </div>
                    </div>
                </div>
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

        let movable = !(this.props.movable == enmu.movable.umMove);
        return (
            <Draggable
                cancel='.no-cursor,.react-resizable-handle'
                position={this.props.dragStyle}
                onStop={this.props.onStop}
                disabled={this.props.movable == enmu.movable.umMove }
            >
                <div>
                    {/*{ this.props.children()}*/}
                    <div onClick={ movable ? this.props.onStart : null}
                         style={this.props.cardStyle}
                         className={`dragItem ${this.props.blinblin ? 'animate-flow' : ''}`}>
                        {this.props.cType == enmu.type.text ?
                            <FontEditor cardStyle={this.props.cardStyle}
                                        movable={movable}
                                        textAlign={this.props.align}
                                        onFocuse={this.props.onStart}
                                        onChange={this.props.textChange}
                                        initText={this.props.item.text}
                                        resizeCallback={this.props.resizeCallback}
                                        fontColor={this.props.item.fontColor}/> :
                            <PictureEditor defaultUrl={this.props.defaultUrl}
                                           uploadFile={this.props.setPictureUrl}/>}
                    </div>
                </div>
            </Draggable>
        )
    }
}

