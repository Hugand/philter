import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router } from 'react-router-dom'
import './index.scss';
import HomeScreen from './components/views/home-screen';
import * as serviceWorker from './serviceWorker';
import EditPhotoScreen from './components/views/edit-photo-screen';
import { StateProvider } from './state'

const initialState = {
  imageName: '',
  image: null,
  imageData: null,
  realSizedCanvas: null,
  histogramData: null,
  imageFilters: {
    exposure: 0,
    contrast: 0,
    hue: 0,
    saturation: 0,
    sharpness: 0,
    highlights: 0,
    shadows: 0,
    noise: 0,
    blur: 0,
    invert_colors: -1,
    b_w: 0
  }
}

const reducer = (state, action) => {
  switch(action.type){
    case 'changeImage':
      return {
        ...state,
        image: action.newImage,
        imageName: action.newImageName
      }
    case 'changeFilter':
      return {
        ...state,
        imageFilters: {
          ...state.imageFilters,
          [action.filterType]: action.newFilterValue
        }
      }
    case 'resetData':
      return initialState
    case 'updateHistogramData':
      return {
        ...state,
        histogramData: action.newHistogramData
      }
    case 'updateNewImageData':
      return {
        ...state,
        imageData: action.newImageData
      }
    case 'updateRealSizedCanvas':
      return {
        ...state,
        realSizedCanvas: action.newrealSizedCanvas
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
