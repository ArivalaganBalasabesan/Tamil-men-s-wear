import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, TextInput, Animated,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import api from '../services/api/api';

const TIERS = [
  { name: 'Trend Starter',    minPoints: 0,    color: '#CCCCCC', emoji: '👕', perks: ['2% discount on orders', 'Birthday bonus points'] },
  { name: 'Style Icon',       minPoints: 1000, color: '#B87333', emoji: '👔', perks: ['5% discount on orders', 'Free shipping over LKR 2000', 'Priority support'] },
  { name: 'Fashion Elite',    minPoints: 3000, color: '#C0C0C0', emoji: '🤵', perks: ['10% discount on orders', 'Free shipping always', 'Early access to sales'] },
  { name: 'Royal Gentleman',  minPoints: 7000, color: '#D4AF37', emoji: '👑', perks: ['20% discount on orders', 'Free express delivery', 'Exclusive products', 'Personal stylist'] },
];

export default function LoyaltyScreen({ navigation }) {
  const { user }     = useSelector(s => s.auth);
  const { isDark }   = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { 
    fetchProfile(); 
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/auth/me`);
      setProfile(res.data);
    } catch (e) {
      setProfile(user);
    } finally { setLoading(false); }
  };

  const points        = profile?.loyaltyPoints || 0;
  const currentTier   = TIERS.filter(t => points >= t.minPoints).pop() || TIERS[0];
  const nextTier      = TIERS.find(t => t.minPoints > points);
  const progressPct   = nextTier ? Math.min((points / nextTier.minPoints) * 100, 100) : 100;
  const pointsToNext  = nextTier ? nextTier.minPoints - points : 0;

  if (loading) return (
    <View style={[styles.loading, { backgroundColor: theme.background }]}><ActivityIndicator size="large" color={theme.primary} /></View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.background }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="arrow-back-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Loyalty Rewards</Text>
              <Text style={[styles.headerTa, { color: theme.primary }]}>விசுவாச பரிசுகள்</Text>
            </View>
          </View>

          {/* Points Hero */}
          <LinearGradient 
            colors={isDark ? [theme.card, theme.background] : ['#FFF', theme.background]} 
            style={[styles.hero, { borderColor: theme.primary + '30', borderWidth: 1 }, shadow]}
          >
            <View style={styles.heroTop}>
              <Text style={[styles.heroBadge, { color: theme.primary }]}>
                <Icon name="diamond-outline" size={14} /> {currentTier.name.toUpperCase()}
              </Text>
              <View style={[styles.pointsBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.pointsBadgeText, { color: theme.primary }]}>ACTIVE</Text>
              </View>
            </View>
            
            <View style={styles.mainPoints}>
              <Text style={[styles.heroPoints, { color: theme.text }]}>{points.toLocaleString()}</Text>
              <Text style={[styles.ptsUnit, { color: theme.primary }]}>PTS</Text>
            </View>
            
            <Text style={[styles.heroLabel, { color: theme.textMuted }]}>AVAILABLE BALANCE</Text>
            <View style={styles.cashbackRow}>
              <Icon name="wallet-outline" size={16} color={theme.primary} />
              <Text style={[styles.heroSub, { color: theme.textSub }]}>≈ LKR {Math.floor(points / 10)} CASHBACK</Text>
            </View>

            {nextTier && (
              <View style={styles.progressSection}>
                <View style={[styles.progressBar, { backgroundColor: theme.surface }]}>
                  <LinearGradient
                    colors={[theme.primary, theme.accent]}
                    style={[styles.progressFill, { width: `${progressPct}%` }]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={[styles.progressNote, { color: theme.textMuted }]}>
                  {pointsToNext} more points to unlock <Text style={{ color: theme.primary, fontWeight: '800' }}>{nextTier.name}</Text>
                </Text>
              </View>
            )}
          </LinearGradient>

        {/* How to Earn */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How to Earn Points</Text>
          {[
            { icon: '🛍️', label: 'Every LKR 100 spent',  pts: '+1 pt' },
            { icon: '⭐', label: 'Write a review',     pts: '+10 pts' },
            { icon: '👥', label: 'Refer a friend',     pts: '+50 pts' },
            { icon: '🎂', label: 'Birthday bonus',     pts: '+100 pts' },
          ].map((item, i) => (
            <View key={i} style={[styles.earnRow, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}>
              <Text style={styles.earnEmoji}>{item.icon}</Text>
              <Text style={[styles.earnLabel, { color: theme.textSub }]}>{item.label}</Text>
              <View style={[styles.earnBadge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.earnPts, { color: theme.primary }]}>{item.pts}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Membership Tiers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Membership Tiers</Text>
          {TIERS.map((tier, i) => (
            <View key={tier.name} style={[styles.tierCard, { backgroundColor: theme.card, borderColor: theme.border }, currentTier.name === tier.name && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }, shadow]}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                <View>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                  <Text style={[styles.tierPts, { color: theme.textMuted }]}>{tier.minPoints.toLocaleString()}+ points</Text>
                </View>
                {currentTier.name === tier.name && (
                  <View style={[styles.currentBadge, { backgroundColor: theme.primary + '20' }]}><Text style={[styles.currentBadgeText, { color: theme.primary }]}>Current</Text></View>
                )}
              </View>
              {tier.perks.map((perk, j) => (
                <View key={j} style={styles.perkRow}>
                  <Icon name="checkmark-circle" size={14} color={tier.color} />
                  <Text style={[styles.perkText, { color: theme.textSub }]}>{perk}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

      </ScrollView>
    </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loading:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  backBtn:          { marginBottom: 8 },
  headerTitle:      { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  headerTa:         { fontSize: 13, marginTop: 2, fontWeight: '700' },
  hero:             { marginHorizontal: 16, marginVertical: 16, borderRadius: Radius.lg, padding: 24 },
  heroTop:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  heroBadge:        { fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  pointsBadge:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pointsBadgeText:  { fontSize: 9, fontWeight: '900' },
  mainPoints:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 5 },
  heroPoints:       { fontSize: 64, fontWeight: '900', lineHeight: 68 },
  ptsUnit:          { fontSize: 18, fontWeight: '800', color: Colors.accent, marginBottom: 12 },
  heroLabel:        { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  cashbackRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroSub:          { fontSize: 15, fontWeight: '700' },
  progressSection:  { marginTop: 25 },
  progressBar:      { height: 8, backgroundColor: '#00000020', borderRadius: 4, overflow: 'hidden' },
  progressFill:     { height: '100%', borderRadius: 4 },
  progressNote:     { fontSize: 11, marginTop: 10, textAlign: 'center', fontWeight: '500' },
  section:          { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle:     { fontSize: 18, fontWeight: '900', marginBottom: 15 },
  earnRow:          { flexDirection: 'row', alignItems: 'center', gap: 15, borderRadius: Radius.md, padding: 16, marginBottom: 10, borderWidth: 1 },
  earnEmoji:        { fontSize: 28, width: 35 },
  earnLabel:        { flex: 1, fontSize: 14, fontWeight: '600' },
  earnBadge:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  earnPts:          { fontSize: 12, fontWeight: '800' },
  tierCard:         { borderRadius: Radius.lg, padding: 18, marginBottom: 15, borderWidth: 1 },
  tierHeader:       { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  tierEmoji:        { fontSize: 32 },
  tierName:         { fontSize: 19, fontWeight: '900' },
  tierPts:          { fontSize: 12, fontWeight: '600' },
  currentBadge:     { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full },
  currentBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  perkRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  perkText:         { fontSize: 13, fontWeight: '500' },
});
