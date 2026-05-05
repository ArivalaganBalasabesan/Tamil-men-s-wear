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
import SupportHistoryScreen   from '../screens/SupportHistoryScreen';
import AboutScreen            from '../screens/AboutScreen';



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
        tabBarShowLabel: false, // Cleaner minimalist look
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth:  0,
          height:          70,
          position:        'absolute',
          bottom:          20,
          left:            25,
          right:           25,
          borderRadius:    25,
          elevation:       15,
          ...shadow,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Icon name={focused ? "home" : "home-outline"} size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Icon name={focused ? "search" : "search-outline"} size={22} color={color} /> }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ 
          tabBarIcon: ({ color, focused }) => <Icon name={focused ? "cart" : "cart-outline"} color={color} size={22} /> 
        }} 
      />
      <Tab.Screen
        name="Advisor"
        component={StyleAdvisorScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Icon name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Icon name={focused ? "person" : "person-outline"} size={22} color={color} /> }}
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
        ) : (
          /* ── User ── */
          <>
            <Stack.Screen name="Main"           component={UserTabs} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="Checkout"       component={CheckoutScreen}
              options={{ headerShown: false }} />
            <Stack.Screen name="Payment"        component={PaymentScreen}
              options={{ headerShown: false }} />
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
            <Stack.Screen name="SupportHistory" component={SupportHistoryScreen}
              options={{ ...darkHeader, headerShown: true, title: 'MY REQUESTS' }} />
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
