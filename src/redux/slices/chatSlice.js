import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  messages: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    addChat: (state, action) => {
      const exists = state.chats.find(
        chat => chat.roomId === action.payload.roomId,
      );
      if (!exists) {
        state.chats.push(action.payload);
      }
    },
    updateLastMsg: (state, action) => {
      const {roomId, lastMsg, sendTime} = action.payload;
      const chatIndex = state.chats.findIndex(chat => chat.roomId === roomId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMsg = lastMsg;
        state.chats[chatIndex].sendTime = sendTime;
      }
    },
    addMessage: (state, action) => {
      const {roomId, message} = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    },
    editMessage: (state, action) => {
      const {roomId, messageId, newText} = action.payload;
      const messages = state.messages[roomId] || [];
      const index = messages.findIndex(msg => msg.id === messageId);
      if (index !== -1) {
        messages[index].text = newText;
        messages[index].edited = true;
      }
    },
    reactToMessage: (state, action) => {
      const {roomId, messageId, reaction} = action.payload;
      const messages = state.messages[roomId] || [];
      const msg = messages.find(msg => msg.id === messageId);
      if (msg) {
        msg.reaction = reaction;
      }
    },

    clearAllChats: state => {
      state.chats = [];
      state.messages = {};
    },

    deleteChatByRoomId: (state, action) => {
      const roomId = action.payload;
      state.chats = state.chats.filter(chat => chat.roomId !== roomId);
      delete state.messages[roomId];
    },

    deleteSingleMessage: (state, action) => {
      const {roomId, messageId} = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(
          msg => msg.id !== messageId,
        );
      }
    },
  },
});

export const {
  setChats,
  addChat,
  updateLastMsg,
  addMessage,
  editMessage,
  reactToMessage,
  clearAllChats,
  deleteChatByRoomId,
  deleteSingleMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
