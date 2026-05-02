import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { Colors } from '../constants/Theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.3)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      navigation.replace(onboarded ? 'Login' : 'Onboarding');
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={isDark ? [theme.background, '#0d0d0d', theme.background] : ['#FFF9F0', '#FFFFFF', '#FFF9F0']} style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.orb, { backgroundColor: theme.primary + '10' }]} />

      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={[styles.crown, { color: theme.primary }]}>♔</Text>
        <Text style={[styles.tamilText, { color: theme.primary }]}>தமிழ்</Text>
        <Text style={[styles.brandText, { color: theme.text }]}>MEN'S WEAR</Text>

        <View style={styles.separator}>
          <View style={[styles.line, { backgroundColor: theme.primary + '50' }]} />
          <Text style={[styles.diamond, { color: theme.primary }]}>◆</Text>
          <View style={[styles.line, { backgroundColor: theme.primary + '50' }]} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: fadeAnim }], color: theme.textMuted }]}>
        PREMIUM FASHION HUB
      </Animated.Text>

      <Animated.View style={[styles.dots, { opacity: fadeAnim }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, { opacity: 0.6 + i * 0.2, backgroundColor: theme.primary }]} />
        ))}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orb:          { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: height * 0.15, alignSelf: 'center' },
  logoContainer:{ alignItems: 'center' },
  crown:        { fontSize: 56, marginBottom: 10 },
  tamilText:    { fontSize: 64, fontWeight: '900', letterSpacing: 8 },
  brandText:    { fontSize: 18, fontWeight: '300', letterSpacing: 14, marginTop: 8 },
  separator:    { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: 220 },
  line:         { flex: 1, height: 0.5 },
  diamond:      { fontSize: 8, marginHorizontal: 12 },
  tagline:      { position: 'absolute', bottom: height * 0.18, fontSize: 12, letterSpacing: 3, fontWeight: '400' },
  dots:         { position: 'absolute', bottom: height * 0.1, flexDirection: 'row', gap: 10 },
  dot:          { width: 5, height: 5, borderRadius: 2.5 },
});
