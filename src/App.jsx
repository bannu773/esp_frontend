import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Typography, Space, Alert, Spin, Row, Col } from 'antd';
import { PoweroffOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const App = () => {
  const [lightStatus, setLightStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  // Fetch initial status
  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const response = await axios.get('https://esp-backend-49h3.onrender.com/get-status');
        setLightStatus(response.data.status);
      } catch (err) {
        setError('Failed to fetch initial light status');
        console.error('Error fetching initial status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialStatus();
  }, []);

  // Setup WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket('wss://esp-backend-49h3.onrender.com');
      
      websocket.onopen = () => {
        console.log('Connected to WebSocket server');
        setError(null);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.status) {
            setLightStatus(data.status);
            setError(null);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      websocket.onclose = () => {
        console.log('Disconnected from WebSocket server');
        setTimeout(connectWebSocket, 5000);
      };

      websocket.onerror = () => {
        setError('WebSocket connection error');
      };

      setWs(websocket);

      return websocket;
    };

    const websocket = connectWebSocket();

    return () => {
      websocket.close();
    };
  }, []);

  const toggleLight = async () => {
    if (loading) return;

    const newStatus = lightStatus === 'OFF' ? 'ON' : 'OFF';
    
    try {
      setLoading(true);
      await axios.post('https://esp-backend-49h3.onrender.com/update-status', { status: newStatus });
      setError(null);
    } catch (err) {
      setError('Failed to update light status');
      console.error('Error updating light status:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    return lightStatus === 'ON' ? '#52c41a' : '#ff4d4f';
  };

  return (
    <Row 
      style={{ 
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        width: '100vw',
        background: '#f0f2f5',
      }}
      justify="center"
      align="middle"
    >
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Card style={{ margin: '24px' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Title level={2} style={{ margin: 0, textAlign: 'center' }}>
              Light Control
            </Title>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            )}

            {loading && !lightStatus ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <Text>Light is currently: </Text>
                  <Text strong style={{ color: getStatusColor() }}>
                    {lightStatus}
                  </Text>
                </div>

                <Button
                  type="primary"
                  icon={<PoweroffOutlined />}
                  onClick={toggleLight}
                  loading={loading}
                  danger={lightStatus === 'ON'}
                  size="large"
                  block
                >
                  {loading ? 'Updating...' : `Turn ${lightStatus === 'OFF' ? 'ON' : 'OFF'}`}
                </Button>
              </>
            )}
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default App;