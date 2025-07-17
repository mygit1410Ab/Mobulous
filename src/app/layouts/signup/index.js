import {View, Keyboard, Alert, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import Wrapper from '../../components/wrapper';
import {useNavigation} from '@react-navigation/native';
import ButtonComp from '../../components/buttonComp';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../../../res/colors';
import {SCREEN} from '..';
import TextInputComp from '../../components/textInputComp';
import TextComp from '../../components/textComp';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import {useDispatch} from 'react-redux';
import {signupAction} from '../../../redux/action';
import Applogo from '../../components/Applogo';

const Signup = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {});
    const hide = Keyboard.addListener('keyboardDidHide', () => {});
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const payload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    password: password.trim(),
    confirmPassword: confirmPassword.trim(),
  };

  const handleRegister = () => {
    if (!email.trim()) {
      Toast.show('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show('Enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Toast.show('Password is required');
      return;
    }

    if (password !== confirmPassword) {
      Toast.show('Passwords do not match');
      return;
    }

    setLoading(true);
    dispatch(
      signupAction(payload, response => {
        setLoading(false);

        const serverMessage = response?.data?.message || 'Something went wrong';

        if (response?.data?.status === true) {
          Toast.show(
            serverMessage || 'OTP sent to registered email successfully!',
            Toast.SHORT,
          );

          navigation.navigate(SCREEN.VERIFY_OTP, {
            email: payload.email,
            comingFrom: SCREEN.SIGNUP,
          });
        } else {
          Toast.show(serverMessage || 'Registration failed', Toast.SHORT);
        }
      }),
    );
  };

  return (
    <Wrapper
      useBottomInset
      useTopInsets
      childrenStyles={styles.wrapperChildren}>
      <KeyboardAwareScrollView
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Applogo />
        </View>

        <View style={styles.nameRow}>
          <TextInputComp
            style={styles.flexInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            label="First Name"
          />
          <View style={styles.inputSpacer} />
          <TextInputComp
            style={styles.flexInput}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            label="Last Name"
          />
        </View>

        <TextInputComp
          value={email}
          onChangeText={setEmail}
          style={styles.inputSpacing}
          placeholder="Enter your email"
          label="E-mail"
        />
        <TextInputComp
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          showPasswordToggle
          placeholder="Enter your password"
          label="Password"
          style={styles.inputSpacing}
        />
        <TextInputComp
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          showPasswordToggle
          placeholder="Confirm Password"
          label="Confirm Password"
          style={styles.inputSpacing}
        />

        <ButtonComp
          loading={loading}
          onPress={handleRegister}
          title="Create Account"
          buttonStyle={styles.registerButton}
          textStyle={styles.registerText}
        />

        <TextComp style={styles.agreementText}>
          By continuing, you agree to our{' '}
          <TextComp onPress={() => {}} style={styles.linkText}>
            Terms of Service
          </TextComp>{' '}
          and{' '}
          <TextComp onPress={() => {}} style={styles.linkText}>
            Privacy Policy
          </TextComp>
        </TextComp>

        <View style={styles.footerSpacing} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default Signup;

const styles = StyleSheet.create({
  wrapperChildren: {
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoContainer: {
    marginTop: -verticalScale(50),
    alignSelf: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: -verticalScale(50),
  },
  flexInput: {
    flex: 0.95,
  },
  inputSpacer: {
    width: moderateScale(8),
  },
  inputSpacing: {
    marginTop: verticalScale(12),
  },
  registerButton: {
    marginTop: verticalScale(40),
  },
  registerText: {
    color: COLORS.white,
  },
  agreementText: {
    fontSize: scale(11),
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  linkText: {
    color: COLORS.blue,
    fontWeight: '700',
    fontSize: scale(12),
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.blue,
  },
  footerSpacing: {
    height: verticalScale(50),
  },
});
