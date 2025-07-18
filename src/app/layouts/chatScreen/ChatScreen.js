import React, {useState, useRef, useCallback, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  addMessage,
  updateLastMsg,
  editMessage,
  reactToMessage,
  deleteSingleMessage,
} from '../../../redux/slices/chatSlice';
import uuid from 'react-native-uuid';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {verticalScale} from 'react-native-size-matters';
import Wrapper from '../../components/wrapper';
import {height, width} from '../../hooks/responsive';
import Header from '../../components/Header';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {COLORS} from '../../../res/colors';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Svg, Rect} from 'react-native-svg';

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen = ({route}) => {
  const {receiverData, userData} = route.params;
  const roomId = receiverData.roomId;
  const dispatch = useDispatch();
  const messages = useSelector(state => state.chat.messages[roomId]) || [];

  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [limit, setLimit] = useState(25);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00');
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  const flatListRef = useRef();

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => new Date(b.sendTime) - new Date(a.sendTime)),
    [messages],
  );

  const paginatedMessages = useMemo(
    () => sortedMessages.slice(0, limit),
    [sortedMessages, limit],
  );

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (paginatedMessages.length > 0 && !initialScrollDone) {
      flatListRef.current?.scrollToOffset({offset: 0, animated: false});
      setInitialScrollDone(true);
    }
  }, [paginatedMessages.length, initialScrollDone]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (currentAudioId) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, [isRecording, currentAudioId]);

  const handleShowActionMenu = id =>
    setShowActions(prev => (prev === id ? null : id));
  const handleCancelReply = () => setReplyingTo(null);

  const startRecording = async () => {
    try {
      const uri = await audioRecorderPlayer.startRecorder();
      setIsRecording(true);
      audioRecorderPlayer.addRecordBackListener(e => {
        setRecordSecs(e.currentPosition);
        setRecordTime(
          audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)),
        );
      });
    } catch (err) {
      console.error('Recording failed', err);
      Alert.alert('Recording Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);

      if (recordSecs < 1000) {
        Alert.alert('Too Short', 'Recording must be at least 1 second');
        return;
      }

      const timestamp = moment().format();
      const audioMsg = {
        id: uuid.v4(),
        roomId,
        senderId: userData._id,
        type: 'audio',
        audioUri: result,
        duration: recordSecs,
        sendTime: timestamp,
      };

      dispatch(addMessage({roomId, message: audioMsg}));
      dispatch(
        updateLastMsg({roomId, lastMsg: 'Audio message', sendTime: timestamp}),
      );

      setRecordSecs(0);
      setRecordTime('00:00');
    } catch (err) {
      console.error('Stop recording failed', err);
      Alert.alert('Recording Error', 'Failed to stop recording');
    }
  };

  const playAudio = async (uri, id, duration) => {
    try {
      if (currentAudioId) {
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }

      setCurrentAudioId(id);
      setPlaybackDuration(duration);
      await audioRecorderPlayer.startPlayer(uri);

      audioRecorderPlayer.addPlayBackListener(e => {
        setPlaybackPosition(e.currentPosition);
        if (e.currentPosition >= e.duration) {
          stopAudio();
        }
      });
    } catch (err) {
      console.error('Playback failed', err);
      Alert.alert('Playback Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setCurrentAudioId(null);
      setPlaybackPosition(0);
    } catch (err) {
      console.error('Stop playback failed', err);
    }
  };

  const sendOrEditMessage = useCallback(() => {
    if (!input.trim()) return;
    const timestamp = moment().format();

    if (editingId) {
      dispatch(editMessage({roomId, messageId: editingId, newText: input}));
      setInput('');
      setEditingId(null);
    } else {
      const msg = {
        id: uuid.v4(),
        roomId,
        senderId: userData._id,
        text: input,
        sendTime: timestamp,
        type: 'text',
        replyTo: replyingTo
          ? {
              id: replyingTo.id,
              text: replyingTo.text,
              senderId: replyingTo.senderId,
            }
          : null,
      };
      dispatch(addMessage({roomId, message: msg}));
      dispatch(updateLastMsg({roomId, lastMsg: msg.text, sendTime: timestamp}));
      setInput('');
      setReplyingTo(null);
    }
  }, [input, editingId, replyingTo, roomId, userData, dispatch]);

  const deleteMessage = useCallback(
    messageId => {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              dispatch(deleteSingleMessage({roomId, messageId}));
              setShowActions(null);
            },
          },
        ],
      );
    },
    [roomId, dispatch],
  );

  const swipeDeleteMessage = useCallback(
    messageId => {
      dispatch(deleteSingleMessage({roomId, messageId}));
      setToastMessage('Message deleted');
    },
    [roomId, dispatch],
  );

  const AudioMessage = React.memo(({item, isCurrentUser}) => {
    const isPlaying = currentAudioId === item.id;
    const progress = isPlaying ? playbackPosition / item.duration : 0;

    const formatTime = ms => {
      const totalSecs = Math.floor(ms / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSeek = e => {
      const {locationX} = e.nativeEvent;
      const barWidth = 220;
      const percent = locationX / barWidth;
      const seekPosition = percent * item.duration;

      if (isPlaying) {
        seekTo(seekPosition);
      } else {
        playAudio(item.audioUri, item.id, item.duration, seekPosition);
      }
    };

    return (
      <View
        style={[
          styles.audioContainer,
          isCurrentUser ? styles.myAudio : styles.otherAudio,
          isPlaying && styles.audioContainerPlaying,
        ]}>
        <View style={styles.leftColumn}>
          <TouchableOpacity
            onPress={() =>
              isPlaying
                ? stopAudio()
                : playAudio(item.audioUri, item.id, item.duration)
            }
            style={styles.playButton}>
            <Icon
              name={isPlaying ? 'pause' : 'play-arrow'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {isPlaying && (
            <TouchableWithoutFeedback onPress={handleSeek}>
              <View style={styles.progressWrapper}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${Math.min(progress * 100, 100)}%`},
                    ]}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        <View style={styles.audioContent}>
          {isPlaying && (
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>
                {formatTime(playbackPosition)}
              </Text>
              <Text style={styles.timeText}>{formatTime(item.duration)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  });

  const MessageItem = React.memo(({item}) => {
    const isCurrentUser = item.senderId === userData._id;
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([null, {dx: pan.x}], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (e, gestureState) => {
          if (Math.abs(gestureState.dx) > 100) {
            if (isCurrentUser && gestureState.dx > 0) {
              swipeDeleteMessage(item.id);
              return;
            }

            if (gestureState.dx < 0) {
              setReplyingTo(item);
            }
          }
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start();
        },
      }),
    ).current;

    const renderCommonUI = content => (
      <View style={[styles.messageContainer, {overflow: 'visible'}]}>
        <Animated.View
          style={[
            isCurrentUser ? styles.myMessage : styles.otherMessage,
            {transform: [{translateX: pan.x}], overflow: 'visible'},
          ]}
          {...panResponder.panHandlers}>
          {item.replyTo && (
            <View style={styles.replyPreview}>
              <Text style={styles.replyText}>
                {item.replyTo.senderId === userData._id
                  ? 'Replying to yourself'
                  : `Replying to ${receiverData.firstName}`}
              </Text>
              <Text numberOfLines={1} style={styles.replyContent}>
                {item.replyTo.text}
              </Text>
            </View>
          )}

          {content}

          {item.reaction && (
            <View
              style={isCurrentUser ? styles.myReaction : styles.otherReaction}>
              <Text>{item.reaction}</Text>
            </View>
          )}

          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>
              {moment(item.sendTime).format('h:mm A')}
            </Text>
            <TouchableOpacity
              onPress={() => handleShowActionMenu(item.id)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon
                name="more-vert"
                size={16}
                color="#888"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>

          {showActions === item.id && (
            <View style={styles.actionMenu}>
              <TouchableOpacity
                onPress={() => setShowActions(null)}
                style={styles.closeButton}>
                <Icon name="close" size={18} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  dispatch(
                    reactToMessage({
                      roomId,
                      messageId: item.id,
                      reaction: '👍',
                    }),
                  );
                  setShowActions(null);
                }}>
                <Text style={styles.actionMenuItem}>
                  👍 <Text style={{color: '#666'}}>Like</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(item);
                  setShowActions(null);
                }}>
                <Text style={styles.actionMenuItem}>
                  ↩️ <Text style={{color: '#666'}}>Reply</Text>
                </Text>
              </TouchableOpacity>

              {isCurrentUser && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(item.id);
                      setInput(item.text);
                      setShowActions(null);
                    }}>
                    <Text style={styles.actionMenuItem}>
                      ✏️ <Text style={{color: '#666'}}>Edit</Text>
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteMessage(item.id)}>
                    <Text style={[styles.actionMenuItem, styles.deleteAction]}>
                      🗑️ Delete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    );

    if (item.type === 'audio') {
      return renderCommonUI(
        <AudioMessage item={item} isCurrentUser={isCurrentUser} />,
      );
    }

    return renderCommonUI(
      <Text style={styles.messageText}>
        {item.text}{' '}
        {item.edited && <Text style={styles.editedText}>(edited)</Text>}
      </Text>,
    );
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowActions(null);
        }}>
        <Wrapper useTopInsets={true} childrenStyles={{width: '100%'}}>
          <View style={styles.container}>
            {toastMessage && (
              <View style={styles.toast}>
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            )}

            <View style={styles.headerCard}>
              <Header
                onBackPress={() => navigation.goBack()}
                title={`${receiverData.firstName} ${receiverData?.lastName}`}
              />
              <FastImage
                style={{width: 60, height: 60, borderRadius: 30}}
                source={{uri: 'https://unsplash.it/400/400?image=1'}}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>

            <FlatList
              ref={flatListRef}
              data={paginatedMessages}
              keyExtractor={item => item.id}
              renderItem={({item}) => <MessageItem item={item} />}
              contentContainerStyle={[styles.listContent, {flexGrow: 1}]}
              inverted
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (limit < sortedMessages.length) setLimit(prev => prev + 25);
              }}
              extraData={{showActions, currentAudioId}}
            />

            {replyingTo && (
              <View style={styles.replyBar}>
                <View style={styles.replyBarContent}>
                  <Text style={styles.replyBarText}>
                    Replying to{' '}
                    {replyingTo.senderId === userData._id
                      ? 'yourself'
                      : receiverData.firstName}
                  </Text>
                  <Text style={{color: '#666'}} numberOfLines={1}>
                    {replyingTo.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelReply}
                  style={styles.cancelReply}>
                  <Icon name="close" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            )}

            <View>
              <View
                style={[
                  styles.inputContainer,
                  {marginBottom: isKeyboardVisible ? verticalScale(35) : 0},
                ]}>
                {isRecording ? (
                  <View style={styles.recordingContainer}>
                    <TouchableOpacity onPress={stopRecording}>
                      <Icon name="stop" size={30} color="red" />
                    </TouchableOpacity>
                    <Icon name="fiber-manual-record" size={20} color="red" />
                    <Text style={styles.recordingTime}>
                      {recordTime.substring(0, 5)}
                    </Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={startRecording}
                      style={styles.audioButton}>
                      <Icon
                        name="mic"
                        size={28}
                        color={COLORS.secondaryAppColor}
                      />
                    </TouchableOpacity>
                    <TextInput
                      placeholder="Type your message..."
                      value={input}
                      placeholderTextColor={'gray'}
                      onChangeText={setInput}
                      style={styles.input}
                      multiline
                      autoFocus={true}
                    />
                    <TouchableOpacity
                      onPress={sendOrEditMessage}
                      style={styles.sendButton}
                      disabled={!input.trim()}>
                      <Icon
                        name={editingId ? 'check' : 'send'}
                        size={24}
                        color={input.trim() ? COLORS.secondaryAppColor : '#ccc'}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </Wrapper>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
  },
  headerCard: {
    paddingHorizontal: verticalScale(10),
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    padding: 12,
    borderRadius: 12,
    borderTopRightRadius: 0,
    maxWidth: '80%',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    maxWidth: '80%',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  editedText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionIcon: {
    marginLeft: 10,
  },
  actionMenu: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 2,
    minWidth: 150,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 4,
    zIndex: 1000,
  },
  actionMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#000',
  },
  deleteAction: {
    color: 'red',
  },
  replyPreview: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    paddingLeft: 8,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  replyContent: {
    fontSize: 14,
    color: '#666',
  },
  replyBar: {
    flexDirection: 'row',
    backgroundColor: '#e5e5e5',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    alignItems: 'center',
  },
  replyBarContent: {
    flex: 1,
    paddingRight: 10,
  },
  replyBarText: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cancelReply: {
    padding: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    color: COLORS.secondaryAppColor,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  myReaction: {
    alignSelf: 'flex-end',
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 4,
  },
  otherReaction: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: 'rgba(220,248,198,0.8)',
    borderRadius: 10,
    padding: 4,
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 1000,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
  },

  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  audioContainerPlaying: {
    maxWidth: '90%',
    gap: 10,
  },
  myAudio: {
    backgroundColor: '#dcf8c6',
  },
  otherAudio: {
    backgroundColor: '#fff',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  audioContent: {
    flex: 1,
    justifyContent: 'center',
  },
  progressWrapper: {
    width: 220,
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#128C7E',
    borderRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ChatScreen;
