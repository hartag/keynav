#Quick Folder Key Navigation (keynav)

##Description

This is an add-on for Thunderbird that allows the folder tree to be 
quickly navigated by typing part or all of a folder name when the 
folder tree has the focus.

##Getting the Add-on

The easiest way to get Quick Folder Key Navigation is to search for it and install 
it from the Add-ons Manager from within Thunderbird itself.

##Building From Source

If you want to build it and install it yourself, here's how to do it.

###Building the Add-on

In addition to a shell such as bash, the following standard Linux/Unix  
utilities will be required in order to build the extension: make, cat, 
grep, head, sed, zip.

Building the extension is straightforward. After cloning the repository
or downloading an archive of the repository and extracting it to a
directory, simply type "make" at the command prompt to build the .xpi 
file.

In addition, "make version" will display the source code version and "make 
clean" will clean up the repository folder structure, deleting the xpi file, as 
well as files with names like *.bak, etc.

###Installing the add-on

Once you have the xpi file, it can be installed using the following procedure.

  1. Open Thunderbird.
  2. Click on the Tools menu and then click on Add-ons to open the Add-ons Manager. Alternatively, type Alt+t followed by a.
  3. Click on the "Tools for all add-ons" button, which appears as a cog wheel. It is just before the "Search all add-ons" edit field in the tab order.
  4. Click on the "Install Add-on from file" item in the pop-up menu that appears.
  5. An open file dialog wil appear. Use it to select the xpi file for the keynav add-on.
  6. Follow the instructions to complete the installation. You may be asked to restart Thunderbird.
  