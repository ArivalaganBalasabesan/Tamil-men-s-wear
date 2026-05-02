import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/api';

export default function ProductRequestScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productName.trim() || !description.trim()) {
      return Alert.alert('Error', 'Please fill out all fields');
    }
    
    setLoading(true);
    try {
      await api.post('/requests', { subject: productName, message: description });
      Alert.alert('Success', 'Your request has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.header, { color: theme.primary }]}>REQUEST PRODUCT</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Can't find what you're looking for? Let us know and we'll try to get it for you!</Text>
          
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.primary }]}>Product Name or Type</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g., Silk Veshti with Gold Border"
              placeholderTextColor={theme.textMuted}
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={[styles.label, { color: theme.primary }]}>Description & Details</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
              placeholder="Please provide colors, preferred size, or any other details..."
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 60, flexGrow: 1 },
  header: { fontSize: 28, fontWeight: '900', color: '#FFD700', marginBottom: 10, letterSpacing: 1.5 },
  subtitle: { color: '#aaa', fontSize: 14, marginBottom: 30, lineHeight: 22 },
  form: { flex: 1 },
  label: { color: '#FFD700', fontSize: 13, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  input: { backgroundColor: '#111', color: '#fff', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#332b00', marginBottom: 20, fontSize: 15 },
  textArea: { height: 120 },
  submitBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 20, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 }
});
