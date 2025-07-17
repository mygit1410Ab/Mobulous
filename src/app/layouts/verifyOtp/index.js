import {View, Alert, Platform, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';

import Wrapper from '../../components/wrapper';
import Header from '../../components/Header';
import Applogo from '../../components/Applogo';
import TextComp from '../../components/textComp';
import TextInputComp from '../../components/textInputComp';
import ButtonComp from '../../components/buttonComp';
import {COLORS} from '../../../res/colors';
import {SCREEN} from '..';
import {width} from '../../hooks/responsive';
import {verifyEmailAction} from '../../../redux/action';
import {setUserData} from '../../../redux/slices/userDataSlice';
import {loginUser} from '../../../redux/slices/authSlice';
import {scale, verticalScale} from 'react-native-size-matters';

const VerifyOtp = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const email = route?.params?.email || 'example@gmail.com';
  const comingFrom = route?.params?.comingFrom || SCREEN.SIGNUP;

  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(59);
  const [showResendLine, setShowResendLine] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setShowResendLine(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = sec => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const storeToken = async jwtToken => {
    try {
      await AsyncStorage.setItem('token', jwtToken);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      Toast.show('Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    const payload = {email, otp};

    if (comingFrom === SCREEN.SIGNUP) {
      dispatch(
        verifyEmailAction(payload, response => {
          setLoading(false);

          if (response?.data?.status === true) {
            const token = response?.data?.data?.token;
            const user = response?.data?.data?.user;

            const userData = {
              ...user,
              auth_token: token,
            };

            storeToken(token);
            dispatch(setUserData(userData));
            dispatch(loginUser());
            AsyncStorage.setItem('userData', JSON.stringify(userData));
            Toast.show(response?.message || 'OTP Verified', Toast.SHORT);
          } else {
            Toast.show(response?.message || 'Verification failed', Toast.SHORT);
            Alert.alert('Error!', response?.message || 'Something went wrong.');
          }
        }),
      );
    }
  };

  return (
    <Wrapper useBottomInset useTopInsets childrenStyles={styles.flex}>
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 80}
        showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.headerContainer}>
            <Header onBackPress={() => navigation.goBack()} />
          </View>

          <Applogo />

          <TextComp style={styles.otpInfoText}>
            OTP has been sent to{' '}
            <TextComp style={styles.emailText}>{`${email}.\n`}</TextComp>
            Enter the OTP to verify your account.
          </TextComp>

          <TextInputComp
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            style={styles.otpInput}
            placeholder="6 Digit Code"
            label="Enter OTP"
          />

          <View style={styles.resendContainer}>
            {showResendLine ? (
              <TextComp style={styles.resendText}>
                Didn't Receive Code?{' '}
                <TextComp
                  onPress={() => {
                    setTimeLeft(59);
                    setShowResendLine(false);
                  }}
                  style={styles.resendLink}>
                  Resend Code
                </TextComp>
              </TextComp>
            ) : (
              <TextComp style={styles.timerText}>
                Resend Code in {formatTime(timeLeft)}
              </TextComp>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ButtonComp
            loading={loading}
            onPress={handleVerify}
            title="Verify Account"
            buttonStyle={styles.verifyButton}
            textStyle={styles.buttonText}
          />
        </View>
        <View style={styles.bottomSpacing} />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: verticalScale(40),
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
  },
  otpInfoText: {
    marginTop: scale(8),
    fontSize: scale(13),
    textAlign: 'center',
  },
  emailText: {
    fontWeight: '700',
    fontSize: scale(13),
  },
  otpInput: {
    marginTop: verticalScale(25),
  },
  resendContainer: {
    marginTop: verticalScale(16),
  },
  resendText: {
    fontSize: scale(13),
    textAlign: 'center',
  },
  resendLink: {
    color: `rgba(148, 163, 184, 1)`,
    fontWeight: '700',
    fontSize: scale(13),
    textDecorationLine: 'underline',
  },
  timerText: {
    fontSize: scale(13),
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  buttonContainer: {
    marginTop: verticalScale(20),
    alignItems: 'center',
  },
  verifyButton: {
    width: width * 0.9,
  },
  buttonText: {
    color: COLORS.white,
  },
  bottomSpacing: {
    height: verticalScale(100),
  },
});

export default VerifyOtp;
