import React, { Component } from 'react';

import { HomePage, TradePage, RegisterPage, WalletPage } from 'components';
import { Route } from 'react-router-dom';
import { 
  ScreenMaskContainer, 
  LoginModalContainer,
  UserLoader,
  Core
 } from 'containers';

class App extends Component {
  render() {
    return (
      <div>
        <Route exact path ="/" component={HomePage}/>
        <Route path="/trade" component={TradePage}/>
        <Route path="/register" component={RegisterPage}/>
        <Route path="/wallet" component={WalletPage}/>
        <ScreenMaskContainer/>
        <LoginModalContainer/>
        <UserLoader/>
        <Core/>
      </div>
    );
  }
}

export default App;