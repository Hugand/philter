import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom'
import './index.scss';
import HomeScreen from './components/views/home-screen';
import * as serviceWorker from './serviceWorker';
import EditPhotoScreen from './components/views/edit-photo-screen';
import { StateProvider } from './state'

const initialState = {
  image: null
}

const reducer = (state, action) => {
  console.log(action.newImage)
  switch(action.type){
    case 'changeImage':
      return {
        ...state,
        image: action.newImage
      }
    default:
      return state
  }
}

const routing = (
  <Router>
    <StateProvider initialState={initialState} reducer={reducer}>
      <div>
        <Route path="/" exact component={HomeScreen} />
        <Route path="/edit" component={EditPhotoScreen} />
      </div>
    </StateProvider>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
