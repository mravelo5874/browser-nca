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
        var sidebar_button = document.getElementById('sidebar_button') as HTMLButtonElement
        if (this.sidebar_open) {
            sidebar.style.cssText='scale:100%;'
            sidebar_button.style.cssText='background-color:white;color:rgba(0, 0, 0, 0.85);border-color:black;border: solid 2px black'
            sidebar_button.innerHTML = 'close'
        }
        else {
            sidebar.style.cssText='scale:0%;'
            sidebar_button.style.cssText='left:0em;'
            sidebar_button.innerHTML = 'open'
        }
    }

    render() {
        return(
            <>
                <div id='sidebar'>
                    <h4 style={{fontSize:'1em'}}>res: <span id='res'/></h4>
                    <h4 style={{fontSize:'1em'}}>fps: <span id='fps'/></h4>
                </div> 

                <div>
                    <button id='sidebar_button' className='ui_button' style={{
                        backgroundColor:'white', 
                        color:'rgba(0, 0, 0, 0.85)', 
                        border:'solid 2px black'}} onClick={this.toggle_sidebar}>close</button>
                </div>
            </>
        )
    }
}