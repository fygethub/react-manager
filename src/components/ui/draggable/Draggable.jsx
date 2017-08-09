/**
 * Created by hao.cheng on 2017/4/28.
 */
import React from 'react';
import {Menu, Icon, Card, Input} from 'antd';
import BreadcrumbCustom from '../../BreadcrumbCustom';
import Draggable from 'react-draggable';
import './draggable.less';
import FontEditor from './FontEditor';

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
        this.dragItems = ['deep', 'middle', 'latest', 'text', 'text1'];
        this.editStyles = ['height', 'width', 'x', 'y', 'zIndex', 'backgroundColor', 'color'];


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
            styles[attr] = deltaPositions[item] && deltaPositions[item][attr];
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
                        if (item === 'text') {
                            doms = <FontEditor/>

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
                                            marginLeft: '-40',
                                            width: '40',
                                            overflow: 'hidden'
                                        }}>{attr}</label>
                                        <input
                                            id={item + attr}
                                            type="text"
                                            placeholder={attr}
                                            value={deltaPositions[item] && deltaPositions[item][attr]}
                                            onChange={_this.changeDeltaStyles(item, attr)}/>
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
