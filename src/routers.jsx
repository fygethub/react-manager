import React from 'react';
import {Router, Route, hashHistory, IndexRedirect} from 'react-router';
import Page from './components/Page';
import Login from './components/pages/Login';
import DragsNew from './components/ui/draggable/DraggableNew';
import Dashboard from './components/dashboard/Dashboard';
import CompoundsManage from './components/ui/compound-manage/CompoundFontManage';
import Compounds from './components/ui/compound/Compounds.jsx';
import Admins from './components/admin/Admins';
import AdminsAdd from './components/admin/AdminsAdd';
import AdminsEdit from './components/admin/AdminsEdit';
import Groups from './components/admin/Groups';
import GroupsAdd from './components/admin/GroupsAdd';
import GroupsEdit from './components/admin/GroupsEdit';
import Users from './components/user/Users';
import SystemConfig from './components/system/SystemConfig.jsx';
import SystemConfigAdd from './components/system/SystemConfigAdd.jsx';
import SystemConfigEdit from './components/system/SystemConfigEdit.jsx';
import Medias from './components/media/Medias';
import PublicAccounts from './components/media/PublicAccounts';
import PublicAccountEdit from './components/media/PublicAccountEdit';
import PublicAccountAdd from './components/media/PublicAccountAdd';
import Home from './Home';

const routes = (
    <Router history={hashHistory}>
        <Route path={'/'} components={Page}>
            <IndexRedirect to="/app/ui/compounds"/>
            <Route path={'app'} component={Home}>
                <Route path={'admin'}>
                    <Route path={'admins'} component={Admins}/>
                    <Route path={'admins/add'} component={AdminsAdd}/>
                    <Route path={'admins/edit/:id'} component={AdminsEdit}/>
                    <Route path={'groups'} component={Groups}/>
                    <Route path={'groups/add'} component={GroupsAdd}/>
                    <Route path={'groups/edit/:id'} component={GroupsEdit}/>
                </Route>
                <Route path={'user'}>
                    <Route path={'users'} component={Users}/>
                </Route>
                <Route path={'system'}>
                    <Route path={'config'} component={SystemConfig}/>
                    <Route path={'config/add'} component={SystemConfigAdd}/>
                    <Route path={'config/edit/:key'} component={SystemConfigEdit}/>
                </Route>
                <Route path={'ui'}>
                    <Route path={'drags-new/:id'} component={DragsNew}/>
                    <Route path={'compounds'} component={Compounds}/>
                    <Route path={'compound-manage'} component={CompoundsManage}/>
                </Route>
                <Route path={'media'}>
                    <Route path={'medias'} component={Medias}/>
                    <Route path={'maps/map/:id'} component={PublicAccounts} />
                    <Route path={'maps/add'} component={PublicAccountAdd} />
                    <Route path={'maps/edit/:id'} component={PublicAccountEdit} />
                </Route>
                <Route path={'dashboard/index'} component={Dashboard}/>
            </Route>
            <Route path={'login'} components={Login}/>
            {/*<Route path={'404'} component={NotFound}/>*/}
        </Route>
    </Router>);
export default routes;


