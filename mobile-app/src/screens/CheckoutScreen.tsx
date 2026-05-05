import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, StatusBar, TextInput, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../store/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api/api';
import { validateEmail, validatePhone, isNotEmpty } from '../utils/validation';

export default function CheckoutScreen({ navigation }) {
  const { items, total } = useSelector(state => state.cart);
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
        Alert.alert('Invalid', `Minimum purchase of Rs. ${promo.minPurchaseAmount} required for this code.`);
        return;
      }

      let calcDiscount = 0;
      if (promo.discountType === 'percentage') {
        calcDiscount = (total * promo.discountAmount) / 100;
      } else {
        calcDiscount = promo.discountAmount;
      }
      
      setDiscount(calcDiscount);
      Alert.alert('Success', `Promo applied! You saved Rs. ${calcDiscount}`);
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
        shippingAddress: shippingDetails.address, // API expects shippingAddress as string
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
    <LinearGradient colors={['#0a0a0a', '#171300']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>CHECKOUT</Text>
        
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>TOTAL ITEMS: {items.reduce((acc, item) => acc + item.quantity, 0)}</Text>
          <Text style={styles.summaryText}>SUBTOTAL: Rs. {total}</Text>
          {discount > 0 && <Text style={[styles.summaryText, { color: '#22c55e' }]}>DISCOUNT: -Rs. {discount}</Text>}
          <Text style={[styles.summaryText, { fontSize: 20, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 10 }]}>FINAL TOTAL: Rs. {total - discount}</Text>
        </View>

        <Text style={styles.subHeader}>PROMO CODE</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
          <TextInput 
            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
            placeholder="Enter Code" 
            placeholderTextColor="#666"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={[styles.applyBtn, { opacity: promoLoading ? 0.6 : 1 }]} 
            onPress={applyPromo}
            disabled={promoLoading}
          >
            {promoLoading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.applyBtnText}>APPLY</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.subHeader}>SHIPPING DETAILS</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Full Name" 
          placeholderTextColor="#666"
          value={shippingDetails.name}
          onChangeText={t => setShippingDetails({...shippingDetails, name: t})}
        />
        
        <TextInput 
          style={[styles.input, shippingDetails.email && !validateEmail(shippingDetails.email) && { borderColor: '#ff4444' }]} 
          placeholder="Email Address" 
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={shippingDetails.email}
          onChangeText={t => setShippingDetails({...shippingDetails, email: t})}
        />
        {shippingDetails.email && !validateEmail(shippingDetails.email) && <Text style={styles.errorText}>Please enter a valid email address</Text>}

        <TextInput 
          style={styles.input} 
          placeholder="Phone Number (10 digits)" 
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          maxLength={10}
          value={shippingDetails.phone}
          onChangeText={t => setShippingDetails({...shippingDetails, phone: t})}
        />
        <TextInput 
          style={[styles.input, { height: 100 }]} 
          placeholder="Full Delivery Address" 
          placeholderTextColor="#666"
          multiline
          textAlignVertical="top"
          value={shippingDetails.address}
          onChangeText={t => setShippingDetails({...shippingDetails, address: t})}
        />

        <TouchableOpacity 
          style={[styles.payBtn, loading && { opacity: 0.7 }]} 
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 60 },
  header: { fontSize: 26, fontWeight: '900', color: '#FFD700', marginBottom: 20, letterSpacing: 2 },
  subHeader: { fontSize: 14, fontWeight: 'bold', color: '#FFD700', marginBottom: 15, letterSpacing: 1 },
  summaryBox: { backgroundColor: 'rgba(255,215,0,0.05)', padding: 25, borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  summaryText: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: 'bold', letterSpacing: 1 },
  input: { backgroundColor: '#111', color: '#fff', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#332b00', marginBottom: 15, fontSize: 15 },
  errorText: { color: '#ff4444', fontSize: 12, marginTop: -10, marginBottom: 15, marginLeft: 5 },
  payBtn: { backgroundColor: '#FFD700', padding: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#FFD700', shadowOffset: {width:0, height:4}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  payBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  applyBtn: { backgroundColor: '#FFD700', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 12 },
  applyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  backBtn: { marginBottom: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  backBtnText: { color: '#FFD700', fontSize: 20, fontWeight: 'bold' }
});
