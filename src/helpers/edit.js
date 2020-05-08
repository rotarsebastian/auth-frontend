// const endpoint = 'https://tranquil-mountain-48332.herokuapp.com/';
const endpoint = 'http://localhost:9090/';

export const editProfile = async(arrayOfFormElemChanged, userAddressID) => {
  try {
      const addressID = userAddressID ? `?addressid=${userAddressID}` : '';
      const options = {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include', 
          body: JSON.stringify(arrayOfFormElemChanged),
      };
      const response = await fetch(endpoint + `users/edit${addressID}`, options);
      const data = await response.json();
      return data;
  }
  catch(err) {
      return { status: 0, message: 'Can not connect to the server', code: 999 };
  }
};


