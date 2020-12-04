import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import { Provider, useActions, useStoreState } from 'unistore-hooks';
import { actions, store } from '@store/index';
import { State } from '@store/types';

import './App.css';

const App = () => {
  const { setOffline, setMenuOpen } = useActions(actions);
  const { menuOpen } = useStoreState<State>(['menuOpen']);

  React.useEffect(() => {
    setOffline(!navigator.onLine);
    window.addEventListener('online', () => setOffline(false), false);
    window.addEventListener('offline', () => setOffline(true), false);
  }, []);

  return (
    <React.Fragment>
      <p>APP</p>
    </React.Fragment>
  );
};

ReactDOM.render(
  <Router>
    <Provider value={store}>
      <App />
    </Provider>
  </Router>,
  document.querySelector('#app')
);
