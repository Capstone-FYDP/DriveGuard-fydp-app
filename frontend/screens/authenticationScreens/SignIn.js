import React, { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../context/MainContext';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomCard from '../../components/card/custom-card';
import CustomHeader from '../../components/header/custom-header';
import CustomInputBox from '../../components/inputBox/custom-inputBox';
import CustomButton from '../../components/button/custom-button';
import LoadingIndicator from '../../components/loadingIndicator/loadingIndicator';
import Toast from 'react-native-toast-message';
import { validate } from 'validate.js';
import signinValidation from '../../validation/signin-validation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';

const Signin = ({ navigation }) => {
  const context = useContext(MainContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const errorCheckOrder = ['email', 'password'];

  const getToken = () => {
    return AsyncStorage.getItem('auth_token');
  };

  const setToken = (token) => {
    return AsyncStorage.setItem('auth_token', token);
  };

  useEffect(() => {
    getToken().then(async (token) => {
      const response = await fetch(context.fetchPath + 'api/validateToken', {
        method: 'GET',
        headers: {
          'x-access-tokens': token,
        },
      });

      const json = await response.json();

      if (json.valid === true) {
        navigation.navigate('Navbar');
      }
    });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    // This validate function performs the error checking using the
    // signupValidation object and returns all the errors. If
    // there are no errors, then validationResult will be null
    const validationResult = validate({ email, password }, signinValidation);

    if (validationResult) {
      for (let error of errorCheckOrder) {
        if (validationResult[error]) {
          Toast.show({
            text1: 'Error',
            text2: validationResult[error][0],
            type: 'error',
          });
          break;
        }
      }
      setLoading(false);
    } else {
      let response;
      let json;
      console.log('Email: ', email);
      console.log('Password: ', password);
      try {
        response = await fetch(context.fetchPath + 'api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        json = await response.json();
      } catch (error) {
        console.error(error);
      }

      if (json.token) {
        setToken(json.token);
        navigation.navigate('Navbar');
      } else if (json.message) {
        Toast.show({
          text1: 'Error',
          text2: json.message,
          type: 'error',
        });
      } else {
        Toast.show({
          text1: 'Error',
          text2: 'An error occured while trying to log in. Please try again.',
          type: 'error',
        });
      }

      setLoading(false);
    }
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={context.gradient}
      style={styles.mainContainer}
    >
      <View style={styles.upperContainer}>
        <CustomHeader additionalStyles={styles.signinHeader}>
          Sign in
        </CustomHeader>
      </View>
      <CustomCard
        outerStyle={styles.lowerOuterContainer}
        innerStyle={styles.lowerInnerContainer}
        noTouchOpacity
      >
        <CustomHeader additionalStyles={styles.header}>Welcome Back</CustomHeader>
        <ScrollView style={styles.scrollInputContainer}>
          <View style={styles.inputContainer}>
            <CustomInputBox
              field="Email"
              placeholder="Enter your email address"
              value={email}
              onChange={setEmail}
            />
          </View>
          <View style={styles.inputContainer}>
            <CustomInputBox
              field="Password"
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              secureTextEntry={true}
            />
          </View>
        </ScrollView>

        {/* <CustomButton
          type="clear"
          text="Forgot Password?"
          textColor="#ff8d4f"
          //NAVIGATE TO FORGOT PASSWORD
          // onPress={() => navigation.navigate("forgotPassword")}
        /> */}

        <View style={styles.inputContainer}>
            <CustomButton
              onPress={handleSubmit}
              type="emphasized"
              text={
                loading ? (
                  <LoadingIndicator color="white" isAnimating={true} />
                ) : (
                  'Sign in'
                )
              }
            />
        </View>

        <View style={styles.createAccountContainer}>
          <Text
            style={[
              styles.bottomText,
              context.theme === 'dark'
                ? { color: '#ffffff' }
                : { color: '#212121' },
            ]}
          >
            Don't have an account?{' '}
          </Text>
          <CustomButton
            type="clear"
            text="Sign Up"
            textColor="#ff8d4f"
            additionalStyling={styles.signupButton}
            //NAVIGATE TO SIGNUP
            onPress={() => navigation.navigate('Signup')}
          />
        </View>
      </CustomCard>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  signinHeader: { color: '#ffffff' },
  header: { marginBottom: 30 },
  upperContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    flex: 1,
    padding: 40,
  },
  scrollInputContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 25,
  },
  lowerOuterContainer: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    flex: 4,
    margin: 0,
    padding: 40,
  },
  lowerInnerContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 400,
  },
  inputContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 25,
  },
  createAccountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bottomText: {
    fontFamily: 'Oxygen-Regular',
    fontSize: 16,
  },
  signupButton: {
    marginLeft: 5,
  },
});

export default Signin;
