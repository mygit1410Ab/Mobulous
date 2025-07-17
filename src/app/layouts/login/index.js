import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import Wrapper from '../../components/wrapper';
import {height} from '../../hooks/responsive';
import {useNavigation} from '@react-navigation/native';
import ButtonComp from '../../components/buttonComp';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../../../res/colors';
import {SCREEN} from '..';
import TextInputComp from '../../components/textInputComp';
import TextComp from '../../components/textComp';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {isIOS} from '../../hooks/platform';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import {useDispatch} from 'react-redux';
import {loginUser} from '../../../redux/slices/authSlice';
import {loginAction} from '../../../redux/action';
import {setUserData} from '../../../redux/slices/userDataSlice';
import Applogo from '../../components/Applogo';
import GoogleSignInButton from '../../components/GoogleSignInButton ';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const storeToken = async jwtToken => {
    try {
      await AsyncStorage.setItem('token', jwtToken);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  const payload = {
    email,
    password,
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show('Please enter both email and password');
      return;
    }
    setLoading(true);

    dispatch(
      loginAction(payload, response => {
        setLoading(false);

        const isSuccess = response?.data?.status === true;

        if (isSuccess) {
          console.log(' response?.data======>', response?.data);
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

          Toast.show(
            response?.data?.message || 'Login successful',
            Toast.SHORT,
          );
        } else {
          const errorMessage =
            response?.data?.message || 'Something went wrong.';
          Toast.show(errorMessage, Toast.SHORT);
        }
      }),
    );
  };

  const handleForgotPassword = () => {
    navigation.navigate(SCREEN.FORGOT_PASSWORD);
  };

  return (
    <Wrapper
      useBottomInset
      useTopInsets={true}
      safeAreaContainerStyle={{}}
      childrenStyles={{height: isIOS() ? height * 0.9 : height}}>
      <KeyboardAwareScrollView
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.logoContainer}>
          <Applogo />
        </View>

        <View style={styles.formContainer}>
          <TextInputComp
            value={email}
            onChangeText={setEmail}
            placeholder={'Email'}
            label={'Email'}
          />
          <TextInputComp
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            showPasswordToggle={true}
            placeholder={'Enter your password'}
            label={'Password'}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}>
            <TextComp style={styles.forgotPasswordText}>
              Forgot Password?
            </TextComp>
          </TouchableOpacity>
          <View style={styles.loginButtonContainer}>
            <ButtonComp
              loading={loading}
              onPress={handleLogin}
              title={'Login'}
              buttonStyle={styles.loginButton}
              textStyle={{color: COLORS.white}}
            />
          </View>
          <Text style={styles.orText}>or login with</Text>
          <View style={styles.googleButtonContainer}>
            <GoogleSignInButton style={{width: '100%'}} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  logoContainer: {
    alignSelf: 'center',
  },
  formContainer: {
    marginTop: -verticalScale(50),
  },
  passwordInput: {
    marginTop: verticalScale(12),
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: verticalScale(8),
  },
  forgotPasswordText: {
    color: COLORS.blue,
  },
  loginButtonContainer: {
    marginTop: verticalScale(20),
  },
  loginButton: {
    marginTop: verticalScale(40),
  },
  orText: {
    color: COLORS.primaryTextColor,
    fontSize: scale(12),
    textAlign: 'center',
    marginTop: verticalScale(60),
    fontWeight: '500',
  },
  googleButtonContainer: {
    marginTop: verticalScale(15),
  },
});

export default Login;
