import React from 'react';
import classes from './Footer.module.css';
import logo from '../../assets/logo.svg';

const Footer = () => (
    <div className={classes.LogoContainer}>
        <div style={{textAlign: 'center'}}><img className={classes.LogoIcon} src={logo} alt="logo" /></div>
        <div className={classes.FooterName}>SoftCloud</div>
    </div>
)

export default Footer;
