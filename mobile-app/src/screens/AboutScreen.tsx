import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';

export default function AboutScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#0A0A0A', '#1A1A1A'] : ['#FFF', '#F5F5F5']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ABOUT US</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#FFD700', '#B8960C']} style={styles.logo}>
              <Text style={styles.logoText}>தமிழ்</Text>
            </LinearGradient>
            <Text style={[styles.brandName, { color: theme.text }]}>TAMIL MEN'S WEAR</Text>
            <Text style={styles.tagline}>Est. 2024 • The Royal Choice</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>OUR STORY</Text>
            <Text style={[styles.cardText, { color: theme.textSub }]}>
              Founded with a passion for traditional elegance and modern style, தமிழ் Men's Wear brings you the finest selection of apparel. From classic shirts to royal ethnic wear, we celebrate the spirit of the modern gentleman.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>OUR MISSION</Text>
            <Text style={[styles.cardText, { color: theme.textSub }]}>
              To provide premium quality fashion that empowers our customers to express their unique identity with confidence and grace.
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="location-outline" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSub }]}>123 Fashion Street, Chennai, TN</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="mail-outline" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSub }]}>support@tamilmenswear.com</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="globe-outline" size={20} color={theme.primary} />
              <Text style={[styles.infoText, { color: theme.textSub }]}>www.tamilmenswear.com</Text>
            </View>
          </View>

          <Text style={styles.version}>Version 1.0.0 (Stable)</Text>
          <Text style={styles.footer}>Made with ❤️ in Tamil Nadu</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  content: { padding: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, borderRadius: 25, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-10deg' }] },
  logoText: { fontSize: 36, fontWeight: '900', color: '#000' },
  brandName: { fontSize: 24, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
  tagline: { color: '#888', fontSize: 13, marginTop: 5, letterSpacing: 1 },
  card: { padding: 20, borderRadius: Radius.lg, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  cardText: { fontSize: 15, lineHeight: 24 },
  infoSection: { marginTop: 20, gap: 15 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoText: { fontSize: 14 },
  version: { textAlign: 'center', color: '#555', fontSize: 12, marginTop: 40 },
  footer: { textAlign: 'center', color: '#888', fontSize: 13, marginTop: 10, fontWeight: '600' }
});
