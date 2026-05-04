import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Radius, Shadows } from '../constants/Theme';
import api from '../services/api/api';
import Icon from '@expo/vector-icons/Ionicons';

export default function SupportHistoryScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {requests.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Icon name="chatbox-ellipses-outline" size={80} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No support requests yet.</Text>
            <TouchableOpacity 
              style={[styles.newBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('ProductRequest')}
            >
              <Text style={styles.newBtnText}>NEW REQUEST</Text>
            </TouchableOpacity>
          </View>
        ) : (
          requests.map((req) => (
            <View key={req._id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: req.status === 'pending' ? '#f59e0b20' : req.status === 'responded' ? '#3b82f620' : '#22c55e20' }]}>
                  <Text style={[styles.statusText, { color: req.status === 'pending' ? '#f59e0b' : req.status === 'responded' ? '#3b82f6' : '#22c55e' }]}>
                    {req.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.date, { color: theme.textMuted }]}>{new Date(req.createdAt).toLocaleDateString()}</Text>
              </View>
              
              <Text style={[styles.subject, { color: theme.text }]}>{req.subject}</Text>
              <Text style={[styles.description, { color: theme.textSub }]}>{req.description}</Text>
              
              {req.adminResponse && (
                <View style={[styles.responseBox, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.responseLabel, { color: theme.primary }]}>ADMIN RESPONSE:</Text>
                  <Text style={[styles.responseText, { color: theme.text }]}>{req.adminResponse}</Text>
                </View>
              )}
            </View>
          ))
        )}
        {loading && <ActivityIndicator size="large" color={theme.primary} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 20, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  date: { fontSize: 11, fontWeight: '600' },
  subject: { fontSize: 17, fontWeight: '800', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 15 },
  responseBox: { marginTop: 10, padding: 15, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#FFD700' },
  responseLabel: { fontSize: 11, fontWeight: '900', marginBottom: 6, letterSpacing: 1 },
  responseText: { fontSize: 14, fontStyle: 'italic' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, marginTop: 20, fontWeight: '600' },
  newBtn: { marginTop: 30, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  newBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1 }
});
