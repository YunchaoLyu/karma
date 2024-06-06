import React from 'react';
import { Form, Input, Button, Card, Upload } from 'antd';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';

const Register = () => {
  const onFinish = async (values) => {
    // Function to convert file to Base64 string
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

    try {
      let avatar;
      // Check if file is provided
      if (values.avatar && values.avatar.file) {
        avatar = await toBase64(values.avatar.file.originFileObj);
      }
      console.log(avatar)
      // Create JSON object including the avatar as a Base64 string
      const user = {
        username: values.name,
        email: values.email,
        password: values.password,
        avatar: avatar // Include the avatar in the user data
      };

      const response = await axios.post('http://localhost:5000/api/auth/register', user);
      console.log('Registration successful:', response.data);
    } catch (error) {
      if (error.response) {
        console.error('Failed to register:', error.response.data);
      } else if (error.request) {
        console.error('Failed to register: No response', error.request);
      } else {
        console.error('Error', error.message);
      }
    }
  };

  return (
    <Card title="Register" style={{ width: 300, margin: 'auto', marginTop: 50 }}>
      <Form name="register" onFinish={onFinish} autoComplete="off">
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Please input your name!' }]}
        >
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Please input your email!' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          name="avatar"
          label="Avatar"
          valuePropName="file"
        >
          <Upload listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Register;
