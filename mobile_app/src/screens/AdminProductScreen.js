import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Shadows, Radius } from '../constants/Theme';
import api from '../api/api';
import Icon from '@expo/vector-icons/Ionicons';

export default function AdminProductScreen({ route, navigation }) {
  const { product } = route.params || {};
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(product?.image || product?.images?.[0] || '');
  
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price?.toString() || '',
    category: product?.category || 'Casual',
    description: product?.description || '',
    stock: product?.stock?.toString() || ''
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validate = () => {
    if (!form.name || !form.price || !form.description || !form.stock) {
      Alert.alert('Validation Error', 'All fields are mandatory.');
      return false;
    }
    if (isNaN(form.price) || isNaN(form.stock)) {
      Alert.alert('Validation Error', 'Price and Stock must be numbers.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      setLoading(true);
      const payload = {
        ...form,
        image: image || 'https://via.placeholder.com/300',
        images: image ? [image] : ['https://via.placeholder.com/300']
      };

      if (product?._id) {
        await api.put(`/products/${product._id}`, payload);
        Alert.alert('Success', 'Product updated successfully.');
      } else {
        await api.post('/products', payload);
        Alert.alert('Success', 'Product added to தமிழ் inventory.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Could not upload product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.accent }]}>{product?._id ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Image URL (e.g. https://example.com/image.jpg)"
          placeholderTextColor={theme.textMuted}
          value={image}
          onChangeText={setImage}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Product Name"
          placeholderTextColor={theme.textMuted}
          value={form.name}
          onChangeText={t => setForm({...form, name: t})}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Price (Rs.)"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={form.price}
          onChangeText={t => setForm({...form, price: t})}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border, height: 100 }]}
          placeholder="Product Description"
          placeholderTextColor={theme.textMuted}
          multiline
          value={form.description}
          onChangeText={t => setForm({...form, description: t})}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
          placeholder="Initial Stock Level"
          placeholderTextColor={theme.textMuted}
          keyboardType="numeric"
          value={form.stock}
          onChangeText={t => setForm({...form, stock: t})}
        />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveText}>{product?._id ? 'UPDATE PRODUCT' : 'PUBLISH PRODUCT'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 40, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  content: { padding: 25 },
  imagePicker: { width: '100%', height: 250, borderRadius: Radius.md, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  preview: { width: '100%', height: '100%' },
  imageText: { fontSize: 10, fontWeight: '800', marginTop: 10 },
  input: { padding: 18, borderRadius: Radius.md, marginBottom: 15, fontSize: 15, borderWidth: 1 },
  saveBtn: { padding: 20, borderRadius: Radius.md, alignItems: 'center', marginTop: 10 },
  saveText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 }
});
