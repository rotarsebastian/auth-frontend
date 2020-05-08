import React, { useState, useRef, useEffect } from 'react';
import { editProfile } from '../../helpers/edit';
import ClipLoader from 'react-spinners/ClipLoader';
import classes from './Profile.module.css';
import { validateForm, validateInputValue } from '../../helpers/validation';
import toastr from 'toastr';
import { useStore, useSetAndDelete, useStoreValue, useSetStoreValue} from 'react-context-hook';

const Profile = () => {
    const submitButton = useRef(null);
    const formEl = useRef(null);
    
    const [isAuthenticated] = useStore('isAuthenticated');
    const [setLoggedUsername] = useSetAndDelete('username');
    const profile_data = useStoreValue('profile_data');
    const updateStoreProfileData = useSetStoreValue('profile_data');

    const [loggedUser, setLoggedUser] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [dataCharged, setDataCharged] = useState(false);

    useEffect(() => { if(isAuthenticated) setLoggedUser(true) }, [isAuthenticated])

    const [fullForm, updateForm] = useState({
        username: { type: 'username', val: '', valid: 'minimum 6 letters or digits', touched: false },
        firstName: { type: 'first_name', val: '', valid: 'minimum 2 letters', touched: false },
        lastName: { type: 'last_name', val: '', valid: 'minimum 2 letters', touched: false },
        company: { type: 'company', val: '', valid: 'minimum 2 characters', touched: false },

        country: { type: 'country', val: '', valid: 'minimum 4 letters', touched: false, address: 1 },
        city: { type: 'city', val: '', valid: 'minimum 2 letters', touched: false, address: 1 },
        address: { type: 'address', val: '', valid: 'minimum 6 characters', touched: false, address: 1 },
        postalCode: { type: 'postal_code', val: '', valid: 'exactly 4 digits', touched: false, address: 1 },
    })
    const [addressID, setAddressID] = useState(null);

    const leftSideForm = [fullForm.username, fullForm.firstName, fullForm.lastName, fullForm.company];
    const rightSideForm = [fullForm.country, fullForm.city, fullForm.address, fullForm.postalCode];

    const populateForm = ({ id, verified, ...userData }) => {
        const populatedForm = { ...fullForm };
        let userDetails = { ...userData };

        const { first_name, last_name, postal_code, ...otherProps } = userDetails;
        userDetails = { firstName: first_name, lastName: last_name, ...otherProps };

        if(userDetails.user_address !== null) {
            const { user_address, ...otherProps } = userDetails;
            setAddressID(user_address.id);
            userDetails = { postalCode: user_address.postal_code, city: user_address.city, address: user_address.address, country: user_address.country,  ...otherProps };
        }

        for (let prop in userDetails) {
            if (Object.prototype.hasOwnProperty.call(userDetails, prop)) {
                if(userDetails[prop] !== null) populatedForm[prop].val = userDetails[prop];
            }
        }
        updateForm(populatedForm);
        setDataCharged(true);
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        submitButton.current.disabled = true;
        submitButton.current.classList.remove(classes.valid);
        setLoadingButton(true);
        await handleEditProfile();
    }

    const handleEditProfile = async() => {
        const submitForm = { ...fullForm };
        for (let field in submitForm) { submitForm[field].val = submitForm[field].val.trim() }
        const arrayOfFormElem = Object.entries(submitForm).map(([k, v]) => v);
        const arrayOfFormElemTouched = arrayOfFormElem.filter(e => e.val.length > 0 && e.touched);
        const arrayOfFormElemChanged = arrayOfFormElemTouched.map(({ valid, touched, ...keepAttrs }) => keepAttrs);
        
        const isFormValid = validateForm(arrayOfFormElemChanged, formEl.current, classes);
        if(isFormValid) {
            const res = addressID !== null ? await editProfile(arrayOfFormElemChanged, addressID) : await editProfile(arrayOfFormElemChanged);
            handleValidChecks('remove');
            setLoadingButton(false);
            if(res.status === 1) {
                toastr.success('Your profile was edited successfully!');
                resetTouched();
                updateProfileStore(res.data);
                setLoggedUsername(fullForm.username.val);
                return false;
            } else {
                handleServerErrors(res);
                return true;
            } 
        } else return true;
    }

    const updateProfileStore = newData => {
        const newProfileData = { ...profile_data };

        Object.keys(newData).forEach(key => {
            if(key !== 'user_address') {
                if(newData[key] !== newProfileData[key]) newProfileData[key] = newData[key];
            } else {
                if(newProfileData[key] !== null) {
                    Object.keys(newData.user_address).forEach(key => {
                        if(newData.user_address[key] !== newProfileData.user_address[key]) newProfileData.user_address[key] = newData.user_address[key];
                    })
                } else {
                    const newUserAddress = { address: null, postal_code: null, country: null, city: null };
                    newProfileData[key] = { ...newUserAddress, ...newData[key] };
                }
            }
        });

        updateStoreProfileData(newProfileData);
    }

    const resetTouched = () => {
        const newForm = { ...fullForm };
        for (let field in newForm) newForm[field].touched = false;
        updateForm(newForm);
    }

    const handleValidChecks = action => {
        const allValidEl = Array.from(formEl.current.querySelectorAll('input + span')).filter(e => e.classList.value.indexOf('valid') > 0);
        if(action === 'remove') allValidEl.forEach(e => e.classList.remove(classes.valid));
        if(action === 'count') return allValidEl.length;
    }

    const handleServerErrors = res => {
        if(res.code === 11) showServerErrors(res.invalids, res); // REGISTRATION / LOGIN - Validation failed!
            else if(res.code === 87) showServerErrors(['username'], res); // LOGIN - Incorrect username!
            else showServerErrors([], res); // REGISTER/LOGIN - General server error - Something went wrong!
    }

    const showServerErrors = (invalidInputs, res) => {
        if( invalidInputs.length === 0 ) return toastr.error('Please try again!', 'Something went wrong!'); // ADD TOASTR FOR GENERAL ERROR - SMTH WENT WRONG
        if ( res.code === 87 ) return toastr.error('Please try another one!', 'This username is already taken!');
        invalidInputs.forEach(el => {
            const element = formEl.current.querySelector(`#${el}`);
            element.classList.add(classes.error);
            element.previousSibling.lastChild.classList.add(classes.error);
        });

        // Adding messages to toastr
        if(res.hasOwnProperty('invalids')) return toastr.error(`${capitalize(invalidInputs.join(', '))} are not valid!`);
            else return toastr.error(capitalize(res.message)); 
    }

    const handleChange = e => {
        const { name: type, value: newValue } = e.target;
        updateInputState(type, newValue);
        validateInput(e, type, newValue);
        showValidButton();
    }

    const showValidButton = () => {
        const formButtonClasses = submitButton.current.classList;

        if(handleValidChecks('count') > 0) { 
            formButtonClasses.add(classes.valid);
            submitButton.current.disabled = false;
        } else {
            formButtonClasses.remove(classes.valid);
            submitButton.current.disabled = true;
        }
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

    const updateInputState = (type, newValue) => {
        const newForm = { ...fullForm };
        let input = type;
        const indexOfSpace = type.indexOf('_');
        if(indexOfSpace !== -1) input = byPassElemType(type, '_');
        const newEl = fullForm[input].hasOwnProperty('address') ? { type, val: newValue, valid: newForm[input].valid, touched: true, address: 1 } : { type, val: newValue, valid: newForm[input].valid, touched: true } ;
        newForm[input] = newEl;
        updateForm(newForm);
    }

    const byPassElemType = (type, bypassFor) => {
        const indexToChange = type.indexOf(bypassFor);
        return type.replace(bypassFor, type[indexToChange + 1].toUpperCase()).replace(type[[indexToChange + 1]], '');
    }

    const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);

    const byPassLabel = (type, options) => {
        if(type.split('_').length === 1) return capitalize(type);
        if(options) return capitalize(type.split('_')[0]) + ' ' + type.split('_')[1];
        return type.split('_')[0] + ' ' + type.split('_')[1];
    }
    
    if(!loggedUser) return <div className={classes.Loading}><ClipLoader size={50} color={'#485877'} /></div>;
        else if(!dataCharged) populateForm(profile_data);
    
    return(
        <div className={classes.ProfileContainer}>
            <h2>Edit your profile</h2>
            <form onSubmit={handleSubmit} ref={formEl} className={classes.FormElem}>
                <div className={classes.FormContainer}>
                    <div className={classes.FormLeft}>
                        <div className={classes.SectionTitle}>User Information</div>
                        { leftSideForm.map((el, index) => {
                            return (
                                <React.Fragment key={'left' + index}>
                                    <label htmlFor={el.type}>{byPassLabel(el.type, 'capitalize')}<span>{el.valid}</span></label>
                                    <input
                                        type="text"
                                        name={el.type}
                                        id={el.type}
                                        autoComplete="off"
                                        value={el.val}
                                        onChange={handleChange}
                                        onKeyPress={e => !(/^[a-zA-Z0-9_.-@]*$/g.test(e.key)) && el.type === 'username' ? e.preventDefault() : undefined}
                                        maxLength="50"
                                        placeholder={`Enter ${byPassLabel(el.type)}...`}
                                    />
                                    <span className={classes['verification']}><i className="fas fa-check"></i></span>    
                                </React.Fragment>       
                            )
                        }) }
                    </div>
                    <div className={classes.FormRight}>
                        <div className={classes.SectionTitle}>Address Information</div>
                        { rightSideForm.map((el, index) => {
                            return (
                                <React.Fragment key={'right' + index}>
                                    <label htmlFor={el.type}>{ el.type === 'postal_code' ? `${byPassLabel(el.type, 'capitalize')} (if Denmark)` : byPassLabel(el.type, 'capitalize')}<span>{el.valid}</span></label>
                                    <input
                                        type="text"
                                        name={el.type}
                                        id={el.type}
                                        autoComplete="off"
                                        value={el.val}
                                        onChange={handleChange}
                                        maxLength={ el.type === 'postal_code' ? '4' :'50' }
                                        placeholder={`Enter ${byPassLabel(el.type)}...`}
                                    />
                                    <span className={classes['verification']}><i className="fas fa-check"></i></span>    
                                </React.Fragment>       
                            )
                        }) }
                    </div>
                </div>
                <div className={classes.BtnContainer}>
                    <button type="submit" disabled={true} className={classes.Btn} ref={submitButton}>{loadingButton ? <ClipLoader size={13} color={'#485877'} /> : 'Save'}</button>
                </div>
            </form>
        </div>
    );
}

export default Profile;
