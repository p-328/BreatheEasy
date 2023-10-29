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
          data.results.forEach((locationData) => {
            const name = locationData.name;
            const sortedParameters = locationData.parameters
              .filter((param) =>
                param.parameter !== 'humidity' &&
                param.parameter !== 'temperature' &&
                param.parameter !== 'pressure' &&
                !parametersSeen.has(param.parameter)
              )
              .sort(customSort); // Sort the parameters using the custom sorting function

            sortedParameters.forEach((param) => {
              parametersInfo.push(`${name}: ${param.parameter}: ${param.count} ${param.unit}`);
              parametersSeen.add(param.parameter);
            });
          });

          setApiResponse(`Parameters:\n${parametersInfo.join('\n')}`);
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
      <p>{location}</p>
      <h2>API Response</h2>
      <pre>{apiResponse}</pre>
    </div>
  );
}

export default App;
