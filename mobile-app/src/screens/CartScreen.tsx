import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Image
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';
import api from '../services/api/api';
import { Colors, Shadows } from '../constants/Theme';

const CATEGORY_EMOJIS = {
  shirts:'👔', pants:'👖', suits:'🤵', traditional:'🧣',
  formal:'💼', casual:'👕', ethnic:'🎭', accessories:'👜', innerwear:'🩲',
};

export default function CartScreen({ navigation }) {
  const dispatch   = useDispatch();
  const { items, total } = useSelector(s => s.cart);
  const { user }   = useSelector(s => s.auth);
  const { isDark } = useSelector(s => s.theme);

  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const handleRemove = async (item) => {
    dispatch(removeFromCart(item));
    if (user) {
      try {
        await api.delete(`/cart/remove/${user._id || user.id}/${item._id || item.productId}`);
      } catch (err) { /* silent */ }
    }
  };

  const handleQty = (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) { handleRemove(item); return; }
    dispatch(updateQuantity({ ...item, quantity: newQty }));
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: () => dispatch(clearCart()) }
    ]);
  };

  const discount  = 0; // Can hook into coupon logic
  const shipping  = total > 999 ? 0 : 49;
  const finalTotal = total + shipping - discount;

  const renderItem = ({ item }) => {
    const emoji = CATEGORY_EMOJIS[item.category?.toLowerCase()] || '👔';
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
        <View style={styles.imageBox}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.itemImg} />
          ) : (
            <Text style={styles.emoji}>{emoji}</Text>
          )}
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: isDark ? '#FFF' : '#111' }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.selectedSize && (
            <Text style={styles.meta}>Size: {item.selectedSize}</Text>
          )}
          <Text style={styles.price}>LKR {item.price?.toLocaleString()}</Text>

          {/* Qty Controls */}
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: isDark ? '#2A2A2A' : '#EEE' }]}
              onPress={() => handleQty(item, -1)}
            >
              <Icon name="remove" size={16} color={isDark ? '#FFF' : '#333'} />
            </TouchableOpacity>
            <Text style={[styles.qtyNum, { color: isDark ? '#FFF' : '#111' }]}>
              {item.quantity || 1}
            </Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { backgroundColor: isDark ? '#2A2A2A' : '#EEE' }]}
              onPress={() => handleQty(item, 1)}
            >
              <Icon name="add" size={16} color={isDark ? '#FFF' : '#333'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.itemTotal}>
            LKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
          </Text>
          <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
            <Icon name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient colors={isDark ? [theme.background, theme.card] : ['#FFF', theme.background]} style={styles.header}>
        <View>
          <Text style={[styles.headerTa, { color: theme.primary }]}>உங்கள் கார்ட்</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Cart ({items.length})
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} style={styles.clearBtn}>
            <Icon name="trash-outline" size={18} color="#EF4444" />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#111' }]}>
            Your cart is empty
          </Text>
          <Text style={styles.emptySub}>Add items from our collection</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopBtn}>
            <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.shopBtnGrad}>
              <Text style={styles.shopBtnText}>Browse Collection</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item, i) => item._id || i.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Summary */}
          <View style={[styles.summary, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            {/* Free shipping notice */}
            {shipping > 0 && (
              <View style={styles.shippingNote}>
                <Icon name="information-circle-outline" size={14} color="#F59E0B" />
                <Text style={styles.shippingNoteText}>
                  Add LKR {(999 - total).toLocaleString()} more for free shipping!
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.sumLabel, { color: isDark ? '#888' : '#666' }]}>Subtotal</Text>
              <Text style={[styles.sumValue, { color: isDark ? '#FFF' : '#111' }]}>LKR {total.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.sumLabel, { color: isDark ? '#888' : '#666' }]}>Shipping</Text>
              <Text style={[styles.sumValue, { color: shipping === 0 ? '#22C55E' : (isDark ? '#FFF' : '#111') }]}>
                {shipping === 0 ? 'FREE' : `LKR ${shipping}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: isDark ? '#FFF' : '#111' }]}>Total</Text>
              <Text style={styles.totalValue}>LKR {finalTotal.toLocaleString()}</Text>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Checkout')} style={styles.checkoutBtn}>
              <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.checkoutGrad}>
                <Icon name="bag-check-outline" size={20} color="#000" />
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 12 },
  headerTa:       { color: '#FFD700', fontSize: 11, letterSpacing: 1 },
  headerTitle:    { fontSize: 22, fontWeight: '800' },
  clearBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EF444420', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  clearBtnText:   { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  card:           { flexDirection: 'row', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A2A', overflow: 'hidden' },
  imageBox:       { width: 90, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' },
  itemImg:        { width: '100%', height: '100%', resizeMode: 'cover' },
  emoji:          { fontSize: 36 },
  details:        { flex: 1, padding: 10, gap: 2 },
  name:           { fontSize: 13, fontWeight: '700' },
  meta:           { color: '#888', fontSize: 10 },
  price:          { color: '#FFD700', fontSize: 13, fontWeight: '700' },
  qtyRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  qtyBtn:         { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  qtyNum:         { fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  rightCol:       { padding: 10, alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal:      { color: '#FFD700', fontSize: 13, fontWeight: '800' },
  removeBtn:      { width: 32, height: 32, backgroundColor: '#EF444420', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyEmoji:     { fontSize: 56 },
  emptyTitle:     { fontSize: 18, fontWeight: '700' },
  emptySub:       { color: '#888', fontSize: 13 },
  shopBtn:        { borderRadius: 12, overflow: 'hidden' },
  shopBtnGrad:    { paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText:    { color: '#000', fontWeight: '700', fontSize: 13 },
  summary:        { padding: 16, borderTopWidth: 1, gap: 6, paddingBottom: 140 },
  shippingNote:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F59E0B10', padding: 8, borderRadius: 10, marginBottom: 4 },
  shippingNoteText:{ color: '#F59E0B', fontSize: 11, flex: 1 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  sumLabel:       { fontSize: 13 },
  sumValue:       { fontSize: 13, fontWeight: '600' },
  totalRow:       { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#2A2A2A', marginTop: 4 },
  totalLabel:     { fontSize: 15, fontWeight: '700' },
  totalValue:     { color: '#FFD700', fontSize: 17, fontWeight: '900' },
  checkoutBtn:    { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  checkoutGrad:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  checkoutText:   { color: '#000', fontWeight: '800', fontSize: 14 },
});
