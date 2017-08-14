/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input, message} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
import FontEditor from './FontEditor';
import App from '../../../App/index.js';
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
        };
        this.DrawBoard = null;
        // this.dragItems = ['deep', 'middle', 'latest', 'text', 'img'];
        this.dragItems = ['text_1', 'text_2', 'text_3', 'img_background', 'img_layer'];
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
        this.uploadConstructor = this.uploadConstructor.bind(this);
        this.eidtStylesFun = this.eidtStylesFun.bind(this);
        this.getDrawBoardStyle = this.getDrawBoardStyle.bind(this);
    }

    componentDidMount() {
        this.DrawBoard = document.getElementById('draw-board');
        let deltaPositions = {};
        const _this = this;
        this.dragItems.forEach(item => {
            deltaPositions[item] = {
                h: 200,
                w: 200,
                x: 0,
                y: 0,
                movable: 0,
                align: 1,
                fontFamily: '宋体',
                fontSize: 16,
                //zIndex: 0,
                //backgroundColor: '#fff',
                //background: 'https://cdn.pixabay.com/photo/2017/08/08/14/32/adler-2611528__340.jpg',
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


    getDrawBoardStyle(style) {
        if (!style) {
            return this.DrawBoard.getBoundingClientRect();
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
        this.dragItems.forEach((item) => {
            let editItem = deltaPositions[item];
            if (item.indexOf('text') > -1) {
                editItem['fontColor'] = editItem['fontColor'].replace(/#/, '');
                hotspots.push(editItem);
            }
            if (item.indexOf('background') > -1) {
                background.height = editItem.h;
                background.width = editItem.w;
                background.url = 'https://cdn.pixabay.com/photo/2017/08/08/14/32/adler-2611528__340.jpg';

            }
            if (item.indexOf('layer') > -1) {
                layer.height = editItem.h;
                layer.width = editItem.w;
                layer.url = 'https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813__340.jpg';
            }
        });

        App.api('adm/compound/save', {
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

    eidtStylesFun(item) {
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
    }

    render() {
        const {deltaPosition, deltaPositions} = this.state;
        const dragHandlers = {onStop: this.onStop};
        const _this = this;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom first="UI" second="拖拽"/>
                <div className="draw-board" id="draw-board">
                    { _this.dragItems.map((item) => {
                        let doms = '';
                        if (item.indexOf('text') > -1) {
                            doms = <FontEditor id={App.uuid()}/>
                        }
                        if (item.indexOf('img') > -1) {
                            doms = <PictureEditor id={App.uuid()}/>
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
                        { _this.dragItems.map((item) =>
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
