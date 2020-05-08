import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Login from './components/Login/Login';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Home from './pages/Home/Home';
import Profile from './pages/Profile/Profile';
import CallMe from './pages/CallMe/CallMe';
import WhoAmI from './pages/WhoAmI/WhoAmI';
import Register from './components/Register/Register';
import Header from './components/Header/Header';
import './App.css';
import toastr from 'toastr';
import toastrSetup from './helpers/toastrSettings';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import ChangePassword from './components/ChangePassword/ChangePassword';
import auth, { checkAuth } from './helpers/auth';
import ClipLoader from 'react-spinners/ClipLoader';
import Footer from './components/Footer/Footer';
import { withStore } from 'react-context-hook';
// import { useStoreState } from 'react-context-hook';
import { useStore, useSetAndDelete, useSetStoreValue } from 'react-context-hook';

// function Description() {
//   const globalState = useStoreState()
//   return (
//     <section style={{position: 'fixed', bottom: 0, left: 0}}>
//       <h3>
//         This is a React App that has a global state. This is the value of the
//         global <em>state</em>.
//       </h3>
//       <pre>
//         <code id="global-state">{JSON.stringify(globalState, null, ' ')}</code>
//       </pre>
//       <p>
//         You can change the global state from different components, using the
//         buttons you find in this page
//       </p>
//       <p>Every time a component renders, it flashes. </p>
//     </section>
//   )
// }

const App = () => {
  toastr.options = toastrSetup;

  const [loggedUser, setLoggedUser] = useStore('username', null, false);
  const [setIsAuthenticated] = useSetAndDelete('isAuthenticated');
  const [setLoggedID] = useSetAndDelete('userID');
  const setObject = useSetStoreValue('profile_data');

  useEffect(() => {
      const fetchAuth = async() => {
          const res = await checkAuth('profile');
          // console.log(res);
          if(res.status === 1) {
            setIsAuthenticated(true);
            setLoggedUser(res.data.username);
            setLoggedID(res.data.id);
            setObject(res.data);
          } else setLoggedUser('Guest');    
      }
      fetchAuth();
  }, [setLoggedUser, setIsAuthenticated, setLoggedID, setObject]);

  if(loggedUser === null) return <div className="loading"><ClipLoader size={50} color={'#485877'} /></div>;

  return (
    <Router basename="/">
      <div>
        <Header/>
        {/* <Description /> */}
        <Route exact path="/" component={Home}/>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/recover" component={ForgotPassword} />
        <Route path="/changepass" component={ChangePassword} />
        <Route path="/about" component={WhoAmI} />
        <PrivateRoute path='/profile' component={Profile} />
        <PrivateRoute path='/callme' component={CallMe} />
        <Link to="/"><Footer /></Link>
      </div>
    </Router>
  )
}

const initialState = auth;

// const storeConfig = {
//   listener: (state, key, prevValue, nextValue) => {
//     if (process.env.NODE_ENV !== 'test') {
//       console.log(`the key "${key}" changed in the store`)
//       console.log('the old value is', prevValue)
//       console.log('the current value is', nextValue)
//       console.log('the state is', state)
//     }
//   },
//   logging: process.env.NODE_ENV !== 'test'
// }

export default withStore(App, initialState);

