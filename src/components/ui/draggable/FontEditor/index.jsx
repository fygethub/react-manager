import React from 'react';
import PropTypes from 'prop-types';
import './fontEditor.less';
import {Menu, Icon, Card, message, Select, InputNumber, Button, Input, Modal} from 'antd';
import {Resizable, ResizableBox} from 'react-resizable';

export default class FontEditor extends React.Component {

    static propTypes = {
        initText: PropTypes.string,
        fontColor: PropTypes.string,
        textAlign: PropTypes.number,
        onChange: PropTypes.func,
        cardStyle: PropTypes.object,
        resizeCallback: PropTypes.func,
        onFocuse: PropTypes.func,
    };

    static defaultProps = {
        fontColor: '#000',
        initText: '输入文字',
    };

    constructor(props) {
        super(props);
        this.id = this.props.id;
        this.state = {
            value: this.props.initText,
        }
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
        }, () => {
            this.props.onChange && this.props.onChange(this.state.value, '');
        })

    };

    render() {
        let value = this.props.textAlign || 1;
        value = value == 1 ? 'left' : value == 2 ? 'center' : 'right';
        let maxHeight = this.props.cardStyle.height;
        let maxWidth = this.props.cardStyle.width;
        return (<div className="font-editor" onClick={(e) => e.stopPropagation()}>
                <ResizableBox
                    width={maxWidth}
                    height={maxHeight}
                    onResizeStop={(e, data) => {
                        if (!data)return;
                        this.props.resizeCallback && this.props.resizeCallback(data.size)
                    }}>
                <textarea width='100%'
                          readOnly={!this.props.movable}
                          value={this.state.value}
                          id={"pell" + this.id}
                          className="no-cursor editable-text"
                          style={{
                              fontSize: 'inherit',
                              textAlign: value,
                              color: '#' + this.props.fontColor.replace(/#/g, ''),
                          }}
                          onFocus={this.props.onFocuse}
                          onChange={this.handleChange}>
                    {this.props.initText}
                </textarea>
                </ResizableBox>
            </div>
        )
    }
}
