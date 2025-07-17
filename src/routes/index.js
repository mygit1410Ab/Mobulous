import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Main from '../stacks/main';
import Auth from '../stacks/auth';
import {useColorScheme, View} from 'react-native';
import {COLORS, darkTheme, lightTheme} from '../res/colors';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginUser} from '../redux/slices/authSlice';

import {navigationRef} from './NavigationService';
import Applogo from '../app/components/Applogo';

const Loading = ({loadingText = 'Loading...'}) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.white,
    }}>
    <Applogo />
  </View>
);

export default function Routes() {
  const scheme = useColorScheme();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('token');
        if (loginStatus) {
          dispatch(loginUser());
        }
      } catch (err) {
        console.log('Login check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [dispatch]);

  if (isLoading) {
    return <Loading loadingText={'Checking login status...'} />;
  }

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      {isLoggedIn ? <Main /> : <Auth />}
    </NavigationContainer>
  );
}
