import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import './style/lib/animate.css';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
import Page from './components/Page';
/*import BasicForm from './components/forms/BasicForm';
 import BasicTable from './components/tables/BasicTables';
 import AdvancedTable from './components/tables/AdvancedTables';
 import AsynchronousTable from './components/tables/AsynchronousTable';*/
import Login from './components/pages/Login';
/*import Echarts from './components/charts/Echarts';
 import Recharts from './components/charts/Recharts';
 import Icons from './components/ui/Icons';
 import Buttons from './components/ui/Buttons';
 import Spins from './components/ui/Spins';
 import Modals from './components/ui/Modals';
 import Notifications from './components/ui/Notifications';
 import Tabs from './components/ui/Tabs';
 import Banners from './components/ui/banners';*/
import Drags from './components/ui/draggable/Draggable';
import Dashboard from './components/dashboard/Dashboard';
/*import Gallery from './components/ui/Gallery';
 import NotFound from './components/pages/NotFound';
 import BasicAnimations from './components/animation/BasicAnimations';
 import ExampleAnimations from './components/animation/ExampleAnimations';*/
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {logger} from './middleware';
import {createStore, applyMiddleware} from 'redux';
import reducer from './reducer';
/*import AuthBasic from './components/auth/Basic';
 import RouterEnter from './components/auth/RouterEnter';*/

/*

 const Wysiwyg = (location, cb) => {     // 按需加载富文本配置
 require.ensure([], require => {
 cb(null, require('./components/ui/Wysiwyg').default);
 }, 'Wysiwyg');
 };
 */


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
            {/*<Route path={'table'}>
             <Route path={'basicTable'} component={BasicTable}/>
             <Route path={'advancedTable'} components={AdvancedTable}/>
             <Route path={'asynchronousTable'} components={AsynchronousTable}/>
             </Route>*/}
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
registerServiceWorker();
