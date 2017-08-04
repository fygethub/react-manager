import React from 'react';
import styles from './style/index.css';
import classNames from 'classnames/bind';

export default class CssModuleT extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            theme: 'bright',
        }
        this.changeTheme = this.changeTheme.bind(this);
    }

    changeTheme() {
        this.setState((state) => ({
            theme: state.theme === 'bright' ? 'dark' : 'bright',
        }))
    }

    render() {
        console.log(styles);
        let cx = classNames.bind(styles);

        let className = cx({
            commonTheme: this.state.theme === 'bright',
            darkTheme: this.state.theme === 'dark',
        });

        console.log(className);
        return (
            <div className={className}>
                <button onClick={this.changeTheme}/>
                <h3>Hello World</h3>
            </div>
        )
    }
}