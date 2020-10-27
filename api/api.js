/*
  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var FolderUIAPI = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      FolderUI: {

        async enableKeyNavigation(windowId, value) {
          let win = context.extension.windowManager.get(windowId, context).window;
        	if (!win) return;
       		let folder = win.document.getElementById("folderTree");
       		if (!folder) return;
       		console.debug("keynav.enableKeyNavigation: successfully set");
          if (value) {
            folder.removeAttribute("disableKeyNavigation");
          } else {
            folder.setAttribute("disableKeyNavigation", "true");
          }
        } // function

      } // FolderUI namespace
    } // return object holding experiment namespaces
  } // getAPI
}; // class
