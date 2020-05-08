import React, { useState, useRef, useEffect } from 'react';
import { changePassword } from '../../helpers/auth';
import { useHistory, useLocation } from 'react-router-dom';
import classes from '../../styles/Auth.module.css';
import { validateForm, validateInputValue } from '../../helpers/validation';
import '../../styles/toastr.css';
import toastr from 'toastr';
import ClipLoader from 'react-spinners/ClipLoader';
import { Redirect } from 'react-router-dom';
import { isUuid } from 'uuidv4';
import { useStore } from 'react-context-hook';

const ChangePassword = () => {
  const formEl = useRef(null);
  const submitButton = useRef(null);
  const history = useHistory();
  const location = useLocation();

  const [loggedUsername] = useStore('username');

  const [password, setPassword] = useState({ type: 'password', val: '' });
  const [rePassword, setRePassword] = useState({ type: 'password', val: '' });
  const [loadingButton, setLoadingButton] = useState(false);
  const [userToHandle, setUserToHandle] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const key = searchParams.get('key'); 
    if(isUuid(key)) setUserToHandle({ key });
        else history.push('/login');
  }, [history, location]);

  const handleSubmit = async(e) => {
      e.preventDefault();
      let areThereErrors = false;

      submitButton.current.disabled = true;
      setLoadingButton(true);
      areThereErrors = await handleChangePass(e);
      submitButton.current.disabled = false;
      setLoadingButton(false);

      if(!areThereErrors) {
        toastr.success('You can login now login with your new password!', 'Your password has been changed!', );
        history.push('/login');
      }
  }

  const handleChangePass = async(e) => {
    const isFormValid = validateForm([password], e.target, classes);
    if(!isRepeatPasswordValid()) return true;
    if(isFormValid) {
        const res = await changePassword(password, rePassword, userToHandle);
        // console.log(res)
        if(res.status === 1) return false;
            else {
                handleServerErrors(res);
                return true;
        } 
    } else return true;
  }

  const handleServerErrors = res => {
      if(res.code === 11) showServerErrors(res.invalids, res); // CHANGE PASSWORD - Validation failed!
          else if(res.code === 10) showServerErrors(['password', 'rePassword'], res); // CHANGE PASSWORD - Passwords do not match!
          else showServerErrors([], res); // CHANGE PASSWORD- General server error - Something went wrong!
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
      showValidButton(2);
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
          case 'password':
              return setPassword(newEl);
          case 'rePassword':
            return setRePassword({ type: 'password', val: newValue });
          default:
              return console.log(`Failed to update state for ${type}!`);
      }
  }

  const handleSwitchPage = (path) => {
      history.push(`/${path}`);
  }

  let animation = 'animated fadeInUp';

  if (loggedUsername !== undefined && loggedUsername !== 'Guest') return <Redirect to={{ pathname: '/' }} />;

  return (
    <div className={classes.Wrapper}>
      <div className={animation}>
          <form onSubmit={handleSubmit} ref={formEl} className={classes['auth-main']}>
              <h3 className={classes['page-name']}>Change password</h3>
              <div className={classes['form-control']}>
                <label htmlFor="password">New Password<span>minimum 6 characters</span></label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    value={password.val}
                    onChange={handleChange}
                    placeholder="Enter password..."
                />
                <span className={classes['verification']}><i className="fas fa-check"></i></span>
                <label htmlFor="rePassword">Confirm New Password <span>same as password above</span></label>
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
              <button type="submit" disabled={true} className={classes.btn} ref={submitButton}>{loadingButton ? <ClipLoader size={13} color={'#485877'} /> : 'Change password'}</button>
              <div className={classes['auth-switch-page'] + ' ' + classes['register']} onClick={() => handleSwitchPage('login')}>Remember your password? Sign in here</div> 
          </form>
      </div>
    </div>
  )
}

export default ChangePassword;