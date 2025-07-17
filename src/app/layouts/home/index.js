import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, FlatList, StyleSheet, Image} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-simple-toast';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '../../../res/colors';
import {IMAGES} from '../../../res/images';
import {height, width} from '../../hooks/responsive';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import Wrapper from '../../components/wrapper';
import TextComp from '../../components/textComp';
import StaticeHeader from '../../components/staticeHeader';
import Applogo from '../../components/Applogo';

import {GABRITO_MEDIUM} from '../../../../assets/fonts';
import {SCREEN} from '..';
import {getBannersAction, getProductsAction} from '../../../redux/action';

const HeaderText = React.memo(({title, data, navigation}) => {
  const handlePress = () => {
    // console.log('data', data);
    navigation.navigate(SCREEN.ViewAll, {data});
  };

  return (
    <View style={styles.headerRow}>
      <TextComp style={styles.bestProductsTitle}>{title}</TextComp>
      <TextComp onPress={handlePress} style={styles.viewAllTitle}>
        View all
      </TextComp>
    </View>
  );
});

const Home = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const flatListRef = useRef(null);

  // const [products, setProducts] = useState([]);
  // const [bannerImages, setBannerImages] = useState([]);
  const [ourBestLoading, setourBestLoading] = useState(false);
  // const [showScrollToTop, setShowScrollToTop] = useState(false);

  // useEffect(() => {
  //   SystemNavigationBar.setNavigationColor(COLORS.primaryAppColor, 'dark');
  //   fetchBanner();
  //   // fetchProducts();
  // }, []);

  // const fetchBanner = useCallback(() => {
  //   dispatch(
  //     getBannersAction(response => {
  //       if (response?.data?.status) {
  //         setBannerImages(response?.data?.data || []);
  //       } else {
  //         Toast.show(
  //           response?.data?.message || 'Banner fetch failed',
  //           Toast.LONG,
  //         );
  //       }
  //     }),
  //   );
  // }, [dispatch]);

  // const fetchProducts = useCallback(() => {
  //   setourBestLoading(true);
  //   dispatch(
  //     getProductsAction({}, response => {
  //       setProducts(response?.data?.data || []);
  //       setourBestLoading(false);
  //     }),
  //   );
  // }, [dispatch]);

  const handleScroll = useCallback(event => {
    const y = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(y > 300);
  }, []);

  // const scrollToTop = useCallback(() => {
  //   flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  // }, []);

  const memoizedHeader = useMemo(
    () => (
      <View>
        {/* {bannerImages.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              data={bannerImages}
              onPressItem={item =>
                navigation.navigate(SCREEN.CATEGORY_PRODUCT_SCREEN, {
                  data: item,
                  bannerClick: true,
                })
              }
              interval={4000}
              height={height * 0.2}
            />
          </View>
        )} */}
      </View>
    ),
    [navigation],
  );

  const renderSectionItem = useCallback(
    ({item}) => (
      <View style={styles.sectionContainer}>
        <HeaderText title={item.title} data={item} navigation={navigation} />
        <HorizontalList
          data={item.data}
          fetchProducts={fetchProducts}
          ourBestLoading={ourBestLoading}
        />
      </View>
    ),
    [ourBestLoading],
  );

  const renderFlatListHeader = useCallback(
    () => (
      <>
        <StaticeHeader />
        {memoizedHeader}
      </>
    ),
    [memoizedHeader],
  );

  const ListFooterComponent = useCallback(() => {
    return (
      <View style={styles.footerContainer}>
        <Applogo />
      </View>
    );
  }, []);

  const getItemLayout = useCallback(
    (_, index) => ({
      length: 200,
      offset: 200 * index,
      index,
    }),
    [],
  );

  return (
    <Wrapper
      useTopInsets={true}
      childrenStyles={{width}}
      safeAreaContainerStyle={{}}>
      <FlatList
        ref={flatListRef}
        data={[]}
        keyExtractor={item => item.key}
        renderItem={renderSectionItem}
        ListHeaderComponent={renderFlatListHeader}
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        refreshing={ourBestLoading}
        // onRefresh={fetchProducts}
        ListFooterComponent={ListFooterComponent}
        getItemLayout={getItemLayout}
      />
    </Wrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  carouselContainer: {
    height: height * 0.2,
    marginTop: verticalScale(12),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: scale(13),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },
  bestProductsTitle: {
    fontSize: scale(16),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.primaryAppColor,
  },
  viewAllTitle: {
    fontSize: scale(12),
    fontFamily: GABRITO_MEDIUM,
    color: COLORS.primaryTextColor,
  },
  flatListContainer: {
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: verticalScale(12),
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
