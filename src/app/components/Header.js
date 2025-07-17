import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import {COLORS} from '../../res/colors';
// import {moderateScale, scale, verticalScale} from '../hooks/responsive';
import {width} from '../hooks/responsive';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {IMAGES} from '../../res/images';
import {GABRITO_MEDIUM} from '../../../assets/fonts';

const Header = ({onBackPress, title}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onBackPress}
        hitSlop={{left: 30}}
        style={styles.backButton}>
        <Image
          style={{height: 40, width: 40, tintColor: COLORS.black}}
          resizeMode="contain"
          source={IMAGES.back}
        />
      </TouchableOpacity>

      {title ? <Text style={styles.title}>{title}</Text> : null}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: verticalScale(50),
    // width: width,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(0),
    backgroundColor: COLORS.white, // Optional, depending on your design
    // borderWidth: 1,
  },
  backButton: {
    backgroundColor: COLORS.white,
    height: verticalScale(30),
    width: verticalScale(30),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginLeft: moderateScale(10),
    fontSize: scale(20),
    color: COLORS.black,
    fontWeight: '900',
    fontFamily: GABRITO_MEDIUM,
  },
});
