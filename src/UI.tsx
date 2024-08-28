import React, { useState } from 'react';
import { Sim } from './Sim';

export { UI }

interface UIInterface {
    sim: Sim
}

class UI extends React.Component<UIInterface, {}> {

    sidebar_left_open: boolean
    sidebar_right_open: boolean

    // text nodes
    fps_node: Text | null = null
    res_node: Text | null = null
    step_node: Text | null = null

    constructor(props: UIInterface) {
        super(props)
        
        // start with sidebar open
        this.sidebar_left_open = true
        this.sidebar_right_open = false
        
        // set simulation ui
        this.props.sim.ui = this

        // bind 'this' for class functions
        this.toggle_sidebar_left = this.toggle_sidebar_left.bind(this)
        this.toggle_sidebar_right = this.toggle_sidebar_right.bind(this)
        this.load_model = this.load_model.bind(this)
        this.change_plane_color = this.change_plane_color.bind(this)

        // set right-sidebar to be closed by default


        console.log('ui constructed...')
    }

    update_res_node(_width: number, _height: number) {
        // find resolution text node
        if (!this.res_node) {
            let res_element = document.querySelector("#res")
            this.res_node = document.createTextNode('')
            res_element?.appendChild(this.res_node)
            this.res_node.nodeValue = ''
        }
        // update text
        if (this.res_node) this.res_node.nodeValue = _width.toFixed(0) + ' x ' + _height.toFixed(0)
    }

    update() {
        // find fps text node
        if (!this.fps_node) {
            let fps_element = document.querySelector("#fps")
            this.fps_node = document.createTextNode('')
            fps_element?.appendChild(this.fps_node)
            this.fps_node.nodeValue = ''
        }
        else {
            this.fps_node.nodeValue = this.props.sim.fps.toFixed(0)
        }

        // find step text node
        if (!this.step_node) {
            let step_element = document.querySelector("#step")
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
        if (this.sidebar_left_open) {
            button.innerHTML = 'close'
        }
        else {
            button.innerHTML = 'open'
        }
    }

    toggle_sidebar_right() {
        this.sidebar_right_open = !this.sidebar_right_open
        var sidebar = document.getElementById('sidebar-right') as HTMLDivElement
        sidebar.classList.toggle('closed')
        var panel = document.getElementById('sidebar-right-panel') as HTMLDivElement
        panel.classList.toggle('closed')
        var button = document.getElementById('sidebar-right-button') as HTMLButtonElement
        button.classList.toggle('closed')
        if (this.sidebar_right_open) {
            button.innerHTML = 'close'
        }
        else {
            button.innerHTML = 'open'
        }
    }

    load_model() {
        let menu = document.getElementById('load_model_dropdown') as HTMLSelectElement
        const value = menu.value
        let sim = this.props.sim
        sim.load_model(value)
    }

    change_plane_color() {

    }

    render() {
        return(
            <>
                <div id='sidebar-left'>
                    <div id='sidebar-left-panel'>
                        <h4 style={{fontSize:'1em'}}>This is the left sidebar.</h4>

                        <hr/>

                        <h4 style={{fontSize:'1em'}}>res: <span id='res'/></h4>
                        <h4 style={{fontSize:'1em'}}>fps: <span id='fps'/></h4>
                        <h4 style={{fontSize:'1em'}}>step: <span id='step'/></h4>

                        <hr/>

                        <div style={{paddingBottom:'0.5em', paddingRight:'0.5em'}}>
                            <h4 style={{paddingBottom:'0.5em'}}>select model:</h4>
                            <select className='dropdown_input' name='load_model_dropdown' id='load_model_dropdown' onChange={this.load_model}>
                                <option className='dropdown_option' value='sphere'>🔵 sphere</option>
                                <option value='oak'>🌳 oak</option>
                                <option value='rubiks'>🧊 rubiks</option>
                                <option value='burger'>🍔 burger</option>
                                <option value='cowboy'>🤠 cowboy</option>
                                <option value='earth'>🌍 earth</option>
                            </select>
                        </div>

                        <hr/>

                        <input type="color" id="head" name="head" value="#e66465" onChange={this.change_plane_color}/>
                    </div>

                    <button id='sidebar-left-button' className='ui_button' onClick={this.toggle_sidebar_left}>close</button>
                </div> 

                <div id='sidebar-right' className='closed'>
                    <div id='sidebar-right-panel' className='closed'>
                        <h4 style={{fontSize:'1em'}}>This is the right sidebar.</h4>

                        <hr/>
                    </div>
                    <button id='sidebar-right-button' className={'ui_button closed'} onClick={this.toggle_sidebar_right}>open</button>
                </div> 
            </>
        )
    }
}