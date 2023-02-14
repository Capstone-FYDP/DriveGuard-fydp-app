import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import CustomCard from '../components/card/CustomCard';
import { MainContext } from '../context/MainContext';

export default function Home() {
  const data = [
    { distraction: 'texting', count: '10', key: '1' },
    { distraction: 'drinking', count: '5', key: '2' },
    { distraction: 'talking on phone', count: '8', key: '3' },
    { distraction: 'using radio', count: '15', key: '4' },
    { distraction: 'sleeping', count: '6', key: '5' },
    { distraction: 'makeup', count: '8', key: '6' },
  ];
  return (
    <ScrollView>
      {data.map((item) => (
        <CustomCard
          outerStyle={styles.infoCardOuter}
          innerStyle={styles.infoCardInner}
        >
          <View style={styles.cardContainer}>
            <View style={styles.textContainer}>
              <Text style={[styles.header]}>{item.count}</Text>
              <Text style={[styles.subtitle]}>{item.distraction}</Text>
            </View>
          </View>
        </CustomCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardOuter: {
    width: '85%',
    marginHorizontal: 0,
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 15,
    alignSelf: 'center',
  },
  infoCardInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#7E7E7E',
  },
});
