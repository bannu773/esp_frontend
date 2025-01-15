import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [lightStatus, setLightStatus] = useState('OFF');
  const [ws, setWs] = useState(null);

  // Setup WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080');
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status) {
        setLightStatus(data.status);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setWs(websocket);

    // Cleanup on component unmount
    return () => {
      websocket.close();
    };
  }, []);

  const toggleLight = async () => {
    const newStatus = lightStatus === 'OFF' ? 'ON' : 'OFF';
    
    try {
      // Update the backend with the new light status
      await axios.post('http://localhost:8080/update-status', { status: newStatus });
      // Note: We don't need to setLightStatus here anymore as it will come through WebSocket
    } catch (err) {
      console.error('Error updating light status:', err);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Light Control</h1>
      <p>Light is currently: <strong>{lightStatus}</strong></p>
      <button onClick={toggleLight} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Turn {lightStatus === 'OFF' ? 'ON' : 'OFF'}
      </button>
    </div>
  );
};

export default App;
