import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import CustomCard from '../components/card/CustomCard';
import { MainContext } from '../context/MainContext';

const stats = [
  { distraction: 'Texting', count: '10', id: '0' },
  { distraction: 'Talking on phone', count: '5', id: '1' },
  { distraction: 'Operating Radio', count: '8', id: '2' },
  { distraction: 'Drinking', count: '15', id: '3' },
  { distraction: 'Reaching behind', count: '6', id: '4' },
  { distraction: 'Hair and makeup', count: '8', id: '5' },
  { distraction: 'Talking to passenger', count: '8', id: '6' },
];

const colourList = [
  '#fc6d6b',
  '#7956f8',
  '#fd9167',
  '#38c2fb',
  '#5a65f8',
  '#A7C957',
];

const DashboardCard = ({ item }) => {
  return (
    <CustomCard
      outerStyle={[styles.listCard]}
      innerStyle={styles.infoCardInner}
    >
      <View style={styles.cardContainer}>
        <View style={styles.textContainer}>
          <Text style={[styles.title]}>{item.distraction}</Text>
          <Text style={[styles.number, { color: colourList[item.id % 6] }]}>
            {item.count}
          </Text>
        </View>
      </View>
    </CustomCard>
  );
};

const Home = () => {
  const total = { distraction: 'Total Distractions', count: '30' };
  return (
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
      data={stats}
      renderItem={DashboardCard}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
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
    alignItems: 'flex-start',
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
    alignItems: 'flex-start',
  },
  number: {
    fontSize: 32,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: '300',
    color: '#7E7E7E',
  },
  firstCardNumber: {
    fontSize: 40,
  },
  firstCardTitle: {
    fontSize: 16,
  },
});

export default Home;
