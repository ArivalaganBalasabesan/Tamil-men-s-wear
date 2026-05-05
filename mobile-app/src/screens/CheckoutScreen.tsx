import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api/api';
import { validateEmail, validatePhone, isNotEmpty } from '../utils/validation';
import { Colors } from '../constants/Theme';

export default function CheckoutScreen({ navigation }) {
  const { items, total } = useSelector(state => state.cart);
  const { isDark } = useSelector(state => state.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const applyPromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    try {
      const res = await api.get(`/promotions/validate/${promoCode}`);
      const promo = res.data;
      
      if (total < promo.minPurchaseAmount) {
        Alert.alert('Invalid', `Minimum purchase of LKR ${promo.minPurchaseAmount} required for this code.`);
        return;
      }

      let calcDiscount = 0;
      if (promo.discountType === 'percentage') {
        calcDiscount = (total * promo.discountAmount) / 100;
      } else {
        calcDiscount = promo.discountAmount;
      }
      
      setDiscount(calcDiscount);
      Alert.alert('Success', `Promo applied! You saved LKR ${calcDiscount}`);
    } catch (err) {
      Alert.alert('Error', 'Invalid or expired promo code');
      setDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const handlePayment = async () => {
    // Validations
    if (!isNotEmpty(shippingDetails.name) || !isNotEmpty(shippingDetails.address)) {
      return Alert.alert('Validation Error', 'Name and Address are required.');
    }
    if (!validateEmail(shippingDetails.email)) {
      return Alert.alert('Validation Error', 'Please enter a valid email address.');
    }
    if (!validatePhone(shippingDetails.phone)) {
      return Alert.alert('Validation Error', 'Phone number must be exactly 10 digits.');
    }

    setLoading(true);
    try {
      const finalAmount = total - discount;
      const formatProducts = items.map(item => ({ 
        productId: item._id, 
        quantity: item.quantity, 
        size: item.selectedSize, 
        price: item.price 
      }));

      // 1) Create the Order in the database first
      const orderRes = await api.post('/orders', { 
        products: formatProducts, 
        totalAmount: finalAmount, 
        shippingAddress: shippingDetails.address, 
        customerName: shippingDetails.name,
        customerPhone: shippingDetails.phone,
        customerEmail: shippingDetails.email
      });
      
      const createdOrder = orderRes.data;

      // 2) Redirect to the actual Payment Screen
      navigation.navigate('Payment', {
        order: createdOrder,
        cartItems: items,
        totalAmount: finalAmount,
        shippingAddress: shippingDetails.address
      });

    } catch (err) {
      console.log('Checkout Error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Could not process order. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
          <Text style={[styles.backBtnText, { color: theme.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.primary }]}>CHECKOUT</Text>
        
        <View style={[styles.summaryBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.summaryText, { color: theme.text }]}>TOTAL ITEMS: {items.reduce((acc, item) => acc + item.quantity, 0)}</Text>
          <Text style={[styles.summaryText, { color: theme.text }]}>SUBTOTAL: LKR {total}</Text>
          {discount > 0 && <Text style={[styles.summaryText, { color: '#22c55e' }]}>DISCOUNT: -LKR {discount}</Text>}
          <Text style={[styles.summaryText, { color: theme.text, fontSize: 20, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10, marginTop: 5 }]}>FINAL TOTAL: LKR {total - discount}</Text>
        </View>

        <Text style={[styles.subHeader, { color: theme.primary }]}>PROMO CODE</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
          <TextInput 
            style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
            placeholder="Enter Code" 
            placeholderTextColor={theme.textMuted}
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={[styles.applyBtn, { backgroundColor: theme.primary, opacity: promoLoading ? 0.6 : 1 }]} 
            onPress={applyPromo}
            disabled={promoLoading}
          >
            {promoLoading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.applyBtnText}>APPLY</Text>}
          </TouchableOpacity>
        </View>

        <Text style={[styles.subHeader, { color: theme.primary }]}>SHIPPING DETAILS</Text>
        
        <TextInput 
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
          placeholder="Full Name" 
          placeholderTextColor={theme.textMuted}
          value={shippingDetails.name}
          onChangeText={t => setShippingDetails({...shippingDetails, name: t})}
        />
        
        <TextInput 
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }, shippingDetails.email && !validateEmail(shippingDetails.email) && { borderColor: '#ff4444' }]} 
          placeholder="Email Address" 
          placeholderTextColor={theme.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={shippingDetails.email}
          onChangeText={t => setShippingDetails({...shippingDetails, email: t})}
        />
        {shippingDetails.email && !validateEmail(shippingDetails.email) && <Text style={styles.errorText}>Please enter a valid email address</Text>}

        <TextInput 
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]} 
          placeholder="Phone Number (10 digits)" 
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
          maxLength={10}
          value={shippingDetails.phone}
          onChangeText={t => setShippingDetails({...shippingDetails, phone: t})}
        />
        <TextInput 
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100 }]} 
          placeholder="Full Delivery Address" 
          placeholderTextColor={theme.textMuted}
          multiline
          textAlignVertical="top"
          value={shippingDetails.address}
          onChangeText={t => setShippingDetails({...shippingDetails, address: t})}
        />

        <TouchableOpacity 
          style={[styles.payBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]} 
          onPress={handlePayment} 
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <ActivityIndicator color="#000" />
              <Text style={styles.payBtnText}>CONNECTING...</Text>
            </View>
          ) : (
            <Text style={styles.payBtnText}>PROCEED TO PAYMENT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 60 },
  header: { fontSize: 26, fontWeight: '900', marginBottom: 20, letterSpacing: 2 },
  subHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, letterSpacing: 1 },
  summaryBox: { padding: 25, borderRadius: 12, marginBottom: 30, borderWidth: 1 },
  summaryText: { fontSize: 16, marginBottom: 10, fontWeight: 'bold', letterSpacing: 1 },
  input: { padding: 18, borderRadius: 12, borderWidth: 1, marginBottom: 15, fontSize: 15 },
  errorText: { color: '#ff4444', fontSize: 12, marginTop: -10, marginBottom: 15, marginLeft: 5 },
  payBtn: { padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, elevation: 5 },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  applyBtn: { paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12 },
  applyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  backBtn: { marginBottom: 20, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  backBtnText: { fontSize: 20, fontWeight: 'bold' }
});
