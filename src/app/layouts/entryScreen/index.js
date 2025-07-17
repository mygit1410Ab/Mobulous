import React from 'react';
import {View, StyleSheet} from 'react-native';
import Wrapper from '../../components/wrapper';
import {height} from '../../hooks/responsive';
import {useNavigation} from '@react-navigation/native';
import ButtonComp from '../../components/buttonComp';
import {moderateScale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../../../res/colors';
import {isIOS} from '../../hooks/platform';
import {SCREEN} from '..';
import Applogo from '../../components/Applogo';
import GoogleSignInButton from '../../components/GoogleSignInButton ';

const EntryScreen = () => {
  const navigation = useNavigation();

  const handleRegister = () => {
    navigation.navigate(SCREEN.SIGNUP);
  };

  const handleLogin = () => {
    navigation.navigate(SCREEN.LOGIN);
  };

  return (
    <Wrapper useBottomInset>
      <View style={styles.logoContainer}>
        <Applogo />
      </View>

      <View style={styles.buttonWrapper}>
        <View style={styles.buttonRow}>
          <ButtonComp
            onPress={handleRegister}
            title="Register"
            buttonStyle={styles.registerButton}
            textStyle={styles.registerText}
          />
          <ButtonComp
            onPress={handleLogin}
            title="Login"
            buttonStyle={styles.loginButton}
            textStyle={styles.loginText}
          />
        </View>

        <GoogleSignInButton style={styles.googleButton} />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.2,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: isIOS() ? verticalScale(80) : verticalScale(45),
    width: '100%',
    paddingHorizontal: moderateScale(20),
    gap: verticalScale(20),
    bottom: -verticalScale(200),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: moderateScale(20),
  },
  registerButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryAppColor,
  },
  registerText: {
    color: COLORS.primaryTextColor,
  },
  loginButton: {
    flex: 1,
    backgroundColor: COLORS.primaryAppColor,
  },
  loginText: {
    color: COLORS.white,
  },
  googleButton: {
    width: '100%',
  },
});

export default EntryScreen;
