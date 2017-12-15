import React from 'react';
import {Breadcrumb, Switch, Icon} from 'antd';
import {Link} from 'react-router';
import themes from '../asssets/theme';

class BreadcrumbCustom extends React.Component {
    state = {
        switcherOn: false,
        theme: null,
        themes: JSON.parse(localStorage.getItem('themes')) || [
            {type: 'info', checked: false},
            {type: 'grey', checked: false},
            {type: 'danger', checked: false},
            {type: 'warn', checked: false},
            {type: 'white', checked: false},
        ],
    };

    componentDidMount() {
        this.state.themes.forEach(val => {
            val.checked && this.setState({
                theme: themes['theme' + val.type] || null
            });
        })
    }

    themeChange = (v) => {
        this.setState({
            themes: this.state.themes.map((t, i) => {
                (t.type === v.type && (t.checked = !t.checked)) || (t.checked = false);
                return t;
            }),
            theme: (v.checked && themes['theme' + v.type]) || null
        }, () => {
            localStorage.setItem('themes', JSON.stringify(this.state.themes));
        })
    };

    render() {
        const first = <Breadcrumb.Item>{this.props.first}</Breadcrumb.Item> || '';
        const second = <Breadcrumb.Item>{this.props.second}</Breadcrumb.Item> || '';
        return (
                <Breadcrumb style={{margin: '12px 0'}}>
                    <Breadcrumb.Item><Link to={'/app/dashboard/index'}>首页</Link></Breadcrumb.Item>
                    {first}
                    {second}
                </Breadcrumb>
        )
    }
}

export default BreadcrumbCustom;
