import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/button/custom-button';

export default function Profile( { navigation } ) {
  const removeToken = () => {
    return AsyncStorage.removeItem('auth_token');
  };

  return (
    <View style={styles.container}>
      <Text>Profile</Text>
      <CustomButton 
        text='Logout'
        type='outlined'
        onPress={() => 
          removeToken().then(navigation.navigate('Signin'))}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
