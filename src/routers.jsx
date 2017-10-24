import React from 'react';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
import Page from './components/Page';
import Login from './components/pages/Login';
import DragsNew from './components/ui/draggable/DraggableNew';
import Dashboard from './components/dashboard/Dashboard';
import CompoundsManage from './components/ui/compound-manage/CompoundFontManage';
import Compounds from './components/ui/compound/Compounds.jsx';
import Admins from './components/admin/Admins'
import Users from './components/user/Users'
import SystemConfig from './components/system/SystemConfig.jsx'
import Medias from './components/media/Medias';
import Home from './Home';

const routes = (
    <Router history={hashHistory}>
        <Route path={'/'} components={Page}>
            <IndexRedirect to="/app/ui/compounds"/>
            <Route path={'app'} component={Home}>
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
                    <Route path={'drags-new/:id'} component={DragsNew}/>
                    <Route path={'compounds'} component={Compounds}/>
                    <Route path={'compound-manage'} component={CompoundsManage}/>
                </Route>
                <Route path={'media'}>
                    <Route path={'medias'} component={Medias}/>
                </Route>
                <Route path={'dashboard/index'} component={Dashboard}/>
            </Route>
            <Route path={'login'} components={Login}/>
            {/*<Route path={'404'} component={NotFound}/>*/}
        </Route>
    </Router>);
export default routes;


