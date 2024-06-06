import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import axios from 'axios';

const Login = () => {
    const onFinish = async (values) => {
        try {
            // Send login request
            const response = await axios.post('http://localhost:5000/api/auth/login', values);
            console.log('Login successful:', response.data);
    
            // Save the token to localStorage
            localStorage.setItem('token', response.data.token);
            
            // Check if the avatar is included in the response and save it
            if (response.data.avatar) {
                localStorage.setItem('avatar', response.data.avatar);
            }
        } catch (error) {
            // More robust error handling
            if (error.response) {
                // When the server sends a response with a status code out of the 2xx range
                console.error('Failed to login:', error.response.data);
                alert('Login failed: ' + (error.response.data.message || 'Unknown Error'));
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Failed to login: No response', error.request);
                alert('Login failed: No response from server.');
            } else {
                // Something happened in setting up the request that triggered an error
                console.error('Login error:', error.message);
                alert('Login failed: ' + error.message);
            }
        }
    };
    

  return (
    <Card title="Login" style={{ width: 300, margin: 'auto', marginTop: 50 }}>
      <Form name="login" onFinish={onFinish} autoComplete="off">
        <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
