import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Image,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Wrapper from '../../components/wrapper';
import {getSearchAction} from '../../../redux/action';
import TextInputComp from '../../components/textInputComp';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';
import {width, height} from '../../hooks/responsive';
import {COLORS} from '../../../res/colors';
import Icon from '../../../utils/icon';
import {useNavigation} from '@react-navigation/native';
import TextComp from '../../components/textComp';
import {SCREEN} from '..';
import {IMAGES} from '../../../res/images';
import {GABRITO_MEDIUM} from '../../../../assets/fonts';
import Toast from 'react-native-simple-toast';

import Header from '../../components/Header';

const DEBOUNCE_DELAY = 500;
const VariantModal = ({product, quantities, onClose, renderItem, userData}) => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);

  // console.log('cartItems==========>', cartItems);
  // console.log('product==========>', product?.variants);
  const mergedVariants = product?.variants.map(variant => {
    const variantKey = `${variant.products_id}_${variant.id}`;
    const cartItem = cartItems.find(item => item.variantId === variantKey);

    // Replace with cartItem if found, else keep original variant
    return cartItem ? {...variant, ...cartItem} : variant;
  });

  console.log('mergedVariants==========>', mergedVariants);

  const handleSubmit = () => {
    let hasQuantity = true;

    const updatedVariants = product.variants.map(variant => {
      const key = `${variant.products_id}_${variant.id}`;
      const orderQuantity = quantities[key] || 0;

      const existingItem = cartItems.find(
        cartItem => cartItem.variantId === key,
      );
      const totalOrderQuantity = existingItem
        ? existingItem.orderQuantity + orderQuantity
        : orderQuantity;

      if (orderQuantity > 0) {
        hasQuantity = true;
      }

      return {
        id: variant.id,
        variantId: key,
        orderQuantity: totalOrderQuantity,
        multiple: true,
        maxLimitReached: false,
        variant: {
          product_name: product?.product_name,
          display_image: product?.display_image,
          orderQuantity: totalOrderQuantity,
          stock_discount_count: Number(variant?.details?.stock ?? 0),
          stepsize: Number(variant?.details?.stepsize ?? 1),
          instockCount: Number(variant?.details?.quantity ?? 0),
          ...variant,
          warranty: product?.warranty,
          tax: product?.tax,
          units: product?.units,
          brand: product?.brand,
          categories: product?.categories,
        },
      };
    });

    if (!hasQuantity) {
      Toast.show('Please select at least one variant');
      return;
    }

    updatedVariants.forEach(item => {
      const {id, variantId, orderQuantity} = item;
      if (!orderQuantity) return;

      const existingItem = cartItems.find(
        cartItem => cartItem.variantId === variantId,
      );

      if (existingItem) {
        dispatch(
          updateCartItem({
            id: existingItem.id,
            updates: {
              orderQuantity: item.orderQuantity,
            },
          }),
        );
        Toast.show('Product updated in the cart');
      } else {
        dispatch(addToCart(item));
        Toast.show('Added to cart');
      }
    });

    onClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <TextComp
          style={styles.modalTitle}>{`${product?.product_name}`}</TextComp>
        <TextComp
          style={
            styles.modalSubTitle
          }>{`HSN Code:${product?.hsn_code}`}</TextComp>
        <Image
          source={{uri: product.display_image}}
          style={styles.modalImage}
          resizeMode="cover"
        />
        {product.variants?.length > 0 ? (
          <>
            <View style={styles.variantHeader}>
              <TextComp style={styles.variantHeaderText}>Size</TextComp>
              <TextComp style={styles.variantHeaderText}>Price</TextComp>
              <TextComp style={styles.variantHeaderText}>Qty</TextComp>
            </View>
            <FlatList
              data={mergedVariants}
              keyExtractor={item => `${item.products_id}_${item.id}`}
              renderItem={({item, index}) => renderItem({item, index})}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <TextComp style={styles.noVariantsText}>No variants</TextComp>
        )}
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <TextComp style={styles.buttonText}>Cancel</TextComp>
          </TouchableOpacity>
          {product.variants?.length > 0 && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}>
              <TextComp style={styles.buttonText}>Submit</TextComp>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const MemoizedRenderItem = React.memo(
  ({
    id,
    item,
    getQuantity,
    onIncrease,
    onDecrease,
    selectedProduct,
    showPrice,
  }) => {
    const quantity = getQuantity(id);
    const size = item?.details?.size;
    const stepsize = item?.details?.stepsize;
    const stock = Number(item?.details?.quantity || 0);

    const getPriceWithTax = useCallback(() => {
      const rawPrice = item?.details?.price;

      const basePrice = parseFloat(rawPrice);
      if (isNaN(basePrice)) return 0;
      const taxRate = Number(selectedProduct?.tax?.igst || 0);
      const taxAmount = (basePrice * taxRate) / 100;
      return (basePrice + taxAmount).toFixed(2);
    }, [item]);

    return (
      <View style={styles.variantItem}>
        <View style={styles.sizeContainer}>
          <TextComp
            style={{
              color: item?.maxLimitReached
                ? 'orange'
                : quantity >= stock
                ? COLORS.red
                : COLORS.secondaryAppColor,
            }}
            numberOfLines={1}>
            {size}
          </TextComp>
        </View>
        <View style={styles.priceContainer}>
          <TextComp numberOfLines={1}>
            ₹{showPrice ? getPriceWithTax() : '...'}
          </TextComp>
        </View>
        <View style={styles.quantityContainer}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={{
                // borderWidth: 1,
                height: 45,
                width: 45,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                left: 0,
              }}
              onPress={() => {
                if (item?.maxLimitReached) {
                  onDecrease(id, stepsize, quantity);
                  // dispatch(
                  //   updateCartItem({
                  //     id: item.id,
                  //     updates: {
                  //       maxLimitReached: false,
                  //     },
                  //   }),
                  // );
                } else {
                  onDecrease(id, stepsize, quantity);
                }
              }}>
              <Icon
                type="AntDesign"
                name="minus"
                size={scale(14)}
                color={COLORS.black}
              />
            </TouchableOpacity>

            <View style={styles.quantityValue}>
              <TextComp style={{fontSize: scale(12)}}>{quantity}</TextComp>
            </View>

            <TouchableOpacity
              style={{
                // borderWidth: 1,
                height: 45,
                width: 45,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: 0,
              }}
              onPress={() => {
                const limit =
                  item?.variant?.details?.quantity ??
                  item?.details?.quantity ??
                  0;

                if (quantity < limit) {
                  // console.log(
                  //   'item?.details?.quantity',
                  //   item?.details?.quantity,
                  // );
                  // console.log(
                  //   'item?.variant?.details?.quantity',
                  //   item?.variant?.details?.quantity,
                  // );
                  // console.log('quantity', quantity);
                  onIncrease(id, stepsize, quantity);
                } else {
                  // dispatch(
                  //   updateCartItem({
                  //     id: item.id,
                  //     updates: {
                  //       maxLimitReached: true,
                  //     },
                  //   }),
                  // );
                  Toast.show('Maximum stock limit reached!');
                }
              }}>
              <Icon
                type="AntDesign"
                name="plus"
                size={scale(14)}
                color={COLORS.black}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.getQuantity(prev.id) === next.getQuantity(next.id),
);

const ProductItem = React.memo(
  ({
    item,
    onPress,
    onMorePress,
    toggleLike,
    addToCart,
    dispatch,
    showPrice,
  }) => {
    const favorites = useSelector(state => state.favorites.items);
    const cartItems = useSelector(state => state.cart.items);
    const userData = useSelector(state => state.userData.userData);

    const itemInCart = cartItems.find(cartItem => {
      if (Array.isArray(item.variants) && item.variants.length === 0) {
        return String(cartItem?.id) === String(item?.id);
      }
    });
    // console.log('==========>itemInCart', itemInCart);
    const mergedItem = itemInCart ? {...item, ...itemInCart} : item;
    // console.log('==========>itemInCart', mergedItem);

    const isLiked = favorites.some(fav => fav.id === mergedItem.id);
    const isInCart = cartItems.some(
      cartItem =>
        cartItem.hsn_code === mergedItem.hsn_code &&
        cartItem.id === mergedItem.id,
    );

    const getPriceWithTax = useCallback(
      (variant = null) => {
        const basePrice = parseFloat(
          variant?.details?.price || mergedItem.price || 0,
        );
        const taxObj = mergedItem.tax;
        const taxRate = Number(taxObj?.igst || 0);
        const taxAmount = (basePrice * taxRate) / 100;
        return (basePrice + taxAmount).toFixed(2); // keeps 2 decimal places
      },
      [mergedItem, userData],
    );

    console.log('mergedItem=========>1', mergedItem);

    return (
      <View>
        <View style={styles.productContainer}>
          <TouchableOpacity
            onPress={() => onPress(mergedItem)}
            style={styles.imageContainer}>
            <Image
              source={
                mergedItem?.display_image
                  ? {uri: mergedItem.display_image}
                  : IMAGES.NO_PRODUCT_IMG
              }
              style={styles.productImage}
              resizeMode="contain"
            />
            {mergedItem?.new_products && (
              <View style={styles.bestProductBadge}>
                <Image
                  source={IMAGES.NEW_PRODUCT_ICON}
                  style={styles.badgeIcon}
                  resizeMode="contain"
                />
              </View>
            )}
            {mergedItem?.variants.length <= 0 &&
              mergedItem?.quantity <
                // mergedItem?.stepsize
                1 && (
                <View style={styles.outOfStockCard}>
                  <Image
                    source={IMAGES.outOfStock}
                    style={styles.outOfStocks}
                    resizeMode="contain"
                  />
                </View>
              )}
          </TouchableOpacity>
          <View style={styles.detailsContainer}>
            <View style={styles.headerRow}>
              <View style={styles.textContainer}>
                <TextComp style={styles.brandText}>
                  {mergedItem?.brand?.name}
                </TextComp>
                <TextComp numberOfLines={2} style={styles.productName}>
                  {mergedItem?.product_name}
                </TextComp>
                <View style={styles.priceRow}>
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    <TextComp style={[styles.rupeeSymbol]}>₹</TextComp>
                    <TextComp style={styles.priceText}>
                      {showPrice
                        ? mergedItem.variants.length > 0
                          ? getPriceWithTax(mergedItem.variants[0])
                          : getPriceWithTax()
                        : '...'}
                    </TextComp>
                  </View>
                  {!isInCart ? (
                    <TouchableOpacity
                      disabled={
                        mergedItem?.variants?.length <= 0 &&
                        mergedItem?.quantity < 1
                      }
                      onPress={() => addToCart(mergedItem)}
                      style={[
                        styles.cartButton,
                        {
                          backgroundColor:
                            mergedItem?.variants?.length > 0
                              ? 'black'
                              : mergedItem?.quantity < 1
                              ? 'rgba(0, 0, 0, 0.5)'
                              : 'black',
                        },
                      ]}>
                      <TextComp style={styles.cartButtonText}>
                        Add to Cart
                      </TextComp>
                    </TouchableOpacity>
                  ) : (
                    <>
                      {!mergedItem?.multiple ? (
                        <View style={[styles.cartButton]}>
                          <TouchableOpacity
                            onPress={() => {
                              if (mergedItem?.orderQuantity > 1) {
                                dispatch(
                                  updateCartItem({
                                    id: mergedItem.id,
                                    updates: {
                                      orderQuantity:
                                        mergedItem.orderQuantity -
                                        Number(mergedItem?.stepsize),
                                      maxLimitReached: false,
                                    },
                                  }),
                                );
                              } else if (mergedItem?.orderQuantity === 1) {
                                dispatch(removeFromCart(mergedItem.id));
                                Toast.show('Removed from cart');
                              }
                            }}
                            style={{
                              padding: 8,
                              height: 45,
                              width: 45,
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              left: 0,
                            }}>
                            <Icon
                              type="AntDesign"
                              name="minus"
                              color={COLORS.white}
                              size={22}
                            />
                          </TouchableOpacity>

                          <View
                            style={{position: 'absolute', alignSelf: 'center'}}>
                            <TextComp
                              style={[
                                styles.cartButtonText,
                                {
                                  fontSize: scale(14),
                                  fontWeight: '700',
                                },
                              ]}>
                              {mergedItem?.orderQuantity}
                            </TextComp>
                          </View>

                          <TouchableOpacity
                            style={{
                              padding: 8,
                              height: 45,
                              width: 45,
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'absolute',
                              right: 0,
                            }}
                            onPress={() => {
                              if (
                                mergedItem?.orderQuantity <
                                Number(mergedItem?.instockCount)
                              ) {
                                dispatch(
                                  updateCartItem({
                                    id: mergedItem.id,
                                    updates: {
                                      orderQuantity:
                                        mergedItem.orderQuantity +
                                        Number(mergedItem?.stepsize),
                                    },
                                  }),
                                );
                              } else {
                                Toast.show('Maximum stock limit reached');
                                dispatch(
                                  updateCartItem({
                                    id: mergedItem.id,
                                    updates: {
                                      maxLimitReached: true,
                                    },
                                  }),
                                );
                              }
                            }}>
                            <Icon
                              type="AntDesign"
                              name="plus"
                              color={COLORS.white}
                              size={22}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          // disabled={
                          //   mergedItem?.variants?.length <= 0 &&
                          //   mergedItem?.quantity < 1
                          // }
                          onPress={() => addToCart(mergedItem)}
                          style={[
                            styles.cartButton,
                            {
                              backgroundColor:
                                mergedItem?.variants?.length > 0
                                  ? 'black'
                                  : mergedItem?.quantity < 1
                                  ? 'rgba(0, 0, 0, 0.5)'
                                  : 'black',
                            },
                          ]}>
                          <TextComp style={styles.cartButtonText}>
                            Add to Cart
                          </TextComp>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
                <TextComp style={styles.taxText}> Incl GST</TextComp>

                {mergedItem.variants?.length > 0 ? (
                  <View style={styles.variantInfo}>
                    <TextComp numberOfLines={1} style={styles.sizeText}>
                      {`Size: ${
                        mergedItem.variants[0]?.details?.size || 'N/A'
                      }`}
                    </TextComp>
                    <TextComp
                      onPress={() => onMorePress(mergedItem)}
                      style={styles.moreText}>
                      More
                    </TextComp>
                  </View>
                ) : mergedItem?.sizes ? (
                  <View style={styles.variantInfo}>
                    <TextComp numberOfLines={1} style={styles.sizeText}>
                      {`Size: ${mergedItem?.sizes || 'N/A'}`}
                    </TextComp>
                  </View>
                ) : null}
                {mergedItem?.maxLimitReached && (
                  <TextComp style={[styles.cartButtonText, {color: 'orange'}]}>
                    {'Maximum stock limit reached'}
                  </TextComp>
                )}
              </View>
              <TouchableOpacity
                onPress={() => toggleLike(mergedItem)}
                style={styles.heartButton}>
                <Icon
                  type="AntDesign"
                  name="heart"
                  size={scale(22)}
                  color={isLiked ? COLORS.red : COLORS.secondaryAppColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

const SearchResults = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userData = useSelector(state => state.userData.userData);
  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const favorites = useSelector(state => state.favorites.items);
  const cartItems = useSelector(state => state.cart.items);
  const showPrice = useSelector(state => state.togglePrice.showPrice);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantQuantities, setVariantQuantities] = useState({});

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedText(searchText);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // Perform search
  useEffect(() => {
    if (!debouncedText.trim()) {
      setResults([]);
      return;
    }

    const payload = {search: debouncedText};
    setLoading(true);

    dispatch(
      getSearchAction(payload, res => {
        try {
          if (res?.status) {
            const products = (res?.data?.products || []).map(item => ({
              ...item,
              type: 'product',
            }));
            setResults(products);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }),
    );
  }, [debouncedText]);

  const navigateToSingleProductScreen = useCallback(
    item => {
      navigation.navigate(SCREEN.SINGLE_PRODUCT_SCREEN, {item});
    },
    [navigation],
  );
  const toggleLike = useCallback(
    item => {
      const isAlreadyInFavorites = favorites.some(fav => fav.id === item.id);
      if (isAlreadyInFavorites) {
        dispatch(removeFromFavourites(item.id));
        Toast.show('Item removed from favourites');
      } else {
        dispatch(addToFavourites(item));
        Toast.show('Item added to favourites');
      }
    },
    [dispatch, favorites],
  );
  const increaseQuantity = useCallback((key, stepsize = 1) => {
    const step = Math.max(parseInt(stepsize), 1);
    setVariantQuantities(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + step,
    }));
  }, []);

  const decreaseQuantity = useCallback(
    (key, stepsize = 1, orderQuantity = 0) => {
      const step = Math.max(parseInt(stepsize), 1);
      setVariantQuantities(prev => {
        const newChange = (prev[key] || 0) - step;
        // prevent reducing below zero total (cart value + local change)
        const baseOrderQty =
          cartItems.find(item => item.variantId === key)?.orderQuantity || 0;
        const totalQty = baseOrderQty + newChange;
        return {
          ...prev,
          [key]: totalQty < 0 ? -baseOrderQty : newChange,
        };
      });
    },
    [cartItems],
  );

  const getQuantity = useCallback(
    key => {
      const baseOrderQty =
        cartItems.find(item => item.variantId === key)?.orderQuantity || 0;
      const localChange = variantQuantities[key] || 0;
      return Math.max(0, baseOrderQty + localChange);
    },
    [variantQuantities, cartItems],
  );

  const renderVariantItem = useCallback(
    ({item, index}) => {
      const key = `${selectedProduct?.id}_${item.id}`;
      return (
        <MemoizedRenderItem
          key={key}
          id={key}
          item={item}
          getQuantity={getQuantity}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
          selectedProduct={selectedProduct}
          showPrice={showPrice}
        />
      );
    },
    [
      selectedProduct,
      getQuantity,
      increaseQuantity,
      decreaseQuantity,
      showPrice,
    ],
  );
  const handleAddToCart = useCallback(
    item => {
      if (item?.variants?.length > 0) {
        setSelectedProduct(item);
        // console.log('======>item======>>>>', item);
        setShowVariantModal(true);
      } else {
        console.log('======>item======>>>>', item);
        const productToAdd = {
          ...item,
          orderQuantity: item.size ? Number(item.size) : 1,
          stock_discount_count: Number(item.stock), // renamed for clarity
          multipleSize:
            Array.isArray(item.variants) && item.variants.length > 0,
          stepsize: item.size ? Number(item.size) : 1,
          instockCount: Number(item.quantity),
          maxLimitReached: false,
          multiple: false,
        };

        // console.log('=====>', productToAdd);
        dispatch(addToCart(productToAdd));
        Toast.show('Added to cart');
      }
    },
    [dispatch, navigation, userData],
  );

  // Render product item
  const renderProductItem = useCallback(
    ({item}) => (
      <ProductItem
        item={item}
        onPress={navigateToSingleProductScreen}
        onMorePress={item => {
          setSelectedProduct(item);
          setShowVariantModal(true);
        }}
        toggleLike={toggleLike}
        addToCart={handleAddToCart}
        dispatch={dispatch}
        showPrice={showPrice}
      />
    ),
    [navigateToSingleProductScreen, toggleLike, handleAddToCart, showPrice],
  );
  // Render recent item

  return (
    <Wrapper useTopInsets={true} childrenStyles={{width: width}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          height: verticalScale(55),
        }}>
        <Header onBackPress={() => navigation.goBack()} />
        <View style={{width: 10}} />
        <TextInputComp
          ref={inputRef}
          value={searchText}
          onChangeText={setSearchText}
          placeholder={'🔍Search products...'}
          style={{flex: 1}}
          customBorderColor={COLORS.secondaryAppColor}
          customContainerStyle={{borderRadius: 100}}
          autoFocus={true}
        />
      </View>

      {loading && <ActivityIndicator size="large" style={{marginTop: 20}} />}

      {!loading && debouncedText && results.length === 0 && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: moderateScale(20),
          }}>
          <Icon
            type="MaterialIcons"
            name="search-off"
            size={scale(60)}
            color={COLORS.grey}
            style={{marginBottom: 10}}
          />
          <TextComp
            style={{
              fontSize: scale(20),
              fontWeight: 'bold',
              color: COLORS.secondaryAppColor,
              marginBottom: verticalScale(5),
              textAlign: 'center',
            }}>
            Product Not Available
          </TextComp>
          <TextComp
            style={{
              fontSize: scale(14),
              color: COLORS.grey,
              textAlign: 'center',
              marginBottom: verticalScale(20),
            }}>
            Sorry, we couldn't find any products matching "{debouncedText}"
          </TextComp>
        </View>
      )}

      {!loading && results.length > 0 ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={results}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderProductItem}
          contentContainerStyle={{
            paddingBottom: verticalScale(100),
          }}
        />
      ) : (
        <View style={{alignSelf: 'center', marginTop: verticalScale(100)}}>
          <Image
            source={IMAGES.bigHome}
            style={{height: verticalScale(200), width: verticalScale(200)}}
            resizeMode="contain"
          />
        </View>
      )}
      {showVariantModal && (
        <VariantModal
          product={selectedProduct}
          quantities={variantQuantities}
          onClose={() => {
            setShowVariantModal(false);
            setVariantQuantities({});
          }}
          renderItem={renderVariantItem}
          userData={userData}
        />
      )}
    </Wrapper>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  variantItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyOpacity(0.3),
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeContainer: {
    width: '30%',
    // borderWidth: 1,
    alignItems: 'center',
  },
  priceContainer: {
    width: '30%',
    alignItems: 'center',
    // borderWidth: 1,
  },
  quantityContainer: {
    width: '40%',
    alignItems: 'flex-end',
  },
  quantityControl: {
    width: scale(90),
    // flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.greyOpacity(0.1),
    borderRadius: scale(20),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
  },
  quantityValue: {
    width: scale(24),
    alignItems: 'center',
  },
  productContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.greyOpacity(1),
    overflow: 'hidden',
    paddingVertical: verticalScale(5),
  },
  imageContainer: {
    width: width * 0.92 * 0.4,
    position: 'relative',
    // borderWidth:1
  },
  productImage: {
    width: '100%',
    height: verticalScale(100),
  },
  bestProductBadge: {
    position: 'absolute',
    top: verticalScale(-5),
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  outOfStockCard: {
    position: 'absolute',
    top: verticalScale(-5),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    zIndex: 10,
    alignItems: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  badgeIcon: {
    height: verticalScale(25),
    width: verticalScale(25),
  },
  outOfStocks: {
    width: '100%',
    height: verticalScale(80),
  },
  badgeText: {
    color: COLORS.black,
    fontSize: scale(10),
  },
  detailsContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    paddingLeft: moderateScale(5),
    // borderWidth: 1,
    justifyContent: 'center',
  },
  brandText: {
    fontSize: scale(12),
    marginTop: scale(3),
    color: COLORS.secondaryAppColor,
  },
  ouoFoStockText: {
    fontSize: scale(12),
    marginTop: scale(3),
    color: COLORS.red,
  },
  productName: {
    fontSize: scale(13),
    fontWeight: '900',
    color: COLORS.secondaryAppColor,
    marginBottom: scale(5),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: verticalScale(6),
    // borderWidth: 1,
  },
  priceText: {
    fontSize: scale(15),
    fontWeight: '900',
    color: COLORS.secondaryAppColor,
  },
  rupeeSymbol: {
    fontSize: scale(11),
    fontWeight: '700',
    color: COLORS.secondaryAppColor,
  },
  taxText: {
    fontSize: scale(8),
    color: COLORS.secondaryAppColor,
    marginBottom: scale(5),
  },
  cartButton: {
    backgroundColor: COLORS.black,
    position: 'absolute',
    right: -15,
    borderRadius: scale(30),
    // paddingHorizontal: scale(18),
    // paddingVertical: scale(9),
    height: scale(30),
    width: scale(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    fontSize: scale(10),
    color: COLORS.white,
  },
  variantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeText: {
    fontSize: scale(12),
    color: COLORS.secondaryAppColor,
    maxWidth: width * 0.25,
  },
  moreText: {
    marginLeft: scale(6),
    fontSize: scale(12),
    color: COLORS.blue,
    fontWeight: '800',
  },
  emptySpace: {
    height: 10,
    width: 60,
  },
  heartButton: {
    marginRight: moderateScale(10),
    marginTop: verticalScale(10),
  },

  // Category Styles
  categoryItem: {
    width: (width - scale(13) * 2) / 4 - scale(4),
    alignItems: 'center',
    marginVertical: verticalScale(5),
  },
  categoryImage: {
    height: scale(72),
    width: scale(70),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: COLORS.secondaryAppColor || '#ccc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: scale(4),
    elevation: 7,
    overflow: 'hidden',
  },
  categoryText: {
    fontSize: scale(11),
    marginTop: scale(5),
    textAlign: 'center',
  },

  // Header Styles
  carouselContainer: {
    height: height * 0.2,
    marginTop: verticalScale(12),
  },
  categoryContainer: {
    marginTop: verticalScale(15),
    paddingHorizontal: scale(13),
  },
  categoryTitle: {
    fontSize: scale(14),
    marginBottom: verticalScale(8),
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bestProductsTitle: {
    fontSize: scale(12),
    fontFamily: GABRITO_MEDIUM,
    marginLeft: scale(13),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(10),
  },

  // Scroll to Top Button
  scrollTopButton: {
    position: 'absolute',
    justifyContent: 'center',
    top: verticalScale(60),
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 30,
    zIndex: 100,
    elevation: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollTopText: {
    paddingHorizontal: 5,
    color: COLORS.white,
  },

  // Variant Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height,
    width: width,
    zIndex: 200,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: scale(20),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: scale(10),
    padding: scale(15),
    maxHeight: height * 0.75,
  },
  modalTitle: {
    fontSize: scale(13),
    fontWeight: 'bold',
    // marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  modalSubTitle: {
    fontSize: scale(10),
    fontWeight: '500',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },

  modalImage: {
    width: verticalScale(40),
    height: verticalScale(40),
    alignSelf: 'center',
  },
  variantHeader: {
    flexDirection: 'row',
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyOpacity(0.5),
    marginBottom: verticalScale(5),
  },
  variantHeaderText: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  noVariantsText: {
    textAlign: 'center',
    marginVertical: verticalScale(20),
    color: COLORS.red,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(20),
  },
  cancelButton: {
    backgroundColor: COLORS.greyOpacity(1),
    paddingVertical: scale(10),
    borderRadius: scale(6),
    flex: 1,
    marginRight: scale(10),
  },
  submitButton: {
    backgroundColor: COLORS.primaryAppColor,
    paddingVertical: scale(10),
    borderRadius: scale(6),
    flex: 1,
  },
  buttonText: {
    textAlign: 'center',
    color: COLORS.white,
  },
});
