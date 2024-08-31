import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { Sim } from './Sim'

// * create a new simulation
let sim = new Sim()

// * render simulation using canvas
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  	<React.StrictMode>
    	<App sim={sim}/>
  	</React.StrictMode>
)