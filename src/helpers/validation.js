let updateClasses = null;

export const validateForm = (formElements, form, classes) => {
    updateClasses = classes;
    let formIsValid = true;
    formElements.forEach(input => {
        if(!validateInputValue(input.type, input.val)) {
            formIsValid = false;
            showError(input.type, form);
        }
    });
    return formIsValid ? true : false;
}

export const validateInputValue = (type, value) => {
    switch (type) {
        case 'username':
            return value.length >= 6 && value.length <= 60 && /^[a-zA-Z0-9_.-@]*$/.test(value);
        case 'password':
            return value.length >= 6 && value.length <= 50;
        case 'email':
            return /@.+\.[A-Za-z]{2,}$/.test(value);
        case 'first_name':
            return value.length >= 2 && value.length <= 50 && /^[\p{L} .'-]+$/u.test(value);
        case 'last_name':
            return value.length >= 2 && value.length <= 50 && /^[\p{L} .'-]+$/u.test(value);
        case 'company':
            return value.length >= 2 && value.length <= 50;
        case 'country':
            return value.length >= 4 && value.length <= 56 && /^[a-zA-Z\s]*$/.test(value);
        case 'city':
            return value.length >= 2 && value.length <= 50 && /^[a-zA-Z\s]*$/.test(value);
        case 'address':
            return value.length >= 6 && value.length <= 100;
        case 'postal_code':
            return /^[0-9]{4}$/.test(value);
        default:
            return console.log(`Validation failed! No validation for ${type}!`);
    }
}

const showError = (type, form) => {
    form.querySelector(`#${type}`).classList.add(updateClasses.error);
    form.querySelector(`#${type}`).previousSibling.lastChild.classList.add(updateClasses.error);
}