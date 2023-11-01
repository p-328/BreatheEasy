import { useState, useEffect } from 'react';
import { Popup } from './Components/Popup/Popup';
import airPollutantsData from './airPollutantsData.json';
import './App.css';

function App() {
  const [location, setLocation] = useState('');
  const [apiResponse, setApiResponse]: any = useState([]);

  // Function to get and store the user's location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      setLocation("Geolocation is not supported by this browser.");
    }
  }

  // Function to display the user's location in "lat,lng" format
  function showPosition(position: any) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    console.log(location);
    setLocation(locationString);
  }

  // Custom sorting function to sort parameter names correctly
  function customSort(a: any, b: any) {
    const nameA = a.parameter.toLowerCase();
    const nameB = b.parameter.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // If the names are the same, compare numerically
    const numA = parseInt(a.parameter.match(/\d+/));
    const numB = parseInt(b.parameter.match(/\d+/));

    return numA - numB;
  }

  // Function to calculate the Haversine distance between two coordinates
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515; // Miles
    return dist;
  }

  // Function to format timestamp as "hours/minutes ago"
  function formatTimeAgo(timestamp: string) {
    const now = new Date();
    const updatedTime = new Date(timestamp);
    const diff = now.getTime() - updatedTime.getTime();
    const hours = Math.floor(diff / 3600000); // 1 hour = 3600000 milliseconds
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const minutes = Math.floor(diff / 60000); // 1 minute = 60000 milliseconds
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Function to get safety level based on lastValue, parameter, and medicalCondition
  function getSafetyLevel(displayName: string, lastValue: number, medicalCondition: boolean) {
    // Replace special characters in displayName and normalize it
    const normalizedDisplayNameJSON = normalizeDisplayName(displayName);
    
    const pollutant = airPollutantsData.airPollutants.find(
      (item) => normalizeDisplayName(item.displayName).toLowerCase() === normalizedDisplayNameJSON.toLowerCase()
    );

    if (pollutant) {
      const thresholds = pollutant.threshold;
      const medicalKey = medicalCondition ? "true" : "false";
      const safetyThreshold = thresholds.Safe[medicalKey];
      const unsafeThreshold = thresholds.Unsafe[medicalKey];

      if (lastValue <= safetyThreshold) {
        return 'Safe';
      } else if (lastValue <= unsafeThreshold) {
        return 'Unsafe';
      } else {
        return 'Dangerous';
      }
    }

    return 'Unknown'; // Default to 'Unknown' if the pollutant is not found
  }
  
  // Function to normalize a displayName
  function normalizeDisplayName(displayName: string) {
    return displayName
      .replace('²', '2')
      .replace('₃', '3')
      .replace('³', '3')
      .replace('₂', '2')
      .replace('µ', 'u');
  }  

  // Function to make the API request
  function makeApiRequest(location: string) {
    const apiUrl = `https://api.openaq.org/v2/locations?limit=100&page=1&offset=0&sort=desc&coordinates=${encodeURIComponent(
      location
    )}&radius=25000&order_by=distance&dump_raw=false`;
    const medicalCondition = localStorage.getItem('medicalCondition') === 'true';

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Host: 'api.openaq.org',
      },
    })
      .then((response: any) => response.json())
      .then((data: any) => {
        if (data.results && data.results.length > 0) {
          const parametersSeen = new Set();
          let parametersInfo = {
            parameters: []
          };
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);

          data.results.forEach((locationData: any) => {
            const name = locationData.name;
            const sensorCoordinates = locationData.coordinates;
            const sensorDistance = calculateDistance(
              parseFloat(location.split(',')[0]),
              parseFloat(location.split(',')[1]),
              sensorCoordinates.latitude,
              sensorCoordinates.longitude
            );
            const sortedParameters = locationData.parameters
              .filter((param: any) => {
                const normalizedDisplayNameJSON = normalizeDisplayName(param.displayName);
                return (
                  !parametersSeen.has(param.parameter) &&
                  new Date(param.lastUpdated) > oneDayAgo &&
                  airPollutantsData.airPollutants.some((item: any) =>
                    normalizeDisplayName(item.displayName).toLowerCase() === normalizedDisplayNameJSON.toLowerCase()
                  )
                );
              })
              .sort(customSort);

            sortedParameters.forEach((param: any) => {
              const timeAgo = formatTimeAgo(param.lastUpdated);
              const safetyLevel = getSafetyLevel(param.displayName, param.lastValue, medicalCondition);

              parametersInfo.parameters.push(
                {
                  location: name,
                  distance: sensorDistance.toFixed(2),
                  parameter: param.parameter,
                  lastValue: param.lastValue,
                  paramUnit: param.unit,
                  safety: safetyLevel,
                  lastUpdated: timeAgo
                }
              );
              parametersSeen.add(param.parameter);
            });
          });
        if (apiResponse)
            setApiResponse((prev: any) => [...prev, parametersInfo]);
        } else {
          setApiResponse('');
        }
      })
      .catch((error) => setApiResponse([
          {
            error: "Error: " + error.message
          }
        ]));
  }

  // Use useEffect to call getLocation and makeApiRequest when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      makeApiRequest(location);
    }
  }, [location]);

  return (
    <div className="App">
      <Popup />
<<<<<<< HEAD
      <h1>CleanAirTracker</h1>
      <pre>{apiResponse.map((parametersInfoObj: any) => 
            parametersInfoObj.parameters.map((obj: any) => 
              <p>{obj.location} (Distance: {obj.distance} miles): {obj.parameter}: {obj.lastValue} {obj.paramUnit} (Safety: {obj.safety}) (Last Updated: {obj.lastUpdated})</p>
            ))}</pre>
=======
      <h1>BreatheEasy</h1>
      <pre>{apiResponse.map(parametersInfoObj => 
            parametersInfoObj.parameters.map(obj => 
              <p>{obj.location} (Distance: {obj.distance} miles): {obj.parameter}: {obj.lastValue} {obj.paramUnit} (Safety: {obj.safety}) (Last Updated: {obj.lastUpdated})</p>
            ))}</pre>
      <h1>CleanAirTracker</h1>
      <pre>{apiResponse}</pre>
>>>>>>> 6caff5ff8bfb7f8ba12131a5bae4275f7be148ed
    </div>
  );
}

export default App;
