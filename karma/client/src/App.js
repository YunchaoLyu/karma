import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import IdeasList from './components/IdeasList';
import CreateIdea from './components/CreateIdea';
import Login from './components/Login';
import Register from './components/Register';

const AppContent = () => {
    const [ideas, setIdeas] = useState([]);
    const location = useLocation();  // Use location to determine current URL and parameters

    const fetchIdeas = async () => {
        const sort = new URLSearchParams(location.search).get('sort');
        const headers = {'Authorization': `Bearer ${localStorage.getItem('token')}`};
        try {
            const response = await axios.get(`http://localhost:5000/api/ideas?sort=${sort}`, { headers });
            setIdeas(response.data);
        } catch (error) {
            console.error('Failed to fetch ideas:', error);
        }
    };

    useEffect(() => {
        fetchIdeas();  // Fetch ideas initially and whenever location.search changes
    }, [location.search]);  // React on changes to the search part of the URL

    const refreshIdeas = () => {
        fetchIdeas();  // Refresh without altering the current sort, relying on existing location.search
    };

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<IdeasList ideas={ideas} refreshIdeas={refreshIdeas} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create" element={<CreateIdea refreshIdeas={refreshIdeas} />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
