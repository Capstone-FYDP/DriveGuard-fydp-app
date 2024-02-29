import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, FlatList, ScrollView } from "react-native";
import CustomCard from "../components/card/custom-card";
import { MainContext } from "../context/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const Home = () => {
  const context = useContext(MainContext);
  const [total, setTotal] = useState();
  const [isLoading, setLoading] = useState(true);
  const [classData, setClassData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const screenWidth = Dimensions.get("window").width;
  const pastDays = 10;

  const DashboardCard = ({ item }) => {
    return (
      <CustomCard
        outerStyle={[styles.listCard]}
        innerStyle={styles.infoCardInner}
      >
        <View style={styles.cardContainer}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: context.secondaryColour }]}>
              {item}
            </Text>
            <Text style={[styles.number, { color: context.tertiaryColour }]}>
              {classData[item]}
            </Text>
          </View>
        </View>
      </CustomCard>
    );
  };

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (e) {
      console.log(e);
    }
  };

  const getSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(context.fetchPath + `api/getSessions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
      });
      const json = await response.json();

      if (json.message) {
        Toast.show({
          text1: "Error",
          text2: json.message,
          type: "error",
        });
      } else {
        //get the most recent sessions
        const pastSessions = json.sessionData
          .reverse()
          .map((item) => {
            return item.numOfIncidents;
          })
          .slice(0, pastDays);
        setGraphData(pastSessions);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getTotalDistractions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        context.fetchPath + `api/totaldistractions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-tokens": token,
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
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-tokens": token,
          },
        }
      );
      const json = await response.json();
      if (json.message) {
        Toast.show({
          text1: "Error",
          text2: json.message,
          type: "error",
        });
      } else {
        setClassData(json.userData[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      await getSessions();
      await getTotalDistractions();
      await getClassificationData();
      setLoading(false);
    }

    fetchDashboardData();
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
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            Dashboard
          </Text>
        </View>
      </View>

      {isLoading ? (
        <LoadingIndicator isAnimating={true} />
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              {graphData.length > 0 && (
                <View style={styles.graphContainer}>
                  <Text
                    style={[
                      styles.graphTitle,
                      { color: context.primaryColour },
                    ]}
                  >
                    {`Incidents of your last ${pastDays} trips`}
                  </Text>
                  <LineChart
                    data={{
                      datasets: [
                        {
                          data: graphData,
                        },
                      ],
                    }}
                    width={screenWidth * 0.9}
                    height={220}
                    yAxisInterval={10}
                    chartConfig={{
                      backgroundGradientFrom: context.screenBackground,
                      backgroundGradientTo: context.screenBackground,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(44, 121, 179, 0.75)`,
                      labelColor: (opacity = 1) => `rgba(31, 82, 123, 1)`,
                      propsForDots: {
                        r: "0",
                        strokeWidth: "1",
                        stroke: context.tertiaryColour,
                      },
                    }}
                    bezier
                    segments={4}
                    fromZero
                  />
                </View>
              )}
              <CustomCard
                outerStyle={[
                  styles.infoCardOuter,
                  { backgroundColor: context.primaryColour },
                ]}
                innerStyle={styles.infoCardInner}
              >
                <View style={styles.firstCardTextContainer}>
                  <Text style={[styles.title, styles.firstCardTitle]}>
                    Total Distractions
                  </Text>
                  <Text style={[styles.number, styles.firstCardNumber]}>
                    {total}
                  </Text>
                </View>
              </CustomCard>
            </>
          }
          numColumns={2}
          columnWrapperStyle={styles.flatListContainer}
          data={Object.keys(classData)}
          renderItem={DashboardCard}
          nestedScrollEnabled
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
  },
  upperContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
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
  },
  graphContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  graphTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 40,
    marginBottom: 15,
  },
  flatListContainer: {
    width: "85%",
    justifyContent: "space-around",
    alignSelf: "center",
  },
  listCard: {
    flex: 0.5,
    marginVertical: 5,
    marginHorizontal: 5,
    paddingVertical: 5,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
  },
  infoCardOuter: {
    width: "85%",
    marginBottom: 10,
    padding: 15,
    borderRadius: 20,
    alignSelf: "center",
  },
  infoCardInner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 80,
  },
  firstCardTextContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  textContainer: {
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  number: {
    fontSize: 32,
    fontWeight: "600",
  },
  title: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    textTransform: "capitalize",
  },
  firstCardNumber: {
    fontSize: 40,
    color: "#fff",
  },
  firstCardTitle: {
    fontSize: 20,
    color: "#fff",
  },
});

export default Home;
