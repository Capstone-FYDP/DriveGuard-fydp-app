import React, { useContext } from "react";
import { StyleSheet, Image, View, Text } from "react-native";
import { MainContext } from "../../context/MainContext";
import {
  humanDateString,
  humanTimeString,
  pluralize,
} from "../../utils/string-utils";
import CustomCard from "./custom-card";
import IconBadge from "../iconBadge/custom-iconBadge";

const SessionCard = (props) => {
  const { startDate, duration, status, numOfIncidents, onPress } = props;

  const context = useContext(MainContext);

  const getDurationString = (duration) => {
    let durationString = "";

    if (duration[0] > 0) {
      durationString += `${duration[0]} ${pluralize("hour", duration[0])} `;
    }
    durationString += `${duration[1]} ${pluralize("min", duration[1])}`;

    return durationString;
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

  const getIncidentColor = (numOfIncidents) => {
    if (numOfIncidents == 0) {
      return "#27ae60";
    } else if (numOfIncidents > 0 && numOfIncidents <= 3) {
      return "#f39c12";
    } else {
      return "#e74c3c";
    }
  };

  return (
    <CustomCard
      outerStyle={[styles.infoCardOuter, styles.firstCard]}
      innerStyle={styles.infoCardInner}
      onPress={props.onPress}
    >
      <View style={styles.infoCardContent}>
        <View style={styles.attribute}>
          <IconBadge
            icon="calendar"
            size={22}
            library="AntDesign"
            noTouchOpacity
          />
          <Text style={styles.attributeText}>
            {humanDateString(startDate)} | {humanTimeString(startDate)}
          </Text>
        </View>
        {status == "COMPLETED" && (
          <>
            <View style={styles.attribute}>
              <IconBadge
                icon="clockcircleo"
                size={22}
                library="AntDesign"
                noTouchOpacity
              />
              <Text style={styles.attributeText}>
                {getDurationString(duration)}
              </Text>
            </View>
            <View style={styles.attribute}>
              <IconBadge
                color={getIncidentColor(numOfIncidents)}
                icon={getIncidentIcon(numOfIncidents)}
                size={22}
                library="AntDesign"
                noTouchOpacity
              />
              <Text
                style={[
                  styles.attributeText,
                  { color: getIncidentColor(numOfIncidents) },
                ]}
              >
                {numOfIncidents} {pluralize("Incident", numOfIncidents)}
              </Text>
            </View>
          </>
        )}
        {status == "ACTIVE" && (
          <>
            <View style={styles.attribute}>
              <IconBadge
                color="#e74c3c"
                icon="circle"
                size={12}
                library="FontAwesome"
                noTouchOpacity
              />
              <Text
                style={[
                  styles.attributeText,
                  { color: "#e74c3c", fontWeight: "600" },
                ]}
              >
                LIVE
              </Text>
            </View>
          </>
        )}
      </View>
    </CustomCard>
  );
};

const styles = StyleSheet.create({
  infoCardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    marginBottom: -8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoCardOuter: {
    width: "90%",
    borderRadius: 20,
    alignSelf: "center",
  },
  infoCardInner: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  infoCardContent: {
    padding: 15,
  },
  attribute: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  attributeText: {
    marginLeft: 8,
    fontSize: 18,
  },
});

export default SessionCard;
