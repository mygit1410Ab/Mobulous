import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Routes from './routes';
import {Provider} from 'react-redux';
import store, {persistor} from './redux/store';
import {PersistGate} from 'redux-persist/integration/react';

const App = () => {
  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Routes />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
