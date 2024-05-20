import React from 'react'
import { Sim } from './Sim'

interface AppInterface { sim: Sim }

class App extends React.Component<AppInterface, {}> {
	constructor (props: AppInterface) {
		super(props)
	}

	render() {
		return (
		<>
			
		</>
		)
	}
}

export { App }