import React, { useState, useRef, useEffect } from 'react';
import { login } from '../../helpers/auth';
import { Redirect, useLocation } from 'react-router-dom';
import classes from '../../styles/Auth.module.css';
import '../../styles/toastr.css';
import toastr from 'toastr';
import { validateForm, validateInputValue } from '../../helpers/validation';
import ClipLoader from 'react-spinners/ClipLoader';
import { isUuid } from 'uuidv4';
import { useStore, useSetAndDelete } from 'react-context-hook';

const Login = props => {
    const formEl = useRef(null);
    const submitButton = useRef(null);
    const { history } = props;
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useStore('isAuthenticated', false, false);
    const [setLoggedUsername] = useSetAndDelete('username');
    const [setLoggedID] = useSetAndDelete('userID');

    const [redirectToReferrer, setRedirectToReferrer] = useState(false);
    const [username, setUsername] = useState({ type: 'username', val: '' });
    const [password, setPassword] = useState({ type: 'password', val: '' });
    const [infoShown, setInfoShown] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const activated = searchParams.get('activated');
        const expired = searchParams.get('expired');
        if(activated && activated === 'true') toastr.info('You can login into your account', 'Your account was already activated!');   
        if(isUuid(activated)) toastr.success('You can now login into your account', 'Your account is now activated!');   
        if(expired && expired === 'true') toastr.error('Your link expired or was already used', 'Your link is already expired!');  
    }, [location]);
  
    const handleSubmit = async(e) => {
        e.preventDefault();
        let areThereErrors = false;
        
        submitButton.current.disabled = true;
        setLoadingButton(true);
        areThereErrors = await handleLogin(e);
        setLoadingButton(false);
        
        if(!areThereErrors) setRedirectToReferrer(true);
    }

    const handleLogin = async(e) => {
        const isFormValid = validateForm([username, password], e.target, classes);
        if(isFormValid) {
            const res = await login(username, password);
            if(res.status === 1) {
                toastr.success('You are now logged in!');
                setIsAuthenticated(true);
                setLoggedUsername(res.username);
                setLoggedID(res.userID);
                return false;
            } else {
                handleServerErrors(res);
                return true;
            } 
        } else return true;
    }

    const handleServerErrors = res => {
        if(res.code === 11) showServerErrors(res.invalids, res); // REGISTRATION / LOGIN - Validation failed!
            else if(res.code === 15) showServerErrors(['username'], res); // LOGIN - Incorrect username!
            else if(res.code === 16) showServerErrors(['password'], res); // LOGIN - Incorrect pass!
            else if(res.code === 17) showServerErrors(['activate'], res); // LOGIN - Incorrect pass!
            else showServerErrors([], res); // REGISTER/LOGIN - General server error - Something went wrong!
    }

    const showServerErrors = (invalidInputs, res) => {
        // console.log(invalidInputs, res)
        if(invalidInputs.length === 0) return toastr.error('Please try again!', 'Something went wrong!'); 
        if(invalidInputs && invalidInputs[0] === 'activate') return toastr.info('Please activate your account first!');
        invalidInputs.forEach(el => {
            const element = formEl.current.querySelector(`#${el}`);
            element.classList.add(classes.error);
            element.previousSibling.lastChild.classList.add(classes.error);
        });

        // Adding messages to toastr
        if(res.hasOwnProperty('invalids')) toastr.error(`${capitalize(invalidInputs.join(', '))} are not valid!`);
            else toastr.error(capitalize(res.message)); 
    }

    const capitalize = name => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const handleChange = e => {
        const { name: type, value: newValue } = e.target;
        updateInputState(type, newValue);
        validateInput(e, type, newValue);
        showValidButton(2);
    }

    const validateInput = (e, type, newValue) => {
        const { target: el } = e;
        let isValid = false;
        
        // Switch when becomes valid
        isValid = validateInputValue(type, newValue);

        // Add/Remove valid check mark on valid/invalid elements
        showValidationInput(el, isValid); 
    }

    const showValidationInput = (el, isValid) => {
        if(isValid === true) {
            el.classList.remove(classes.error);
            el.previousSibling.lastChild.classList.remove(classes.error);
            el.nextSibling.classList.add(classes.valid);
        } else el.nextSibling.classList.remove(classes.valid);
    }

    const showValidButton = validInputs => {
        const allValidEl = Array.from(formEl.current.querySelectorAll('input + span')).filter(e => e.classList.value.indexOf('valid') > 0).length;
        const formButtonClasses = submitButton.current.classList;

        if(allValidEl === validInputs) { 
            formButtonClasses.add(classes.valid);
            submitButton.current.disabled = false;
        } else {
            formButtonClasses.remove(classes.valid);
            submitButton.current.disabled = true;
        }
    }

    const updateInputState = (type, newValue) => {
        const newEl = { type, val: newValue };
        switch (type) {
            case 'username':
                return setUsername(newEl);
            case 'password':
                return setPassword(newEl);
            default:
                return console.log(`Failed to update state for ${type}!`);
        }
    }

    const handleSwitchPage = path => {
        history.push(`/${path}`, { from: '/login' });
    }

    let animation = '';

    if(props.location.state && (props.location.state.from === '/register' || props.location.state.from === '/recover')) animation = 'animated flipInX';
        else animation = 'animated fadeInUp';
  
    let { from } = props.location.state || { from: { pathname: '/' } };
    if(from === '/register') from = { pathname: '/' };
    if(isAuthenticated) return <Redirect to={{ pathname: '/' }} />
    if (redirectToReferrer === true) return <Redirect to={from} />
    else {
        if(from && (from.pathname === '/profile' || from.pathname === '/callme') && !infoShown && !isAuthenticated) {
            // toastr.info('You have to login to visit this page!');
            setInfoShown(true);
        }
    }
  
    return (
      <div className={classes.Wrapper}>
        <div className={animation}>
            <form onSubmit={handleSubmit} ref={formEl} className={classes['auth-main']}>
                <h3 className={classes['page-name']}>Login</h3>
                <div className={classes['form-control']}>
                    <label htmlFor="username">Username or email<span>minimum 6 characters</span></label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        autoComplete="off"
                        value={username.val}
                        onChange={handleChange}
                        onKeyPress={(e) => !(/^[a-zA-Z0-9_.-@]*$/g.test(e.key)) ? e.preventDefault() : undefined}
                        maxLength="50"
                        placeholder="Enter username..."
                    />
                    <span className={classes['verification']}><i className="fas fa-check"></i></span>
                    <label htmlFor="password">Password<span>minimum 6 characters</span></label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={password.val}
                        onChange={handleChange}
                        placeholder="Enter password..."
                    />
                    <span className={classes['verification']}><i className="fas fa-check"></i></span>
                </div>
                <button type="submit" disabled={true} className={classes.btn} ref={submitButton}>{loadingButton ? <ClipLoader size={13} color={'#485877'} /> : 'Login'}</button>
                <div className={classes['auth-switch-page']} onClick={() => handleSwitchPage('register')}> Don't have an account yet? Sign up here</div> 
                <div className={classes['auth-switch-page']} onClick={() => handleSwitchPage('recover')}>Forgot your account OR need to resend activation email? </div> 
            </form>
        </div>
      </div>
    )
}

export default Login;