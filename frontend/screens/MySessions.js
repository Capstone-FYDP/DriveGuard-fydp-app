import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { MainContext } from '../context/MainContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../components/loadingIndicator/loadingIndicator';
import SessionCard from '../components/card/session-card';
import { useIsFocused } from '@react-navigation/native';

const MySessions = () => {
  const context = useContext(MainContext);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (e) {
      console.log(e);
    }
  };

  const getSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        context.fetchPath + `api/getSessions`,
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
        console.log(json.sessionData);
        setSessions(json.sessionData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getSessions();
      console.log("test")
    }
  }, [isFocused]);

  //Display the duration in hours and mins -> output is array [hours, mins]
  const getTimeDuration = (startDate, endDate) => {
    let start = new Date(startDate)
    let end = new Date(endDate)
    const totalMin = Math.abs(start.getTime() - end.getTime()) / (1000 * 60)
 
    const hours = (totalMin / 60);
    const roundHours = Math.floor(hours);
    const minutes = (hours - roundHours) * 60;
    const roundMinutes = Math.round(minutes);
    return [roundHours, roundMinutes]
  }

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <Text style={styles.headerTitle}>My Trips</Text>
        </View>
      </View>
      {isLoading ? (
        <LoadingIndicator isAnimating={true} />
      ) : (
        <View style={styles.flatListContainer}> 
          <FlatList
            data={sessions.reverse()}
            renderItem={({item}) => {
              return(
                <>
                  <SessionCard
                    imageUrl={item.image_url}
                    startDate={new Date(item.startDate)}
                    duration={item.status == "COMPLETED" ? getTimeDuration(item.startDate, item.endDate) : []}
                    status={item.status}
                    numOfIncidents={item.numOfIncidents}
                  />
                  <View style={{height: 20}} />
                </>
              )
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbf6',
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
    flex: 1,
    width: '85%',
    justifyContent: 'space-around',
    alignSelf: 'center',
  },
});

export default MySessions;