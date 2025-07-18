import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SCREEN} from '../app/layouts';
import DrawerStack from './drawerStack';
import Search from '../app/layouts/search';
import ChatScreen from '../app/layouts/chatScreen/ChatScreen';

const Stack = createNativeStackNavigator();
const Main = () => {
  // headerShown: false
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name={SCREEN.HOME_TAB} component={DrawerStack} />
      <Stack.Screen name={SCREEN.SEARCH} component={Search} options={{}} />
      <Stack.Screen
        name={SCREEN.ChatScreen}
        component={ChatScreen}
        options={{}}
      />
    </Stack.Navigator>
  );
};

export default Main;
