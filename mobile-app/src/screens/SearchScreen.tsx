import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions, Animated, StatusBar, Image
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import api from '../services/api/api';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Colors, Shadows } from '../constants/Theme';

const { width } = Dimensions.get('window');

const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];

export default function SearchScreen({ route }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;
  const navigation = useNavigation();
  
  const initialCategory = route?.params?.category || 'All';
  const [query,      setQuery]      = useState('');
  const [products,   setProducts]   = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [category,   setCategory]   = useState(initialCategory);
  const [categories, setCategories] = useState(['All']);
  const [sortBy,     setSortBy]     = useState('Newest');
  const [showFilter, setShowFilter] = useState(false);
  const [minPrice,   setMinPrice]   = useState('');
  const [maxPrice,   setMaxPrice]   = useState('');

  const filterAnim = useRef(new Animated.Value(0)).current;
  const inputRef   = useRef(null);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);
  
  useEffect(() => {
    if (route?.params?.category) {
      setCategory(route.params.category);
    }
  }, [route?.params?.category]);

  useEffect(() => { applyFilters(); }, [query, category, sortBy, minPrice, maxPrice, products]);

  useEffect(() => {
    Animated.timing(filterAnim, {
      toValue: showFilter ? 1 : 0, duration: 300, useNativeDriver: false,
    }).start();
  }, [showFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const catNames = res.data.map(c => c.name);
      setCategories(['All', ...catNames]);
    } catch (e) { console.error(e); }
  };

  const applyFilters = useCallback(() => {
    let result = [...products];

    if (query.trim()) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (category !== 'All') {
      result = result.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    switch (sortBy) {
      case 'Price: Low to High':  result.sort((a, b) => a.price - b.price); break;
      case 'Price: High to Low':  result.sort((a, b) => b.price - a.price); break;
      case 'Top Rated':           result.sort((a, b) => (b.ratings || 0) - (a.ratings || 0)); break;
      default:                    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    setFiltered(result);
  }, [query, category, sortBy, minPrice, maxPrice, products]);

  const filterHeight = filterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });


  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardImage}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImg} />
        ) : (
          <Text style={styles.cardEmoji}>👔</Text>
        )}
        <View style={[
          styles.searchStockBadge, 
          { backgroundColor: (item.stock > 0) ? '#22C55E' : '#EF4444' }
        ]}>
          <Text style={styles.searchStockText}>{(item.stock > 0) ? 'IN' : 'OUT'}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>LKR {item.price?.toLocaleString()}</Text>
          <View style={styles.ratingBadge}>
            <Icon name="star" size={10} color="#FFD700" />
            <Text style={styles.ratingText}>{item.ratings || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
          <Icon name="search" size={18} color={theme.textMuted} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Icon name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilter(!showFilter)} style={[styles.filterBtn, { backgroundColor: theme.card }]}>
          <Icon name="options" size={22} color={showFilter ? theme.primary : theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Filter Panel */}
      <Animated.View style={[styles.filterPanel, { height: filterHeight, overflow: 'hidden' }]}>
        <View style={styles.priceRow}>
          <TextInput
            style={styles.priceInput}
            placeholder="Min LKR "
            placeholderTextColor="#666"
            value={minPrice}
            onChangeText={setMinPrice}
            keyboardType="numeric"
          />
          <Text style={{ color: '#666' }}>—</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Max LKR "
            placeholderTextColor="#666"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
          />
        </View>
        <FlatList
          horizontal
          data={SORT_OPTIONS}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSortBy(item)}
              style={[styles.sortChip, { backgroundColor: theme.card, borderColor: theme.border }, sortBy === item && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            >
              <Text style={[styles.sortChipText, { color: theme.textMuted }, sortBy === item && { color: '#000', fontWeight: '700' }]}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{ marginTop: 8 }}
        />
      </Animated.View>

      {/* Category chips */}
      <View style={{ height: 60 }}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setCategory(item)}
              style={[styles.catChip, { backgroundColor: theme.card, borderColor: theme.border }, category === item && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            >
              <Text style={[styles.catChipText, { color: theme.textSub }, category === item && { color: '#000', fontWeight: '700' }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      <Text style={[styles.resultsText, { color: theme.textMuted }]}>{filtered.length} results found</Text>

      {/* Product Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderProduct}
          keyExtractor={i => i._id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubText}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0A0A0A' },
  header:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, gap: 12 },
  backBtn:            { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  searchBar:          { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput:        { flex: 1, color: '#FFF', fontSize: 15 },
  filterBtn:          { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12 },
  filterPanel:        { backgroundColor: '#141414', paddingHorizontal: 16, paddingTop: 8 },
  priceRow:           { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceInput:         { flex: 1, backgroundColor: '#1E1E1E', color: '#FFF', borderRadius: 8, padding: 8, fontSize: 13 },
  sortChip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', marginRight: 8 },
  sortChipActive:     { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  sortChipText:       { color: '#AAA', fontSize: 12 },
  sortChipTextActive: { color: '#000', fontWeight: '700' },
  catChip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A' },
  catChipActive:      { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  catChipText:        { color: '#AAA', fontSize: 13 },
  catChipTextActive:  { color: '#000', fontWeight: '700' },
  resultsText:        { color: '#666', fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  card:               { flex: 1, backgroundColor: '#141414', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' },
  cardImage:          { height: 140, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  productImg:         { width: '100%', height: '100%', resizeMode: 'cover' },
  cardEmoji:          { fontSize: 48 },
  cardInfo:           { padding: 10 },
  cardName:           { color: '#FFF', fontSize: 13, fontWeight: '600' },
  cardCategory:       { color: '#888', fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  cardBottom:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  cardPrice:          { color: '#FFD700', fontWeight: '700', fontSize: 14 },
  ratingBadge:        { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: '#1E1E1E', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  ratingText:         { color: '#FFF', fontSize: 10 },
  empty:              { alignItems: 'center', paddingTop: 80 },
  emptyIcon:          { fontSize: 48, marginBottom: 12 },
  emptyText:          { color: '#FFF', fontSize: 18, fontWeight: '600' },
  emptySubText:       { color: '#666', fontSize: 14, marginTop: 4 },
  searchStockBadge:   { position: 'absolute', top: 5, right: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10 },
  searchStockText:    { color: '#FFF', fontSize: 8, fontWeight: '800' },
});
