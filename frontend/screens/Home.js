import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import CustomCard from '../components/card/custom-card';
import { MainContext } from '../context/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../components/loadingIndicator/loadingIndicator';
import { LinearGradient } from 'expo-linear-gradient';

const Home = () => {
  const context = useContext(MainContext);
  const [total, setTotal] = useState();
  const [isLoading, setLoading] = useState(true);
  const [classData, setClassData] = useState([]);

  const DashboardCard = ({ item }) => {
    return (
      <CustomCard
        outerStyle={[styles.listCard]}
        innerStyle={styles.infoCardInner}
      >
        <View style={styles.cardContainer}>
          <View style={styles.textContainer}>
            <Text style={[styles.title]}>{item}</Text>
            <Text style={[styles.number, { color: context.primaryColour }]}>
              {classData[item]}
            </Text>
          </View>
        </View>
      </CustomCard>
    );
  };

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (e) {
      console.log(e);
    }
  };

  const getTotalDistractions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        context.fetchPath + `api/totaldistractions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        }
      );
      const json = await response.json();
      setTotal(json.message);
    } catch (error) {
      console.error(error);
    }
  };

  const getClassificationData = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        context.fetchPath + `api/classifydistractions`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-tokens': token,
          },
        }
      );
      const json = await response.json();

      if (json.message) {
        Toast.show({
          text1: 'Error',
          text2: json.message,
          type: 'error',
        });
      } else {
        console.log(json.userData[0]);
        setClassData(json.userData[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTotalDistractions();
    getClassificationData();
  }, []);

  return (
    <View
      style={[
        styles.homeContainer,
        { backgroundColor: context.screenBackground },
      ]}
    >
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <Text style={styles.headerTitle}>My Driving Score</Text>
        </View>
      </View>
      {isLoading ? (
        <LoadingIndicator isAnimating={true} />
      ) : (
        <FlatList
          ListHeaderComponent={
            <CustomCard
              outerStyle={[styles.infoCardOuter, styles.firstCard]}
              innerStyle={styles.infoCardInner}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={context.gradient}
                style={[styles.linearGradient]}
              >
                <View style={styles.firstCardTextContainer}>
                  <Text style={[styles.title, styles.firstCardTitle]}>
                    Total Distractions
                  </Text>
                  <Text style={[styles.number, styles.firstCardNumber]}>
                    {total}
                  </Text>
                </View>
              </LinearGradient>
            </CustomCard>
          }
          numColumns={2}
          columnWrapperStyle={styles.flatListContainer}
          data={Object.keys(classData)}
          renderItem={DashboardCard}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  upperContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  textWrapper: {
    width: '85%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '600',
    color: '#3f2021',
  },
  flatListContainer: {
    width: '85%',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  linearGradient: {
    borderRadius: 20,
    width: '100%',
    padding: 20,
  },
  listCard: {
    flex: 0.5,
    marginVertical: 7,
    marginHorizontal: 5,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  infoCardOuter: {
    width: '85%',
    marginVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  infoCardInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstCard: {
    marginTop: 20,
    backgroundColor: '#f5ad47',
  },
  firstCardTextContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  number: {
    fontSize: 32,
    fontWeight: '600',
    color: '#f5ad47',
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  firstCardNumber: {
    fontSize: 40,
    color: '#fff',
  },
  firstCardTitle: {
    fontSize: 20,
    color: '#fff',
  },
});

export default Home;
