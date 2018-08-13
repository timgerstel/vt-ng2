

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import 'script-loader!./../lib/js/vt.js';
import { Subject } from 'rxjs/Subject';

declare var startVT: any;

import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptionsArgs} from '@angular/http';
import {Observable} from 'rxjs/Rx';

export class Terminal {
  virtualScreen: any;
  contextMenuEmitter: Subject<any>;
  constructor(
    private terminalElement: HTMLElement,
    private terminalParentElement: HTMLElement,
    public http: Http,
    public pluginDefinition: ZLUX.ContainerPluginDefinition,
    private log: ZLUX.ComponentLogger
  ) {
    this.contextMenuEmitter = new Subject();
  }

  connectToHost(rendererSettings: any, connectionSettings: any) {
    const computedStyle = getComputedStyle(this.terminalElement, null);
    const width = parseInt(computedStyle.getPropertyValue('width'));
    const height = parseInt(computedStyle.getPropertyValue('height'));
    let plugin:ZLUX.Plugin = this.pluginDefinition.getBasePlugin();
    const myHost = window.location.host;
    const protocol = window.location.protocol;
    const wsProtocol = (protocol === 'https:') ? 'wss:' : 'ws:';
    let computedURL:string = `${wsProtocol}//${myHost}/ZLUX/plugins/com.rs.terminalproxy/services/vtdata`;    
    //let computedURL:string = RocketMVD.uriBroker.pluginWSUri(plugin,'data','');
    connectionSettings.url = computedURL;
    connectionSettings.connect = true;
    connectionSettings.screenWidth = "MAX";
    connectionSettings.screenHeight = "MAX";
    this.virtualScreen = startVT({parentDiv:this.terminalElement,
                                  width: width, height: height},
                                 connectionSettings,
                                 rendererSettings,
                                 null);
   // logic for using dispatcher goes here
   // should be in vtService.js eventually
   this.virtualScreen.contextCallback = (mouseEvent, screenContext) => {
      var x = mouseEvent.offsetX;
      var y = mouseEvent.offsetY;
      mouseEvent.preventDefault();
      this.log.debug("JOE Context callback. screenID="+screenContext.screenID+" x="+x+" y="+y);
      this.log.debug("screenContext=" + JSON.stringify(screenContext, null, 2));
      this.contextMenuEmitter.next({ x: x, y: y, screenContext: screenContext});
   }
  }

  isConnected(): boolean {
    return this.virtualScreen && this.virtualScreen.isConnected();
  }

  
  close() {
    if (this.virtualScreen) {
      this.virtualScreen.closeConnection(4000, "Closed by user");
    }
    this.virtualScreen = null;
  }

  performResize() {
    this.virtualScreen.handleContainerResizeFromUI(this.terminalElement, this.virtualScreen);
  }
}



/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
