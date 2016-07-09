var mailfolderkeynav = {
  prefs : null,
  keynav : "",
  gomenutoggle : "",

  startup : function(e) {
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch("extensions.mailfolderkeynav.");
    this.prefs.addObserver("", this, false);
    this.keynav = this.prefs.getBoolPref("MailFolderKeyNav");
    this.gomenutoggle = this.prefs.getBoolPref("GoMenuToggle");
    document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("checked", this.keynav.toString());
    this.toggleKeyNav();
  },

  shutdown : function() {
  	this.prefs.removeObserver("", this);
  },

  observe : function(subject, topic, data) {
    if (topic != "nsPref:changed") {return;}
    switch (data) {
    	case "MailFolderKeyNav":
        this.keynav = this.prefs.getBoolPref("MailFolderKeyNav");
        document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("checked", this.keynav.toString());
        this.toggleKeyNav();
    	  break;
    	case "GoMenuToggle":
        this.gomenutoggle = this.prefs.getBoolPref("GoMenuToggle");
        document.getElementById("appmenu_goMailFolderKeyNavMenuItem").setAttribute("disabled", this.gomenutoggle.toString());
    	  break;
    }
  },

  toggleKeyNav : function() {
//  	document.getElementById("folderTree").setAttribute("disableKeyNavigation", this.keynav); /* activate first-letter navigation */
    if (this.keynav) {
  	  document.getElementById("folderTree").removeAttribute("disableKeyNavigation"); /* activate first-letter navigation */
	  } else {
  	  document.getElementById("folderTree").setAttribute("disableKeyNavigation", "true");  /* deactivate first-letter navigation */
    }
  },

  updateKeyNavOption : function() {
  	var state = document.getElementById("appmenu_goMailFolderKeyNavMenuItem").getAttribute("checked") === "true";
  	this.prefs.setBoolPref("MailFolderKeyNav", state);
  }
}; // mailfolderkeynav


window.addEventListener("load",
  function(e) {
mailfolderkeynav.startup();
  })
  
  window.addEventListener("unload",
  function(e) {
mailfolderkeynav.shutdown();
  })

