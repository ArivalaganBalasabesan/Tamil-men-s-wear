import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors } from '../constants/Theme';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { orderId, amount, method, isCod } = route.params || {};
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Success Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient colors={['#22C55E', '#16a34a']} style={styles.iconCircle}>
          <Icon name="checkmark" size={56} color="#FFF" />
        </LinearGradient>
        <View style={[styles.iconGlow, { backgroundColor: '#22C55E15' }]} />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: theme.text }]}>{isCod ? 'Order Placed! 📦' : 'Payment Successful! 🎉'}</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          {isCod
            ? 'Your order has been placed.\nPay when you receive it.'
            : 'Your payment was processed\nsuccessfully.'
          }
        </Text>

        {/* Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Order ID</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>#{orderId?.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: theme.primary }]}>LKR {amount?.toLocaleString()}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Payment</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{method}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <Text style={styles.statusText}>{isCod ? 'Pending' : 'Paid'}</Text>
            </View>
          </View>
        </View>

        {/* Loyalty note */}
        {!isCod && (
          <View style={[styles.loyaltyNote, { backgroundColor: theme.primary + '15' }]}>
            <Icon name="star" size={16} color={theme.primary} />
            <Text style={[styles.loyaltyText, { color: theme.primary }]}>
              You earned {Math.floor((amount || 0) / 100)} loyalty points!
            </Text>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
        >
          <LinearGradient colors={[theme.primary, isDark ? '#B8960C' : '#D4AF37']} style={styles.trackGrad}>
            <Icon name="location-outline" size={18} color="#000" />
            <Text style={styles.trackText}>Track Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={[styles.homeBtnText, { color: theme.textMuted }]}>Continue Shopping</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconContainer:  { alignItems: 'center', marginBottom: 32, position: 'relative' },
  iconCircle:     { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  iconGlow:       { position: 'absolute', width: 140, height: 140, borderRadius: 70, top: -20 },
  content:        { width: '100%', alignItems: 'center', gap: 16 },
  title:          { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  subtitle:       { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  detailsCard:    { width: '100%', borderRadius: 16, padding: 20, gap: 4, borderWidth: 1 },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  detailLabel:    { fontSize: 14 },
  detailValue:    { fontSize: 14, fontWeight: '600' },
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  statusText:     { color: '#22C55E', fontSize: 12, fontWeight: '600' },
  loyaltyNote:    { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12 },
  loyaltyText:    { fontSize: 13, fontWeight: '600' },
  trackBtn:       { width: '100%', borderRadius: 14, overflow: 'hidden' },
  trackGrad:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  trackText:      { color: '#000', fontSize: 16, fontWeight: '700' },
  homeBtn:        { paddingVertical: 14 },
  homeBtnText:    { fontSize: 14 },
});
