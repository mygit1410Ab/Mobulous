import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../res/colors';
import Icon from '../utils/icon';
import TextComp from '../app/components/textComp';
import {GABRITO_MEDIUM} from '../../assets/fonts';
import {SCREEN} from '../app/layouts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutUser} from '../redux/slices/authSlice';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';
import {IMAGES} from '../res/images';
import {width} from '../app/hooks/responsive';
import Header from '../app/components/Header';
import auth from '@react-native-firebase/auth';
import {clearUserData} from '../redux/slices/userDataSlice';

const drawerItems = [
  {
    label: 'Home',
    labe2: 'Explore home and shop',
    screen: SCREEN.DRAWER_HOME,
    icon: 'home',
    iconType: 'Feather',
  },
  {
    label: 'Contacts',
    labe2: 'Your saved contacts',
    screen: SCREEN.CONTACTS,
    icon: 'contacts',
    iconType: 'AntDesign',
  },
  {
    label: 'Groups',
    labe2: 'Your group conversations',
    screen: SCREEN.GROUPS,
    icon: 'users',
    iconType: 'Feather',
  },
  {
    label: 'Calls',
    labe2: 'View call history',
    screen: SCREEN.CALL_HISTORY,
    icon: 'call',
    iconType: 'Ionicons',
  },
  {
    label: 'Notifications',
    labe2: 'Message and call alerts',
    screen: SCREEN.NOTIFICATIONS,
    icon: 'bell',
    iconType: 'Feather',
  },
  {
    label: 'Settings',
    labe2: 'Account & app settings',
    screen: SCREEN.SETTINGS,
    icon: 'settings',
    iconType: 'Feather',
  },
  {
    label: 'Help & Support',
    labe2: 'FAQs and support',
    screen: SCREEN.HELP_SUPPORT,
    icon: 'support-agent',
    iconType: 'MaterialIcons',
  },
];

const CustomDrawerContent = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const usersData = useSelector(state => state.user.userData);

  const userData = {
    image: usersData?.image || null,
    businessName: usersData?.business_name || 'Business Name',
    phone: usersData?.mobile_number || '+91 9876543210',
    email: usersData?.email || 'user.myself@gmail.com',
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      dispatch(clearUserData());
      dispatch(logoutUser());
      dispatch({type: 'LOGOUT'});
      await AsyncStorage.clear();
      Toast.show('User Logged out', Toast.SHORT);
    } catch (error) {
      console.error('Logout Error:', error);
      Toast.show('Logout Failed', Toast.SHORT);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        props.state?.history?.at(-1)?.type === 'drawer' && {width},
      ]}>
      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        <Header
          onBackPress={() => props.navigation.closeDrawer()}
          title="Profile"
        />

        <View style={styles.profileContainer}>
          <View>
            <TextComp style={styles.userNameText}>
              {userData.businessName}
            </TextComp>
            <TextComp style={styles.emailText}>{userData.email}</TextComp>
          </View>

          <View style={styles.imageWrapper}>
            <Image
              source={
                userData.image ? {uri: userData.image} : IMAGES.DEFAULT_PROFILE
              }
              style={styles.profileImage}
            />
            <TouchableOpacity
              onPress={() => props.navigation.navigate(SCREEN.SELF_PROFILE)}
              style={styles.editButton}>
              <Icon
                type="MaterialIcons"
                name="mode-edit"
                color={COLORS.primaryAppColor}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.drawerList}>
          {drawerItems.map((item, index) => (
            <DrawerItem
              key={index}
              label={() => (
                <>
                  <TextComp style={styles.drawerLabel}>{item.label}</TextComp>
                  <TextComp style={styles.drawerSubLabel}>
                    {item.labe2}
                  </TextComp>
                </>
              )}
              // onPress={() => props.navigation.navigate(item.screen)}
              icon={() => (
                <View style={styles.iconWrapper}>
                  <Icon
                    name={item.icon}
                    type={item.iconType}
                    size={25}
                    color={COLORS.white}
                  />
                </View>
              )}
              style={[
                styles.drawerItem,
                props.state.routeNames[props.state.index] === item.screen && {
                  backgroundColor: COLORS.primaryAppColorOpacity(0.2),
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <TextComp style={styles.logoutText}>Log Out</TextComp>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.9,
    paddingHorizontal: scale(10),
    paddingTop: scale(10),
  },
  userNameText: {
    fontSize: scale(15),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.secondaryAppColor,
    fontWeight: '900',
  },
  emailText: {
    fontSize: scale(15),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.primaryTextColor,
    fontWeight: '600',
  },
  imageWrapper: {
    width: verticalScale(80),
    alignSelf: 'center',
  },
  profileImage: {
    width: verticalScale(80),
    height: verticalScale(80),
    borderRadius: verticalScale(40),
  },
  editButton: {
    position: 'absolute',
    bottom: scale(2),
    left: scale(2),
    padding: scale(2),
    borderRadius: scale(100),
    backgroundColor: COLORS.white,
    borderColor: '#A3050566',
    borderWidth: 1,
  },
  drawerList: {
    marginTop: scale(10),
  },
  drawerItem: {
    marginHorizontal: scale(4),
    borderRadius: 8,
  },
  drawerLabel: {
    fontSize: scale(14),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.secondaryAppColor,
  },
  drawerSubLabel: {
    fontSize: scale(11),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.primaryTextColor,
  },
  iconWrapper: {
    padding: scale(5),
    borderRadius: 100,
    backgroundColor: COLORS.primaryAppColor,
  },
  logoutContainer: {
    padding: scale(10),
    marginTop: 'auto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryAppColor,
    paddingVertical: scale(10),
    borderRadius: 25,
    width: width * 0.5,
    alignSelf: 'center',
  },
  logoutText: {
    fontSize: scale(14),
    color: COLORS.white,
    marginLeft: scale(10),
    fontFamily: GABRITO_MEDIUM,
  },
});

export default CustomDrawerContent;
