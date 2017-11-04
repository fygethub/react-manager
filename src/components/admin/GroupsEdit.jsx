import React,{Component} from 'react';
import {Link} from 'react-router';
import {message, Card, Row, Col, Table, Input, Button, Icon, Popconfirm, Modal, Form, Select, InputNumber,Tree} from 'antd';
import BreadcrumbCustom from '../BreadcrumbCustom';
import App from '../../common/App.jsx';
import U from '../../utils';
import '../../asssets/css/users/users.less';

const Option = Select.Option;
const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

class AdminsAdd extends Component {

    constructor(props) {
        super(props);
        this.state={
            roots: [{
                'id': '1',
                'name': 'Root'
            },{
                'id': '2',
                'name': 'test'
            }],
            permissionBack: [],
            permissions: [],
            expandedKeys: [],
            autoExpandParent: true,
            checkedKeys: [],
            selectedKeys: [],
        }
    }

    handleChange = (value) =>  {
        console.log(`selected ${value}`);
    }

    handleCancle = (e) => {

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,val) => {
            console.info(val);
            if(!err){
                if(!this.state.checkedKeys.length) message('error','请选择权限');
                val.permissions = this.state.checkedKeys.filter((v,i) => (/\//.test(v))).join('|');
                console.info(val);
                App.api('/adm/admin/save_group',val).then((res) => {
                    this.props.router.push('app/admin/groups');
                });
            }
        });
    }
    componentDidMount() {
        const {params:{id},form:{setFieldsValue}} = this.props;
        App.api('adm/admin/permissions').then((data) => {
            this.setState({permissions: data},() => {
                App.api('adm/admin/group',{id}).then(({root,name,permissions}) => {
                    setFieldsValue({name,root});
                    console.log(permissions);
                    // this.setState({permissionBack:permissions.split('|')});
                });
            });

        })
    }
    onExpand = (expandedKeys) => {
        console.log('onExpand', arguments);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    }
    onCheck = (checkedKeys) => {
        console.log('onCheck', checkedKeys);
        this.setState({ checkedKeys });
    }
    onSelect = (selectedKeys, info) => {
        console.log('onSelect', info);
        this.setState({ selectedKeys });
    }
    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} />;
        });
    }

    render() {
        const defaultCheckedKeys = this.state.permissionBack;
        const roots = [{
            'id': '0',
            'name': '管理员'
        },{
            'id': '1',
            'name': '超级管理员'
        }];
        const treeData = this.state.permissions.map((v,i) => {
            return {
                title: v.name,
                key: v.name,
                children: v.permissions.map((sv,j) => (
                        {
                            title: sv.name,
                            key: sv.key
                        }
                    )
                )
            }
        });
        console.info(treeData);
        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 14,
                    offset: 6,
                },
            },
        };

        return(
            <Form onSubmit={this.handleSubmit} style={{marginTop: "30px"}}>
                <FormItem
                    {...formItemLayout}
                    label="名称"
                    hasFeedback
                >
                    {getFieldDecorator('name', {
                        rules: [{
                            type: 'string', message: 'The input is not valid name!',
                        }, {
                            required: true, message: 'Please input your name',
                        }],
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="类型"
                    hasFeedback
                >
                    {getFieldDecorator('root', {
                        rules: [{
                            required: true, message: '请选择!',
                        }],
                        initialValue: '1'
                    })(
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Please select"
                            onChange={this.handleChange}
                        >
                            {roots.map((v, i) => {
                                return (<Option key={i.toString(36) + i} value={`${v.id}`}>{`${v.name}`}</Option>);
                            })
                            }
                        </Select>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="权限"
                >
                    {getFieldDecorator('permissions')(
                        <Tree
                            // showLine
                            checkable
                            onExpand={this.onExpand}
                            expandedKeys={this.state.expandedKeys}
                            autoExpandParent={this.state.autoExpandParent}
                            onCheck={this.onCheck}
                            checkedKeys={this.state.checkedKeys}
                            defaultCheckedKeys={defaultCheckedKeys}
                            onSelect={this.onSelect}
                            selectedKeys={this.state.selectedKeys}
                        >
                            {this.renderTreeNodes(treeData)}
                        </Tree>
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">保存</Button>
                    <Button type="primary" htmlType="reset" onClick={this.handleCancle}>取消</Button>
                </FormItem>
            </Form>
        )
    }

}

const AdminsAddWrap = Form.create()(AdminsAdd);

export default AdminsAddWrap;
