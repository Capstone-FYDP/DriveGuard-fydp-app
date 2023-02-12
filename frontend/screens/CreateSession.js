import React from "react";
// import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  SectionList,
  StatusBar,
} from "react-native";

// export default function CreateSession() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <SectionList
//         sections={DATA}
//         keyExtractor={(item, index) => item + index}
//         renderItem={({ item }) => (
//           <View style={styles.container}>
//             <Text>Track My Trip</Text>
//             <StatusBar style="auto" />;
//           </View>
//         )}
//         renderSectionHeader={({ section: { title } }) => (
//           <Text style={styles.header}>{title}</Text>
//         )}
//       />
//     </SafeAreaView>
//   );
// }

const DATA = [
  {
    title: "Past Trips",
    data: ["Trip 1", "Trip 2", "Trip 3"],
  },
];

const App = () => (
  <SafeAreaView style={styles.container}>
    <SectionList
      sections={DATA}
      keyExtractor={(item, index) => item + index}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item}</Text>
        </View>
      )}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.header}>{title}</Text>
      )}
    />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    backgroundColor: "#fff",
    padding: 60,
    marginVertical: 30,
  },
  header: {
    fontSize: 32,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
  },
});

export default App;
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
