import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './style/lib/animate.css';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
import Page from './components/Page';
import Login from './components/pages/Login';
import Drags from './components/ui/draggable/Draggable';
import Dashboard from './components/dashboard/Dashboard';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {logger} from './middleware';
import {createStore, applyMiddleware} from 'redux';
import reducer from './reducer';
/*import AuthBasic from './components/auth/Basic';
 import RouterEnter from './components/auth/RouterEnter';*/


const Compounds = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/ui/compound/Compounds.jsx').default);
    }, 'Compounds');
};

const SystemConfig = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/system/SystemConfig.jsx').default);
    }, 'SystemConfig');

};

const Apps = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/app/Apps').default);
    }, 'Apps');
};

const Admins = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/admin/Admins').default);
    }, 'Admins');
};

const Users = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/user/Users').default);
    }, 'Users');
};


const routes =
    <Route path={'/'} components={Page}>
        <IndexRedirect to="/app/ui/compounds"/>
        <Route path={'app'} component={App}>
            <Route path={'app'}>
                <Route path={'apps'} getComponent={Apps}/>
            </Route>
            <Route path={'admin'}>
                <Route path={'admins'} getComponent={Admins}/>
            </Route>
            <Route path={'user'}>
                <Route path={'users'} getComponent={Users}/>
            </Route>
            <Route path={'system'}>
                <Route path={'config'} getComponent={SystemConfig}/>
            </Route>
            <Route path={'ui'}>
                <Route path={'drags/:id'} component={Drags}/>
                <Route path={'compounds'} getComponent={Compounds}/>
            </Route>
            <Route path={'dashboard/index'} component={Dashboard}/>
        </Route>
        <Route path={'login'} components={Login}/>
        {/*<Route path={'404'} component={NotFound}/>*/}
    </Route>;

// redux 注入操作
const middleware = [thunk, logger];
const store = createStore(reducer, applyMiddleware(...middleware));

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            {routes}
        </Router>
    </Provider>
    ,
    document.getElementById('root')
);
