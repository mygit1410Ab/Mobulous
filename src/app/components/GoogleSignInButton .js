import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {IMAGES} from '../../res/images';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const GoogleSignInButton = ({onPress, style, textStyle, iconStyle}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, style]}>
      <Image
        source={IMAGES.google} // Change path as needed
        style={[styles.icon, iconStyle]}
        resizeMode="contain"
      />
      <Text style={[styles.text, textStyle]}>Login in with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;

const BUTTON_WIDTH = SCREEN_WIDTH * 0.9;
const BUTTON_HEIGHT = 54;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 24,
    gap: 16,
    alignSelf: 'center',
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});
