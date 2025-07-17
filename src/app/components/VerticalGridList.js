import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import {scale, verticalScale} from 'react-native-size-matters';

import {IMAGES} from '../../res/images';
import {COLORS} from '../../res/colors';
import TextComp from './textComp';
import {useNavigation} from '@react-navigation/native';
import {SCREEN} from '../layouts';
import {width} from '../hooks/responsive';

const ITEM_WIDTH = width * 0.88;

const VerticalGridList = ({
  data = [],
  numColumns = 2,
  itemStyle = {},
  onRefresh,
  refreshing = false,
  loading = false, // New: pass loading from parent
  keyExtractor = (item, index) => index.toString(),
}) => {
  const memoizedData = useMemo(() => data, [data]);
  const navigation = useNavigation();
  const renderItem = useCallback(
    ({item, index}) => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(SCREEN.SINGLE_PRODUCT_SCREEN, {item})
        }
        style={[styles.item, itemStyle]}>
        <FastImage
          style={styles.image}
          source={
            item?.image
              ? {
                  uri: item?.image,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }
              : IMAGES.DEFAULT_PROFILE
          }
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={{marginLeft: scale(10)}}>
          <TextComp numberOfLines={1} style={styles.nameStyle}>
            {(item?.firstName + ' ' + item?.lastName).slice(0, 20)}
            {(item?.firstName + ' ' + item?.lastName).length > 20 ? '...' : ''}
          </TextComp>
          <TextComp numberOfLines={1} style={styles.priceStyle}>
            {`${item?.email ?? 'N/A'}`}
          </TextComp>
          <TextComp numberOfLines={1} style={styles.priceStyle}>
            {`${item?.mobile ?? 'N/A'}`}
          </TextComp>
        </View>
      </TouchableOpacity>
    ),
    [itemStyle],
  );

  const renderShimmerPlaceholder = () => (
    <View style={styles.shimmerContainer}>
      {[...Array(numColumns * 3)].map((_, i) => (
        <>
          <ShimmerPlaceHolder
            key={i}
            style={styles.shimmerBox}
            shimmerStyle={{borderRadius: 10}}
            autoRun
          />
          <ShimmerPlaceHolder
            key={i}
            style={styles.shimmerBox}
            shimmerStyle={{borderRadius: 10}}
            autoRun
          />
          <ShimmerPlaceHolder
            key={i}
            style={styles.shimmerBox}
            shimmerStyle={{borderRadius: 10}}
            autoRun
          />
        </>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No items to show</Text>
    </View>
  );

  return (
    <FlatList
      data={loading ? [] : memoizedData}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      numColumns={numColumns}
      ListEmptyComponent={loading ? renderShimmerPlaceholder : renderEmpty}
      initialNumToRender={6}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : null
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.contentContainer,
        !loading && memoizedData.length === 0 && styles.centeredContent,
      ]}
      ListFooterComponent={() => <View style={{height: verticalScale(50)}} />}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
    paddingBottom: verticalScale(70),
    alignItems: 'center',
  },
  centeredContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: COLORS.white,
    // marginHorizontal: 5,
    borderRadius: 10,
    width: ITEM_WIDTH,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    padding: scale(5),
  },
  image: {
    height: scale(60),
    width: scale(60),
    alignSelf: 'center',
    borderRadius: scale(30),
  },
  nameStyle: {
    fontSize: scale(11),
    fontWeight: '800',
    marginTop: scale(10),
    textAlign: 'left',
    paddingHorizontal: 10,
  },
  priceStyle: {
    fontSize: scale(10),
    fontWeight: '700',
    marginBottom: scale(10),
    textAlign: 'left',
    paddingHorizontal: 10,
  },
  shimmerContainer: {
    // flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    // paddingHorizontal: 10,
    marginTop: 20,
  },
  shimmerBox: {
    height: 80,
    width: ITEM_WIDTH,
    borderRadius: 10,
    margin: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.textGrey,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default React.memo(VerticalGridList);
