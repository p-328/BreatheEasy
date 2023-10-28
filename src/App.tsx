import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState('');

  // Function to get and store the user's location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      setLocation("Geolocation is not supported by your browser/device.");
    }
  }

  // Function to display the user's location
  function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
  }

  // Use useEffect to call getLocation when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="App">
      <h1>BreathEasy</h1>
      <p>{location}</p>
    </div>
  );
}

export default App;
