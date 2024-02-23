import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import {
  humanDateString,
  humanTimeString,
  pluralize,
} from '../utils/string-utils';
import IconBadge from '../components/iconBadge/custom-iconBadge';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { MainContext } from '../context/MainContext';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import LoadingIndicator from '../components/loadingIndicator/loadingIndicator';

const SessionDetails = ({ route, navigation }) => {
  const { session } = route.params;
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const context = useContext(MainContext);

  const isFocused = useIsFocused();

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (e) {
      console.log(e);
    }
  };

  // const getSession = async () => {
  //   try {
  //     const token = await getToken();
  //     const response = await fetch(
  //       context.fetchPath + `api/getSession/${session.session_id}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'x-access-tokens': token,
  //         },
  //       }
  //     );
  //     const json = await response.json();

  //     if (json.message) {
  //       Toast.show({
  //         text1: 'Error',
  //         text2: json.message,
  //         type: 'error',
  //       });
  //     } else {
  //       setSessions(
  //         json.sessionData
  //           .map((item) => {
  //             return {
  //               ...item,
  //               startDate: new Date(item.startDate),
  //               endDate: new Date(item.endDate),
  //             };
  //           })
  //           .sort((a, b) => {
  //             // Put whatevers active at the top first
  //             if (a.status == 'ACTIVE' && b.status != 'ACTIVE') return 1;
  //             if (a.status != 'ACTIVE' && b.status == 'ACTIVE') return -1;
  //             // Sort in descending order from latest to oldest
  //             if (a.status == 'ACTIVE' && b.status == 'ACTIVE')
  //               return a.startDate - b.startDate;
  //             return a.endDate - b.endDate;
  //           })
  //       );
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getIncidents = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        context.fetchPath + `api/getIncidents/${session.session_id}`,
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
        setIncidents(
          json.incidentData
            .map((item) => {
              return {
                ...item,
                classification: item.classification,
              };
            })
            .sort((a, b) => {
              // Put whatevers active at the top first
              if (a.status == 'ACTIVE' && b.status != 'ACTIVE') return 1;
              if (a.status != 'ACTIVE' && b.status == 'ACTIVE') return -1;
              // Sort in descending order from latest to oldest
              if (a.status == 'ACTIVE' && b.status == 'ACTIVE')
                return a.startDate - b.startDate;
              return a.endDate - b.endDate;
            })
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getIncidents();
    }
  }, [isFocused]);

  const path = [
    { latitude: 43.47368, longitude: -80.54025 },
    { latitude: 43.47407, longitude: -80.53903 },
    { latitude: 43.47442, longitude: -80.53809 },
    { latitude: 43.474309, longitude: -80.53794 },
    { latitude: 43.475107, longitude: -80.53851 },
    { latitude: 43.475628, longitude: -80.53889 },
    { latitude: 43.476002, longitude: -80.53917 },
  ];

  const getTimeDuration = (startDate, endDate) => {
    let start = new Date(startDate);
    let end = new Date(endDate);
    const totalMin = Math.abs(start.getTime() - end.getTime()) / (1000 * 60);

    const hours = totalMin / 60;
    const roundHours = Math.floor(hours);
    const minutes = (hours - roundHours) * 60;
    const roundMinutes = Math.round(minutes);
    return [roundHours, roundMinutes];
  };

  const getIncidentColor = (numOfIncidents) => {
    if (numOfIncidents == 0) {
      return '#27ae60';
    } else if (numOfIncidents > 0 && numOfIncidents <= 3) {
      return '#f39c12';
    } else {
      return '#e74c3c';
    }
  };

  const getIncidentIcon = (numOfIncidents) => {
    if (numOfIncidents == 0) {
      return 'checkcircleo';
    } else if (numOfIncidents > 0 && numOfIncidents <= 3) {
      return 'warning';
    } else {
      return 'exclamationcircle';
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: context.screenBackground }]}
    >
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <View style={{ marginRight: 20 }}>
            <IconBadge
              icon='arrowleft'
              size={30}
              library='AntDesign'
              noTouchOpacity
              onPress={() => navigation.navigate('Trips')}
            />
          </View>
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            Trip Details
          </Text>
        </View>
      </View>

      {session && (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.mapStyle}
            region={{
              latitude: path[5].latitude,
              longitude: path[5].longitude,
              latitudeDelta: 0.007,
              longitudeDelta: 0.007,
            }}
          >
            <Marker
              coordinate={{
                latitude: path[0].latitude,
                longitude: path[0].longitude,
              }}
            />
            <Marker
              coordinate={{
                latitude: path[path.length - 1].latitude,
                longitude: path[path.length - 1].longitude,
              }}
            />
            <Polyline coordinates={path} strokeWidth={5} />
          </MapView>
          <View
            style={[
              styles.infoCardOuter,
              { backgroundColor: context.screenBackground },
            ]}
          >
            <View style={styles.attribute}>
              <IconBadge
                icon='calendar'
                size={22}
                library='AntDesign'
                noTouchOpacity
              />
              <Text style={styles.infoCardInner}>
                {humanDateString(new Date(session.startDate))} |{' '}
                {humanTimeString(new Date(session.startDate))}
              </Text>
            </View>
            <View style={styles.attribute}>
              <IconBadge
                icon='clockcircleo'
                size={22}
                library='AntDesign'
                noTouchOpacity
              />
              <Text style={styles.infoCardInner}>
                {session.status == 'COMPLETED'
                  ? getTimeDuration(session.startDate, session.endDate)
                  : []}{' '}
                min
              </Text>
            </View>
            <View style={styles.attribute}>
              <IconBadge
                color={getIncidentColor(session.numOfIncidents)}
                icon={getIncidentIcon(session.numOfIncidents)}
                size={22}
                library='AntDesign'
                noTouchOpacity
              />
              <Text
                style={[
                  styles.attributeText,
                  { color: getIncidentColor(session.numOfIncidents) },
                ]}
              >
                {session.numOfIncidents}{' '}
                {pluralize('Incident', session.numOfIncidents)}
              </Text>
            </View>
            {/* <Text style={styles.infoCardInner}>Distance: 15 km</Text> */}
            <View style={styles.incidentsView}>
              {session.numOfIncidents != 0 ? (
                <>
                  <Text style={styles.incidentsTitle}>List of Incidents</Text>
                  <View>
                    <FlatList
                      data={incidents}
                      renderItem={({ item }) => {
                        return (
                          <View>
                            <Text style={styles.infoCardInner}>
                              {`\u2022 ${item.classification}`}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                </>
              ) : (
                <></>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapsContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    width: '100%',
    height: 300,
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
  infoCardOuter: {
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  infoCardInner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    height: 35,
    marginLeft: 10,
    textAlignVertical: 'center',
  },
  attribute: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 5,
  },
  attributeText: {
    marginLeft: 8,
    fontSize: 18,
  },
  incidentsTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  incidentsView: {
    marginTop: 25,
  },
  noIncidents: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    // marginTop: 8,
    // padding: 5,
  },
});

export default SessionDetails;
