import React from 'react';
import {Menu, Icon, Card, message, Select, InputNumber, Button, Input, Modal} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import '../../../style/ui/draggable-new.less';
import FontEditor from './FontEditor';
import OSSWrap from '../../../common/OSSWrap.jsx';
import App from '../../../common/App.jsx';
import PictureEditor from './PictureEditor';
import enmu from '../../../common/Ctype';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
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
        }
    }

    componentDidMount() {
        this.RightMenu = document.getElementById('right-operator');

        let state = localStorage.getItem('state') && JSON.parse(localStorage.getItem('state'));
        if (state) {
            this.setState({
                ...state,
            });
            return;
        }

        let id = this.props.params.id;
        if (id !== 'no') {
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

    createItem = (type) => {
        let items = this.state.items;
        let item = {
            id: App.uuid(),
            type,
            movable: enmu.movable.move,
            w: enmu.len.middle,
            h: enmu.len.middle,
            background: enmu.background.white,//1111
        };

        if (type == enmu.type.img) {
            let a = window.prompt('为当前图层取一个名字吧');
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
        id = id || this.state.item.id;
        let items = this.state.items.filter((item) => item.id != id);
        this.setState({
            items,
            item: {},
            visible: false,
        })
    };

    itemAttrChange = (type) => (text) => {
        let items = this.state.items.map(item => {
            if (item.id == this.state.item.id) {
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

        let items = this.state.items.map(item => {
            if (item.id == this.state.item.id) {
                item[type] = val;
            }
            return item;
        });
        this.setState({
            items,
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
                    }
                    if (key == 'fontColor' && item['fontColor'].length !== 6) {
                        message.error(item + ':颜色码应该为6位数,请检查');
                        judge = false;
                    }
                    layer[key] = item[key];
                }
            }
            return layer;
        });
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

    translateStyle = (type) => {
        let item = this.state.item;
        if (!item || !item.id) return;
        if (['type', 'align', 'italic', 'bold', 'movable'].includes(type)) {
            switch (type) {
                case 'italic':
                    return type == enmu.italic.normal ? 'normal' : 'italic';
                case 'bold':
                    return type == enmu.bold.normal ? 'normal' : 'bold';
                case 'movable':
                    return type == enmu.movable.move ? 'move' : 'unMove';
                case 'type':
                    return type == enmu.type.text ? 'text' : 'img';
                case 'align':
                    return type == enmu.align.left ? 'left' : item.align == enmu.align.center ? 'center' : 'right';
            }
        }
        return item[type];
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
        console.log('click');
        this.setState({
            collRightMenu: !this.state.collRightMenu,
        })
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
                    <p>是否删除 {_item.id}</p>
                </Modal>
                <BreadcrumbCustom first="UI" second="合成图编辑"/>
                <div className="uplaodMain">
                    <img src={this.state.preview && this.state.preview.url} alt=""/>
                </div>
                <div className="operator">
                    <div className="header-operator">
                        <div className="selectItem">
                            <Select value={this.state.category + ''}
                                    style={{width: '50%'}}
                                    onChange={this.editMsg('category')}>
                                <Option value="1">课程</Option>
                                <Option value="2">专栏</Option>
                                <Option value="3">商品</Option>
                                <Option value="4">轮播图</Option>
                            </Select>

                            <Select onSelect={this.onSelectItem}
                                    value={_item.id}
                                    style={{width: '50%'}}>
                                { this.state.items.map((item) => {
                                    return <Option value={item.id}
                                                   key={item.id}>{item.text || item.id}</Option>
                                })}
                            </Select>
                        </div>
                        <div className="menu_selectItem">
                            <input className="edit-remove"
                                   placeholder="请输入标题"
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
                    </div>
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
                                    <DraggableItem onStart={this.onStart(item)}
                                                   onStop={this.onStop(item.id)}
                                                   {...fn}
                                                   dragStyle={{x: item.x, y: item.y}}
                                                   cardStyle={{
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
                                                   movable={item.movable}
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
                                <SubMenu
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
                                </SubMenu>
                                <SubMenu
                                    key="sub1"
                                    title={<span><Icon type="bars"/>属性面板</span>}>
                                    {Object.keys(_item).map(key => {
                                        if (key == 'movable' || key == 'bold' || key == 'italic' || key == 'background') {
                                            let nor, un;
                                            switch (key) {
                                                case 'movable':
                                                    nor = '可移动';
                                                    un = '不可移动';
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
                                                    }}>{key}</label>
                                                    <Select
                                                        onSelect={this.changeItemStyle(key)}
                                                        value={_item[key] + ''}
                                                        style={{width: '100%'}}>
                                                        <Option value='0'>{nor}</Option>
                                                        <Option value='1'>{un}</Option>
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
                                                    }}>{key}</label>
                                                    <Select
                                                        onSelect={this.changeItemStyle(key)}
                                                        value={_item[key] + ''}
                                                        style={{width: '100%'}}>
                                                        <Option value={'"宋体"'}>宋体</Option>
                                                        <Option value={'"黑体"'}>黑体</Option>
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
                                                    }}>{key}</label>
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
                                            return (
                                                <Menu.Item key={key}>
                                                    <label htmlFor={key} style={{
                                                        position: 'absolute',
                                                        marginLeft: -40,
                                                        width: 40,
                                                        overflow: 'hidden'
                                                    }}>{key}</label>
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
                                                }}>{key}</label>
                                                <InputNumber
                                                    onChange={this.changeItemStyle(key)}
                                                    id="type"
                                                    value={this.state.item[key]}/>
                                            </Menu.Item>)
                                    })}
                                </SubMenu>
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

class DraggableItem extends React.Component {
    static propTypes = {
        cType: React.PropTypes.number.isRequired,
        onStop: React.PropTypes.func,
        onStart: React.PropTypes.func,
        setPictureUrl: React.PropTypes.func,
        textChange: React.PropTypes.func,
        cardStyle: React.PropTypes.object,
        dragStyle: React.PropTypes.object,
        item: React.PropTypes.object,
        defaultUrl: React.PropTypes.string,
    };

    render() {
        return (
            <Draggable
                cancel='.no-cursor'
                position={this.props.dragStyle}
                onStop={this.props.onStop}
                onStart={this.props.onStart}>
                <Card
                    bordered={false}
                    style={this.props.cardStyle}
                    className='dragItem'>
                    {this.props.cType == enmu.type.text ?
                        <FontEditor textAlign={this.props.align}
                                    onChange={this.props.textChange}
                                    initText={this.props.item.text}
                                    fontColor={this.props.item.fontColor}/> :
                        <PictureEditor defaultUrl={this.props.defaultUrl}
                                       uploadFile={this.props.setPictureUrl}/>}
                </Card>
            </Draggable>
        )
    }
}
