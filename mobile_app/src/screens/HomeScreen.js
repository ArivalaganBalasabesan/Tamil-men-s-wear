import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  RefreshControl, StatusBar, Dimensions, Animated, ActivityIndicator, Image
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import api from '../api/api';
import { Colors, Shadows, Radius, Spacing } from '../constants/Theme';

const { width } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  shirts:'👔', pants:'👖', suits:'🤵', traditional:'🧣',
  formal:'💼', casual:'👕', ethnic:'🎭', accessories:'👜', innerwear:'🩲',
};

const OCCASIONS = [
  { id: '1', name: 'Wedding', icon: 'heart', color: '#D4AF37' },
  { id: '2', name: 'Office', icon: 'briefcase', color: '#1A1A1A' },
  { id: '3', name: 'Casual', icon: 'shirt', color: '#B87333' },
  { id: '4', name: 'Party', icon: 'wine', color: '#800000' },
  { id: '5', name: 'Festival', icon: 'sparkles', color: '#B8860B' },
  { id: '6', name: 'Traditional', icon: 'ribbon', color: '#8B4513' },
];

// ── Skeleton loader ───────────────────────────────────────────
function SkeletonCard({ isDark }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const bg = isDark ? '#1E1E1E' : '#E0E0E0';
  return (
    <Animated.View style={[styles.skeletonCard, { opacity: pulse, backgroundColor: bg }]}>
      <View style={[styles.skeletonImg, { backgroundColor: isDark ? '#2A2A2A' : '#D0D0D0' } ]} />
      <View style={[styles.skeletonLine1, { backgroundColor: isDark ? '#2A2A2A' : '#D0D0D0' }]} />
      <View style={[styles.skeletonLine2, { backgroundColor: isDark ? '#2A2A2A' : '#D0D0D0' }]} />
    </Animated.View>
  );
}


// ── Product Card ──────────────────────────────────────────────
function ProductCard({ item, onPress, onWishlist, isWishlisted, isDark }) {
  const discount = item.discount || 0;
  const original = discount > 0 ? Math.round(item.price / (1 - discount / 100)) : null;
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
      <View style={[styles.productImageBox, { backgroundColor: theme.surface }]}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        ) : (
          <Text style={styles.productEmoji}>
            {CATEGORY_EMOJIS[item.category?.toLowerCase()] || '👔'}
          </Text>
        )}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        {item.featured && (
          <View style={[styles.featuredBadge, { backgroundColor: Colors.accent }]}>
            <Icon name="star" size={8} color="#000" />
            <Text style={styles.featuredText}>Premium</Text>
          </View>
        )}
        <TouchableOpacity style={styles.wishlistBtn} onPress={onWishlist}>
          <Icon name={isWishlisted ? 'heart' : 'heart-outline'} size={16}
            color={isWishlisted ? Colors.error : '#FFF'} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productCat, { color: theme.textMuted }]}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.productPrice, { color: Colors.accent }]}>₹{item.price?.toLocaleString()}</Text>
          {original && <Text style={styles.originalPrice}>₹{original.toLocaleString()}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const dispatch   = useDispatch();
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const wishlist   = useSelector(s => s.wishlist.items);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured,   setFeatured]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activecat,  setActiveCat]  = useState('All');
  const [filtered,   setFiltered]   = useState([]);

  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    setFiltered(
      activecat === 'All'
        ? products
        : products.filter(p => p.category?.toLowerCase() === activecat.toLowerCase())
    );
  }, [activecat, products]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      const prods = prodRes.data || [];
      setProducts(prods);
      setFiltered(prods);
      setFeatured(prods.filter(p => p.featured || p.stock > 20).slice(0, 5));
      setCategories([{ _id: 'all', name: 'All' }, ...(catRes.data || [])]);
    } catch (e) { console.error('HomeScreen fetch error:', e.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const isWishlisted = (productId) =>
    wishlist.some(w => (w.productId?._id || w.productId) === productId);

  const renderHeader = () => (
    <View>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textMuted }]}>
            வணக்கம், {user?.name?.split(' ')[0] || 'Guest'} 👋
          </Text>
          <Text style={[styles.brand, { color: theme.primary }]}>
            தமிழ் <Text style={{ color: theme.text, fontWeight: '300' }}>MEN'S WEAR</Text>
          </Text>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.card }, shadow]}
            onPress={() => dispatch(toggleTheme())}
          >
            <Icon name={isDark ? 'sunny-outline' : 'moon-outline'} size={20}
              color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Icon name="search-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart-outline" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Banner */}
      <LinearGradient colors={[Colors.primary, '#2C2C2C']} style={styles.heroBanner}>
        <View style={styles.heroLeft}>
          <Text style={[styles.heroTag, { color: Colors.accent }]}>FESTIVAL COLLECTION 2026</Text>
          <Text style={styles.heroTitle}>Elegance in{'\n'}Every Stitch</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.heroBtn}
          >
            <LinearGradient colors={[Colors.accent, '#B8960C']} style={styles.heroBtnGrad}>
              <Text style={styles.heroBtnText}>Discover</Text>
              <Icon name="arrow-forward" size={14} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={styles.heroRight}>
          <Text style={styles.heroEmoji}>👑</Text>
          <View style={[styles.heroBadge, { backgroundColor: Colors.copper }]}>
            <Text style={styles.heroBadgeDisc}>PREMIUM</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Occasions */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Shop by Occasion</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.occasionRow}>
        {OCCASIONS.map(occ => (
          <TouchableOpacity key={occ.id} style={styles.occItem}>
            <View style={[styles.occCircle, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Icon name={occ.icon} size={24} color={occ.color} />
            </View>
            <Text style={[styles.occName, { color: theme.text }]}>{occ.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category Chips */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={[styles.seeAll, { color: Colors.accent }]}>See All →</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={i => i._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveCat(item.name)}
            style={[
              styles.catChip,
              { backgroundColor: theme.card, borderColor: theme.border },
              activecat === item.name && { backgroundColor: Colors.accent, borderColor: Colors.accent },
            ]}
          >
            {item.name !== 'All' && (
              <Text style={styles.catChipEmoji}>
                {CATEGORY_EMOJIS[item.name.toLowerCase()] || '👔'}
              </Text>
            )}
            <Text style={[
              styles.catChipText,
              { color: theme.textSub },
              activecat === item.name && { color: '#000', fontWeight: '700' },
            ]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Products Header */}
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          New Arrivals
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background} />

      {loading ? (
        <>
          {renderHeader()}
          <View style={styles.skeletonGrid}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} isDark={isDark} />)}
          </View>
        </>
      ) : (
        <FlatList
          data={filtered}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              onWishlist={() => {}}
              isWishlisted={isWishlisted(item._id)}
              isDark={isDark}
            />
          )}
          keyExtractor={i => i._id}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16, marginBottom: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }}
              tintColor={Colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No products found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  greeting:         { fontSize: 11, letterSpacing: 0.5 },
  brand:            { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  topActions:       { flexDirection: 'row', gap: 10 },
  iconBtn:          { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  heroBanner:       { marginHorizontal: 16, marginVertical: 12, borderRadius: Radius.lg, padding: 24, flexDirection: 'row', alignItems: 'center' },
  heroLeft:         { flex: 1, gap: 10 },
  heroTag:          { fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle:        { color: '#FFF', fontSize: 26, fontWeight: '900', lineHeight: 32 },
  heroBtn:          { alignSelf: 'flex-start', marginTop: 8 },
  heroBtnGrad:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: Radius.full },
  heroBtnText:      { color: '#000', fontWeight: '700', fontSize: 13 },
  heroRight:        { alignItems: 'center', gap: 10 },
  heroEmoji:        { fontSize: 60 },
  heroBadge:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  heroBadgeDisc:    { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sectionHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle:     { fontSize: 18, fontWeight: '800' },
  seeAll:           { fontSize: 13, fontWeight: '600' },
  occasionRow:      { paddingHorizontal: 16, gap: 15 },
  occItem:          { alignItems: 'center', gap: 8 },
  occCircle:        { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  occName:          { fontSize: 11, fontWeight: '600' },
  catChip:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.full, borderWidth: 1 },
  catChipEmoji:     { fontSize: 15 },
  catChipText:      { fontSize: 13, fontWeight: '500' },
  productCard:      { flex: 1, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1 },
  productImageBox:  { height: 170, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  productImage:     { width: '100%', height: '100%', resizeMode: 'cover' },
  productEmoji:     { fontSize: 60 },
  discountBadge:    { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText:     { color: '#FFF', fontSize: 9, fontWeight: '800' },
  featuredBadge:    { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignItems: 'center' },
  featuredText:     { color: '#000', fontSize: 9, fontWeight: '800' },
  wishlistBtn:      { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#00000040', justifyContent: 'center', alignItems: 'center' },
  productInfo:      { padding: 12 },
  productName:      { fontSize: 14, fontWeight: '700' },
  productCat:       { fontSize: 10, textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },
  priceRow:         { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  productPrice:     { fontWeight: '900', fontSize: 16 },
  originalPrice:    { color: '#999', fontSize: 12, textDecorationLine: 'line-through' },
  skeletonGrid:     { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  skeletonCard:     { width: (width - 44) / 2, borderRadius: Radius.md, overflow: 'hidden' },
  skeletonImg:      { height: 170 },
  skeletonLine1:    { height: 14, margin: 12, borderRadius: 7 },
  skeletonLine2:    { height: 12, marginHorizontal: 12, marginBottom: 12, borderRadius: 6, width: '50%' },
  empty:            { alignItems: 'center', paddingTop: 80 },
  emptyEmoji:       { fontSize: 50, marginBottom: 15 },
  emptyText:        { fontSize: 15, fontWeight: '500' },
});
