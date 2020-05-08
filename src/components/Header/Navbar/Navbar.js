import React from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';

const Navbar = () => {
    return (
        <div className={classes.Navbar}>
          <div><NavLink exact to="/" activeClassName={classes.active}>Home</NavLink></div>
          <div><NavLink exact to="/about" activeClassName={classes.active}>Contact</NavLink></div>
          <div><NavLink exact to="/callme" activeClassName={classes.active}><i className="fas fa-mobile-alt"></i></NavLink></div>
        </div>
    )
}

export default Navbar;