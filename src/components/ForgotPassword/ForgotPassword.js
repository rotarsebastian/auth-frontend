import React, { useState, useRef } from 'react';
import { recoverOrResendValidation } from '../../helpers/auth';
import classes from '../../styles/Auth.module.css';
import '../../styles/toastr.css';
import toastr from 'toastr';
import { validateForm, validateInputValue } from '../../helpers/validation';
import ClipLoader from 'react-spinners/ClipLoader';
import { Redirect } from 'react-router-dom';
import { useStore } from 'react-context-hook';

const ForgotPassword = props => {
    const formEl = useRef(null);
    const submitButton = useRef(null);
    const { history } = props;

    const [loggedUsername] = useStore('username');

    const [username, setUsername] = useState({ type: 'username', val: '' });
    const [loadingButton, setLoadingButton] = useState(false);
  
    const handleSubmit = async(e) => {
        e.preventDefault();
        let areThereErrors = false;
        
        submitButton.current.disabled = true;
        setLoadingButton(true);
        areThereErrors = await handleRecover(e);
        submitButton.current.disabled = false;
        setLoadingButton(false);
        
        if(!areThereErrors) {
            history.push('/login');
        }
    }

    const handleRecover = async(e) => {
        const isFormValid = validateForm([username], e.target, classes);
        if(isFormValid) {
            const res = await recoverOrResendValidation(username);
            if(res.status === 1) {
                // console.log(res)
                toastr.options.timeOut = '5000';
                toastr.success('Please follow the email information to complete this action', 'Email was sent successfully!');
                return false;
            } else {
                handleServerErrors(res);
                return true;
            } 
        } else return true;
    }

    const handleServerErrors = res => {
        if(res.code === 11) showServerErrors(res.invalids, res); // RECOVER - Validation failed!
            else if(res.code === 15) showServerErrors(['username'], res); // RECOVER - Incorrect email or username!
            else showServerErrors([], res); // RECOVER - General server error - Something went wrong!
    }

    const showServerErrors = (invalidInputs, res) => {
        if(invalidInputs.length === 0) return toastr.error('Please try again!', 'Something went wrong!');
        invalidInputs.forEach(el => {
            const element = formEl.current.querySelector(`#${el}`);
            element.classList.add(classes.error);
            element.previousSibling.lastChild.classList.add(classes.error);
        });

        // Adding messages to toastr
        if(res.hasOwnProperty('invalids')) toastr.error(`${capitalize(invalidInputs[0])} is not valid!`);
            else toastr.error(capitalize(res.message));
    }

    const capitalize = name => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    const handleChange = e => {
        const { name: type, value: newValue } = e.target;
        updateInputState(type, newValue);
        validateInput(e, type, newValue);
        showValidButton(1);
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
            default:
                return console.log(`Failed to update state for ${type}!`);
        }
    }

    const handleSwitchPage = (path) => {
        history.push(`/${path}`, { from: '/recover' });
    }

    let animation = '';

    if(props.location.state && props.location.state.from === '/login') animation = 'animated flipInY';
        else animation = 'animated fadeInUp';

    if (loggedUsername !== undefined && loggedUsername !== 'Guest') return <Redirect to={{ pathname: '/' }} />;

    return (
      <div className={classes.Wrapper}>
        <div className={animation}>
            <form onSubmit={handleSubmit} ref={formEl} className={classes['auth-main']}>
                <h3 className={classes['page-name'] + ' ' + classes['recover']}>Recover account or resend activation email</h3>
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
                        placeholder="Your email or username..."
                    />
                    <span className={classes['verification']}><i className="fas fa-check"></i></span>
                </div>
                <button type="submit" disabled={true} className={classes.btn} ref={submitButton}>{loadingButton ? <ClipLoader size={13} color={'#485877'} /> : 'Send email'}</button>
                <div className={classes['auth-switch-page']} onClick={() => handleSwitchPage('login')}>Remember your account now? Go back to login</div> 
            </form>
        </div>
      </div>
    )
}

export default ForgotPassword;