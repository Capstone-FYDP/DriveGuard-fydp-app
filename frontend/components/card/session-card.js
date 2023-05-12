import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { MainContext } from '../../context/MainContext';

const SessionCard = (props) => {
    const {image, startDate, duration, status, numOfIncidents} = props

    const context = useContext(MainContext);

    return (
        <View>
            <Text>{startDate}</Text>
            <Text>Duration: {duration[0]} hour(s) {duration[1]} min(s)</Text>
            <Text>{status}</Text>
            <Text>{numOfIncidents}</Text>
        </View>    
    );
}

export default SessionCard