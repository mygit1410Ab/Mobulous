import {Platform, Animated, View} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {scale, verticalScale} from 'react-native-size-matters';
import {SCREEN} from '../app/layouts';
import Home from '../app/layouts/home';
import Contacts from '../app/layouts/contacts';
import TextComp from '../app/components/textComp';
import Icon from '../utils/icon';
import {COLORS} from '../res/colors';
import {useSelector} from 'react-redux';

const BottomStack = ({navigation}) => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName={SCREEN.HOME_TAB}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName = '';
          let iconType = 'Feather';

          switch (route.name) {
            case SCREEN.HOME_TAB:
              iconName = 'inbox';
              iconType = 'Octicons';
              break;
            case SCREEN.Contacts:
              iconName = 'contacts';
              iconType = 'AntDesign';
              break;
            default:
              iconName = 'circle';
          }

          return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
              {focused && (
                <View
                  style={{
                    height: scale(5),
                    width: scale(5),
                    borderRadius: scale(4),
                    backgroundColor: COLORS.white,
                    position: 'absolute',
                    top: -verticalScale(10),
                  }}
                />
              )}

              <Icon
                name={iconName}
                type={iconType}
                size={scale(24)}
                color={COLORS.white}
              />
            </View>
          );
        },
        tabBarLabel: ({focused, color}) => (
          <TextComp
            allowFontScaling={false}
            style={{
              fontSize: scale(12),
              fontWeight: focused ? '700' : '400',
              color,
            }}>
            {route.name}
          </TextComp>
        ),
        tabBarStyle: {
          backgroundColor: COLORS.primaryAppColor,
          height: verticalScale(45),
          paddingBottom: verticalScale(8),
          justifyContent: 'center',
          paddingTop: 10,
        },
        headerShown: false,
        tabBarShowLabel: false,
      })}>
      <Tab.Screen
        name={SCREEN.HOME_TAB}
        component={Home}
        options={{title: 'Home'}}
      />
      <Tab.Screen
        name={SCREEN.Contacts}
        component={Contacts}
        options={{title: 'Contacts'}}
      />
    </Tab.Navigator>
  );
};

export default BottomStack;
