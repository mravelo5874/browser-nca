import React from 'react'
import { Sim } from './Sim'
import { Canvas } from './Canvas'
import { UI } from './UI'

export { App }

interface AppInterface { sim: Sim }

class App extends React.Component<AppInterface, {}> {
	constructor (props: AppInterface) {
		super(props)
	}

	render() {
		return(
			<>
				<Canvas sim={this.props.sim}/>
				<UI sim={this.props.sim}/>
			</>
		)
	}
}