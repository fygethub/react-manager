import React from 'react';
import './pictureEditor.less';

export default class PictureEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showEditor: false,
            show: false,
            value: '',
        };
        this.toggleShow = this.toggleShow.bind(this);
        this.inputOnChange = this.inputOnChange.bind(this);
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            src: newProps.imgSrc,
        })
    }

    toggleShow() {
        this.setState({
            show: !this.state.show,
        })
    }

    inputOnChange(e) {
        this.setState({
            value: e.target.value
        })
    }

    render() {
        let imgStyle = {
            width: this.props.imgWidth,
            height: this.props.imgHeight,
        };
        return <div className="picture-editor">
            <img src={this.state.value || 'https://cdn.pixabay.com/photo/2017/08/08/14/32/adler-2611528__340.jpg'}
                 alt=""/>
            { !this.state.show &&
            <input type="text" value={this.state.value} id="img_url" onChange={this.inputOnChange}/>}
        </div>
    }
}
