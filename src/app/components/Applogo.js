import {Image, StyleSheet} from 'react-native';
import React from 'react';
import {IMAGES} from '../../res/images';
import {height} from '../hooks/responsive';

const Applogo = ({style}) => {
  return (
    <Image
      source={IMAGES.Guppsupp}
      style={[styles.logoStyle, style]}
      resizeMode="contain"
    />
  );
};

export default Applogo;

const styles = StyleSheet.create({
  logoStyle: {
    height: height * 0.38,
    width: height * 0.38,
  },
});
