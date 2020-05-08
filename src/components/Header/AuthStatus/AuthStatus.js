import React from 'react';
import { withRouter, NavLink } from 'react-router-dom';
import { logout } from '../../../helpers/auth';
import classes from './AuthStatus.module.css';
import { useStore, useSetAndDelete, useDeleteStoreValue } from 'react-context-hook';

const AuthStatus = withRouter(({ history }) => {
  let component = null;

  const [isAuthenticated, setIsAuthenticated] = useStore('isAuthenticated');
  const [loggedUsername, setLoggedUsername] = useStore('username');
  const [setLoggedID] = useSetAndDelete('userID');
  const cleanUserData = useDeleteStoreValue('profile_data');

  const handleSignOut = async() => {
    await logout();
    setIsAuthenticated(false);
    setLoggedUsername(undefined);
    setLoggedID(undefined);
    cleanUserData();
    history.push('/');
  }

  if(isAuthenticated) {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const userUsername = width <= 510 ? '' : ` ${loggedUsername}`;
    component = 
      <div className={classes['sign-out']}>
        <NavLink exact to="/profile" activeClassName={classes.active}><i className="fas fa-user"></i>{ userUsername }</NavLink>
        <button onClick={handleSignOut}><i className="fas fa-sign-out-alt"></i> Sign out</button>
      </div>;
  } else {
    component = 
      <div className={classes['sign-in']}>
        <NavLink exact to="/profile" activeClassName={classes.active}>Your Profile</NavLink>
        <NavLink exact to="/register" activeClassName={classes.active}>Sign up</NavLink>
        <NavLink exact to="/login" activeClassName={classes.active}><i className="fas fa-sign-in-alt"></i> Login</NavLink>
      </div>;
  }

  return (
    <div className={classes.AuthStatus}>{component}</div>
  )
})

export default AuthStatus;