import React, { useContext } from 'react';
import { MainContext } from '../../context/MainContext';

const SessionCard = (props) => {
    const {image, startDate, duration, status, numOfIncidents} = props

    const context = useContext(MainContext);
}

export default SessionCard