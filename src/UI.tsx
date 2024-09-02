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
        this.toggle_nca_paused = this.toggle_nca_paused.bind(this)
        this.change_light_color = this.change_light_color.bind(this)
        this.change_light_speed = this.change_light_speed.bind(this)
        this.change_light_radius = this.change_light_radius.bind(this)
        this.exit_performance_mode = this.exit_performance_mode.bind(this)

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
            lightradius.defaultValue ='5.0'
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
            this.step_node.nodeValue = this.props.sim.steps.toFixed(0)
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

    toggle_nca_paused() {
        let sim = this.props.sim
        sim.toggle_nca_paused()
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

    exit_performance_mode() {

    }

    render() {
        return(
            <>
                <div id='sidebar-left' className={!this.sidebar_left_open ? 'closed': ''}>
                    <div id='sidebar-left-panel' className={!this.sidebar_left_open ? 'closed': ''}>
                        <div id='sidebar-left-inside'>
                            <div style={{height:'1em'}}/>
                        
                            <h4 id='ui-title'>What am I looking at?</h4>
                            <h5 id='ui-text'>You are looking at a <i>neural cellular automaton</i> (nca for short). More specifically, you are seeing an nca model growing into its target structure (an oak tree!). To get a better understanding, let's break down each word in nca:</h5>
                            <h4 id='ui-sub-title'><big>🧠</big> neural:</h4>
                            <h5 id='ui-text'>The underlying mechanism powering the nca model is a trained <i>neural network</i>.</h5>
                            <h4 id='ui-sub-title'><big>🦠</big> cellular:</h4>
                            <h5 id='ui-text'>Instead of consisting of a single unit, a model is made up of a bunch of individual <i>cells</i>.</h5>
                            <h4 id='ui-sub-title'><big>🤖</big> automata:</h4>
                            <h5 id='ui-text' style={{paddingBottom:'0.5em'}}>A model grows on its own by repeatedly applying steps <i>automatically</i> as if it were a living organism.</h5>
                            
                            <div style={{height:'1em'}}/>
                            <hr/>
                            <div style={{height:'1em'}}/>
                            
                            <h4 id='ui-title'>How do they work?</h4>
                            <h5 id='ui-text'>As previously mentioned, nca are made up of a bunch of <i>cells</i> (each little box you see is a single cell).</h5>
                            <h5 id='ui-text'>Each step, every cell looks at its <i>neighboring</i> cells and decides what color and how transparent it should be. After enough steps, the model grows to become its target structure!</h5>
                            <h5 id='ui-text' style={{paddingBottom:'0.5em'}}>This is a gross simplification of how nca work. I wrote an entire +100 page thesis on the subject (available <a href='https://repositories.lib.utexas.edu/items/59d8a230-6f66-4cfe-90ae-1ee82c4842c7'><i>here</i></a>) if you are looking for a more comprehensive answer.</h5>
                        
                            <div style={{height:'1em'}}/>
                            <hr/>
                            <div style={{height:'1em'}}/>

                            <h4 id='ui-title'>What properties do they have?</h4>
                            <h5 id='ui-text'>These nca models have various properties that make them unique to other cellular automata-based models. Here are the three most prominent ones:</h5>
                            <h4 id='ui-sub-title'><big>🗃️</big> self-organizing:</h4>
                            <h5 id='ui-text'>The individual cells in an nca model are able to <i>organize</i> into a global structure via interactions amongst themselves rather than through external instruction.</h5>
                            <h4 id='ui-sub-title'><big>🦎</big> regenerative:</h4>
                            <h5 id='ui-text'>After cellular damage is applied, nca models are able to <i>regenerate</i> lost structures and features. By default, cellular damage is applied (a random half of the model's volume get erased) every 100 steps.</h5>
                            <h4 id='ui-sub-title'><big>🔄</big> isotropic:</h4>
                            <h5 id='ui-text' style={{paddingBottom:'0.5em'}}>Models trained with specific perception types are able to grow in any direction, a property known as <i>isotropism</i>. For more details on this, refer to the thesis (available <a href='https://repositories.lib.utexas.edu/items/59d8a230-6f66-4cfe-90ae-1ee82c4842c7'><i>here</i></a>).</h5>

                            <div style={{height:'1em'}}/>
                            <hr/>
                            <div style={{height:'1em'}}/>

                            <h4 id='ui-title'>Are there more?</h4>
                            <h5 id='ui-text'>Sure! Click on the <big>⚙️</big> button at the top-right of the window to open up the control panel. You can change the model using the drop-down labeled <i>select a model</i>.</h5>
                            <h5 id='ui-text'>You can also close this panel by clicking the <big>🤔</big> button at the top-right of this panel.</h5>

                            <div style={{height:'4em'}}/>
                        </div>
                    </div>

                    <button id='sidebar-left-button' className={!this.sidebar_left_open ? 'ui_button closed': 'ui_button'} onClick={this.toggle_sidebar_left}><big>🤔</big></button>
                </div> 

                <div id='sidebar-right' className='closed'>
                    <div id='sidebar-right-panel' className='closed'>
                        <div style={{height:'1em'}}/>
                        <h4 style={{fontSize:'1em'}}>This is the control panel.</h4>
                        <h5 id='ui-text' style={{paddingTop:'0.5em'}}>⚠️ This app is still under development!</h5>
                        <h5 id='ui-text'>Come back soon to see new features!</h5>

                        <div style={{height:'0.5em'}}/>
                        <hr/>
                        <div style={{height:'0.5em'}}/>

                        <h4 style={{fontSize:'1em'}}>res: <span style={{color:'#c8c8c8'}} id='res'/></h4>
                        <h4 style={{fontSize:'1em'}}>fps: <span style={{color:'#c8c8c8'}} id='fps'/></h4>
                        <h4 style={{fontSize:'1em'}}>step: <span style={{color:'#c8c8c8'}} id='step'/></h4>

                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='checkbox' id='toggle-nca-paused' onClick={this.toggle_nca_paused}/>
                            <h5 id='ui-text' style={{paddingLeft:'0.5em', marginBlockEnd:'0em'}}>paused</h5>
                        </div>

                        {/* <button id='exit-performance-mode' style={{
                            scale: this.props.sim.perfomance_mode ? '100%' : '0%',
                            height: this.props.sim.perfomance_mode ? '-100%' : '0%',
                            paddingTop: this.props.sim.perfomance_mode ? '0.5em' : '0em',
                            paddingBottom: this.props.sim.perfomance_mode ? '0.5em' : '0em',
                        }} className={'ui_button'} onClick={this.exit_performance_mode}>exit performance mode</button> */}

                        <div style={{height:'0.5em'}}/>
                        <hr/>
                        <div style={{height:'0.5em'}}/>

                        <div style={{paddingBottom:'0.5em', paddingRight:'0.5em'}}>
                            <h4 id='ui-title'>Model Controls</h4>
                            <h5 id='ui-text' style={{paddingBottom:'0.2em'}}>select a model:</h5>
                            <select className='dropdown_input' name='load_model_dropdown' id='load_model_dropdown' onChange={this.load_model}>
                                <option value='oak' className='dropdown_option'>🌳 oak</option>
                                <option value='minicube'>◻️ minicube</option>
                                <option value='sphere'>🔵 sphere</option>
                                <option value='rubiks'>🧊 rubiks</option>
                                <option value='burger'>🍔 burger</option>
                                <option value='cowboy'>🤠 cowboy</option>
                                <option value='earth'>🌍 earth</option>
                                <option value='cactus'>🌵 cactus</option>
                                <option value='maze'>🕹️ maze</option>
                                
                            </select>

                            <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                                <input type='checkbox' id='toggle-auto-reset' onClick={this.toggle_auto_reset} defaultChecked/>
                                <h5 id='ui-text' style={{paddingLeft:'0.5em', marginBlockEnd:'0em'}}>auto reset (after 500 steps)</h5>
                            </div>

                            <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0em'}}>
                                <input type='checkbox' id='toggle-auto-reset' onClick={this.toggle_auto_damage} defaultChecked/>
                                <h5 id='ui-text' style={{paddingLeft:'0.5em', marginBlockEnd:'0em'}}>auto damage (every 100 steps)</h5>
                            </div>
                        </div>

                        <div style={{height:'0.5em'}}/>
                        <hr/>
                        <div style={{height:'0.5em'}}/>

                        <h4 id='ui-title'>Light Controls</h4>
                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='color' id='light-color-picker' onChange={this.change_light_color}/>
                            <h5 id='ui-text' style={{paddingLeft:'0.5em'}}>light color</h5>
                        </div>

                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='range' id='light-speed-slider' min='0.0' max='1.0' step='0.1' onChange={this.change_light_speed}/>
                            <h5 id='ui-text' style={{paddingLeft:'0.5em', marginBlockEnd:'0em'}}>light speed</h5>
                        </div>

                        <div className='ui-row' style={{paddingBottom:'0.5em', paddingTop:'0.5em'}}>
                            <input type='range' id='light-radius-slider' min='0.0' max='24.0' step='0.1' onChange={this.change_light_radius}/>
                            <h5 id='ui-text' style={{paddingLeft:'0.5em', marginBlockEnd:'0em'}}>light radius</h5>
                        </div>

                        <div style={{height:'0.5em'}}/>
                        <hr/>
                        <div style={{height:'0.5em'}}/>

                        <h4 id='ui-title'>Links</h4>
                        <a href='https://marcoravelo.com/continuous-cellular-automata/' className='a_button'><big>🚀</big> Visit CCA App</a>
                        <div style={{height:'1.5em'}}/>
                        <a href='https://repositories.lib.utexas.edu/items/59d8a230-6f66-4cfe-90ae-1ee82c4842c7/' className='a_button'><big>📚</big> View NCA Thesis</a>
                        <div style={{height:'1.5em'}}/>
                        <a href='https://github.com/mravelo5874/neural-cellular-automata/' className='a_button'><big>👨‍💻</big> NCA Github Repo</a>
                        <div style={{height:'1.5em'}}/>
                        <a href='https://github.com/mravelo5874/browser-nca/' className='a_button'><big>💻</big> Website Github Repo</a>

                        <div style={{height:'4em'}}/>
                    </div>
                    <button id='sidebar-right-button' className={'ui_button closed'} onClick={this.toggle_sidebar_right}><big>⚙️</big></button>
                </div> 
            </>
        )
    }
}