import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar, TextInput, Animated, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/i18n';
import api from '../services/api/api';
import { Colors } from '../constants/Theme';

export default function ProductDetailsScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const { user, language } = useSelector(state => state.auth);
  const { isDark } = useSelector(state => state.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  const userProfile = user?.bodyProfile;
  const [selectedSize, setSelectedSize] = useState(product.sizeAvailable?.[0] || 'M');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${product._id}`);
      setReviews(res.data);
    } catch(err) {
      console.log('Error fetching reviews', err);
    }
  };

  const submitReview = async () => {
    if(!user) return Alert.alert('Error', 'Please login to review');
    try {
      await api.post('/reviews', { userId: user._id || user.id, productId: product._id, rating: Number(rating), comment: reviewText });
      setReviewText('');
      fetchReviews();
      Alert.alert('Success', 'Review added!');
    } catch(err) {
      Alert.alert('Error', 'Could not submit review');
    }
  };

  const getSmartSize = () => {
    if (!userProfile?.height || !userProfile?.weight) return null;
    const { height, weight } = userProfile;
    if (height > 180 && weight > 80) return 'XL';
    if (height > 175 && weight > 70) return 'L';
    if (height > 165 && weight > 60) return 'M';
    return 'S';
  };

  const recommendedSize = getSmartSize();

  const handleAddToCart = async () => {
    dispatch(addToCart({ ...product, selectedSize })); 
    try {
      if(user) await api.post('/cart/add', { userId: user._id || user.id, productId: product._id, quantity: 1 });
    } catch (e) { console.log('Server cart sync issue'); }
    
    if (Platform.OS === 'web') {
       window.alert(`Added ${product.name || 'Product'} to Cart!`);
       navigation.navigate('Main', { screen: 'Cart' });
    } else {
       Alert.alert('Added to Cart', `${product.name || 'Product'} size ${selectedSize} added to your cart.`, [
         { text: 'View Cart', onPress: () => navigation.navigate('Main', { screen: 'Cart' }) },
         { text: 'Keep Shopping', style: 'cancel' }
       ]);
    }
  };

  const handleWishlist = async () => {
    if(!user) return Alert.alert('Error', 'Please login first');
    try {
      await api.post('/wishlist/add', { userId: user._id || user.id, productId: product._id });
      Alert.alert('Wishlist', 'Item successfully added to your wishlist!');
    } catch(err) {
      Alert.alert('Wishlist', 'Item might already be in your wishlist!');
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Animated.View style={[styles.headerBlur, { opacity: headerOpacity, backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.primary }]}>{product.name.toUpperCase()}</Text>
      </Animated.View>

      <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.backBtnText, { color: theme.primary }]}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView 
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <Image source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/300' }} style={styles.image} />
        <LinearGradient colors={['transparent', theme.background]} style={styles.imageOverlay} />
        
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <Text style={[styles.name, { color: theme.text }]}>{product.name || 'Product'}</Text>
              <Text style={[styles.category, { color: theme.textMuted }]}>{(product.category || 'Collection').toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={[styles.wishBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={handleWishlist}>
              <Text style={styles.heartIcon}>❤️</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
            <Text style={[styles.price, { color: theme.primary, marginTop: 0 }]}>LKR {product.price || 0}</Text>
            <View style={[
              styles.stockBadgeDetail, 
              { backgroundColor: (product.stock > 0) ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderColor: (product.stock > 0) ? '#22C55E' : '#EF4444' }
            ]}>
              <Text style={[styles.stockTextDetail, { color: (product.stock > 0) ? '#22C55E' : '#EF4444' }]}>
                {(product.stock > 0) ? 'IN STOCK' : 'OUT OF STOCK'}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.primary }]}>{t(language, 'selectSize').toUpperCase()}</Text>
          <View style={styles.sizeContainer}>
            {(product.sizeAvailable || product.sizes || ['S','M','L']).map(size => (
              <TouchableOpacity 
                key={size} 
                style={[
                  styles.sizeBtn, 
                  { borderColor: theme.border },
                  selectedSize === size && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeText, 
                  { color: theme.primary },
                  selectedSize === size && { color: '#000' }
                ]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {recommendedSize && (
            <View style={[styles.smartSizeCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
              <Text style={[styles.smartSize, { color: theme.primary }]}>{t(language, 'smartRec')} {recommendedSize}</Text>
            </View>
          )}

          <Text style={[styles.description, { color: theme.textSub }]}>{product.description}</Text>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.reviewSection}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>REVIEWS ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={[styles.noReviews, { color: theme.textMuted }]}>No reviews yet. Be the first to share your experience!</Text>
            ) : (
              reviews.map(r => (
                <View key={r._id} style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewUser, { color: theme.text }]}>{r.userId?.name || 'User'}</Text>
                    <Text style={styles.rating}>{'⭐'.repeat(r.rating)}</Text>
                  </View>
                  <Text style={[styles.reviewText, { color: theme.textSub }]}>{r.comment}</Text>
                </View>
              ))
            )}
            
            <View style={[styles.addReviewBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.primary }]}>WRITE A REVIEW</Text>
              <View style={styles.reviewInputs}>
                <TextInput 
                  style={[styles.ratingInput, { backgroundColor: theme.background, color: theme.primary, borderColor: theme.border }]} 
                  placeholder="5" 
                  placeholderTextColor={theme.textMuted} 
                  keyboardType="numeric" 
                  value={rating} 
                  onChangeText={setRating} 
                  maxLength={1} 
                />
                <TextInput 
                  style={[styles.reviewInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
                  placeholder="Tell us what you think..." 
                  placeholderTextColor={theme.textMuted} 
                  value={reviewText} 
                  onChangeText={setReviewText} 
                  multiline 
                />
              </View>
              <TouchableOpacity style={[styles.reviewBtn, { backgroundColor: theme.primary }]} onPress={submitReview}>
                <Text style={styles.reviewBtnText}>SUBMIT REVIEW</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      <LinearGradient colors={['transparent', theme.background]} style={styles.bottomBar}>
        <TouchableOpacity 
          style={[
            styles.addBtn, 
            { backgroundColor: theme.primary },
            (product.stock <= 0) && { backgroundColor: theme.textMuted, opacity: 0.5 }
          ]} 
          onPress={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <Text style={styles.addBtnText}>
            {(product.stock > 0) ? t(language, 'addToCart').toUpperCase() : 'OUT OF STOCK'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBlur: { position: 'absolute', top: 0, left: 0, right: 0, height: 100, zIndex: 10, justifyContent: 'flex-end', paddingBottom: 15, alignItems: 'center' },
  headerTitle: { fontWeight: '900', letterSpacing: 2, fontSize: 14 },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 20, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  backBtnText: { fontSize: 20, fontWeight: 'bold' },
  image: { width: '100%', height: 500, resizeMode: 'cover' },
  imageOverlay: { position: 'absolute', top: 300, height: 200, width: '100%' },
  infoContainer: { padding: 25, marginTop: -20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  category: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginTop: 4 },
  wishBtn: { padding: 10, borderRadius: 25, borderWidth: 1 },
  heartIcon: { fontSize: 22 },
  price: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  stockBadgeDetail: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  stockTextDetail: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  divider: { height: 1, marginVertical: 30 },
  sectionTitle: { fontSize: 13, marginBottom: 15, fontWeight: '900', letterSpacing: 2 },
  sizeContainer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  sizeBtn: { padding: 14, borderWidth: 1, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  sizeText: { fontWeight: 'bold' },
  smartSizeCard: { marginTop: 20, padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  smartSize: { fontStyle: 'italic', fontSize: 13, fontWeight: '500' },
  description: { marginTop: 10, lineHeight: 26, fontSize: 16, letterSpacing: 0.3 },
  reviewSection: { marginTop: 10 },
  noReviews: { fontStyle: 'italic' },
  reviewCard: { padding: 18, borderRadius: 12, marginBottom: 15, borderWidth: 1 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewUser: { fontWeight: 'bold' },
  rating: { fontSize: 12 },
  reviewText: { lineHeight: 20 },
  addReviewBox: { marginTop: 40, padding: 20, borderRadius: 12 },
  reviewInputs: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  ratingInput: { width: 50, textAlign: 'center', borderRadius: 8, borderWidth: 1, fontWeight: 'bold' },
  reviewInput: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, height: 50 },
  reviewBtn: { padding: 15, borderRadius: 8, alignItems: 'center' },
  reviewBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 25, paddingTop: 40 },
  addBtn: { padding: 20, borderRadius: 12, alignItems: 'center', elevation: 10 },
  addBtnText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 2 }
});
