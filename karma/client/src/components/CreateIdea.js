import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const CreateIdea = () => {
    const [image, setImage] = useState('');  // State to hold the image data

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);  // Convert image file to base64 string
        };
        reader.readAsDataURL(file);
    };

    const onFinish = async (values) => {
        try {
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
            console.log(localStorage)
            const avatar = localStorage.getItem('avatar'); // Get avatar from localStorage

            // Include image data in the POST request
            const response = await axios.post('http://localhost:5000/api/ideas', {
                title: values.title,
                description: values.description,
                avatar: avatar,
                ideaImage: image  // Send image data
            }, { headers });

            console.log('Idea created:', response.data);
            message.success('Idea submitted successfully!');
        } catch (error) {
            console.error('Failed to submit idea:', error);
            message.error('Failed to submit idea: ' + (error.response ? error.response.data.message : "Server error"));
        }
    };

    return (
        <Form name="create-idea" onFinish={onFinish} autoComplete="off">
            <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please input the title of your idea!' }]}>
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the description!' }]}>
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item name="ideaImage" label="Upload Image">
                <input type="file" onChange={handleImageChange} accept="image/*" />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
                <Button type="primary" htmlType="submit">
                    Submit Idea
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CreateIdea;
