import React, {Component} from 'react';
import {Menu, Icon, Layout, Badge} from 'antd';
import U from '../utils';
import avatar from '../asssets/images/imgs/b1.jpg';

import App from '../common/App.jsx';
const {Header} = Layout;

class HeaderCustom extends Component {
    state = {
        user: '',
    };
    componentDidMount(){
        let userName = window.localStorage.getItem('userName');
        this.setState({user: userName});
    }
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
            <Header style={{background: '#fff', padding: 0, height: 50}} className="custom-theme">
                <Icon
                    className="trigger custom-trigger"
                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                    onClick={this.props.toggle}
                />
                <Menu
                    mode="horizontal"
                    style={{lineHeight: '50px', float: 'right',borderLeft: '1px solid #ccc'}}
                    onClick={this.menuClick}
                >
                    <Menu.SubMenu title={<span>{this.state.user}<i
                        className="on bottom b-white"/></span>}>
                        <Menu.ItemGroup title="用户中心">
                            <Menu.Item key="logout"><span onClick={this.logout}>退出登录</span></Menu.Item>
                        </Menu.ItemGroup>
                    </Menu.SubMenu>
                </Menu>

            </Header>
        )
    }
}

export default HeaderCustom;
