import React from 'react';
import { Sim } from './Sim';

interface UIInterface {
    sim: Sim
}

export class UI extends React.Component<UIInterface, {}> {

    comp_mounted: boolean
    sidebar_left_open: boolean
    sidebar_right_open: boolean

    // * dynamic text nodes
    fps_node: Text | null = null
    res_node: Text | null = null
    step_node: Text | null = null

    constructor(props: UIInterface) {
        super(props)
        
        // * component not mounted
        this.comp_mounted = false

        // * start with no sidebars open
        this.sidebar_left_open = false
        this.sidebar_right_open = false
        
        // * set simulation ui
        this.props.sim.ui = this

        // * bind 'this' for class functions
        this.load_model = this.load_model.bind(this)
        this.toggle_sidebar_left = this.toggle_sidebar_left.bind(this)
        this.toggle_sidebar_right = this.toggle_sidebar_right.bind(this)
        this.toggle_auto_reset = this.toggle_auto_reset.bind(this)
        this.toggle_auto_damage = this.toggle_auto_damage.bind(this)
        this.change_light_color = this.change_light_color.bind(this)
        this.change_light_speed = this.change_light_speed.bind(this)
        this.change_light_radius = this.change_light_radius.bind(this)

        console.log('[UI.tsx] ui constructed')
    }

    componentDidMount = () => {
        // * open the left sidebar after 1 second
        if (!this.comp_mounted) {
            this.comp_mounted = true
            // * set default values for inputs
            let lightColor = document.getElementById('light-color-picker') as HTMLInputElement
            lightColor.defaultValue = '#19334d'
            let lightslider = document.getElementById('light-speed-slider') as HTMLInputElement
            lightslider.defaultValue ='0.1'
            let lightradius = document.getElementById('light-radius-slider') as HTMLInputElement
            lightradius.defaultValue ='8.0'
            // * open left sidebar after 1 second
            setTimeout(() => {
                this.toggle_sidebar_left()
                this.forceUpdate()
            }, 1000)
        }
    }

    update_res_node(_width: number, _height: number) {
        // * find resolution text node
        if (!this.res_node) {
            let res_element = document.querySelector('#res')
            this.res_node = document.createTextNode('')
            res_element?.appendChild(this.res_node)
            this.res_node.nodeValue = ''
        }
        // * update text
        if (this.res_node) this.res_node.nodeValue = _width.toFixed(0) + ' x ' + _height.toFixed(0)
    }

    update() {
        // * update fps text
        if (!this.fps_node) {
            let fps_element = document.querySelector('#fps')
            this.fps_node = document.createTextNode('')
            fps_element?.appendChild(this.fps_node)
            this.fps_node.nodeValue = ''
        }
        else {
            this.fps_node.nodeValue = this.props.sim.fps.toFixed(0)
        }

        // * update step text
        if (!this.step_node) {
            let step_element = document.querySelector('#step')
            this.step_node = document.createTextNode('')
            step_element?.appendChild(this.step_node)
            this.step_node.nodeValue = ''
        }
        else {
            this.step_node.nodeValue = this.props.sim.step.toFixed(0)
        }
    }

    toggle_sidebar_left() {
        this.sidebar_left_open = !this.sidebar_left_open
        var sidebar = document.getElementById('sidebar-left') as HTMLDivElement
        sidebar.classList.toggle('closed')
        var panel = document.getElementById('sidebar-left-panel') as HTMLDivElement
        panel.classList.toggle('closed')
        var button = document.getElementById('sidebar-left-button') as HTMLButtonElement
        button.classList.toggle('closed')
    }

    toggle_sidebar_right() {
        this.sidebar_right_open = !this.sidebar_right_open
        var sidebar = document.getElementById('sidebar-right') as HTMLDivElement
        sidebar.classList.toggle('closed')
        var panel = document.getElementById('sidebar-right-panel') as HTMLDivElement
        panel.classList.toggle('closed')
        var button = document.getElementById('sidebar-right-button') as HTMLButtonElement
        button.classList.toggle('closed')
    }

    load_model() {
        let menu = document.getElementById('load_model_dropdown') as HTMLSelectElement
        const value = menu.value
        let sim = this.props.sim
        sim.load_model(value)
    }

    toggle_auto_reset() {
        let sim = this.props.sim
        sim.toggle_auto_reset()
    }

    toggle_auto_damage() {
        let sim = this.props.sim
        sim.toggle_auto_damage()
    }

    change_light_color() {
        var colorpicker = document.getElementById('light-color-picker') as HTMLInputElement
        const color = colorpicker.value
        let sim = this.props.sim
        sim.set_light_color(color)
    }

    change_light_speed() {
        var lightslider = document.getElementById('light-speed-slider') as HTMLInputElement
        const val = lightslider.value
        let sim = this.props.sim
        sim.set_light_speed(+val)
    }

    change_light_radius() {
        var lightslider = document.getElementById('light-radius-slider') as HTMLInputElement
        const val = lightslider.value
        let sim = this.props.sim
        sim.set_light_radius(+val)
    }

    render() {
        return(
            <>
                <div id='sidebar-left' className={!this.sidebar_left_open ? 'closed': ''}>
                    <div id='sidebar-left-panel' className={!this.sidebar_left_open ? 'closed': ''}>
                        <div id='sidebar-left-inside'>
                            <h4 id='ui-title'>What am I looking at?</h4>
                            <h5 id='ui-text'>You are looking at a <i>neural cellular automaton</i> (nca for short). More specifically, you are seeing an nca model growing into its target object (an oak tree!).</h5>
                            <h5 id='ui-text'>Lets break down each word in nca:</h5>
                            <h4 id='ui-sub-title'>🧠 neural:</h4>
                            <h5 id='ui-text'>The underlying mechanism powering the model is a trained <i>neural network</i>.</h5>
                            <h4 id='ui-sub-title'>🦠 cellular:</h4>
                            <h5 id='ui-text'>Instead of being a single unit, a model is made up of a bunch of individual <i>cells</i>.</h5>
                            <h4 id='ui-sub-title'>🤖 automata:</h4>
                            <h5 id='ui-text' style={{paddingBottom:'0.5em'}}>A model grows on its own by repeatedly applying steps <i>automatically</i> as if it were a living organism.</h5>
                            
                            <hr/>
                            
                            <h4 id='ui-title'>How does it work?</h4>
                            <h5 id='ui-text'>As previously mentioned, nca are made up of a bunch of <i>cells</i> (each little box you see is a single cell).</h5>
                            <h5 id='ui-text'>Each step, every cell looks at its <i>neighboring</i> cells and decides what color and how transparent it should be. After enough steps, the model grows to become its target object!</h5>
                            <h5 id='ui-text' style={{paddingBottom:'0.5em'}}>This is a gross simplification of how nca work. I wrote an entire +100 page thesis on the subject (available <a href='https://repositories.lib.utexas.edu/items/59d8a230-6f66-4cfe-90ae-1ee82c4842c7'><i>here</i></a>) if you are looking for a more comprehensive answer.</h5>
                        
                            <hr/>

                            <h4 id='ui-title'>Are there more?</h4>
                            <h5 id='ui-text'>Sure! Click on the <big>⚙️</big> button at the top-right of the window to open up the control panel. You can change the model using the drop-down labeled <i>select model</i>.</h5>
                            <h5 id='ui-text' style={{paddingBottom:'4em'}}>You can also close this panel by clicking the <big>🤔</big> button at the top-right of this panel.</h5>

                            <a href='https://marcoravelo.com/continuous-cellular-automata/' className='a_button'>🚀 Visit CCA App</a>

                            <div style={{height:'4em'}}/>
                        </div>
                    </div>

                    <button id='sidebar-left-button' className={!this.sidebar_left_open ? 'ui_button closed': 'ui_button'} onClick={this.toggle_sidebar_left}>🤔</button>
                </div> 

                <div id='sidebar-right' className='closed'>
                    <div id='sidebar-right-panel' className='closed'>
                        <h4 style={{fontSize:'1em'}}>This is the control panel.</h4>
                        <h5 id='ui-text' style={{paddingTop:'0.5em'}}>⚠️ This app is still under development!</h5>
                        <h5 id='ui-text' style={{paddingTop:'0.5em'}}>Come back soon to see new features!</h5>

                        <hr/>

                        <h4 style={{fontSize:'1em'}}>res: <span id='res'/></h4>
                        <h4 style={{fontSize:'1em'}}>fps: <span id='fps'/></h4>
                        <h4 style={{fontSize:'1em'}}>step: <span id='step'/></h4>

                        <hr/>

                        <div style={{paddingBottom:'0.5em', paddingRight:'0.5em'}}>
                            <h4 style={{paddingBottom:'0.5em'}}>select a model:</h4>
                            <select className='dropdown_input' name='load_model_dropdown' id='load_model_dropdown' onChange={this.load_model}>
                                <option className='dropdown_option' value='oak'>🌳 oak</option>
                                <option value='sphere'>🔵 sphere</option>
                                <option value='rubiks'>🧊 rubiks</option>
                                <option value='burger'>🍔 burger</option>
                                <option value='cowboy'>🤠 cowboy</option>
                                <option value='earth'>🌍 earth</option>
                                <option value='cactus'>🌵 cactus</option>
                                <option value='maze'>🕹️ maze</option>
                                <option value='minicube'>◻️ minicube</option>
                            </select>

                            <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                                <input type='checkbox' id='toggle-auto-reset' onClick={this.toggle_auto_reset} defaultChecked/>
                                <h4 style={{fontSize:'1em', paddingLeft:'0.5em'}}>auto reset (after 500 steps)</h4>
                            </div>

                            <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0em'}}>
                                <input type='checkbox' id='toggle-auto-reset' onClick={this.toggle_auto_damage} defaultChecked/>
                                <h4 style={{fontSize:'1em', paddingLeft:'0.5em'}}>auto damage (every 100 steps)</h4>
                            </div>
                        </div>

                        <hr/>

                        <h4 style={{fontSize:'1em'}}>light controls</h4>
                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='color' id='light-color-picker' onChange={this.change_light_color}/>
                            <h4 style={{fontSize:'1em', paddingLeft:'0.5em'}}>light color</h4>
                        </div>

                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='range' id='light-speed-slider' min='0.0' max='1.0' step='0.1' onChange={this.change_light_speed}/>
                            <h4 style={{fontSize:'1em', paddingLeft:'0.5em'}}>light speed</h4>
                        </div>

                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='range' id='light-radius-slider' min='4.0' max='24.0' step='0.1' onChange={this.change_light_radius}/>
                            <h4 style={{fontSize:'1em', paddingLeft:'0.5em'}}>light radius</h4>
                        </div>
                        
                    </div>
                    <button id='sidebar-right-button' className={'ui_button closed'} onClick={this.toggle_sidebar_right}>⚙️</button>
                </div> 
            </>
        )
    }
}