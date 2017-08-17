/**
 * Created by hao.cheng on 2017/5/3.
 */
import React from 'react';
import BreadcrumbCustom from '../BreadcrumbCustom';

class Dashboard extends React.Component {

    handleClick = () => {
        localStorage.clear();
    }

    render() {
        return (
            <div className="gutter-example button-demo">
                <BreadcrumbCustom />
                <button onClick={this.handleClick}>清除缓存</button>
            </div>
        )
    }
}

export default Dashboard;
