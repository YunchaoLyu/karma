import React, { useState } from 'react';
import { List, Card, Button, Avatar, Typography, Input, Form, Modal, Popconfirm } from 'antd';
import axios from 'axios';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserOutlined, LikeOutlined, DislikeOutlined, SendOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
const { Title, Paragraph } = Typography;
const IdeasList = ({ ideas, refreshIdeas }) => {
    const [commentText, setCommentText] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentIdea, setCurrentIdea] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    let { sortBy } = useParams();
    useEffect(() => {
        if (sortBy) {
            refreshIdeas(sortBy);
        }
    }, [sortBy]);
    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const submitComment = async (ideaId) => {
        if (!commentText.trim()) return;
        setLoading(true);
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };
            await axios.post(`http://localhost:5000/api/ideas/${ideaId}/comments`, {
                text: commentText
            }, { headers });
            console.log('Comment submitted successfully for idea ID:', ideaId);
            setCommentText('');
            refreshIdeas();  // Refresh ideas to update comments on UI
        } catch (error) {
            console.error('Failed to submit comment:', error);
            alert('Failed to submit comment, please try again!');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (ideaId, type) => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };
            const response = await axios.post(`http://localhost:5000/api/ideas/${ideaId}/vote`, {
                voteType: type
            }, { headers });
            console.log('Vote registered:', response.data);
            refreshIdeas();
        } catch (error) {
            console.error('Failed to register vote:', error);
            alert('Failed to vote, please try again!');
        }
    };

    const deleteIdea = async (ideaId) => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };
            await axios.delete(`http://localhost:5000/api/ideas/${ideaId}`, { headers });
            refreshIdeas();
        } catch (error) {
            console.error('Failed to delete idea:', error);
            alert('Failed to delete idea, please try again!');
        }
    };

    const showEditModal = (idea) => {
        setCurrentIdea(idea);
        setEditData({ title: idea.title, description: idea.description });
        setEditModalVisible(true);
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const submitEdit = async () => {
        if (!editData.title || !editData.description) {
            alert("Title and description cannot be empty.");
            return;
        }
        try {
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            await axios.put(`http://localhost:5000/api/ideas/${currentIdea._id}`, editData, { headers });
            setEditModalVisible(false);
            refreshIdeas();
        } catch (error) {
            console.error('Failed to edit idea:', error);
            alert('Failed to edit idea, please try again!');
        }
    };

    const closeModal = () => {
        setEditModalVisible(false);
    };
    const deleteComment = async (ideaId, commentId) => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            };
            await axios.delete(`http://localhost:5000/api/ideas/${ideaId}/comments/${commentId}`, { headers });
            refreshIdeas();
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment, please try again!');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                dataSource={ideas}
                renderItem={idea => {
                    const avatarSrc = idea.userAvatar && idea.userAvatar.startsWith('data:image/png;base64,')
                        ? idea.userAvatar
                        : null;
    
                    return (
                        <List.Item>
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <Avatar
                                            src={avatarSrc}
                                            icon={!avatarSrc && <UserOutlined />}
                                            alt={idea.userName || 'User'}
                                        />
                                        <div style={{ marginLeft: '10px' }}>
                                            <Title level={5} style={{ marginBottom: 0 }}>{idea.title}</Title>
                                            <Paragraph style={{ margin: 0, fontSize: '12px', color: 'gray' }}>
                                            {idea.userName || 'Unknown User'} - Karma: {Math.max(0.5, Math.min(2.0, idea.points || 0.5)).toFixed(3)}
                                            </Paragraph>
                                        </div>
                                        
                                    </div>
                                }
                                extra={[
                                    <Button icon={<EditOutlined />} onClick={() => showEditModal(idea)}>Edit</Button>,
                                    <Popconfirm
                                        title="Are you sure delete this idea?"
                                        onConfirm={() => deleteIdea(idea._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button icon={<DeleteOutlined />} type="danger">Delete</Button>
                                    </Popconfirm>
                                ]}
                                style={{ width: 400, margin: '20px' }}
                                actions={[
                                    <Button icon={<LikeOutlined />} type="primary" onClick={() => handleVote(idea._id, 'upvote')}>
                                        Vote Up ({idea.upvotes || 0})
                                    </Button>,
                                    <Button icon={<DislikeOutlined />} type="danger" onClick={() => handleVote(idea._id, 'downvote')}>
                                        Vote Down ({idea.downvotes || 0})
                                    </Button>,
                                    <Form.Item style={{ margin: 0, flexGrow: 1 }}>
                                        <Input
                                            value={commentText}
                                            onChange={handleCommentChange}
                                            suffix={
                                                <Button
                                                    icon={<SendOutlined />}
                                                    onClick={() => submitComment(idea._id)}
                                                    disabled={!commentText || loading}
                                                    type="link"
                                                />
                                            }
                                        />
                                    </Form.Item>
                                ]}
                            >
                                <Paragraph>{idea.description}</Paragraph>
                                {idea.ideaImage && <img src={idea.ideaImage} alt="Uploaded Idea" style={{ maxWidth: '100%', maxHeight: '200px' }} />}
                                {idea.comments && idea.comments.map((comment, index) => (
                                    <div key={index} style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
                                        <Paragraph strong>{comment.userName}</Paragraph>
                                        <Paragraph>{comment.text}</Paragraph>
                                        <Button icon={<DeleteOutlined />} type="danger" onClick={() => deleteComment(idea._id, comment._id)}>Delete Comment</Button>
                                    </div>
                                ))}
                            </Card>
                        </List.Item>

                    );
                }}
            />
            <Modal
                title="Edit Idea"
                visible={editModalVisible}
                onOk={submitEdit}
                onCancel={closeModal}
                okText="Save"
                cancelText="Cancel"
            >
                <Form layout="vertical">
                    <Form.Item label="Title">
                        <Input value={editData.title} onChange={e => handleEditChange('title', e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Description">
                        <Input value={editData.description} onChange={e => handleEditChange('description', e.target.value)} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
    
};

export default IdeasList;
