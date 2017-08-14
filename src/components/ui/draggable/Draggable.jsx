/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input} from 'antd';
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
        };
        this.DrawBoard = null;
        // this.dragItems = ['deep', 'middle', 'latest', 'text', 'img'];
        this.dragItems = ['text_1', 'text_2', 'img_background', 'img_layer'];
        this.editStyles = [
            'height',
            'width',
            'x',
            'y',
            'zIndex',
            'backgroundColor',
            'color',
            'align',
            'fontSize',
            'fontFamily',
        ];


        this.eidtStylesFun = this.eidtStylesFun.bind(this);
        this.getDrawBoardStyle = this.getDrawBoardStyle.bind(this);
    }

    componentDidMount() {
        this.DrawBoard = document.getElementById('draw-board');
        let deltaPositions = {};
        const _this = this;
        this.dragItems.forEach(item => {
            deltaPositions[item] = {
                height: 200,
                width: 200,
                x: 0,
                y: 0,
                zIndex: 0,
                backgroundColor: '#fff',
                color: '#000'
            };
        });


        /* App.api('adm/compound/save', {
         compound: JSON.stringify({
         /!*合成图结构体*!/
         "title": "风景图2",
         "category": 1,
         "priority": 1,
         "hotspots": [
         {
         "w": 50,
         "fontColor": "667799",
         "align": 2,
         "movable": 1,
         "fontFamily": "宋体",
         "fontSize": 15,
         "y": 200,
         "h": 20,
         "x": 100
         },
         {
         "w": 1,
         "fontColor": "ffffff",
         "align": 3,
         "movable": 0,
         "fontFamily": "黑体",
         "fontSize": 8,
         "y": 0,
         "h": 1,
         "x": 0
         }
         ],
         "createdAt": "2017-08-01T07:23:34.039Z",
         "background": {
         "height": 428,
         "width": 384,
         "url": "https://cdn.pixabay.com/photo/2017/08/02/22/46/peach-2573836__340.jpg"
         },
         "state": 2,
         "layer": {
         "height": 300,
         "width": 420,
         "url": "https://cdn.pixabay.com/photo/2017/08/03/18/49/wolf-in-sheeps-clothing-2577813_960_720.jpg"
         }
         })
         }).then((data) => {
         console.log(data);

         });
         */
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

    eidtStylesFun(item) {
        let styles = {};
        const {deltaPositions} = this.state;
        this.editStyles.forEach((attr) => {
            let value = deltaPositions[item] && deltaPositions[item][attr];
            if (!isNaN(value - 0)) {
                value = value - 0;
            }
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

                        </div>
                        <div className="button">提交</div>
                    </div>
                </div>
            </div>
        )
    }
}


export default Drags;
