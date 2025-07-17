import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import BottomStack from './bottomStack';
import CustomDrawerContent from './customDrawerContent';
import {SCREEN} from '../app/layouts';
import {GABRITO_MEDIUM} from '../../assets/fonts';
import {COLORS} from '../res/colors';
import {scale} from 'react-native-size-matters';
import {isIOS} from '../app/hooks/platform';
import TextComp from '../app/components/textComp';
import SelfProfile from '../app/layouts/selfProfile';

const Drawer = createDrawerNavigator();

const getDrawerLabel =
  label =>
  ({focused, color}) =>
    (
      <TextComp
        allowFontScaling={false}
        style={{
          fontSize: scale(15),
          fontFamily: GABRITO_MEDIUM,
          color,
        }}>
        {label}
      </TextComp>
    );

const DrawerStack = () => {
  return (
    <Drawer.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        drawerActiveBackgroundColor: COLORS.primaryAppColorOpacity(0.3), // <- this adds blue bg on focus
      })}
      initialRouteName={SCREEN.DRAWER_HOME}
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name={SCREEN.DRAWER_HOME}
        component={BottomStack}
        options={{drawerLabel: getDrawerLabel('Home')}}
      />
      <Drawer.Screen
        name={SCREEN.SELF_PROFILE}
        component={SelfProfile}
        options={{drawerLabel: getDrawerLabel('Self Profile')}}
      />
    </Drawer.Navigator>
  );
};

export default DrawerStack;
