import { useState, useEffect } from 'react';
import { Popup } from './Components/Popup/Popup';
import './App.css';

function App() {
  const [location, setLocation] = useState('');
  const [apiResponse, setApiResponse] = useState('');

  // Function to get and store the user's location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      setLocation("Geolocation is not supported by this browser.");
    }
  }

  // Function to display the user's location in "lat,lng" format
  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    console.log(location);
    setLocation(locationString);
  }

  // Custom sorting function to sort parameter names correctly
  function customSort(a, b) {
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
  function calculateDistance(lat1, lon1, lat2, lon2) {
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
  function formatTimeAgo(timestamp) {
    const now = new Date();
    const updatedTime = new Date(timestamp);
    const diff = now - updatedTime;
    const hours = Math.floor(diff / 3600000); // 1 hour = 3600000 milliseconds
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    const minutes = Math.floor(diff / 60000); // 1 minute = 60000 milliseconds
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Function to make the API request
  function makeApiRequest(location) {
    const apiUrl = `https://api.openaq.org/v2/locations?limit=100&page=1&offset=0&sort=desc&coordinates=${encodeURIComponent(location)}&radius=25000&order_by=distance&dump_raw=false`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Host: 'api.openaq.org',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          const parametersSeen = new Set();
          let parametersInfo = [];
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);

          data.results.forEach((locationData) => {
            const name = locationData.name;
            const sensorCoordinates = locationData.coordinates;
            const sensorDistance = calculateDistance(
              parseFloat(location.split(',')[0]),
              parseFloat(location.split(',')[1]),
              sensorCoordinates.latitude,
              sensorCoordinates.longitude
            );
            const sortedParameters = locationData.parameters
              .filter((param) =>
                param.parameter !== 'humidity' &&
                param.parameter !== 'temperature' &&
                param.parameter !== 'pressure' &&
                !parametersSeen.has(param.parameter) &&
                new Date(param.lastUpdated) > oneDayAgo
              )
              .sort(customSort);

            sortedParameters.forEach((param) => {
              const timeAgo = formatTimeAgo(param.lastUpdated);
              parametersInfo.push(
                `${name} (Distance: ${sensorDistance.toFixed(2)} miles): ${param.parameter}: ${param.lastValue} ${param.unit} (Last Updated: ${timeAgo})`
              );
              parametersSeen.add(param.parameter);
            });
          });

          setApiResponse(`${parametersInfo.join('\n')}`);
        } else {
          setApiResponse('Location data not found.');
        }
      })
    .catch((error) => setApiResponse('Error: ' + error.message));
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
      <h1>BreatheEasy</h1>
      <pre>{apiResponse}</pre>
    </div>
  );
}

export default App;
