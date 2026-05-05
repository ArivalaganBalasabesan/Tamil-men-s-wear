import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
  RefreshControl, StatusBar, Dimensions, Image, ActivityIndicator
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/themeSlice';
import api from '../services/api/api';
import { Colors, Shadows, Radius, Spacing } from '../constants/Theme';
import { Product } from '@shared/types';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProducts(prodRes.data || []);
      setCategories([{ _id: 'all', name: 'All' }, ...(catRes.data || [])]);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredProducts = activeCat === 'All' 
    ? products 
    : products.filter(p => p.category?.toLowerCase() === activeCat.toLowerCase());

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: theme.card }]}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: theme.primary }]}>LKR {(item.price || 0).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.textMuted }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Guest'}</Text>
          </View>
          <View style={styles.headerActions}>
             <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => dispatch(toggleTheme())}>
              <Icon name={isDark ? "sunny" : "moon"} size={20} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.navigate('WishlistStack')}>
              <Icon name="heart-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Banner */}
        <TouchableOpacity style={styles.heroWrapper} activeOpacity={0.9}>
          <LinearGradient colors={['#1A1A1A', '#000']} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTag}>NEW ARRIVAL</Text>
              <Text style={styles.heroTitle}>Premium{'\n'}Linen Collection</Text>
              <View style={styles.shopNowBtn}>
                <Text style={styles.shopNowText}>Shop Now</Text>
                <Icon name="arrow-forward" size={16} color="#000" />
              </View>
            </View>
            <View style={styles.heroImagePlaceholder}>
               <Icon name="shirt" size={80} color="rgba(255, 215, 0, 0.2)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat._id} 
                onPress={() => setActiveCat(cat.name)}
                style={[
                  styles.catItem, 
                  activeCat === cat.name && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
              >
                <Text style={[
                  styles.catText, 
                  { color: theme.textSub },
                  activeCat === cat.name && { color: '#000', fontWeight: '700' }
                ]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trending Now</Text>
            <TouchableOpacity><Text style={{ color: theme.primary, fontWeight: '600' }}>See All</Text></TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
          ) : filteredProducts.length === 0 ? (
            <Text style={{ color: theme.textMuted, paddingHorizontal: 24 }}>No products found in this category.</Text>
          ) : (
            <FlatList
              data={filteredProducts.slice(0, 6)}
              renderItem={renderProduct}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productScroll}
            />
          )}
        </View>

        {/* Just For You (Grid) */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Just For You</Text>
          <View style={styles.grid}>
            {filteredProducts.slice(0, 4).map(product => (
               <TouchableOpacity 
                  key={product._id}
                  style={[styles.gridCard, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('ProductDetails', { product })}
                >
                  <Image source={{ uri: product.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.gridImage} />
                  <Text style={[styles.gridName, { color: theme.text }]} numberOfLines={1}>{product.name}</Text>
                  <Text style={[styles.gridPrice, { color: theme.primary }]}>LKR {product.price || 0}</Text>
               </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20
  },
  welcomeText: { fontSize: 13, fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  heroWrapper: { paddingHorizontal: 24, marginVertical: 10 },
  heroCard: { height: 180, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  heroContent: { flex: 1, justifyContent: 'center' },
  heroTag: { color: '#FFD700', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', lineHeight: 30 },
  shopNowBtn: { backgroundColor: '#FFD700', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  shopNowText: { color: '#000', fontWeight: '700', fontSize: 13 },
  heroImagePlaceholder: { position: 'absolute', right: -20, bottom: -10, opacity: 0.5 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 24, marginBottom: 16 },
  catScroll: { paddingHorizontal: 24, gap: 12 },
  catItem: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#eee' },
  catText: { fontSize: 14, fontWeight: '600' },
  productScroll: { paddingHorizontal: 24, gap: 16 },
  productCard: { width: 160, borderRadius: 20, overflow: 'hidden' },
  productImage: { width: '100%', height: 200, resizeMode: 'cover' },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600' },
  productPrice: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, gap: 16, marginTop: 16 },
  gridCard: { width: (width - 64) / 2, borderRadius: 20, padding: 10 },
  gridImage: { width: '100%', height: 150, borderRadius: 12, marginBottom: 10 },
  gridName: { fontSize: 13, fontWeight: '600' },
  gridPrice: { fontSize: 14, fontWeight: '800', marginTop: 4 },
});

export default HomeScreen;
