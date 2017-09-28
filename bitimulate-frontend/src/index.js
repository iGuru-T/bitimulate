import React from 'react';
import ReactDOM from 'react-dom';
import Root from 'Root';
import './styles/main.scss';
import registerServiceWorker from './registerServiceWorker';
import configureStore from 'store/configure';
import { AppContainer } from 'react-hot-loader';

const store = configureStore();
// import modules from './store/modules/';
// console.log(modules);
const render = (Component) => ReactDOM.render(
  (
    <AppContainer>
      <Component store={store}/>
    </AppContainer>
  ), 
  document.getElementById('root')
);

render(Root);

if(module.hot) {
  module.hot.accept('./Root', () => render(Root))
}

registerServiceWorker();

// ReactDOM.render(<Root store={store}/>, document.getElementById('root'));
// registerServiceWorker();
