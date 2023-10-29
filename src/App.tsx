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
    const apiUrl = `https://api.openaq.org/v2/locations?limit=100&page=1&offset=0&sort=desc&coordinates=${encodeURIComponent(location)}&radius=25000&order_by=distance&dump_raw=false`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Host: 'api.openaq.org',
      },
    })
      .then((response) => response.json())
      .then((data) => setApiResponse(JSON.stringify(data, null, 2)))
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
