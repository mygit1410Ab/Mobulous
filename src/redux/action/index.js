import * as TYPES from './types';

export const loginAction = (payload, callBack) => ({
  type: TYPES['LOGIN_ACTION'],
  payload,
  callBack,
});

export const signupAction = (payload, callBack) => ({
  type: TYPES['SIGNUP_ACTION'],
  payload,
  callBack,
});

export const verifyEmailAction = (payload, callBack) => ({
  type: TYPES['VERIFY_EMAIL_ACTION'],
  payload,
  callBack,
});

export const getAllUsersAction = callBack => ({
  type: TYPES['GET_ALL_USERS'],
  callBack,
});

export const editProfileAction = (payload, callBack) => ({
  type: TYPES['EDIT_PROFILE'],
  payload,
  callBack,
});

export const createChatRoomAction = (payload, callBack) => ({
  type: TYPES['CREATE_CHAT_ROOM'],
  payload,
  callBack,
});
