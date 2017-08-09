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
            deltaPositions: {},
            openKeys: [],
        };
        this.DrawBoard = null;
        this.timer = -1;
        this.dragItems = ['deep', 'middle', 'latest'];
        this.editStyles = ['height', 'width', 'x', 'y', 'zIndex'];
        this.getDrawBoardStyle = this.getDrawBoardStyle.bind(this);
    }

    componentDidMount() {
        this.DrawBoard = document.getElementById('draw-board');
        let deltaPositions = {};
        const _this = this;
        this.dragItems.forEach(item => {
            deltaPositions[item] = {height: 100, width: 100, x: 0, y: 0, zIndex: 0};
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
        deltaPositions[position][attr] = e.target.value - 0;
        this.setState({
            deltaPositions
        })
    };

    render() {
        const {deltaPositions} = this.state;
        const _this = this;
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom first="UI" second="拖拽"/>
                <div className="draw-board" id="draw-board">
                    { _this.dragItems.map((item) => {
                        return <Draggable
                            key={item}
                            onStop={_this.handleOnStop(item)}
                            onStart={_this.onStart(item)}
                            position={{
                                x: deltaPositions[item] && deltaPositions[item].x,
                                y: deltaPositions[item] && deltaPositions[item].y
                            }}>
                            <Card
                                bordered={false}
                                className='dragItem'
                                style={{
                                    width: deltaPositions[item] && deltaPositions[item]['width'],
                                    height: deltaPositions[item] && deltaPositions[item]['height'],
                                    zIndex: deltaPositions[item] && deltaPositions[item]['zIndex'],
                                }}>
                                <div>I track my deltas</div>
                                <div>x: {deltaPositions[item] && deltaPositions[item].x.toFixed(0)},
                                    y: {deltaPositions[item] && deltaPositions[item].y.toFixed(0)}</div>
                            </Card>
                        </Draggable>
                    })
                    }
                </div>
                <div className="rightTools">
                    <Menu
                        mode="inline"
                        openKeys={_this.state.openKeys}
                        onOpenChange={_this.onOpenChange}>
                        { _this.dragItems.map((item) =>
                            <SubMenu
                                key={item}
                                title={<span><Icon type="apple"/>{item}背景</span>}>
                                { _this.editStyles.map((attr) =>
                                    <Menu.Item key={item + attr}>
                                        <input
                                            type="text"
                                            placeholder={attr}
                                            value={deltaPositions[item] && deltaPositions[item][attr]}
                                            onChange={_this.changeDeltaStyles(item, attr)}
                                            size="default"/>
                                    </Menu.Item>)
                                }
                            </SubMenu>)
                        }
                    </Menu>
                </div>
            </div>
        )
    }
}


export default Drags;
