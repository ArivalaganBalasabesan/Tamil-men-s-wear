import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import { Colors, Radius, Shadows } from '../constants/Theme';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SupportScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const contactMethods = [
    { icon: 'logo-whatsapp', label: 'WhatsApp Us', detail: '+91 98765 43210', action: () => Linking.openURL('whatsapp://send?phone=919876543210') },
    { icon: 'call-outline', label: 'Call Support', detail: '1800-TMW-SUPPORT', action: () => Linking.openURL('tel:1800869787') },
    { icon: 'mail-outline', label: 'Email Help', detail: 'support@tamilmenswear.com', action: () => Linking.openURL('mailto:support@tamilmenswear.com') },
    { icon: 'chatbubbles-outline', label: 'Request Product', detail: 'Custom orders & inquiries', action: () => navigation.navigate('ProductRequest') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.header, { color: theme.primary }]}>HELP & SUPPORT</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>How can we help you today? Our team is available 24/7 to assist you.</Text>

        <View style={styles.grid}>
          {contactMethods.map((method, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}
              onPress={method.action}
            >
              <LinearGradient colors={[theme.primary + '20', 'transparent']} style={styles.iconCircle}>
                <Icon name={method.icon} size={28} color={theme.primary} />
              </LinearGradient>
              <Text style={[styles.cardLabel, { color: theme.text }]}>{method.label}</Text>
              <Text style={[styles.cardDetail, { color: theme.textMuted }]}>{method.detail}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.faqBox, { backgroundColor: theme.surface }]}>
          <Text style={[styles.faqTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
          <TouchableOpacity style={styles.faqItem} onPress={() => navigation.navigate('About')}>
            <Text style={[styles.faqText, { color: theme.textSub }]}>Shipping & Returns</Text>
            <Icon name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem} onPress={() => navigation.navigate('Loyalty')}>
            <Text style={[styles.faqText, { color: theme.textSub }]}>Loyalty Program Tiers</Text>
            <Icon name="chevron-forward" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 25, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  header: { fontSize: 28, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 35 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  card: { width: '47.5%', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardLabel: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  cardDetail: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  faqBox: { marginTop: 40, borderRadius: 20, padding: 20 },
  faqTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15 },
  faqItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,215,0,0.1)' },
  faqText: { fontSize: 14, fontWeight: '600' }
});
