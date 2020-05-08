// const endpoint = 'https://tranquil-mountain-48332.herokuapp.com/users';
const endpoint = 'http://localhost:9090/users';

const auth = {
    isAuthenticated: false,
    username: undefined,
    userID: undefined
}

export const checkAuth = async(config) => {
  try {
      const withOptions = config ? 'profile' : '';
      const options = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ withOptions })
      };
      const response = await fetch(endpoint + '/checkauth', options);
      const data = await response.json();
      return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export const logout = async() => {
  try {
    const options = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    };
    const response = await fetch(endpoint + '/logout', options);
    const data = await response.json();
    return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export const login = async(username, password) => {
  try {
      const options = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          username,
          password
        ])
      };
      const response = await fetch(endpoint + '/login', options);
      const data = await response.json();
      return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export const recoverOrResendValidation = async(usernameOrEmail) => {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([ usernameOrEmail ])
    };
    const response = await fetch(endpoint + '/recover', options);
    const data = await response.json();
    return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export const register = async(username, password, email, repeatPassword) => {
  try {
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([ username, password, email, repeatPassword ])
      };
      const response = await fetch(endpoint + '/register', options);
      const data = await response.json();
      return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export const changePassword = async(password, repeatPassword, key) => {
  try {
      const options = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([ password, repeatPassword, key ])
      };
      const response = await fetch(endpoint + '/resetpass', options);
      const data = await response.json();
      return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};

export default auth;