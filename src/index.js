import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Plan';
import 'antd/dist/antd.css'
import registerServiceWorker from './registerServiceWorker'
registerServiceWorker()
document.body.style.height = window.innerHeight + 'px'
ReactDOM.render(<App />, document.getElementById('root'));
