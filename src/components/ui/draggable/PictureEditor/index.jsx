import React from 'react';

export default class PictureEditor extends React.Component {

    constructor(props) {
        this.state = {
            showEditor: false,
            src: '',
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            src: newProps.imgSrc,
        })
    }

    render() {
        return <div className="picture-editor">
            <img src={this.state.src} alt=""/>
        </div>
    }
}
