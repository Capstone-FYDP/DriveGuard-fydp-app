import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import CustomCard from '../components/card/CustomCard';
import { MainContext } from '../context/MainContext';

const api_url = 'https://reactnative.dev/movies.json';

const DashboardCard = ({ item }) => {
  return (
    <CustomCard
      outerStyle={[styles.listCard]}
      innerStyle={styles.infoCardInner}
    >
      <View style={styles.cardContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title]}>{item.title}</Text>
          <Text style={[styles.number]}>{item.releaseYear}</Text>
        </View>
      </View>
    </CustomCard>
  );
};

const Home = () => {
  const total = { distraction: 'Total Distractions', count: '30' };
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getMovies = async () => {
    try {
      const response = await fetch(api_url);
      const json = await response.json();
      setData(json.movies);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <View style={styles.homeContainer}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          ListHeaderComponent={
            <CustomCard
              outerStyle={[styles.infoCardOuter, styles.firstCard]}
              innerStyle={styles.infoCardInner}
            >
              <View style={styles.firstCardTextContainer}>
                <Text style={[styles.title, styles.firstCardTitle]}>
                  {total.distraction}
                </Text>
                <Text style={[styles.number, styles.firstCardNumber]}>
                  {total.count}
                </Text>
              </View>
            </CustomCard>
          }
          numColumns={2}
          columnWrapperStyle={styles.flatListContainer}
          data={data}
          keyExtractor={({ id }) => id}
          renderItem={DashboardCard}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    backgroundColor: '#f9f5ee',
  },
  flatListContainer: {
    width: '85%',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
  listCard: {
    flex: 0.5,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  infoCardOuter: {
    width: '85%',
    marginVertical: 10,
    padding: 15,
    borderRadius: 15,
    alignSelf: 'center',
  },
  infoCardInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 80,
  },
  firstCard: {
    marginTop: 20,
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
    color: '#c80f2f',
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#3f2021',
  },
  firstCardNumber: {
    fontSize: 40,
    color: '#c80f2f',
  },
  firstCardTitle: {
    fontSize: 16,
    color: '#3f2021',
  },
});

export default Home;
