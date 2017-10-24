import React, {Component} from 'react';
import {Menu, Icon, Layout, Badge} from 'antd';
import screenfull from 'screenfull';
import U from '../utils';
import avatar from '../asssets/images/imgs/b1.jpg';

import App from '../common/App.jsx';
const {Header} = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

let queryString = U.queryString;
class HeaderCustom extends Component {
    state = {
        user: ''
    };

    componentDidMount() {
        const QueryString = queryString();
        // if (QueryString.hasOwnProperty('code')) {
        //     console.log(QueryString);
        //     const _user = JSON.parse(localStorage.getItem('user'));
        //     !_user && gitOauthToken(QueryString.code).then(res => {
        //         console.log(res);
        //         gitOauthInfo(res.access_token).then(info => {
        //             this.setState({
        //                 user: info
        //             });
        //             localStorage.setItem('user', JSON.stringify(info));
        //         });
        //     });
        //     _user && this.setState({
        //         user: _user
        //     });
        // }
        const _user = JSON.parse(localStorage.getItem('user')) || '测试';
        if (!_user && QueryString.hasOwnProperty('code')) {
            /*gitOauthToken(QueryString.code).then(res => {
             gitOauthInfo(res.access_token).then(info => {
             this.setState({
             user: info
             });
             localStorage.setItem('user', JSON.stringify(info));
             });
             });*/
        } else {
            this.setState({
                user: _user
            });
        }
    };

    screenFull = () => {
        if (screenfull.enabled) {
            screenfull.request();
        }

    };
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
                    <SubMenu title={<span className="avatar"><img src={avatar} alt="头像"/><i
                        className="on bottom b-white"/></span>}>
                        <MenuItemGroup title="用户中心">
                            <Menu.Item key="logout"><span onClick={this.logout}>退出登录</span></Menu.Item>
                        </MenuItemGroup>
                    </SubMenu>
                </Menu>
                <style>{`
                    .ant-menu-submenu-horizontal > .ant-menu {
                        width: 120px;
                        left: -40px;
                    }
                `}</style>
            </Header>
        )
    }
}

export default HeaderCustom;
