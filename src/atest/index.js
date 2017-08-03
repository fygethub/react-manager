import React from 'react';
import styles from './style/index.css';
import classname from 'classnames';

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
        let styles = classname.bind(styles);
        styles = ({
            commonTheme: this.state.theme === 'bright',
            darkTheme: this.state.dark === 'dark',
        });

        return (
            <div style={styles}>
                <button onClick={this.changeTheme}/>
                <h3>Hello World</h3>
            </div>
        )
    }
}