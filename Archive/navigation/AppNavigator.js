
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CollectionListScreen from '../screens/CollectionListScreen';
import AddEditFigureScreen from '../screens/AddEditFigureScreen';
import FigureDetailScreen from '../screens/FigureDetailScreen';
import PriceLookupScreen from '../screens/PriceLookupScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import { initDB } from '../services/db';
import { useEffect } from 'react';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


function MainTabs() {
  console.log('MainTabs loaded');

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        console.log('Configuring tab:', route.name); // 👈 Added
        return {
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Collection') iconName = 'albums-outline';
            else if (route.name === 'PriceLookup') iconName = 'pricetag-outline';
            else if (route.name === 'Stats') iconName = 'stats-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        };
      }}
    >
      <Tab.Screen
        name="Collection"
        component={CollectionListScreen}
        listeners={{
          focus: () => console.log('CollectionListScreen focused'),
        }}
      />
      <Tab.Screen
        name="PriceLookup"
        component={PriceLookupScreen}
        listeners={{
          focus: () => console.log('PriceLookupScreen focused'),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        listeners={{
          focus: () => console.log('StatsScreen focused'),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  console.log('AppNavigator loaded');

  useEffect(() => {
    initDB()
      .then(() => console.log('DB ready'))
      .catch(err => console.error('DB init error:', err));
  }, []);

  return (
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddEdit" component={AddEditFigureScreen} />
        <Stack.Screen name="Detail" component={FigureDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
          name="BarcodeScanner"
          component={BarcodeScannerScreen}
          options={{ title: 'Scan Barcode' }}
        />
      </Stack.Navigator>
  );
}
