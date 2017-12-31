import React from 'react';
import PropTypes from 'prop-types';
import U from '../../../../common/U'

export default class Placeholders extends React.Component {

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
            zIndex: 99,
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
