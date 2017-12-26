/**
 * Created by hao.cheng on 2017/4/13.
 */
import React, {Component} from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Link} from 'react-router';
const {Sider} = Layout;

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

    getPostion = (str, cha, num) => {
        let x = str.indexOf(cha);
        for (let i = 0; i < num; i++) {
            x = str.indexOf(cha, x + 1);
        }
        return x;
    };

    setMenuOpen = props => {
        let {path} = props;
        //兼容三层目录,三级页不修改，刷新时定位到一级
        let key = path.substr(0, path.lastIndexOf('/'));
        if (key.split('/').length > 3) {
            if (this.state.openKey)
                return;
            key = key.substring(0, this.getPostion(key, '/', 2));
        }
        this.setState({
            openKey: key,
            selectedKey: path
        });
    };

    onCollapse = (collapsed) => {
        this.setState({
            collapsed,
            firstHide: collapsed,
            mode: collapsed ? 'vertical' : 'inline'
        });
    };

    menuClick = e => {
        this.setState({
            selectedKey: e.key
        });

    };
    openMenu = v => {
        this.setState({
            openKey: v[v.length - 1],
            firstHide: false
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
                    openKeys={this.state.firstHide ? null : [this.state.openKey]}
                    onOpenChange={this.openMenu}
                >
                    {/*<Menu.Item key="/app/dashboard/index">*/}
                    {/*<Link to={'/app/dashboard/index'}><Icon type="mobile"/><span*/}
                    {/*className="nav-text">首页</span></Link>*/}
                    {/*</Menu.Item>*/}
                    <Menu.SubMenu
                        key="/app/ui"
                        title={<span><Icon type="scan"/><span className="nav-text">合成图</span></span>}
                    >
                        <Menu.Item key="/app/ui/drags-new/id"><Link to={'/app/ui/drags-new/id'}>添加编辑</Link></Menu.Item>
                        <Menu.Item key="/app/ui/compounds"><Link to={'/app/ui/compounds'}>合成图列表</Link></Menu.Item>
                        <Menu.Item key="/app/ui/compound-manage">
                            <Link to={'/app/ui/compound-manage'}>字体管理</Link>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu
                        key="/app/media"
                        title={<span><Icon type="shop"/><span className="nav-text">店铺</span></span>}
                    >
                        <Menu.Item key="/app/media/medias"><Link to={'/app/media/medias'}>店铺管理</Link> </Menu.Item>
                        <Menu.Item key="/app/media/coupons"><Link to={'/app/media/coupons'}>优惠券列表</Link> </Menu.Item>
                    </Menu.SubMenu>
                    < Menu.SubMenu
                        key="/app/system"
                        title={<span><Icon type="setting"/><span className="nav-text">系统设置</span></span>}
                    >
                        <Menu.Item key="/app/system/config"><Link to={'/app/system/config'}>系统设置</Link> </Menu.Item>
                    </Menu.SubMenu>
                    {/*
                     //废弃
                     <Menu.SubMenu
                     key="/app/user"
                     title={<span><Icon type="user"/><span className="nav-text">用户管理</span></span>}
                     >
                     <Menu.Item key="/app/user/users"><Link to={'/app/user/users'}>用户列表</Link></Menu.Item>
                     </Menu.SubMenu>*/}
                    <Menu.SubMenu
                        key="/app/admin"
                        title={<span><Icon type="team"/><span className="nav-text">管理员</span></span>}
                    >
                        <Menu.Item key="/app/admin/admins"><Link to={`/app/admin/admins`}>管理员列表</Link></Menu.Item>
                        <Menu.Item key="/app/admin/adminGroup"><Link to={`/app/admin/groups`}>管理员分组</Link></Menu.Item>
                    </Menu.SubMenu>
                </Menu>
            </Sider>
        )
    }
}

export default SiderCustom;
