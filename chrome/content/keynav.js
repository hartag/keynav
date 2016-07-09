var keynav = {
  prefs : null,

  startup : function(e) {
  	// Get preference machinery for keynav
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.keynav.");
    // Add keynav prefs observer to keynav
    this.prefs.addObserver("", this, false);
    // Get stored values of preferences
    var MailFolderKeyNav = this.prefs.getBoolPref("MailFolderKeyNav");
//    var GoMenuMailFolderKeyNavToggle = this.prefs.getBoolPref("GoMenuMailFolderKeyNavToggle");
    // Set the checked/unchecked state of the MailFolderKeynav Go menu item
    document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("checked", MailFolderKeyNav.toString());
    // Set the key navigation state on the mail folder tree
    this.setMailFolderKeyNav(MailFolderKeyNav);
  },

  shutdown : function() {
    this.prefs.removeObserver("", this); // remove the observer
  },

  observe : function(subject, topic, data) {
  	// If the preference has not been changed, bail
    if (topic != "nsPref:changed") {return;}
    // Respond to change in preference
    switch (data) {
    	case "MailFolderKeyNav":
        var val = this.prefs.getBoolPref("MailFolderKeyNav"); // get current preference value
        document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("checked", val.toString());
        this.setMailFolderKeyNav(val);
    	  break;
    	case "GoMenuMalFolderKeyNavToggle":
        var val= this.prefs.getBoolPref("GoMenuMailFolderKeyNavToggle"); // get current preference value
        document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("hidden", (!val).toString()); // hide/show menu item
    	  break;
    }
  },

  setMailFolderKeyNav : function(val) {
    if (val) {
  	  document.getElementById("folderTree").removeAttribute("disableKeyNavigation"); // activate first-letter navigation
	  } else {
  	  document.getElementById("folderTree").setAttribute("disableKeyNavigation", "true");  // deactivate first-letter navigation
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
}; // mailfolderkeynav


// Set up event listeners for starting and stopping the extension

window.addEventListener("load",
  function(e) {
keynav.startup();
  })
  
  window.addEventListener("unload",
  function(e) {
keynav.shutdown();
  })

