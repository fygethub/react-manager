import React from 'react';
import {AutoSizer} from 'react-virtualized';


export default class Resizer extends React.Component {

    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <AutoSizer>
                    {(({width, height}) => width === 0 || height === 0 ? null : (
                            <div>width:{width},height:{height}</div>
                        ))}
                </AutoSizer>
            </div>
        )
    }
}
