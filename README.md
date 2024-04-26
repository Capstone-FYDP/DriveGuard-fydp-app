## Overview
DriveGuard is a mobile app with advanced analytics, providing drivers with insights on their journeys to improve their driving habits.

The app uses the phone's camera to record the user's driving and provide real-time feedback if the user is distracted using an ML model. In addition, we also use Google Map's geolocation to track the locations of incidents throughout the trip, and also provide a navigation feature using Mapbox.

## UI/UX
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/d23c3b8f-3d39-49c7-a4ee-7480f70b595b" width="200" />
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/6f919d23-8f55-4d61-9e75-231c41033d8b" width="200" />
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/8c36f88e-2e4f-4ba4-84d3-8cd440ad73d2" width="200" />
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/677d8943-641d-4399-9cba-f6a825b9a361" width="200" />
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/7cc9a29a-3e5b-4018-b8d4-285db2ca8f85" width="200" />
<img src="https://github.com/Capstone-FYDP/fydp-app/assets/36520183/dbc35a48-52e5-4576-bb6c-de525eec1137" width="200" />


## ML Model
We trained the CNN model on the Statefarm Dataset: https://www.kaggle.com/c/state-farm-distracted-driver-detection/overview

The model is based on MobileNet-v2 architecture, achieving an impressive accuracy of above 95%.

### NOTE: 
Install the latest LTS version of Node.js, as some of the libraries are not compatible with older Node versions

