import React, {Component} from 'react';
import {Layout} from 'antd';
import './asssets/css/common/index.less';
import SiderCustom from './components/SiderCustom';
import HeaderCustom from './components/HeaderCustom';
import {receiveData} from './action';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
const {Content, Footer} = Layout;

class App extends Component {
    state = {
        collapsed: false,
    };

    componentWillMount() {
        const {receiveData} = this.props;
        const user = JSON.parse(localStorage.getItem('user'));
        user && receiveData(user, 'auth');
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render() {
        const {auth, router} = this.props;
        return (
            <Layout className="ant-layout-has-sider">
                <SiderCustom path={this.props.location.pathname} collapsed={this.state.collapsed}/>
                <Layout>
                    <HeaderCustom toggle={this.toggle} user={auth.data || {}} router={router}/>
                    <Content style={{margin: '0 16px', overflow: 'initial'}}>
                        {this.props.children}
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                        Wakkaa 后台管理
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    const {auth = {data: {}}} = state.httpData;
    return {auth};
};
const mapDispatchToProps = dispatch => ({
    receiveData: bindActionCreators(receiveData, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
