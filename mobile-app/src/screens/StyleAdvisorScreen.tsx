import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, Image, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Colors, Shadows, Radius } from '../constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api/api';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  {
    id: 'occasion',
    question: "What's the occasion?",
    options: ["Wedding", "Office", "Casual", "Party"],
  },
  {
    id: 'style',
    question: "What's your preferred style?",
    options: ["Traditional", "Modern Slim", "Relaxed Fit", "Classic"],
  },
  {
    id: 'budget',
    question: "Budget range?",
    options: ["Under LKR 2000", "LKR 2000 - LKR 5000", "LKR 5000 - LKR 10000", "Premium"],
  }
];

export default function StyleAdvisorScreen({ navigation }) {
  const { isDark } = useSelector(s => s.theme);
  const theme = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products for advisor:', err);
    }
  };

  const handleSelect = (option) => {
    const qId = QUESTIONS[step].id;
    const newAnswers = { ...answers, [qId]: option };
    setAnswers(newAnswers);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      generateRecommendations(newAnswers);
    }
  };

  const generateRecommendations = (finalAnswers) => {
    setLoading(true);
    
    // Logic for filtering
    let filtered = products.filter(p => (p.stock || 0) > 0);

    // Filter by Budget
    if (finalAnswers.budget === 'Under LKR 2000') filtered = filtered.filter(p => p.price < 2000);
    else if (finalAnswers.budget === 'LKR 2000 - LKR 5000') filtered = filtered.filter(p => p.price >= 2000 && p.price <= 5000);
    else if (finalAnswers.budget === 'LKR 5000 - LKR 10000') filtered = filtered.filter(p => p.price >= 5000 && p.price <= 10000);
    else if (finalAnswers.budget === 'Premium') filtered = filtered.filter(p => p.price > 10000);

    // Filter by Occasion/Category (Heuristic)
    if (finalAnswers.occasion === 'Wedding') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase().includes('suit') || 
        p.category?.toLowerCase().includes('trad') || 
        p.category?.toLowerCase().includes('ethnic')
      );
    } else if (finalAnswers.occasion === 'Office') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase().includes('shirt') || 
        p.category?.toLowerCase().includes('pant') || 
        p.category?.toLowerCase().includes('formal')
      );
    } else if (finalAnswers.occasion === 'Casual') {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase().includes('t-shirt') || 
        p.category?.toLowerCase().includes('jean') || 
        p.category?.toLowerCase().includes('casual')
      );
    }

    setRecommendations(filtered.slice(0, 5));
    setLoading(false);
    setShowResult(true);
  };

  if (showResult) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient colors={[theme.primary, '#2A2A2A']} style={styles.resultHeader}>
          <Icon name="sparkles" size={40} color="#000" />
          <Text style={styles.resultTitle}>Your Style Match</Text>
          <Text style={styles.resultSub}>Curated based on your {answers.occasion} needs</Text>
        </LinearGradient>
        
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          {recommendations.length > 0 ? (
            <>
              <Text style={[styles.matchDesc, { color: theme.textMuted }]}>
                We've found {recommendations.length} items in stock that match your <Text style={{ color: theme.primary, fontWeight: '800' }}>{answers.style}</Text> preference.
              </Text>
              
              {recommendations.map((item) => (
                <TouchableOpacity 
                  key={item._id} 
                  style={[styles.prodCard, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}
                  onPress={() => navigation.navigate('ProductDetails', { product: item })}
                >
                  <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.prodImg} />
                  <View style={styles.prodInfo}>
                    <Text style={[styles.prodName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.prodPrice, { color: theme.primary }]}>LKR {item.price.toLocaleString()}</Text>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>IN STOCK</Text>
                    </View>
                  </View>
                  <Icon name="chevron-forward" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-outline" size={60} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No direct matches found</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>Try adjusting your budget or style preference.</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.resetBtn, { borderColor: theme.border }]} 
            onPress={() => { setShowResult(false); setStep(0); setAnswers({}); }}
          >
            <Text style={[styles.resetBtnText, { color: theme.text }]}>Retake Style Quiz</Text>
          </TouchableOpacity>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }

  const q = QUESTIONS[step];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.progressContainer, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBar, { width: `${((step + 1) / QUESTIONS.length) * 100}%`, backgroundColor: theme.primary }]} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.stepText, { color: theme.primary }]}>STEP {step + 1} OF {QUESTIONS.length}</Text>
        <Text style={[styles.question, { color: theme.text }]}>{q.question}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.optionBtn, { backgroundColor: theme.card, borderColor: theme.border }, shadow]}
              onPress={() => handleSelect(opt)}
            >
              <Text style={[styles.optionText, { color: theme.text }]}>{opt}</Text>
              <Icon name="chevron-forward" size={20} color={theme.primary} />
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
  
  resultHeader: { padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  resultTitle: { color: '#000', fontSize: 22, fontWeight: '900', marginTop: 10 },
  resultSub: { color: 'rgba(0,0,0,0.6)', fontSize: 13, fontWeight: '600' },
  resultScroll: { padding: 25 },
  matchDesc: { fontSize: 14, lineHeight: 22, marginBottom: 25, textAlign: 'center' },
  
  prodCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 18, marginBottom: 12, borderWidth: 1 },
  prodImg: { width: 70, height: 70, borderRadius: 12 },
  prodInfo: { flex: 1, marginLeft: 15, gap: 2 },
  prodName: { fontSize: 15, fontWeight: '700' },
  prodPrice: { fontSize: 14, fontWeight: '800' },
  stockBadge: { backgroundColor: '#22C55E20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  stockText: { color: '#22C55E', fontSize: 8, fontWeight: '900' },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 15 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  
  resetBtn: { marginTop: 20, padding: 18, borderRadius: 15, borderWidth: 1, alignItems: 'center' },
  resetBtnText: { fontWeight: '700', fontSize: 14 },
});

