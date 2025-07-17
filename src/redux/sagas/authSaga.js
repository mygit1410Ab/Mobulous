import {call, put, takeLatest} from 'redux-saga/effects';
import {
  EDIT_PROFILE,
  GET_ALL_USERS,
  LOGIN_ACTION,
  SIGNUP_ACTION,
  VERIFY_EMAIL_ACTION,
} from '../action/types';
import axios from '../../utils/axiosConfig';
import {BASE_URL, END_POINTS} from '../../utils/config';
import auth from '@react-native-firebase/auth';

function* login(payload) {
  return yield axios.post(`${BASE_URL}${END_POINTS.LOGIN}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function* loginSaga(action) {
  try {
    const {email, password} = action.payload;

    const firebaseResponse = yield call(
      [auth(), auth().signInWithEmailAndPassword],
      email,
      password,
    );

    console.log(' Firebase login success:', firebaseResponse.user.uid);

    const backendResponse = yield call(login, action.payload);

    console.log(' Backend login response:', backendResponse.data);

    // Step 3: Pass data to callback
    action.callBack(backendResponse);
  } catch (error) {
    console.error(' Login failed:', error);

    if (error.code === 'auth/user-not-found') {
      action.callBack({
        data: {
          status: false,
          message: 'No user found with this email.',
        },
      });
    } else if (error.code === 'auth/wrong-password') {
      action.callBack({
        data: {
          status: false,
          message: 'Incorrect password.',
        },
      });
    } else {
      const fallbackMessage =
        error?.response?.data?.message || error?.message || 'Login failed';

      action.callBack({
        data: {
          status: false,
          message: fallbackMessage,
        },
      });
    }
  }
}

function* signup(payload) {
  return yield axios.post(`${BASE_URL}${END_POINTS.SIGNUP}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function* signupSaga(action) {
  try {
    const {email, password} = action.payload;

    // Step 1: Create user in Firebase Auth
    const firebaseResponse = yield call(
      [auth(), auth().createUserWithEmailAndPassword],
      email,
      password,
    );

    console.log(' Firebase user created:', firebaseResponse.user.uid);

    // Step 2: Register user in your backend
    const backendResponse = yield call(signup, action.payload);

    console.log(' Backend signup response:', backendResponse.data);

    action.callBack(backendResponse);
  } catch (error) {
    console.error(' Signup failed:', error);

    if (error.code === 'auth/email-already-in-use') {
      action.callBack({
        data: {
          status: false,
          message: 'That email address is already in use!',
        },
      });
    } else if (error.code === 'auth/invalid-email') {
      action.callBack({
        data: {
          status: false,
          message: 'That email address is invalid!',
        },
      });
    } else {
      const fallbackMessage =
        error?.response?.data?.message || error?.message || 'Signup failed';

      action.callBack({
        data: {
          status: false,
          message: fallbackMessage,
        },
      });
    }
  }
}

function* verifyEmail(payload) {
  return yield axios.post(`${BASE_URL}${END_POINTS.VERIFY_EMAIL}`, payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
export function* verifyEmailSaga(action) {
  try {
    // console.log('action--->>>>', action);
    const response = yield call(verifyEmail, action.payload);
    console.log('response=======>>>>>>>+++++', response.data);
    action.callBack(response);
  } catch (error) {
    console.error('verify Email failed:', error);
    action.callBack(error);
  }
}

function* getUsers() {
  return yield call(axios.get, `${BASE_URL}${END_POINTS.GET_ALL_USERS}`);
}
function* getUsersSaga(action) {
  try {
    console.log('action--->>>>', action);
    const response = yield call(getUsers);
    console.log('response=======>>>>>>>+++++', response.data);
    action.callBack(response);
  } catch (error) {
    action.callBack(error);
  }
}

function* editProfile(payload) {
  let formData = new FormData();
  Object.keys(payload).forEach(element => {
    formData.append(element, payload[element]);
  });
  return yield call(
    axios.post,
    `${BASE_URL}${END_POINTS.EDIT_PROFILE_DATA}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
function* editProfileSaga(action) {
  try {
    console.log('action--->>>>', action);
    const response = yield call(editProfile, action.payload);
    console.log('response=======>>>>>>>+++++', response?.data);
    action.callBack(response);
  } catch (error) {
    console.log('edit profile API Error:', error?.message || error); // safer logging
    action.callBack(error);
  }
}

export function* authSaga() {
  yield takeLatest(LOGIN_ACTION, loginSaga);
  yield takeLatest(SIGNUP_ACTION, signupSaga);
  yield takeLatest(VERIFY_EMAIL_ACTION, verifyEmailSaga);
  yield takeLatest(GET_ALL_USERS, getUsersSaga);
  yield takeLatest(EDIT_PROFILE, editProfileSaga);
}
export default authSaga;
