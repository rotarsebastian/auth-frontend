import React, { useState, useRef } from 'react';
import { register } from '../../helpers/auth';
import classes from '../../styles/Auth.module.css';
import { validateForm, validateInputValue } from '../../helpers/validation';
import '../../styles/toastr.css';
import toastr from 'toastr';
import ClipLoader from 'react-spinners/ClipLoader';
import { Redirect } from 'react-router-dom';
import { useStore } from 'react-context-hook';

const Register = props => {
  const formEl = useRef(null);
  const submitButton = useRef(null);
  const { history } = props;

  const [loggedUsername] = useStore('username');

  const [email, setEmail] = useState({ type: 'email', val: '' });
  const [username, setUsername] = useState({ type: 'username', val: '' });
  const [password, setPassword] = useState({ type: 'password', val: '' });
  const [rePassword, setRePassword] = useState({ type: 'password', val: '' });
  const [loadingButton, setLoadingButton] = useState(false);

  const handleSubmit = async(e) => {
      e.preventDefault();
      let areThereErrors = false;

      submitButton.current.disabled = true;
      setLoadingButton(true);
      areThereErrors = await handleRegistration(e);
      submitButton.current.disabled = false;
      setLoadingButton(false);

      if(!areThereErrors) {
        toastr.success('Please check your email to activate your account!', 'Your account has been created!', );
        history.push('/login', { from: '/register', username });
      }
  }

  const handleRegistration = async(e) => {
    const isFormValid = validateForm([username, password, email], e.target, classes);
    if(!isRepeatPasswordValid()) return true;
    if(isFormValid) {
        const res = await register(username, password, email, rePassword);
        if(res.status === 1) return false;
            else {
                handleServerErrors(res);
                return true;
        } 
    } else return true;
  }

  const handleServerErrors = res => {
      if(res.code === 11) showServerErrors(res.invalids, res); // REGISTRATION / LOGIN - Validation failed!
          else if(res.code === 12) showServerErrors(['username', 'email'], res);  // REGISTRATION - Both email and username are already used!
          else if(res.code === 13 || res.code === 15) showServerErrors(['username'], res); // REGISTRATION - Username is already used! ---- LOGIN - Incorrect username!
          else if(res.code === 14) showServerErrors(['email'], res); // REGISTRATION - Email is already used!
          else if(res.code === 16) showServerErrors(['password'], res); // LOGIN - Incorrect pass!
          else if(res.code === 10) showServerErrors(['password', 'rePassword'], res); // REGISTER - Passwords do not match!
          else if(res.code === 9) showServerErrors(['email'], res); // REGISTER - Your email is not valid!
          else showServerErrors([], res); // REGISTER/LOGIN - General server error - Something went wrong!
  }

  const showServerErrors = (invalidInputs, res) => {
      if(invalidInputs.length === 0) return toastr.error('Please try again!', 'Something went wrong!'); 
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
      showValidButton(4);
  }

  const validateInput = (e, type, newValue) => {
      const { target: el } = e;
      let isValid = false;
      
      // Switch when becomes valid
      if(type !== 'rePassword') {
        isValid = validateInputValue(type, newValue);
        if(type === 'password') byPassValidationForPasswords(isValid, newValue);
      } else isValid = (password.val === newValue && newValue !== '' && newValue.length > 5) ? true : false;

      // Add/Remove valid check mark on valid/invalid elements
      showValidationInput(el, isValid); 
  }

  const byPassValidationForPasswords = (isValid, pass) => {
    const { val: rePass } = rePassword;
    if(isValid && rePass.length > 0) {
        if(rePass !== pass ) formEl.current.querySelector('#rePassword').nextSibling.classList.remove(classes.valid);
            else formEl.current.querySelector('#rePassword').nextSibling.classList.add(classes.valid);
    } else if(!isValid && rePass.length > 0) 
        formEl.current.querySelector('#rePassword').nextSibling.classList.remove(classes.valid);
  }

  const isRepeatPasswordValid = () => {
      if(password.val !== rePassword.val || rePassword.val === '' || rePassword.val < 6) {
          const rePassInput = formEl.current.querySelector('#rePassword');
          rePassInput.classList.add(classes.error);
          rePassInput.previousSibling.lastChild.classList.add(classes.error);
          return false;
      }
      return true;
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
          case 'rePassword':
            return setRePassword({ type: 'password', val: newValue });
          case 'email':
            return setEmail(newEl);
          default:
              return console.log(`Failed to update state for ${type}!`);
      }
  }

  const handleSwitchPage = (path) => {
      history.push(`/${path}`, { from: '/register' });
  }

  let animation = '';

  if(props.location.state && props.location.state.from === '/login') animation = 'animated flipInY';
    else animation = 'animated fadeInUp';

  if (loggedUsername !== undefined && loggedUsername !== 'Guest') return <Redirect to={{ pathname: '/' }} />;

  return (
    <div className={classes.Wrapper}>
      <div className={animation}>
          <form onSubmit={handleSubmit} ref={formEl} className={classes['auth-main']}>
              <h3 className={classes['page-name']}>Register</h3>
              <div className={classes['form-control']}>
                <label htmlFor="username">Username<span>minimum 6 letters or numbers</span></label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    autoComplete="off"
                    value={username.val}
                    onChange={handleChange}
                    onKeyPress={(e) => !(/^[aA-zZ0-9-]+$/g.test(e.key)) ? e.preventDefault() : undefined}
                    maxLength="50"
                    placeholder="Enter username..."
                />
                <span className={classes['verification']}><i className="fas fa-check"></i></span>
                <label htmlFor="email">Email<span>e.g. joe@smith.com</span></label>
                <input
                    type="text"
                    name="email"
                    id="email"
                    autoComplete="off"
                    value={email.val}
                    onChange={handleChange}
                    placeholder="Enter email..."
                    
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
                <label htmlFor="rePassword">Confirm Password<span>same as password above</span></label>
                <input
                    type="password"
                    name="rePassword"
                    id="rePassword"
                    value={rePassword.val}
                    onChange={handleChange}
                    placeholder="Enter password..."
                /> 
                <span className={classes['verification']}><i className="fas fa-check"></i></span>
              </div>
              <button type="submit" disabled={true} className={classes.btn} ref={submitButton}>{loadingButton ? <ClipLoader size={13} color={'#485877'} /> : 'Register'}</button>
              <div className={classes['auth-switch-page'] + ' ' + classes['register']} onClick={() => handleSwitchPage('login')}>Already have an account? Sign in here</div> 
          </form>
      </div>
    </div>
  )
}

export default Register;