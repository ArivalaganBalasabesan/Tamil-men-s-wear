import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import api from '../services/api/api';
import Icon from '@expo/vector-icons/Ionicons';

export default function WishlistScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data);
    } catch (err) {
      console.log('Wishlist fetch error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlist(wishlist.filter(item => item._id !== id));
    } catch (err) {
      console.log('Remove from wishlist error');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.primary }]}>WISHLIST</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
      ) : wishlist.length === 0 ? (
        <View style={styles.center}>
          <Icon name="heart-dislike-outline" size={60} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>Your wishlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={item => item._id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadow]} 
              onPress={() => navigation.navigate('ProductDetails', { productId: item._id })}
            >
              <Image source={{ uri: item.images[0] }} style={styles.image} />
              <View style={styles.info}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.price, { color: theme.primary }]}>Rs. {item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromWishlist(item._id)} style={styles.removeBtn}>
                <Icon name="trash-outline" size={20} color={theme.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 30, paddingTop: 60, backgroundColor: '#000', borderBottomWidth: 1, borderBottomColor: '#111' },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 15, fontWeight: '700' },
  card: { flexDirection: 'row', borderRadius: Radius.md, marginBottom: 15, padding: 12, alignItems: 'center', borderWidth: 1 },
  image: { width: 70, height: 70, borderRadius: Radius.sm },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 14, marginTop: 4, fontWeight: '900' },
  removeBtn: { padding: 10 }
});
