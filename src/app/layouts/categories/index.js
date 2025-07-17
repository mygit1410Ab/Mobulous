import React, {useCallback, useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-simple-toast';

import Wrapper from '../../components/wrapper';
import Header from '../../components/Header';
import {width} from '../../hooks/responsive';
import {getAllUsersAction} from '../../../redux/action';
import VerticalGridList from '../../components/VerticalGridList';

const Categories = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(
    (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);

      dispatch(
        getAllUsersAction(response => {
          if (response?.data?.status) {
            setUsers(response?.data?.data || []);
          } else {
            Toast.show(
              response?.data?.message || 'Failed to fetch users',
              Toast.LONG,
            );
          }

          if (isRefresh) setRefreshing(false);
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  return (
    <Wrapper
      useTopInsets
      childrenStyles={{width: width * 0.96}}
      safeAreaContainerStyle={{}}>
      <Header onBackPress={() => navigation.goBack()} title="All Users" />
      <VerticalGridList
        data={users}
        numColumns={1}
        itemStyle={styles.itemStyle}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </Wrapper>
  );
};

const styles = {
  itemStyle: {
    marginVertical: 8,
  },
};

export default Categories;
