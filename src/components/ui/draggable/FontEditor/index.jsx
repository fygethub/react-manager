import React from 'react';
// import pell from 'pell';
// import MediumEditor from 'medium-editor';
import './fontEditor.less';

export default class FontEditor extends React.Component {
    constructor(props) {
        super(props);
        this.id = this.props.id;
        this.state = {
            value: this.props.initText,
        }
    }

    componentDidMount() {
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
        }, () => {
            this.props.onChange(this.state.value, '');
        })

    };

    render() {
        let value = this.props.textAlign || 1;
        value = value == 1 ? 'left' : value == 2 ? 'center' : 'right';
        return (<div className="font-editor">
                <div className="dragText"/>
                <textarea width='100%' value={this.state.value} id={"pell" + this.id}
                          className="no-cursor editable-text"
                          style={{textAlign: value, color: '#' + this.props.fontColor.replace(/#/g, '')}}
                          onChange={this.handleChange}>
                    {this.props.initText}
                </textarea>
            </div>
        )
    }
}
