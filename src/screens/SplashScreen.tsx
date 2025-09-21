import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/slices/authSlice';
import { setAppLoading } from '../redux/slices/appSlice';
import { secureStorage } from '../utils/secureStorage';

const SplashScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    console.log('🚀 [SPLASH] App starting...');

    const initializeApp = async () => {
      try {
        console.log('🔍 [SPLASH] Checking for stored token...');
        const token = await secureStorage.getItem('token');

        if (token && isMountedRef.current) {
          console.log('✅ Token found, setting authenticated state');
          dispatch(setToken(token));
        } else {
          console.log('ℹ️ No token found, user needs to login');
        }

        setTimeout(() => {
          if (isMountedRef.current) {
            console.log('✅ App initialization complete');
            dispatch(setAppLoading(false));
          }
        }, 2000);
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        if (isMountedRef.current) {
          dispatch(setAppLoading(false));
        }
      }
    };

    initializeApp();

    return () => {
      isMountedRef.current = false;
    };
  }, [dispatch]);

  return (
    <View style={styles.container}>
      {/* Center Image */}
      <Image
        source={require('../../assets/images/splash-logo.png')} // 👈 your uploaded logo
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Premium Text */}
      <Text style={styles.text}>Partner App</Text>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B9AE" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 60,
  },
});

export default SplashScreen;
