var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

var myapi = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    let { apiManager, tabManager } = context.extension;
    return {
      myapi: {

        enableKeyNavigation(tabId, value) {
          let tabmail = tabManager.get(tabId).tabmail;
          if (!tabmail) {
            throw new ExtensionError("Not a Tabmail Tab");
          }
          let folder = tabmail.ownerGlobal.document.getElementById("folderTree");
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
