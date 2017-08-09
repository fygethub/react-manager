/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Drags extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            deltaPosition: {
                x: 0, y: 0, width: 100, height: 100,
            },
            deltaPositions: {},
            current: '1',
            openKeys: [],
        };
        this.DrawBoard = null;
        this.timer = -1;
        this.dragItems = ['deep', 'middle', 'latest'];
        this.getDrawBoardStyle = this.getDrawBoardStyle.bind(this);
    }

    componentDidMount() {
        this.DrawBoard = document.getElementById('draw-board');
        let deltaPositions = {};
        this.dragItems.forEach(item => {
            deltaPositions[item] = {x: 0, y: 0, width: 100, height: 100};
        });
        console.log(deltaPositions);
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

    onStop = (e, ui) => {
        const {x, y} = this.state.deltaPosition;
        this.setState({
            deltaPosition: {
                x: ui.lastX,
                y: ui.lastY,
            }
        });
    };

    handleOnStop = (key) => (e, item) => {
        let deltaPositions = this.state.deltaPositions;
        deltaPositions[key].x = item.lastX;
        deltaPositions[key].y = item.lastY;
        this.setState({deltaPositions});
    };


    handleDrag = (e, ui) => {

    };

    handleClick = (e) => {
        this.setState({current: e.key});
    };

    handleClickCard = (key) => {
        this.setState({current: key});
    };

    onOpenChange = (openKeys) => {
        const state = this.state;
        const latestOpenKey = openKeys.find(key => !(state.openKeys.indexOf(key) > -1));
        const latestCloseKey = state.openKeys.find(key => !(openKeys.indexOf(key) > -1));

        let nextOpenKeys = [];
        if (latestOpenKey) {
            nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
        }
        if (latestCloseKey) {
            nextOpenKeys = this.getAncestorKeys(latestCloseKey);
        }
        this.setState({openKeys: nextOpenKeys});
    };

    getAncestorKeys = (key) => {
        const map = {
            sub3: ['sub2'],
        };
        return map[key] || [];
    };

    changeDeltaStyle = (styl) => (e) => {
        if (e.target && !(typeof ((e.target.value - 0)) === 'number')) return;
        const {deltaPosition} = this.state;
        const dragStyle = {
            width: deltaPosition.width || 100,
            height: deltaPosition.height || 100,
            transform: `translate(${deltaPosition.x }, ${deltaPosition.y})`,
        };
        this.setState({deltaPosition: Object.assign({}, {...this.state.deltaPosition}, {[styl]: e.target.value - 0})}, () => {
            document.querySelector('.react-draggable').style.transform = `translate(${this.state.deltaPosition.x }px,${this.state.deltaPosition.y}px)`;
        });
    };

    changeDeltaStyles = (position, attr) => (e) => {
        if (e.target && !(typeof ((e.target.value - 0)) === 'number')) return 0;
        let deltaPositions = this.state.deltaPositions;
        let deltaPosition = deltaPositions[position];
        deltaPosition = {...deltaPosition, [attr]: e.target.value - 0};
        this.setState({
            deltaPositions:{}
        })
    };

    render() {
        const dragHandlers = {onStop: this.onStop};
        const {deltaPosition, deltaPositions} = this.state;
        const _this = this;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom first="UI" second="拖拽"/>
                <div className="draw-board" id="draw-board">
                    <Draggable
                        onDrag={this.handleDrag}
                        {...dragHandlers}
                        onStart={this.onStart('deep')}
                        position={{x: deltaPosition.x, y: deltaPosition.y}}

                    >
                        <Card bordered={false} className='dragItem' id="deep">
                            <div>I track my deltas</div>
                            <div>x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}</div>
                        </Card>
                    </Draggable>
                    {
                        this.dragItems.map((item) => {
                            return (
                                <Draggable
                                    key={item}
                                    onStop={this.handleOnStop(item)}
                                    onStart={this.onStart(item)}
                                    position={{
                                        x: deltaPositions[item] && deltaPositions[item].x,
                                        y: deltaPositions[item] && deltaPositions[item].y
                                    }}
                                >
                                    <Card bordered={false} className='dragItem middle' id="middle">
                                        <div>I track my deltas</div>
                                        <div>x: {deltaPositions[item] && deltaPositions[item].x.toFixed(0)},
                                            y: {deltaPositions[item] && deltaPositions[item].y.toFixed(0)}</div>
                                    </Card>
                                </Draggable>
                            )
                        })
                    }
                </div>
                <div className="rightTools">
                    <Menu
                        mode="inline"
                        onOpenChange={this.onOpenChange}
                        openKeys={this.state.openKeys}
                        onClick={this.handleClick}
                    >
                        <SubMenu
                            key='deep'
                            title={<span><Icon type="apple"/>最底部背景</span>}
                        >
                            <Menu.Item key="5">
                                <input type="text" placeholder="width" size="default"/>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <input type="text" placeholder="height" size="default"/>
                            </Menu.Item>
                            <Menu.Item key="7">
                                <input
                                    type="text"
                                    placeholder="top"
                                    size="default"
                                    value={deltaPosition.y}
                                    onChange={this.changeDeltaStyle('y')}
                                />
                            </Menu.Item>
                            <Menu.Item key="8">
                                <input
                                    type="text"
                                    placeholder="left"
                                    size="default"
                                    value={deltaPosition.x}
                                    onChange={this.changeDeltaStyle('x')}
                                />
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu
                            key='middle'
                            title={<span><Icon type="apple"/>中部背景</span>}
                        >
                            <Menu.Item key="9">
                                <input
                                    type="text"
                                    placeholder="width"
                                    value={deltaPositions['middle'] && deltaPositions['middle'].width}
                                    onChange={this.changeDeltaStyles('middle', 'width')}
                                    size="default"/>
                            </Menu.Item>
                            <Menu.Item key="10">
                                <input
                                    type="text"
                                    value={deltaPositions['middle'] && deltaPositions['middle'].height}
                                    placeholder="height"
                                    onChange={this.changeDeltaStyles('middle', 'height')}
                                    size="default"/>
                            </Menu.Item>
                            <Menu.Item key="11">
                                <input
                                    type="text"
                                    placeholder="top"
                                    size="default"
                                    value={deltaPositions['middle'] && deltaPositions['middle'].y}
                                    onChange={deltaPositions['middle'] && this.changeDeltaStyles('middle', 'y')}
                                />
                            </Menu.Item>
                            <Menu.Item key="12">
                                <input
                                    type="text"
                                    placeholder="left"
                                    size="default"
                                    value={deltaPositions['middle'] && deltaPositions['middle'].x}
                                    onChange={deltaPositions['middle'] && this.changeDeltaStyles('middle', 'x')}
                                />
                            </Menu.Item>
                        </SubMenu>
                        <SubMenu
                            key='latest'
                            title={<span><Icon type="apple"/>其他组件</span>}
                        >
                            <Menu.Item key="5">
                                <input type="text" placeholder="width" size="default"/>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <input type="text" placeholder="height" size="default"/>
                            </Menu.Item>
                            <Menu.Item key="7">
                                <input type="text" placeholder="top" size="default"/>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <input type="text" placeholder="left" size="default"/>
                            </Menu.Item>
                        </SubMenu>
                    </Menu>
                </div>
            </div>
        )
    }
}


export default Drags;
