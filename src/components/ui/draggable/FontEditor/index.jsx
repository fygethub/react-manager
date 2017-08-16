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
        var editor = new MediumEditor(pellDom, {
            delay: 1000,
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'strikethrough', 'quote', 'anchor', 'image', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'superscript', 'subscript', 'orderedlist', 'unorderedlist', 'pre', 'outdent', 'indent', 'h2', 'h3'],
                static: true,
                sticky: true
            }
        });
        _this.timer = -1;
        editor.subscribe('editableInput', function (event, editable) {
            clearTimeout(_this.timer);
            _this.timer = setTimeout(() => {
                console.log(editable, editable.innerText.replace(/[\n\r]/g, ''));
                _this.props.onChange(editable.innerText.replace(/[\n\r]/g, ''));
            }, 1000);
        });
    }

    render() {
        return (<div className="font-editor">
                <div id={"text-output" + this.id}
                     className="dragText"/>
                <div id={"pell" + this.id} className="no-cursor editable-text">
                    {this.props.initText}
                </div>
            </div>
        )
    }
}
