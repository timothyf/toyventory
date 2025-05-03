import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { initDB } from './services/db';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Ionicons.loadFont().then(() => {
      console.log('Ionicons font loaded');
    });
  }, []);

  useEffect(() => {
    const prepareDB = async () => {
      try {
        await initDB();
        setIsReady(true);
      } catch (err) {
        console.error('DB failed to initialize:', err);
      }
    };

    prepareDB();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});
