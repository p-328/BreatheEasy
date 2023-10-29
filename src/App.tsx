import { useState, useEffect } from 'react';
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

  // Function to make the API request
  function makeApiRequest(location) {
    const apiUrl = `https://api.openaq.org/v2/locations?limit=1&page=1&offset=0&sort=desc&coordinates=${encodeURIComponent(location)}&radius=25000&order_by=distance&dump_raw=false`;

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
          const locationData = data.results[0];
          const name = locationData.name;
          // Filter parameters to exclude humidity, temperature, and pressure
          const parameters = locationData.parameters.filter(
            (param) =>
              param.parameter !== 'humidity' &&
              param.parameter !== 'temperature' &&
              param.parameter !== 'pressure'
          );
          const parametersInfo = parameters.map(
            (param) => `${param.parameter}: ${param.count} ${param.unit}`
          );
          setApiResponse(`Name: ${name}\nParameters:\n${parametersInfo.join('\n')}`);
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
      <h1>BreatheEasy</h1>
      <p>{location}</p>
      <h2>API Response</h2>
      <pre>{apiResponse}</pre>
    </div>
  );
}

export default App;
