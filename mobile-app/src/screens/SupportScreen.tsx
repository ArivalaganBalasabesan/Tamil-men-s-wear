import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import api from '../services/api/api';
import Icon from '@expo/vector-icons/Ionicons';

export default function SupportScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !message) return Alert.alert('Validation Error', 'All fields are required.');

    try {
      setLoading(true);
      await api.post('/requests', { subject, message });
      Alert.alert('Success', 'Your support request has been submitted. Our team will contact you soon.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', 'Could not submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.accent }]}>CUSTOMER SUPPORT</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.textMuted }]}>How can we help you today?</Text>
        
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Subject (e.g. Order Issue, Feedback)"
          placeholderTextColor={theme.textMuted}
          value={subject}
          onChangeText={setSubject}
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border, height: 150 }]}
          placeholder="Describe your issue in detail..."
          placeholderTextColor={theme.textMuted}
          multiline
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.accent }]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitText}>SUBMIT REQUEST</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 25, paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  content: { padding: 25 },
  label: { marginBottom: 20, fontSize: 14 },
  input: { padding: 18, borderRadius: Radius.md, marginBottom: 15, fontSize: 15, borderWidth: 1 },
  submitBtn: { padding: 20, borderRadius: Radius.md, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 }
});
