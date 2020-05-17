var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var myapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      myapi: {

        async enableKeyNavigation(value) {
        	let tries = 25; // number of times to try getting the folder payne
        	const ms = 200; // timer delay in milliseconds between tries
        	let win = null; // for holding the mail:3pane window
        	let folder = null; // for holding the folder pane
        	while (!folder && tries>0) {
        		win = Services.wm.getMostRecentWindow("mail:3pane");
        	  if (!win) {
        	    throw new ExtensionError("Unable to get mail:3pane window");
        	  }
       		  folder = win.document.getElementById("folderTree");
        		if (!folder) {
        			tries -= 1;
        		  await new Promise(resolve => win.setTimeout(resolve, ms));
        	  }
        	}
        	if (!folder) {
        	  throw new ExtensionError("Unable to get folderTree element");
        	}
          if (value) {
            folder.removeAttribute("disableKeyNavigation");
          } else {
            folder.setAttribute("disableKeyNavigation", "true");
          }
        }
      }
    }
  }
};
