import React from 'react';
import antd from 'antd';
import OSSWrap from '../../../common/OSSWrap.jsx';
import './compound.less';
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

    componentDidMount(){

    }

    renderAction = () => {
        return <a href="javascript:;">删除</a>;
    };

    expandedRowRender = (record) => {
        return <p>{record.description}</p>;
    };

    render() {
        return <div className="compounds">
            <div className="uploadArea">
                <div className="background">

                </div>
                <div className="laye">

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
