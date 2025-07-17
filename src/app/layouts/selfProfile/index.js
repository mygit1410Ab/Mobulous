import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  BackHandler,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-simple-toast';
import ImagePicker from 'react-native-image-crop-picker';
import {useDispatch, useSelector} from 'react-redux';

import Wrapper from '../../components/wrapper';
import ButtonComp from '../../components/buttonComp';
import Header from '../../components/Header';
import TextComp from '../../components/textComp';
import TextInputComp from '../../components/textInputComp';

import {SCREEN} from '..';
import {IMAGES} from '../../../res/images';
import {COLORS} from '../../../res/colors';
import {height, width} from '../../hooks/responsive';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {GABRITO_MEDIUM} from '../../../../assets/fonts';
import Icon from '../../../utils/icon';
import {isIOS} from '../../hooks/platform';
import {editProfileAction} from '../../../redux/action';
import {setUserData} from '../../../redux/slices/userDataSlice';

const SelfProfile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const usersData = useSelector(state => state.user.userData);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  // Local editable states
  const [mobileNumber, setMobileNumber] = useState('');
  const [about, setAbout] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  // Sync redux user data to local state when usersData changes
  useEffect(() => {
    if (usersData) {
      setMobileNumber(usersData.mobile || '');
      setAbout(usersData.about || '');
      setLoading(false);
    }
  }, [usersData]);

  // Keyboard event listeners
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.reset({
          index: 0,
          routes: [{name: SCREEN.DRAWER_HOME}],
        });
        return true;
      };
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  const openImagePicker = useCallback(async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true,
      });
      if (image?.data) {
        setProfileImage({
          base64: `data:${image.mime};base64,${image.data}`,
          path: image.path,
        });
      }
    } catch (err) {
      console.log('Image picker cancelled or failed:', err?.message);
    }
  }, []);

  const handleSave = useCallback(() => {
    setButtonLoading(true);

    const trimmedMobile = mobileNumber.trim();
    const trimmedAbout = about.trim();

    const payload = {};
    if (trimmedMobile !== usersData.mobile) payload.mobile = trimmedMobile;
    if (trimmedAbout !== usersData.about) payload.about = trimmedAbout;
    if (profileImage?.base64) payload.image = profileImage.base64;

    if (Object.keys(payload).length === 0) {
      Toast.show('Please update a field before saving.', Toast.SHORT);
      setButtonLoading(false);
      return;
    }

    dispatch(
      editProfileAction(payload, response => {
        setButtonLoading(false);
        if (response?.data?.status) {
          dispatch(setUserData(response.data.data));
          Toast.show('Profile updated successfully!', Toast.SHORT);
          navigation.goBack();
        } else {
          Toast.show('Failed to update profile. Try again.', Toast.SHORT);
          console.log('Update failed:', response);
        }
      }),
    );
  }, [about, mobileNumber, profileImage, usersData, dispatch, navigation]);

  const profileImageSource = useMemo(() => {
    if (profileImage?.base64) return {uri: profileImage.base64};
    if (profileImage?.path) return {uri: profileImage.path};
    if (usersData?.image)
      return {
        uri: usersData.image.startsWith('http')
          ? usersData.image
          : `${usersData.image}`,
      };
    return IMAGES.DEFAULT_PROFILE;
  }, [profileImage, usersData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondaryAppColor} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <Wrapper
      useBottomInset
      useTopInsets
      childrenStyles={{height: isIOS() ? height * 0.9 : height}}>
      <Header onBackPress={() => navigation.goBack()} title="Profile Edit" />
      <KeyboardAwareScrollView
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={profileImageSource} style={styles.profileImage} />
          <TouchableOpacity
            onPress={openImagePicker}
            style={styles.editIconButton}>
            <Icon
              type="MaterialIcons"
              name="mode-edit"
              color={COLORS.primaryAppColor}
              size={20}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.headerTextContainer}>
          <TextComp style={styles.headerText}>Profile Details</TextComp>
        </View>

        <TextInputComp
          editable={false}
          value={usersData?.firstName || usersData?.first_name || ''}
          placeholder="First Name"
          label="First Name"
        />

        <TextInputComp
          editable={false}
          value={usersData?.lastName || usersData?.last_name || ''}
          placeholder="Last Name"
          label="Last Name"
          style={styles.inputSpacing}
        />

        <TextInputComp
          editable={false}
          value={usersData?.email || ''}
          placeholder="Email"
          label="Email"
          style={styles.inputSpacing}
        />

        <TextInputComp
          value={mobileNumber}
          onChangeText={setMobileNumber}
          placeholder="Mobile Number"
          label="Mobile Number"
          style={styles.inputSpacing}
        />

        <TextInputComp
          value={about}
          onChangeText={setAbout}
          placeholder="Tell us about yourself"
          label="About"
          multiline
          style={styles.inputSpacing}
        />

        <ButtonComp
          onPress={handleSave}
          loading={buttonLoading}
          title="Update"
          buttonStyle={styles.updateButton}
          textStyle={{color: COLORS.white}}
        />

        {keyboardVisible && <View style={{height: verticalScale(100)}} />}
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

export default SelfProfile;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: verticalScale(80),
    height: verticalScale(80),
    borderRadius: verticalScale(80) / 2,
  },
  editIconButton: {
    borderWidth: 1,
    position: 'absolute',
    bottom: scale(2),
    left: scale(2),
    padding: scale(2),
    borderRadius: scale(100),
    backgroundColor: COLORS.white,
    borderColor: '#A3050566',
  },
  headerTextContainer: {
    marginTop: scale(20),
    marginBottom: scale(5),
  },
  headerText: {
    fontSize: scale(18),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.secondaryAppColor,
  },
  inputSpacing: {
    marginTop: verticalScale(12),
  },
  updateButton: {
    backgroundColor: COLORS.primaryAppColor,
    marginTop: verticalScale(40),
    alignSelf: 'center',
    width: width * 0.4,
  },
});
