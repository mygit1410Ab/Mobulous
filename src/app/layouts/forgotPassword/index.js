import {
  View,
  TouchableOpacity,
  Keyboard,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import Wrapper from '../../components/wrapper';
import {height, width} from '../../hooks/responsive';
import {useNavigation, useTheme} from '@react-navigation/native';
import ButtonComp from '../../components/buttonComp';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {COLORS} from '../../../res/colors';
import TextInputComp from '../../components/textInputComp';
import TextComp from '../../components/textComp';
import Icon from '../../../utils/icon';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {isIOS} from '../../hooks/platform';
import {useDispatch} from 'react-redux';
import {requestForgetPasswordAction} from '../../../redux/action';
import Toast from 'react-native-simple-toast';
import {SCREEN} from '..';
import Header from '../../components/Header';
import Applogo from '../../components/Applogo';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerify = () => {
    const payload = {email};
    if (!email) {
      Toast.show('Please enter your email.');
      return;
    }
    setLoading(true);
    dispatch(
      requestForgetPasswordAction(payload, response => {
        if (response?.data?.status) {
          setLoading(false);
          Toast.show('Email sent successfully', Toast.SHORT);
          navigation.goBack();
        } else {
          Alert.alert(response?.data?.message);
        }
      }),
    );
  };

  return (
    <Wrapper
      useBottomInset={true}
      useTopInsets={true}
      safeAreaContainerStyle={{}}
      childrenStyles={{height: isIOS() ? height * 0.9 : height}}>
      <KeyboardAwareScrollView
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Applogo />
        </View>
        <View style={styles.instructionContainer}>
          <TextComp style={styles.instructionText}>
            {` No worries! Enter you email below and we will \n send a email to reset your password.`}
          </TextComp>
        </View>
        <TextInputComp
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder={'Enter your email'}
          label={'Email'}
        />
        <ButtonComp
          loading={loading}
          onPress={handleVerify}
          title={'Send Reset Instruction'}
          buttonStyle={styles.button}
          textStyle={styles.buttonText}
        />
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    marginTop: -verticalScale(50),
  },
  logoContainer: {
    alignSelf: 'center',
  },
  instructionContainer: {
    marginTop: -verticalScale(90),
  },
  instructionText: {
    marginTop: scale(8),
    fontSize: scale(13),
    textAlign: 'center',
  },
  input: {
    marginTop: verticalScale(25),
  },
  button: {
    marginTop: verticalScale(40),
    position: 'absolute',
    bottom: verticalScale(50),
    width: width * 0.89,
  },
  buttonText: {
    color: COLORS.white,
  },
});

export default ForgotPassword;
