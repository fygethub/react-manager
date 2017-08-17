import React from 'react';
import pell from 'pell';
import MediumEditor from 'medium-editor';
import './fontEditor.less';

export default class FontEditor extends React.Component {
    constructor(props) {
        super(props);
        this.id = this.props.id;
    }

    componentDidMount() {
        const _this = this;
        const pellDom = document.getElementById('pell' + this.id);
        let editor = new MediumEditor(pellDom, {
            delay: 1000,
            toolbar: false,
        });
        _this.timer = -1;
        editor.subscribe('editableInput', function (event, editable) {
            clearTimeout(_this.timer);
            _this.timer = setTimeout(() => {
                _this.props.onChange(editable.innerText && editable.innerText.replace(/\n\r\s*$/, ''));
            }, 1000);
        });
    }

    render() {
        return (<div className="font-editor">
                <div className="dragText"/>
                <div id={"pell" + this.id} className="no-cursor editable-text">
                    {this.props.initText}
                </div>
            </div>
        )
    }
}
