import React from 'react'
import { Sim } from './Sim'
import { Canvas } from './Canvas'
import { UI } from './UI'

interface AppInterface { sim: Sim }

export class App extends React.Component<AppInterface, {}> {
	render() {
		return(
			<>
				<Canvas sim={this.props.sim}/>
				<UI sim={this.props.sim}/>
			</>
		)
	}
}