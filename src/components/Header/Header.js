import React from 'react';
import Navbar from './Navbar/Navbar';
import AuthStatus from './AuthStatus/AuthStatus';
import classes from './Header.module.css';

const Header = () => {
    return (
        <div className={classes.Header}>
            <Navbar />
            <AuthStatus /> 
        </div>
    )
}

export default Header;

