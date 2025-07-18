import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '../../../res/colors';
import {height, width} from '../../hooks/responsive';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import Wrapper from '../../components/wrapper';
import StaticeHeader from '../../components/staticeHeader';
import Applogo from '../../components/Applogo';
import VerticalGridList from '../../components/VerticalGridList';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);

  const rawChats = useSelector(state => state.chat.chats);

  const chats = useMemo(() => {
    return [...rawChats].sort(
      (a, b) => new Date(b.sendTime) - new Date(a.sendTime),
    );
  }, [rawChats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const ListFooterComponent = (
    <View style={styles.footerContainer}>
      <Applogo />
    </View>
  );

  return (
    <Wrapper useTopInsets={true} childrenStyles={{width}}>
      <StaticeHeader />
      <VerticalGridList
        data={chats}
        numColumns={1}
        itemStyle={styles.itemStyle}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={ListFooterComponent}
      />
    </Wrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  itemStyle: {
    marginVertical: 8,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
