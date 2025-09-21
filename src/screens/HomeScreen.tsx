import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import LoadingButton from '../components/LoadingButton';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>✅</Text>
        </View>
        
        <Text style={styles.title}>
          Welcome to MoneySquad!
        </Text>
        
        <Text style={styles.subtitle}>
          You have successfully logged in to your account.
        </Text>
      </View>

      <LoadingButton
        title="Logout"
        onPress={handleLogout}
        mode="outlined"
        style={styles.logoutButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#00B9AE',
    borderRadius: 48,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#222222',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#888888',
    fontSize: 18,
    textAlign: 'center',
  },
  logoutButton: {
    width: '100%',
  },
});

export default HomeScreen;