import React from 'react';
import pell from 'pell';
import './fontEditor.less';

export default class FontEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: '',
            showEditor: true,
        };
        this.handClick = this.handClick.bind(this);
        this.id = this.props.id;
    }

    handClick() {
        this.setState({
            showEditor: true,
        })
    }

    componentDidMount() {
        const _this = this;
        const pellDom = document.getElementById('pell' + this.id);
        const editor = pellDom && pell.init({
                element: pellDom,
                onChange: html => {
                    document.getElementById('text-output' + this.id).innerHTML = html
                },
                styleWithCSS: true,
                actions: [
                    'bold',
                    'underline',
                    'heading1',
                    'heading2',
                    'paragraph',
                    'italic',
                    {
                        name: 'close',
                        icon: '<b><u><i>X</i></u></b>',
                        title: 'Custom Action',
                        result: () => _this.setState({
                            showEditor: false,
                        })
                    }
                ],
                classes: {
                    actionbar: 'pell-actionbar-custom-name',
                    button: 'pell-button-custom-name',
                    content: 'pell-content-custom-name'
                }
            });
        // editor.content<HTMLElement>
        // To change the editor's content:
        editor.content.innerHTML = '<b><u><i>Initial content!</i></u></b>'
    }

    render() {
        const show = this.state.showEditor;
        return (<div className="font-editor">
                <div id={"text-output" + this.id} onClick={this.handClick} className="dragText"/>
                <div id={"pell" + this.id} style={{display: show ? 'block' : 'none'}} className="no-cursor"/>
            </div>
        )
    }
}
