/**
 * Created by hao.cheng on 2017/4/13.
 */
import React, {Component} from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Link} from 'react-router';
const {Sider} = Layout;
const SubMenu = Menu.SubMenu;

class SiderCustom extends Component {
    state = {
        collapsed: false,
        mode: 'inline',
        openKey: '',
        selectedKey: ''
    };

    componentDidMount() {
        this.setMenuOpen(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.onCollapse(nextProps.collapsed);
        this.setMenuOpen(nextProps)
    }

    setMenuOpen = props => {
        const {path} = props;
        this.setState({
            openKey: path.substr(0, path.lastIndexOf('/')),
            selectedKey: path
        });
    };
    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            mode: collapsed ? 'vertical' : 'inline',
        });
    };
    menuClick = e => {
        this.setState({
            selectedKey: e.key
        });

    };
    openMenu = v => {
        this.setState({
            openKey: v[v.length - 1]
        })
    };

    render() {
        return (
            <Sider
                trigger={null}
                breakpoint="lg"
                collapsed={this.props.collapsed}
                style={{overflowY: 'auto'}}
            >
                <div className="logo"/>
                <Menu
                    onClick={this.menuClick}
                    theme="dark"
                    mode={this.state.mode}
                    selectedKeys={[this.state.selectedKey]}
                    openKeys={[this.state.openKey]}
                    onOpenChange={this.openMenu}
                >
                    <Menu.Item key="/app/dashboard/index">
                        <Link to={'/app/dashboard/index'}><Icon type="mobile"/><span
                            className="nav-text">首页</span></Link>
                    </Menu.Item>
                    <SubMenu
                        key="/app/ui"
                        title={<span><Icon type="scan"/><span className="nav-text">合成图</span></span>}
                    >
                        <Menu.Item key="/app/ui/drags-new"><Link to={'/app/ui/drags-new/no'}>合成图编辑</Link></Menu.Item>
                        <Menu.Item key="/app/ui/imageUpload"><Link to={'/app/ui/compounds'}>合成图管理</Link></Menu.Item>
                    </SubMenu>
                    <SubMenu
                        key="/app/system"
                        title={<span><Icon type="setting"/><span className="nav-text">系统设置</span></span>}
                    >
                        <Menu.Item key="/app/system/config/"><Link to={'/app/system/config'}>系统设置</Link> </Menu.Item>
                    </SubMenu>
                    <SubMenu
                        key="/app/user"
                        title={<span><Icon type="user"/><span className="nav-text">用户管理</span></span>}
                    >
                        <Menu.Item key="/app/user/users"><Link to={'/app/user/users'}>用户列表</Link></Menu.Item>
                    </SubMenu>
                </Menu>
                <style>
                    {`
                    #nprogress .spinner{
                        left: ${this.state.collapsed ? '70px' : '206px'};
                        right: 0 !important;
                    }
                    `}
                </style>
            </Sider>
        )
    }
}

export default SiderCustom;
