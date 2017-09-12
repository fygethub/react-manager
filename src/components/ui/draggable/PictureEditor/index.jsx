import React from 'react';
import {message} from 'antd';
import './pictureEditor.less';
import OSSWrap from '../../../../common/OSSWrap.jsx';
export default class PictureEditor extends React.Component {
    static propTypes = {
        uploadFile: React.PropTypes.func,
        defaultUrl: React.PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            showEditor: false,
            show: false,
            value: this.props.pictureUrl,
        };
        this.defaultUrl = this.props.defaultUrl || '';
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            src: newProps.imgSrc,
        })
    }

    toggleShow = () => {
        this.setState({
            show: !this.state.show,
        })
    };

    doUpload = (e) => {
        let _this = this;
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        OSSWrap.upload('compound-layer', file).then((result) => {
            this.setState({
                value: result.url,
            }, () => {
                this.props.uploadFile && this.props.uploadFile(result.url);
            });
        }, (error) => message.error(error));
    };

    render() {
        return <div className="picture-editor">
            <img
                src={this.state.value || this.defaultUrl }
                alt={this.props.layer}
                draggable="false"
            />
            <input
                placeholder="选择文件"
                type="file"
                id="img_url"
                onChange={this.doUpload}/>
            <div
                className="upload-text"
                onClick={this.toggleShow}>点击上传文件
            </div>
        </div>
    }
}
