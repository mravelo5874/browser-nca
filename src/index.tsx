import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './App'
import { Sim } from './Sim'

let sim = new Sim()

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
)
root.render(
  	<React.StrictMode>
    	<App sim={sim}/>
  	</React.StrictMode>
)