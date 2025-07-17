import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import React from 'react';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {IMAGES} from '../../res/images';
import {COLORS} from '../../res/colors';
import Icon from '../../utils/icon';
import TextComp from './textComp';
import {width} from '../hooks/responsive';
import {useNavigation} from '@react-navigation/native';
import {SCREEN} from '../layouts';
import {useSelector} from 'react-redux';

const StaticeHeader = ({headerLabel, showFilterIcon = true, onpressFilter}) => {
  const navigation = useNavigation();
  const usersData = useSelector(state => state.user.userData);
  const profileImage = usersData?.profileImage;

  return (
    <>
      <View
        style={[styles.headerContainer, !headerLabel && styles.headerBorder]}>
        <Image
          resizeMode="cover"
          source={IMAGES.Guppsupp}
          style={styles.logo}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN.SEARCH)}
          style={styles.searchContainer}>
          <TextComp style={styles.searchText}>Search</TextComp>
          <Icon name="search" type="EvilIcons" size={20} color={COLORS.black} />
        </TouchableOpacity>

        {headerLabel ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon
              type="AntDesign"
              name="arrowleft"
              size={23}
              color={COLORS.white}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.profileWrapper}>
            <Image
              resizeMode="cover"
              source={
                profileImage ? {uri: profileImage} : IMAGES.DEFAULT_PROFILE
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        )}
      </View>

      {headerLabel && (
        <View style={styles.labelContainer}>
          <TextComp style={styles.headerLabelText}>{headerLabel}</TextComp>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: width,
    height: verticalScale(55),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerBorder: {
    borderBottomWidth: 1,
    borderColor: COLORS.greyOpacity(0.5),
  },
  logo: {
    height: verticalScale(50),
    width: verticalScale(50),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(34),
    borderRadius: 100,
    borderWidth: 1,
    width: 100,
    justifyContent: 'space-between',
    flex: 0.9,
    paddingHorizontal: moderateScale(5),
  },
  searchText: {
    paddingLeft: 5,
  },
  backButton: {
    backgroundColor: COLORS.secondaryAppColor,
    height: verticalScale(30),
    width: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  profileWrapper: {
    borderWidth: 1,
    height: verticalScale(43),
    width: verticalScale(43),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    height: verticalScale(40),
    width: verticalScale(40),
    borderRadius: 100,
  },
  labelContainer: {
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(15),
    borderBottomWidth: 1,
    borderColor: COLORS.greyOpacity(0.5),
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabelText: {
    fontSize: scale(22),
    fontWeight: '600',
  },
});

export default StaticeHeader;
