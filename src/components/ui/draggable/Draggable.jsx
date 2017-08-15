/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input, message} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
import FontEditor from './FontEditor';
import App from '../../../common/App.jsx';
import PictureEditor from './PictureEditor';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;


class Drags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deltaPositions: {},
            openKeys: [],
            dragHandle: '',
            title: '风景图',
            priority: 1,
            state: 2,
            category: 3,
            dragItems: ['img_background', 'img_layer', 'text_1', 'text_2', 'text_3',],
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
        this.getDrawBoardStyle = this.getDrawBoardStyle.bind(this);
        this.addFontEditor = this.addFontEditor.bind(this);
        this.removeFontEditor = this.removeFontEditor.bind(this);
        this.layerUpload = this.layerUpload.bind(this);
    }

    componentDidMount() {
        this.DrawBoard = document.getElementById('draw-board');
        const _this = this;
        let deltaPositions = {};
        this.state.dragItems.forEach(item => {
            deltaPositions[item] = {
                h: 200,
                w: 400,
                x: 0,
                y: 0,
                movable: 0,
                align: 1,
                fontFamily: '宋体',
                fontSize: 16,
                fontColor: '000000'
            };
        });

        App.api('adm/compound/list', {
            marker: null,
            category: 1,
            "offset": 0,
            "limit": 10,
        }).then((data) => {
            console.log(data);
        });
        this.setState({deltaPositions});
    }


    getDrawBoardStyle = (style) => {
        if (!style) {
            return this.DrawBoard.getBoundingClientRect();
        }
    };

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
        if (e.target && !(typeof ((e.target.value - 0)) === 'number')) return 0;
        let deltaPositions = this.state.deltaPositions;
        deltaPositions[position][attr] = e.target.value;
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
        let createdAt = new Date().toISOString();
        let _this = this;
        let deltaPositions = this.state.deltaPositions;
        let judge = true;
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
                background.url = this.state.deltaPositions[item].url || 'https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813__340.jpg';

            }
            if (item.indexOf('layer') > -1) {
                layer.height = editItem.h;
                layer.width = editItem.w;
                layer.url = this.state.deltaPositions[item].url || 'https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813__340.jpg';

            }
        });

        judge && App.api('adm/compound/save', {
            compound: JSON.stringify({
                title,
                category,
                priority,
                hotspots,
                createdAt,
                background,
                state,
                layer,
            })
        }).then((data) => {
            message.info('保存成功!')
        });
    };

    eidtStylesFun = (item) => {
        let styles = {};
        const {deltaPositions} = this.state;
        this.editStyles.forEach((attr) => {
            let value = deltaPositions[item] && deltaPositions[item][attr];
            if (!isNaN(value - 0)) {
                value = value - 0;
            }
            attr = attr == 'h' ? 'height' : attr;
            attr = attr == 'w' ? 'width' : attr;
            attr = attr == 'fontColor' ? 'color' : attr;
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
        deltaPositions[key] = {
            h: 200,
            w: 400,
            x: 0,
            y: 0,
            movable: 0,
            align: 1,
            fontFamily: '宋体',
            fontSize: 16,
            fontColor: '000000'
        };

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
        this.setState({
            [info]: e.target.value,
        })
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

    render() {
        const {deltaPosition, deltaPositions} = this.state;
        const dragHandlers = {onStop: this.onStop};
        const _this = this;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom first="UI" second="合成图编辑"/>
                <div className="draw-board" id="draw-board">
                    { _this.state.dragItems.map((item) => {
                        let doms = '';
                        if (item.indexOf('text') > -1) {
                            doms = <FontEditor id={App.uuid()}/>
                        }
                        if (item.indexOf('img') > -1) {
                            doms = <PictureEditor id={App.uuid()} uploadFile={this.layerUpload(item)}/>
                        }

                        return <Draggable
                            key={item}
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
                            title="基本操作"
                        >
                            <Menu.Item
                                key="eidt-btn-add"
                            >
                                <p className="edit-add" onClick={this.addFontEditor}>增加文本框</p>
                            </Menu.Item>
                            <Menu.Item
                                key="eidt-btn-remove"
                            >
                                <p className="edit-remove" onClick={this.removeFontEditor}>删除文本框</p>
                            </Menu.Item>
                            <Menu.Item
                                key="editTitle"
                            >
                                <input className="edit-remove" value={this.state.title}
                                       onChange={this.editMsg('title')}/>
                            </Menu.Item>
                            <Menu.Item
                                key="editCategory"
                            >
                                <input className="edit-remove" value={this.state.category}
                                       onChange={this.editMsg('category')}/>
                            </Menu.Item>
                            <Menu.Item
                                key="editPriority"
                            >
                                <input className="edit-remove" value={this.state.priority}
                                       onChange={this.editMsg('priority')}/>
                            </Menu.Item>
                        </SubMenu>
                        { _this.state.dragItems.map((item) =>
                            <SubMenu
                                key={item}
                                title={<span><Icon type="apple"/>{item}</span>}>
                                { _this.editStyles.map((attr) =>
                                    <Menu.Item key={item + attr}>
                                        <label htmlFor={item + attr} style={{
                                            position: 'absolute',
                                            marginLeft: -40,
                                            width: 40,
                                            overflow: 'hidden'
                                        }}>{attr}</label>
                                        <input
                                            id={item + attr}
                                            type="text"
                                            placeholder={attr}
                                            value={deltaPositions[item] && deltaPositions[item][attr] || ''}
                                            onChange={_this.changeDeltaStyles(item, attr)}/>
                                    </Menu.Item>)
                                }
                            </SubMenu>)
                        }
                    </Menu>
                    <div className="submit">
                        <div className="view">
                            {/*{JSON.stringify(this.state.deltaPositions)}*/}
                        </div>
                        <div className="button" onClick={this.uploadConstructor}>提交</div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Drags;
