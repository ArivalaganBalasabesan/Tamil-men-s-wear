import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  {
    id: 1,
    question: "What's the occasion?",
    options: ["Wedding", "Office", "Casual", "Party"],
  },
  {
    id: 2,
    question: "What's your preferred style?",
    options: ["Traditional", "Modern Slim", "Relaxed Fit", "Classic"],
  },
  {
    id: 3,
    question: "Budget range?",
    options: ["Under ₹2000", "₹2000 - ₹5000", "₹5000 - ₹10000", "Premium"],
  }
];

export default function StyleAdvisorScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [QUESTIONS[step].id]: option };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient colors={[theme.primary, '#2C2C2C']} style={styles.resultHeader}>
          <Icon name="sparkles" size={50} color={theme.accent} />
          <Text style={styles.resultTitle}>Your Style Match</Text>
          <Text style={styles.resultSub}>Based on your preferences</Text>
        </LinearGradient>
        
        <View style={styles.resultCard}>
          <Text style={[styles.matchText, { color: theme.text }]}>
            We recommend our <Text style={{ color: theme.accent }}>Premium Silk Traditional Set</Text> for your upcoming {answers[1]}.
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.accent }, shadow]}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.actionBtnText}>Shop Recommendation</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowResult(false); setStep(0); }}>
            <Text style={[styles.resetText, { color: theme.textMuted }]}>Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const q = QUESTIONS[step];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBar, { width: `${((step + 1) / QUESTIONS.length) * 100}%`, backgroundColor: theme.accent }]} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.stepText, { color: theme.accent }]}>STEP {step + 1} OF {QUESTIONS.length}</Text>
        <Text style={[styles.question, { color: theme.text }]}>{q.question}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.optionBtn, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>{opt}</Text>
              <Icon name="chevron-forward" size={20} color={theme.accent} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { height: 4, marginTop: 60 },
  progressBar: { height: '100%' },
  content: { padding: 30, flex: 1 },
  stepText: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  question: { fontSize: 28, fontWeight: '900', lineHeight: 36, marginBottom: 40 },
  options: { gap: 15 },
  optionBtn: { padding: 20, borderRadius: Radius.md, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '600' },
  resultHeader: { padding: 50, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  resultTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 15 },
  resultSub: { color: '#AAA', fontSize: 14, marginTop: 5 },
  resultCard: { padding: 30, alignItems: 'center' },
  matchText: { fontSize: 18, textAlign: 'center', lineHeight: 28, marginBottom: 30 },
  actionBtn: { paddingVertical: 18, paddingHorizontal: 40, borderRadius: Radius.full },
  actionBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
  resetText: { marginTop: 20, fontSize: 14, textDecorationLine: 'underline' },
});
