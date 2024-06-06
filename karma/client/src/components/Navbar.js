import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom'; // Correct import source for Link

const Navbar = () => {
    const menuItems = [
        {
            key: 'home',
            label: (<Link to="/?sort=latest">Home</Link>),
        },
        {
            key: 'newest',
            label: (<Link to="/?sort=newest">Newest</Link>),
        },
        {
            key: 'best',
            label: (<Link to="/?sort=best">Best Ideas</Link>),
        },
        {
            key: 'login',
            label: (<Link to="/login">Login</Link>),
        },
        {
            key: 'register',
            label: (<Link to="/register">Register</Link>),
        },
        {
            key: 'create',
            label: (<Link to="/create">Create Idea</Link>),
        }
    ];

    return (
        <Menu mode="horizontal" className="nav-menu" items={menuItems} />
    );
};

export default Navbar;
