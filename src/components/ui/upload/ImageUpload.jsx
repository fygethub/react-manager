import React from 'react';
import antd from 'antd';
import OSSWrap from '../../../common/OSSWrap.jsx';
import './imageUpload.less';
import App from '../../../common/App.jsx';

let Table = antd.Table;


export default class ImageUpload extends React.Component {
    constructor(props) {
        super(props);
        this.doUpload = this.doUpload.bind(this);
        this.renderAction = this.renderAction.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
        this.state = {
            tables: {
                background: [
                    {key: 1, name: '胡彦斌', url: 32, address: '西湖区湖底公园1号'},
                    {key: 2, name: '吴彦祖', url: 42, address: '西湖区湖底公园2号'},
                    {key: 3, name: '李大嘴', url: 32, address: '西湖区湖底公园3号'}
                ],
                layer: [
                    {key: 1, name: '胡彦斌', url: 32, address: '西湖区湖底公园1号'},
                    {key: 2, name: '吴彦祖', url: 42, address: '西湖区湖底公园2号'},
                    {key: 3, name: '李大嘴', url: 32, address: '西湖区湖底公园3号'}
                ]
            },
        };

        this.columns = [
            {title: '图片名称', dataIndex: 'name', key: 'name'},
            {title: 'URL', dataIndex: 'url', key: 'url'},
            {title: '操作', dataIndex: 'option', key: 'option', render: this.renderAction}
        ];
    }


    renderAction = () => {
        return <a href="javascript:;">删除</a>;
    };

    expandedRowRender = (record) => {
        return <p>{record.description}</p>;
    };

    doUpload = (position) => (e) => {
        let _this = this;
        let file = e.target.files[0];
        if (!file) {
            return;
        }
        if (position === 'background') {
            OSSWrap.upload('compound-background', file).then(function (result) {
                console.log(result);
            });
        } else {
            OSSWrap.upload('compound-layer', file).then(function (result) {
                console.log(result);
            });
        }

    };


    render() {
        return <div className="image-upload">
            <div className="uploadArea">
                <div className="background">
                    <label htmlFor="uploadBackground">上传背景图片</label>
                    <input type="file" id="uploadBackground" onChange={this.doUpload('background')}/>
                </div>
                <div className="laye">
                    <label htmlFor="uploadLayer">上传合成图图层</label>
                    <input type="file" id="uploadLayer" onChange={this.doUpload('layer')}/>
                </div>
            </div>
            <div className="tables">
                <div className="backgroundTable">
                    <div className="backgroundFilter">

                    </div>
                    <Table columns={this.columns}
                           expandedRowRender={this.expandedRowRender}
                           dataSource={this.state.tables.background}
                           className="table"/>
                </div>
                <div className="layerTable">
                    <Table columns={this.columns}
                           expandedRowRender={this.expandedRowRender}
                           dataSource={this.state.tables.layer}
                           className="table"/>
                </div>
            </div>
        </div>
    }
}
