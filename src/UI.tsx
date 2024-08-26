import React, { useState } from 'react';
import { Sim } from './Sim';

export { UI }

interface UIInterface {
    sim: Sim
}

class UI extends React.Component<UIInterface, {}> {

    sidebar_open: boolean;

    // text nodes
    fps_node: Text | null = null;
    res_node: Text | null = null;

    constructor(props: UIInterface) {
        super(props)
        
        // start with sidebar open
        this.sidebar_open = true
        
        // set simulation ui
        this.props.sim.ui = this

        // bind 'this' for class functions
        this.toggle_sidebar = this.toggle_sidebar.bind(this);
        this.load_model = this.load_model.bind(this);

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
        // update text
        if (this.fps_node) this.fps_node.nodeValue = this.props.sim.fps.toFixed(0)
    }

    toggle_sidebar() {
        this.sidebar_open = !this.sidebar_open
        var sidebar = document.getElementById('sidebar') as HTMLDivElement
        sidebar.classList.toggle('closed')
        var panel = document.getElementById('sidebar_panel') as HTMLDivElement
        panel.classList.toggle('closed')
        var button = document.getElementById('sidebar_button') as HTMLButtonElement
        button.classList.toggle('closed')
        if (this.sidebar_open) {
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

    render() {
        return(
            <>
                <div id='sidebar'>
                    <div id='sidebar_panel'>
                        <h4 style={{fontSize:'1em'}}>res: <span id='res'/></h4>
                        <h4 style={{fontSize:'1em'}}>fps: <span id='fps'/></h4>

                        <hr/>

                        <div style={{paddingBottom:'0.5em', paddingRight:'0.5em'}}>
                            <h4 style={{paddingBottom:'0.5em'}}>model:</h4>
                            <select className='dropdown_input' name='load_model_dropdown' id='load_model_dropdown' onChange={this.load_model}>
                                <option className='dropdown_option' value='oak'>oak</option>
                                <option value='rubiks'>rubiks</option>
                                <option value='sphere'>sphere</option>
                            </select>
                        </div>
                    </div>

                    

                    <button id='sidebar_button' className='ui_button' onClick={this.toggle_sidebar}>close</button>
                </div> 

                
            </>
        )
    }
}