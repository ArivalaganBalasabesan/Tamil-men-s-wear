import React, { useEffect, useState } from 'react';
import { NavigationContainer }           from '@react-navigation/native';
import { createNativeStackNavigator }    from '@react-navigation/native-stack';
import { createBottomTabNavigator }      from '@react-navigation/bottom-tabs';
import { useSelector }                   from 'react-redux';
import Icon                              from '@expo/vector-icons/Ionicons';
import AsyncStorage                      from '@react-native-async-storage/async-storage';
import { Colors, Shadows }               from '../constants/Theme';

// ── Screens ──────────────────────────────────────────────────
import SplashScreen           from '../screens/SplashScreen';
import OnboardingScreen       from '../screens/OnboardingScreen';
import LoginScreen            from '../screens/LoginScreen';

// User screens
import HomeScreen             from '../screens/HomeScreen';
import ProductDetailsScreen   from '../screens/ProductDetailsScreen';
import CartScreen             from '../screens/CartScreen';
import CheckoutScreen         from '../screens/CheckoutScreen';
import ProfileScreen          from '../screens/ProfileScreen';
import WishlistScreen         from '../screens/WishlistScreen';
import OrderHistoryScreen     from '../screens/OrderHistoryScreen';
import ProductRequestScreen   from '../screens/ProductRequestScreen';
import SearchScreen           from '../screens/SearchScreen';
import CategoryScreen         from '../screens/CategoryScreen';
import OrderTrackingScreen    from '../screens/OrderTrackingScreen';
import LoyaltyScreen          from '../screens/LoyaltyScreen';
import ReviewScreen           from '../screens/ReviewScreen';
import PaymentScreen          from '../screens/PaymentScreen';
import PaymentSuccessScreen   from '../screens/PaymentSuccessScreen';
import OutfitBuilderScreen    from '../screens/OutfitBuilderScreen';
import StyleAdvisorScreen     from '../screens/StyleAdvisorScreen';
import SupportScreen          from '../screens/SupportScreen';
import AboutScreen            from '../screens/AboutScreen';

// Admin screens
import AdminDashboardScreen   from '../screens/AdminDashboardScreen';
import AdminProductScreen     from '../screens/AdminProductScreen';
import AdminProductsScreen    from '../screens/AdminProductsScreen';
import AdminOrdersScreen      from '../screens/AdminOrdersScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─────────────────────────────────────────────────────────────
//  Bottom Tab Navigator (User)
// ─────────────────────────────────────────────────────────────
function UserTabs() {
  const { isDark } = useSelector(s => s.theme);
  const theme  = isDark ? Colors.dark : Colors.light;
  const shadow = isDark ? Shadows.dark : Shadows.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   theme.primary,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth:  0,
          paddingBottom:   10,
          paddingTop:      10,
          height:          65,
          position:        'absolute',
          bottom:          15,
          left:            20,
          right:           20,
          borderRadius:    20,
          ...shadow,
        },
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '800',
          marginBottom: 5
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} /> }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="cart" color={color} size={size} /> 
        }} 
      />
      <Tab.Screen 
        name="Wishlist" 
        component={WishlistScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => <Icon name="heart" color={color} size={size} /> 
        }} 
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="search" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Advisor"
        component={StyleAdvisorScreen}
        options={{ tabBarLabel: 'Advisor', tabBarIcon: ({ color, size }) => <Icon name="sparkles" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <Icon name="person" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// ─────────────────────────────────────────────────────────────
//  Common Stack Options
// ─────────────────────────────────────────────────────────────
const darkHeader = {
  headerStyle:     { backgroundColor: '#1A1A1A' },
  headerTintColor: '#D4AF37',
  headerTitleStyle:{ fontWeight: '800' },
  headerBackTitle: '',
};

// ─────────────────────────────────────────────────────────────
//  Root Navigator
// ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const [isReady,       setIsReady]       = useState(false);
  const [showOnboarding,setShowOnboarding]= useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then(val => {
      setShowOnboarding(!val);
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>

        {/* ── NOT logged in ── */}
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash"      component={SplashScreen} />
            <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
            <Stack.Screen name="Login"       component={LoginScreen} />
          </>
        ) : user?.role === 'admin' ? (
          /* ── Admin ── */
          <>
            <Stack.Screen name="ADMIN_DASHBOARD" component={AdminDashboardScreen} />
            <Stack.Screen name="ADMIN_PRODUCTS" component={AdminProductScreen} />
            <Stack.Screen name="AdminProducts" component={AdminProductsScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="AdminOrders"   component={AdminOrdersScreen}
              options={{ headerShown: false }} />
          </>
        ) : (
          /* ── User ── */
          <>
            <Stack.Screen name="Main"           component={UserTabs} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
              options={{ ...darkHeader, headerShown: true, title: 'PRODUCT DETAILS' }} />
            <Stack.Screen name="Checkout"       component={CheckoutScreen}
              options={{ ...darkHeader, headerShown: true, title: 'CHECKOUT' }} />
            <Stack.Screen name="Payment"        component={PaymentScreen}
              options={{ ...darkHeader, headerShown: true, title: 'PAYMENT' }} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="OrderTracking"  component={OrderTrackingScreen}
              options={{ ...darkHeader, headerShown: true, title: 'TRACK ORDER' }} />
            <Stack.Screen name="OrderHistory"   component={OrderHistoryScreen}
              options={{ ...darkHeader, headerShown: true, title: 'MY ORDERS' }} />
            <Stack.Screen name="Loyalty"        component={LoyaltyScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="Reviews"        component={ReviewScreen}
              options={{ ...darkHeader, headerShown: true, title: 'REVIEWS' }} />
            <Stack.Screen name="ProductRequest" component={ProductRequestScreen}
              options={{ ...darkHeader, headerShown: true, title: 'REQUEST PRODUCT' }} />
            <Stack.Screen name="Categories"     component={CategoryScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="CartStack"      component={CartScreen}
              options={{ ...darkHeader, headerShown: true, title: 'MY CART' }} />
            <Stack.Screen name="WishlistStack"  component={WishlistScreen}
              options={{ ...darkHeader, headerShown: true, title: 'MY WISHLIST' }} />
            <Stack.Screen name="Support"        component={SupportScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="About"          component={AboutScreen}
              options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
