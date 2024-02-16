import React, { useState, useEffect, useContext } from "react";
import { StyleSheet, Text, View, FlatList, ScrollView } from "react-native";
import CustomCard from "../components/card/custom-card";
import { MainContext } from "../context/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../components/loadingIndicator/loadingIndicator";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const Home = () => {
  const context = useContext(MainContext);
  const [total, setTotal] = useState();
  const [isLoading, setLoading] = useState(true);
  const [classData, setClassData] = useState([]);
  const screenWidth = Dimensions.get("window").width;
  const chartConfig = {
    backgroundGradientFrom: "#ebf5fc",
    backgroundGradientTo: "#ebf5fc",
    color: (opacity = 1) => `rgba(44, 121, 179, 1)`,
    labelColor: (opacity = 1) => `rgba(31, 82, 123, 1)`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
  };

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
          <Text
            style={[styles.headerTitle, { color: context.secondaryColour }]}
          >
            Driving Stats
          </Text>
        </View>
      </View>
      <ScrollView>
        <View style={styles.graphContainer}>
          <LineChart
            data={{
              labels: ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={screenWidth * 0.85}
            height={220}
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              backgroundGradientFrom: context.backgroundColor,
              backgroundGradientTo: context.backgroundColor,
              color: (opacity = 1) => `rgba(44, 121, 179, 1)`,
              labelColor: (opacity = 1) => `rgba(31, 82, 123, 1)`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "0",
                strokeWidth: "1",
                stroke: context.primaryColour,
              },
            }}
            bezier
            style={{
              borderRadius: 20,
              marginBottom: 20,
            }}
          />
          {/* <BarChart
            data={{
              labels: ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={screenWidth * 0.85}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            style={{
              borderRadius: 20,
            }}
          /> */}
        </View>

        {isLoading ? (
          <LoadingIndicator isAnimating={true} />
        ) : (
          <FlatList
            ListHeaderComponent={
              <CustomCard
                outerStyle={[
                  styles.infoCardOuter,
                  styles.firstCard,
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
            }
            numColumns={2}
            columnWrapperStyle={styles.flatListContainer}
            data={Object.keys(classData)}
            renderItem={DashboardCard}
          />
        )}
      </ScrollView>
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
  },
  graphContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
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
    marginVertical: 10,
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
  firstCard: {
    marginTop: 20,
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
