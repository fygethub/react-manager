import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './style/lib/animate.css';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
import Page from './components/Page';
import Login from './components/pages/Login';
import Drags from './components/ui/draggable/Draggable';
import DragsNew from './components/ui/draggable/DraggableNew';
import Dashboard from './components/dashboard/Dashboard';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {logger} from './middleware';
import {createStore, applyMiddleware} from 'redux';
import reducer from './reducer';

import CompoundsManage from './components/ui/compound-manage/CompoundManage';
import Compounds from './components/ui/compound/Compounds.jsx';
import Apps from './components/app/Apps'
import Admins from './components/admin/Admins'
import Users from './components/user/Users'
import SystemConfig from './components/system/SystemConfig.jsx'



const routes =
    <Route path={'/'} components={Page}>
        <IndexRedirect to="/app/ui/compounds"/>
        <Route path={'app'} component={App}>
            <Route path={'app'}>
                <Route path={'apps'} component={Apps}/>
            </Route>
            <Route path={'admin'}>
                <Route path={'admins'} component={Admins}/>
            </Route>
            <Route path={'user'}>
                <Route path={'users'} component={Users}/>
            </Route>
            <Route path={'system'}>
                <Route path={'config'} component={SystemConfig}/>
            </Route>
            <Route path={'ui'}>
                <Route path={'drags/:id'} component={Drags}/>
                <Route path={'drags-new/:id'} component={DragsNew}/>
                <Route path={'compounds'} component={Compounds}/>
                <Route path={'compound-manage'} component={CompoundsManage}/>
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
