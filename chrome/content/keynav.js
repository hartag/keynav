"use strict"; // use strict mode

var keynav = {
  prefs : null,
  MailFolderKeyNavMenuItem : null,

  startup : function(e) {
  	var MailFolderKeyNav, GoMenuMailFolderKeyNavToggle;
    var keynavBundle = document.getElementById("keynav.keynav.strings"); // get the keynav stringbundle
  	// Get preference machinery for keynav
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.keynav.");
    // Add keynav prefs observer to keynav
    this.prefs.addObserver("", this, false);
    // Create the MailFolderKeynav menuitem
    const XULNS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"; // xml namespace
    this.MailfolderKeyNavMenuItem = document.createElementNS(XULNS, "menuitem");
    this.MailfolderKeyNavMenuItem.setAttribute("id", "appmenu_goMailFolderKeyNavMenuItem");
    this.MailfolderKeyNavMenuItem.setAttribute("label", 
      keynavBundle.getString("menu_EnableMailFolderKeyNav.label"));
    this.MailfolderKeyNavMenuItem.setAttribute("type", "checkbox");
    this.MailfolderKeyNavMenuItem.setAttribute("autocheck", "false");
    this.MailfolderKeyNavMenuItem.setAttribute("checked", "false");
    this.MailfolderKeyNavMenuItem.setAttribute("oncommand", "keynav.toggleMailFolderKeyNavOption()");
    // Get stored values of preferences
    MailFolderKeyNav = this.prefs.getBoolPref("MailFolderKeyNav");
    GoMenuMailFolderKeyNavToggle = this.prefs.getBoolPref("GoMenuMailFolderKeyNavToggle");
    // Add the MailFolderKeynav menuitem to the Go menu according to the GoMenuMailFolderKeyNavToggle option
    if (GoMenuMailFolderKeyNavToggle)
      document.getElementById("menu_GoPopup").appendChild(this.MailfolderKeyNavMenuItem);
    // Set the checked/unchecked state of the MailFolderKeynav Go menu item
    this.MailfolderKeyNavMenuItem.setAttribute("checked", MailFolderKeyNav.toString());
    // Set the key navigation state on the mail folder tree
    this.setMailFolderKeyNav(MailFolderKeyNav);
  },

  shutdown : function() {
  	// Remove the MailFolderKeyNav menu item from the Go menu if it is currently attached
    var val= this.prefs.getBoolPref("GoMenuMailFolderKeyNavToggle"); // get current preference value
    if (!val) {
      document.getElementById("menu_GoPopup").removeChild(this.MailfolderKeyNavMenuItem); // delete menu item from Go menu
    }
    this.MailFolderKeyNavMenuItem = null;
    // Remove the observer
    this.prefs.removeObserver("", this);
  },

  observe : function(subject, topic, data) {
  	var val;
  	// If the preference has not been changed, bail
    if (topic != "nsPref:changed") {return;}
    // Respond to change in preference
    switch (data) {
    	case "MailFolderKeyNav":
        val = this.prefs.getBoolPref("MailFolderKeyNav"); // get current preference value
        this.MailfolderKeyNavMenuItem.setAttribute("checked", val.toString());
        this.setMailFolderKeyNav(val);
    	  break;
    	case "GoMenuMailFolderKeyNavToggle":
        val= this.prefs.getBoolPref("GoMenuMailFolderKeyNavToggle"); // get current preference value
        if (val)
          document.getElementById("menu_GoPopup").appendChild(this.MailfolderKeyNavMenuItem); // add menu item to Go menu
        else
          document.getElementById("menu_GoPopup").removeChild(this.MailfolderKeyNavMenuItem); // delete menu item from Go menu
    	  break;
    }
  },

  setMailFolderKeyNav : function(val) {
    if (val) {
  	  document.getElementById("folderTree").removeAttribute("disableKeyNavigation"); // activate key navigation
	  } else {
  	  document.getElementById("folderTree").setAttribute("disableKeyNavigation", "true");  // deactivate key navigation
    }
  },

  toggleMailFolderKeyNavOption : function() {
    /* This function is called by the oncommand event when the user activates 
  	the MailFolderKeyNav menuitem on the Go menu.  It is not necessary to 
  	update the checked/unchecked state of the menuitem as this will be done 
  	by the observer. */
    var val = this.prefs.getBoolPref("MailFolderKeyNav"); // get current value of MailFolderKeyNav
    this.prefs.setBoolPref("MailFolderKeyNav", !val); // flip it and write it back to preferences
  }
}; // keynav


// Set up event listeners for starting and stopping the extension

window.addEventListener("load", 
  function(e) {
keynav.startup();
  })
  
  window.addEventListener("unload",
  function(e) {
keynav.shutdown();
  })

