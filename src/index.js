import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './asssets/css/lib/animate.css';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import {logger} from './middleware';
import {createStore, applyMiddleware} from 'redux';
import reducer from './reducer';
import routers from './routers';


// redux 注入操作
const middleware = [thunk, logger];
const store = createStore(reducer, applyMiddleware(...middleware));

ReactDOM.render(
    <Provider store={store}>
        {routers}
    </Provider>
    ,
    document.getElementById('root')
);
