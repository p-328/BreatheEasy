import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState('');

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

  // Function to fetch data from the API
  async function fetchData(location) {
    try {
      const apiUrl = `https://api.openaq.org/v1/latest?has_geo=true&coordinates=${location}&limit=100&radius=25000&order_by=distance`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log(data);
      // You can do more with the API data here
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Use useEffect to call getLocation and fetchData when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchData(location);
    }
  }, [location]);

  return (
    <div className="App">
      <h1>User Location</h1>
      <p>{location}</p>
    </div>
  );
}

export default App;
