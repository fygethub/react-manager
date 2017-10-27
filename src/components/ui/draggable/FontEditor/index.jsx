import React from 'react';
import PropTypes from 'prop-types';
import './fontEditor.less';
import {Menu, Icon, Card, message, Select, InputNumber, Button, Input, Modal} from 'antd';

export default class FontEditor extends React.Component {

    static propTypes = {
        initText: PropTypes.string,
        fontColor: PropTypes.string,
        textAlign: PropTypes.number,
        onChange: PropTypes.func,
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
        return (<div className="font-editor">
                <div className="dragText"/>
                <textarea width='100%'
                          value={this.state.value}
                          id={"pell" + this.id}
                          className="no-cursor editable-text"
                          style={{
                              textAlign: value,
                              color: '#' + this.props.fontColor.replace(/#/g, ''),
                          }}
                          onChange={this.handleChange}>
                    {this.props.initText}
                </textarea>
            </div>
        )
    }
}
