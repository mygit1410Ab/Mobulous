import {addChat, addMessage, updateLastMsg} from '../slices/chatSlice';
import {put, takeLatest, select} from 'redux-saga/effects';
import uuid from 'react-native-uuid';
import moment from 'moment';
import {CREATE_CHAT_ROOM} from '../action/types';

function* handleCreateChatRoom({payload, callBack}) {
  try {
    const {userData, receiverData, navigation} = payload;

    // Get existing chats from store
    const existingChats = yield select(state => state.chat.chats);

    // Check if chat with this user already exists
    const existingChat = existingChats.find(
      chat => chat._id === receiverData._id && chat.roomId,
    );

    if (existingChat) {
      callBack?.();
      navigation.navigate('ChatScreen', {
        receiverData: existingChat,
        userData,
      });
      return;
    }

    const roomId = uuid.v4();
    const timestamp = moment().format();

    // Create new chat room object
    const chatRoom = {
      roomId,
      _id: receiverData._id,
      firstName: receiverData?.firstName,
      lastName: receiverData?.lastName,
      image: receiverData?.image ?? '',
      lastMsg: `Hi ${userData?.firstName} wants to connect with you.`,
      msgType: 'text',
      sendTime: timestamp,
      email: receiverData.email ?? '',
    };

    // Initial welcome message
    const welcomeMessage = {
      id: uuid.v4(),
      roomId,
      senderId: userData._id,
      text: `Hi ${receiverData?.firstName}, let's connect!`,
      sendTime: timestamp,
      type: 'text',
    };

    // Update Redux Store
    yield put(addChat(chatRoom));
    yield put(addMessage({roomId, message: welcomeMessage}));
    yield put(
      updateLastMsg({
        roomId,
        lastMsg: welcomeMessage.text,
        sendTime: timestamp,
      }),
    );

    callBack?.();
    navigation.navigate('ChatScreen', {
      receiverData: chatRoom,
      userData,
    });
  } catch (error) {
    console.error('Chat creation failed:', error);
  }
}

export default function* chatSaga() {
  yield takeLatest(CREATE_CHAT_ROOM, handleCreateChatRoom);
}
