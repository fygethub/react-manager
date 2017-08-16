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
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'strikethrough', 'quote', 'anchor', 'image', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'superscript', 'subscript', 'orderedlist', 'unorderedlist', 'pre', 'outdent', 'indent', 'h2', 'h3'],
                static: true,
                sticky: true
            }
        });
        editor.subscribe('editableInput', function (event, editable) {
            _this.props.onChange(editable.innerText);
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
