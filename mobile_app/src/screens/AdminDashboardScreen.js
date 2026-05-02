import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar, Image, Animated, Modal, Platform, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import api, { baseURL } from '../api/api';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Shadows, Radius } from '../constants/Theme';

import { useFocusEffect } from '@react-navigation/native';

export default function AdminDashboardScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const [orders,          setOrders]          = useState([]);
  const [customers,       setCustomers]       = useState([]);
  const [requests,        setRequests]        = useState([]);
  const [products,        setProducts]        = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [stats,           setStats]           = useState({ totalRevenue: 0, totalOrders: 0, usersCount: 0, productsCount: 0, lowStockCount: 0, pendingOrders: 0 });
  const [view,            setView]            = useState('dashboard');
  const [loading,         setLoading]         = useState(true);
  const [isMenuOpen,      setIsMenuOpen]      = useState(false);
  
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [view])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, statRes, prodRes, customerRes, reqRes, catRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/stats'),
        api.get('/products'),
        api.get('/admin/customers'),
        api.get('/product-requests/admin'),
        api.get('/categories')
      ]);
      setOrders(orderRes.data || []);
      setStats(statRes.data || stats);
      setProducts(prodRes.data || []);
      setCustomers(customerRes.data || []);
      setRequests(reqRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logout());
  };

  const deleteProduct = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/products/${id}`);
            fetchData(); // Refresh the list
            Alert.alert('Success', 'Product deleted successfully.');
          } catch (e) {
            Alert.alert('Error', 'Failed to delete product.');
          }
        }
      }
    ]);
  };

  const deleteCategory = async (id) => {
    Alert.alert('Confirm Delete', 'Delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/categories/${id}`);
            fetchData();
            Alert.alert('Success', 'Category deleted.');
          } catch(e) { Alert.alert('Error', 'Failed to delete category.'); }
        }
      }
    ]);
  };

  const TABS = [
    { id: 'dashboard', label: 'DASHBOARD', icon: 'analytics' },
    { id: 'users', label: 'USERS', icon: 'people' },
    { id: 'products', label: 'PRODUCTS', icon: 'shirt' },
    { id: 'categories', label: 'CATEGORIES', icon: 'grid' },
    { id: 'inventory', label: 'INVENTORY', icon: 'cube' },
    { id: 'catalogs', label: 'CATALOGS', icon: 'book' },
    { id: 'orders', label: 'ORDERS', icon: 'cart' },
    { id: 'payments', label: 'PAYMENTS', icon: 'card' },
    { id: 'reviews', label: 'REVIEWS', icon: 'star' },
    { id: 'requests', label: 'SUPPORT', icon: 'chatbubbles' },
    { id: 'promotions', label: 'PROMOTIONS', icon: 'pricetag' },
  ];

  const renderStatCard = (label, value, sub, color = Colors.accent) => (
    <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
      <Text style={[styles.statSub, { color: theme.textMuted }]}>{sub}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <LinearGradient colors={[Colors.primary, '#2C2C2C']} style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setIsMenuOpen(!isMenuOpen)} style={styles.menuIconBtn}>
            <Icon name="ellipsis-vertical" size={24} color={Colors.accent} />
          </TouchableOpacity>
          <View>
            <Text style={styles.tamilBrand}>தமிழ்</Text>
            <Text style={styles.adminTitle}>ADMIN COMMAND</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.mainLayout}>
        {/* Collapsible Sidebar */}
        {isMenuOpen && (
          <View style={styles.sidebar}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {TABS.map(tab => (
                <TouchableOpacity 
                  key={tab.id} 
                  onPress={() => { fadeAnim.setValue(0); setView(tab.id); setIsMenuOpen(false); }} 
                  style={[styles.sidebarItem, view === tab.id && styles.sidebarItemActive]}
                >
                  <Icon name={tab.icon} size={22} color={view === tab.id ? '#000' : theme.textMuted} />
                  <Text style={[styles.sidebarText, { color: view === tab.id ? '#000' : theme.textMuted }]}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Content Area */}
        <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.accent} /></View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {view === 'dashboard' && (
              <View style={styles.dashboardGrid}>
                <LinearGradient colors={[Colors.accent, '#B8860B']} style={styles.revenueHero}>
                  <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
                  <Text style={styles.revenueValue}>₹{stats.totalRevenue?.toLocaleString() || 0}</Text>
                </LinearGradient>
                <View style={styles.gridRow}>
                  {renderStatCard('ORDERS', stats.totalOrders || 0, 'Total completed')}
                  {renderStatCard('CUSTOMERS', stats.usersCount || 0, 'Registered users')}
                </View>
                <View style={styles.gridRow}>
                  {renderStatCard('PRODUCTS', stats.productsCount || 0, 'In catalog')}
                  {renderStatCard('LOW STOCK', stats.lowStockCount || 0, 'Needs restock', Colors.error)}
                </View>
              </View>
            )}

            {view === 'products' && (
              <View style={styles.listContainer}>
                <TouchableOpacity 
                  style={[styles.listItem, { backgroundColor: Colors.accent, justifyContent: 'center' }]}
                  onPress={() => navigation.navigate('ADMIN_PRODUCTS')}
                >
                  <Text style={{ color: '#000', fontWeight: '900', letterSpacing: 1 }}>+ ADD NEW PRODUCT</Text>
                </TouchableOpacity>
                {products.map(p => (
                  <View key={p._id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>{p.name}</Text>
                      <Text style={[styles.listSub, { color: theme.textMuted }]}>{p.category} • ₹{p.price}</Text>
                    </View>
                    <View style={styles.listActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('ADMIN_PRODUCTS', { product: p })}><Icon name="create-outline" size={18} color={Colors.accent} /></TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => deleteProduct(p._id)}><Icon name="trash-outline" size={18} color={Colors.error} /></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {view === 'orders' && (
              <View style={styles.listContainer}>
                {orders.map(o => (
                  <View key={o._id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>Order #{o._id.slice(-6)}</Text>
                      <Text style={[styles.listSub, { color: theme.textMuted }]}>{o.userId?.email} • ₹{o.totalAmount}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: o.orderStatus === 'Pending' ? Colors.warning + '20' : Colors.success + '20' }]}>
                      <Text style={[styles.statusText, { color: o.orderStatus === 'Pending' ? Colors.warning : Colors.success }]}>{o.orderStatus}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {view === 'requests' && (
              <View style={styles.listContainer}>
                {requests.map(r => (
                  <View key={r._id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>{r.productName}</Text>
                      <Text style={[styles.listSub, { color: theme.textMuted }]}>{r.userId?.email || 'User'}</Text>
                    </View>
                    <TouchableOpacity style={styles.respondBtn}>
                      <Text style={styles.respondText}>RESPOND</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {/* CATEGORIES MODULE */}
            {view === 'categories' && (
              <View style={styles.listContainer}>
                <TouchableOpacity 
                  style={[styles.listItem, { backgroundColor: Colors.accent, justifyContent: 'center' }]}
                  onPress={() => Alert.alert('Coming Soon', 'Add Category Modal will open here.')}
                >
                  <Text style={{ color: '#000', fontWeight: '900', letterSpacing: 1 }}>+ ADD NEW CATEGORY</Text>
                </TouchableOpacity>
                {categories.map(c => (
                  <View key={c._id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>{c.name}</Text>
                      <Text style={[styles.listSub, { color: theme.textMuted }]}>{c.description || 'No description'}</Text>
                    </View>
                    <View style={styles.listActions}>
                      <TouchableOpacity style={styles.actionBtn}><Icon name="create-outline" size={18} color={Colors.accent} /></TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => deleteCategory(c._id)}><Icon name="trash-outline" size={18} color={Colors.error} /></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* INVENTORY MODULE */}
            {view === 'inventory' && (
              <View style={styles.listContainer}>
                {products.map(p => (
                  <View key={p._id} style={[styles.listItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.listInfo}>
                      <Text style={[styles.listTitle, { color: theme.text }]}>{p.name}</Text>
                      <Text style={[styles.listSub, { color: theme.textMuted }]}>SKU: {p._id.slice(-6).toUpperCase()} • Category: {p.category}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: p.stock < 5 ? Colors.error + '20' : Colors.success + '20' }]}>
                      <Text style={[styles.statusText, { color: p.stock < 5 ? Colors.error : Colors.success }]}>
                        {p.stock} IN STOCK
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* NEW MODULE PLACEHOLDERS */}
            {['users', 'catalogs', 'payments', 'reviews', 'promotions'].includes(view) && (
               <View style={styles.centerBox}>
                 <Icon name="construct-outline" size={60} color={theme.textMuted} />
                 <Text style={[styles.placeholderText, { color: theme.text }]}>{view.toUpperCase()} MODULE</Text>
                 <Text style={[styles.placeholderSub, { color: theme.textMuted }]}>This CRUD module is being wired up.</Text>
               </View>
            )}
          </ScrollView>
        )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tamilBrand: { color: Colors.accent, fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  adminTitle: { color: '#FDF5E680', fontSize: 10, fontWeight: '800', letterSpacing: 4, marginTop: -5 },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  tabItem: { alignItems: 'center', paddingBottom: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 10, fontWeight: '800', marginTop: 4 },
  scrollContent: { padding: 20 },
  dashboardGrid: { gap: 15 },
  revenueHero: { padding: 30, borderRadius: Radius.lg, alignItems: 'center' },
  revenueLabel: { color: '#000', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  revenueValue: { color: '#000', fontSize: 40, fontWeight: '900', marginTop: 5 },
  gridRow: { flexDirection: 'row', gap: 15 },
  statCard: { flex: 1, padding: 20, borderRadius: Radius.md, borderWidth: 1 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: '900', marginVertical: 5 },
  statSub: { fontSize: 9, fontWeight: '600' },
  listContainer: { gap: 12 },
  listItem: { flexDirection: 'row', padding: 18, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'space-between' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '800' },
  listSub: { fontSize: 12, marginTop: 4 },
  listActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: '800' },
  respondBtn: { backgroundColor: Colors.accent, paddingHorizontal: 15, paddingVertical: 8, borderRadius: Radius.full },
  respondText: { color: '#000', fontSize: 10, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainLayout: { flex: 1, flexDirection: 'row' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  menuIconBtn: { padding: 5 },
  sidebar: { width: 250, backgroundColor: '#1A1A1A', borderRightWidth: 1, borderRightColor: '#333', paddingVertical: 20, zIndex: 100, position: 'absolute', height: '100%', left: 0 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 25, marginBottom: 5 },
  sidebarItemActive: { backgroundColor: Colors.accent, borderRightWidth: 4, borderRightColor: '#FFF' },
  sidebarText: { fontSize: 12, fontWeight: '800', marginLeft: 15, letterSpacing: 1 },
  contentArea: { flex: 1, backgroundColor: '#0A0A0A' },
  centerBox: { alignItems: 'center', justifyContent: 'center', padding: 50, marginTop: 50, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  placeholderText: { fontSize: 20, fontWeight: '900', marginTop: 15, letterSpacing: 2 },
  placeholderSub: { fontSize: 12, marginTop: 5 }
});
