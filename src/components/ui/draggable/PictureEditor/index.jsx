import React from 'react';
import {message} from 'antd';
import './pictureEditor.less';
import OSSWrap from '../../../../common/OSSWrap.jsx';
export default class PictureEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showEditor: false,
            show: false,
            value: '',
        };
        this.doUpload = this.doUpload.bind(this);
        this.toggleShow = this.toggleShow.bind(this);
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

    doUpload = (position) => (e) => {
        let _this = this;
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        if (position === 'background') {
            OSSWrap.upload('compound-background', file).then(function (result) {
                _this.setState({
                    value: result.url,
                }, () => {
                    _this.props.uploadFile(result.url);
                });
            }, (error) => message.error(error));
        } else {
            OSSWrap.upload('compound-layer', file).then(function (result) {
                _this.setState({
                    value: result.url,
                }, () => {
                    _this.props.uploadFile(result.url);
                });
            }, (error) => message.error(error));
        }

    };

    render() {
        return <div className="picture-editor">
            <img src={this.state.value || 'https://cdn.pixabay.com/photo/2017/08/08/14/32/adler-2611528__340.jpg'}
                 alt=""/>
            { !this.state.show &&
            <input placeholder="选择文件" type="file" id="img_url" onChange={this.doUpload(this.props.layer)}/>}
            { !this.state.show && <div className="upload-text">点击上传文件</div>}
        </div>
    }
}

PictureEditor.propTypes = {
    uploadFile: React.PropTypes.func.isRequired,
}
