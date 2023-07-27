import { StyleSheet, Image, Text, View, TouchableOpacity } from "react-native";
import {
  humanDateString,
  humanTimeString,
  pluralize,
} from "../utils/string-utils";
import IconBadge from "../components/iconBadge/custom-iconBadge";

const SessionDetails = ({ route, navigation }) => {
  const { session } = route.params;
  // const context = useContext(MainContext);
  // const [sessions, setSessions] = useState([]);
  // const [isLoading, setLoading] = useState(true);

  // const isFocused = useIsFocused();

  // const getToken = async () => {
  //   try {
  //     return await AsyncStorage.getItem('auth_token');
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const getSession = async () => {
  //   try {
  //     const token = await getToken();
  //     const response = await fetch(
  //       context.fetchPath + `api/getSession/` + {},
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
  //       setSessions(json.sessionData);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (isFocused) {
  //     getSession();
  //   }
  // }, [isFocused]);

  // //Display the duration in hours and mins -> output is array [hours, mins]
  // const getTimeDuration = (startDate, endDate) => {
  //   let start = new Date(startDate)
  //   let end = new Date(endDate)
  //   const totalMin = Math.abs(start.getTime() - end.getTime()) / (1000 * 60)

  //   const hours = (totalMin / 60);
  //   const roundHours = Math.floor(hours);
  //   const minutes = (hours - roundHours) * 60;
  //   const roundMinutes = Math.round(minutes);
  //   return [roundHours, roundMinutes]
  // }

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
      return "#27ae60";
    } else if (numOfIncidents > 0 && numOfIncidents <= 3) {
      return "#f39c12";
    } else {
      return "#e74c3c";
    }
  };

  const getIncidentIcon = (numOfIncidents) => {
    if (numOfIncidents == 0) {
      return "checkcircleo";
    } else if (numOfIncidents > 0 && numOfIncidents <= 3) {
      return "warning";
    } else {
      return "exclamationcircle";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperContainer}>
        <View style={styles.textWrapper}>
          <View style={{ marginRight: 20 }}>
            <IconBadge
              icon="arrowleft"
              size={30}
              library="AntDesign"
              noTouchOpacity
              onPress={() => navigation.navigate("Trips")}
            />
          </View>
          <Text style={styles.headerTitle}>Trip Details</Text>
        </View>
      </View>

      {session && (
        <View style={styles.infoCardOuter}>
          <Image
            source={{
              uri: "https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png",
            }}
            style={{ width: 350, height: 350 }}
          />
          <View style={styles.attribute}>
            <IconBadge
              icon="calendar"
              size={22}
              library="AntDesign"
              noTouchOpacity
            />
            <Text style={styles.infoCardInner}>
              Date: {humanDateString(new Date(session.startDate))} |{" "}
              {humanTimeString(new Date(session.startDate))}
            </Text>
          </View>
          <View style={styles.attribute}>
            <IconBadge
              icon="clockcircleo"
              size={22}
              library="AntDesign"
              noTouchOpacity
            />
            <Text style={styles.infoCardInner}>
              Duration:{" "}
              {session.status == "COMPLETED"
                ? getTimeDuration(session.startDate, session.endDate)
                : []}
            </Text>
          </View>
          <View style={styles.attribute}>
            <IconBadge
              color={getIncidentColor(session.numOfIncidents)}
              icon={getIncidentIcon(session.numOfIncidents)}
              size={22}
              library="AntDesign"
              noTouchOpacity
            />
            <Text
              style={[
                styles.attributeText,
                { color: getIncidentColor(session.numOfIncidents) },
              ]}
            >
              {session.numOfIncidents}{" "}
              {pluralize("Incident", session.numOfIncidents)}
            </Text>
          </View>
          {/* <Text style={styles.infoCardInner}>Distance: 15 km</Text> */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffbf6",
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  textWrapper: {
    width: "85%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "600",
    color: "#3f2021",
  },
  flatListContainer: {
    flex: 1,
    width: "85%",
    justifyContent: "space-around",
    alignSelf: "center",
  },
  infoCardOuter: {
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    alignSelf: "center",
  },
  infoCardInner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    height: 35,
    marginLeft: 10,
    textAlignVertical: "center",
  },
  attribute: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 5,
  },
  attributeText: {
    marginLeft: 8,
    fontSize: 18,
  },
});

export default SessionDetails;
