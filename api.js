var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

var myapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      myapi: {

        async enableKeyNavigation(value) {
        	let win = null;
        	let folder = null;
        	let tries = 10;
        	const ms = 200;
        	while (!folder && tries>0) {
        		win = Services.wm.getMostRecentWindow("mail:3pane");
        		if (!win) break;
        		folder = win.document.getElementById("folderTree");
        		if (!folder) {
        			tries -= 1;
        		  await new Promise(resolve => win.setTimeout(resolve, 1000));
        		}
        	}
        	if (!win) {
        	  throw new ExtensionError("Unable to get mail:3pane window");
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
