import React, { useEffect, useState } from 'react';
import classes from './Home.module.css';
import { Link } from 'react-router-dom';
import code from '../../assets/code.svg';

const Home = () => {
    const [ animated, setAnimated ] = useState(' animated fadeInRight');

    useEffect(() => {
        const timer = () => setTimeout(() => { setAnimated('') }, 1000);
        const timerId = timer();
        return () => {
            clearTimeout(timerId);
        }
    }, []);

    return (
        <div className={classes.HomeContainer}>
            <Link to="/about"><div className={classes.CreateProject + animated}>Need help with a project?</div></Link>
            <img className={classes.Code} src={code} alt="code" />
        </div>
    )
}

export default Home;
