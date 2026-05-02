import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import api from '../services/api/api';

const { width } = Dimensions.get('window');

export default function OutfitBuilderScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const [shirts, setShirts] = useState([]);
  const [pants, setPants] = useState([]);
  const [selectedShirt, setSelectedShirt] = useState(null);
  const [selectedPant, setSelectedPant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/products');
      const all = res.data || [];
      setShirts(all.filter(p => p.category?.toLowerCase() === 'shirts'));
      setPants(all.filter(p => p.category?.toLowerCase() === 'pants'));
      if (all.length > 0) {
        setSelectedShirt(all.find(p => p.category?.toLowerCase() === 'shirts'));
        setSelectedPant(all.find(p => p.category?.toLowerCase() === 'pants'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    // Logic to add both to cart
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Outfit Builder</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Mix & Match your style</Text>
      </View>

      <View style={styles.previewContainer}>
        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
          <Text style={styles.emojiLarge}>{selectedShirt ? '👕' : '❓'}</Text>
          <Text style={[styles.itemName, { color: theme.text }]}>{selectedShirt?.name || 'Select Shirt'}</Text>
        </View>
        <Icon name="add" size={30} color={Colors.accent} />
        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
          <Text style={styles.emojiLarge}>{selectedPant ? '👖' : '❓'}</Text>
          <Text style={[styles.itemName, { color: theme.text }]}>{selectedPant?.name || 'Select Pants'}</Text>
        </View>
      </View>

      <ScrollView style={styles.selectors}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Shirt</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {shirts.map(item => (
            <TouchableOpacity 
              key={item._id} 
              onPress={() => setSelectedShirt(item)}
              style={[
                styles.itemChip, 
                { backgroundColor: theme.card, borderColor: selectedShirt?._id === item._id ? Colors.accent : theme.border }
              ]}
            >
              <Text style={styles.emojiSmall}>👕</Text>
              <Text style={[styles.chipText, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Choose Pants</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {pants.map(item => (
            <TouchableOpacity 
              key={item._id} 
              onPress={() => setSelectedPant(item)}
              style={[
                styles.itemChip, 
                { backgroundColor: theme.card, borderColor: selectedPant?._id === item._id ? Colors.accent : theme.border }
              ]}
            >
              <Text style={styles.emojiSmall}>👖</Text>
              <Text style={[styles.chipText, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      <TouchableOpacity style={[styles.buyBtn, { backgroundColor: Colors.accent }, shadow]} onPress={addToCart}>
        <Text style={styles.buyBtnText}>Purchase Look - ₹{( (selectedShirt?.price || 0) + (selectedPant?.price || 0) ).toLocaleString()}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, borderBottomWidth: 1 },
  headerTop: { marginBottom: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  subtitle: { fontSize: 13, marginTop: 4 },
  previewContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 30, gap: 15 },
  previewCard: { width: width * 0.35, height: width * 0.45, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emojiLarge: { fontSize: 60 },
  itemName: { fontSize: 12, fontWeight: '700', marginTop: 10, textAlign: 'center', paddingHorizontal: 5 },
  selectors: { flex: 1, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  horizontalList: { gap: 12, paddingBottom: 10 },
  itemChip: { width: 100, padding: 12, borderRadius: Radius.md, borderWidth: 1, alignItems: 'center' },
  emojiSmall: { fontSize: 30 },
  chipText: { fontSize: 10, fontWeight: '600', marginTop: 8 },
  buyBtn: { margin: 20, padding: 18, borderRadius: Radius.md, alignItems: 'center' },
  buyBtnText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});
