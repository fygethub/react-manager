import React, {Component} from 'react';
import {Menu, Icon, Layout, Badge} from 'antd';
import U from '../utils';
import avatar from '../asssets/images/imgs/b1.jpg';

import App from '../common/App.jsx';
const {Header} = Layout;

class HeaderCustom extends Component {
    state = {};

    menuClick = e => {
        console.log(e);
        e.key === 'logout' && this.logout();
    };
    logout = () => {
        localStorage.removeItem('user');
        App.removeCookie('x-adm-sess');
        this.props.router.push('/login')
    };

    render() {
        return (
            <Header style={{background: '#fff', padding: 0, height: 65}} className="custom-theme">
                <Icon
                    className="trigger custom-trigger"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.props.toggle}
                />
                <Menu
                    mode="horizontal"
                    style={{lineHeight: '64px', float: 'right'}}
                    onClick={this.menuClick}
                >
                    <Menu.SubMenu title={<span className="avatar"><img src={avatar} alt="头像"/><i
                        className="on bottom b-white"/></span>}>
                        <Menu.ItemGroup title="用户中心">
                            <Menu.Item key="logout"><span onClick={this.logout}>退出登录</span></Menu.Item>
                        </Menu.ItemGroup>
                    </Menu.SubMenu>
                </Menu>
                <style>{`
                    .ant-menu-Menu.SubMenu-horizontal > .ant-menu {
                        width: 120px;
                        left: -40px;
                    }
                `}</style>
            </Header>
        )
    }
}

export default HeaderCustom;
