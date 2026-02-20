# Quick Folder Key Navigation (QuickNav)

## Description

This is an extension (add-on) for Thunderbird that makes it possible to quickly jump
  to a desired folder in the folder tree. In Thunderbird version 102
 and earlier, one can quickly navigate the folder tree by typing
the first part or all of a folder name when the folder tree has the
focus.

Note that single-letter Thunderbird short-cuts (such as "n" and "p" which move to the next and previous unread messages respectively) do not work in the
folder pane when key navigation is enabled. Therefore, There is an option to turn key navigation on/off, as well as for adding this item to the context
menu when the folder pane has the focus.

The Thunderbird UI was completely redesigned in Thunderbird 115. As a
consequence, the mail folder tree is not  capable of responding to
key presses and QuickNav can no longer take advantage of this
functionality. Instead, QuickNav makes it possible to quickly
navigate to a particular folder in the folder pane  in Thunderbird
115.0 and later by clicking on the "QuickNav" button (or pressing
F4) and  typing the first few letters of the folder name into the
Search box that appears. If multiple folders start with the same
prefix, you can cycle through them using  the up and down arrow
keys. Click the "Go" button (or press ENTER) to jump to the selected
 folder or Esc to cancel the operation.

Using the Search method control, The way searching is carried out can be
 changed to "match anywhere" to allow searching for text that
appears anywhere in the folder name, instead of only at the
beginning of the folder name, which is what  the default "Match from
 start" method does.

In Thunderbird 121.0 and later, an additional "Go to new tab" button (or
  pressing CTRL+ENTER) allows the selected folder to be opened in a
new mail tab.

**Note for JAWS users:**
 if you have Forms Mode set to Manual, it is necessary to press
ENTER when the QuickNav dialog opens in order to type into the
search box. As this is extremely  inconvenient, it is recommended
that you uncheck  the 'Disable forms Mode when a  new page is
loaded' option in JAWS Settings Center. This will cause you to be
placed  into the edit field immediately when the QuickNav dialog
opens. Alternatively, this can also be achieved by setting Forms
Mode to anything other than Manual. The verbosity of  screen-reader
speech can be adjusted using the 'Screen-reader verbosity' combo box
 in the QuickNav dialog.

## Getting the Add-on

The easiest way to get Quick Folder Key Navigation is to search for it and install
it from the Add-ons Manager from within Thunderbird itself.

## Building From Source

If you want to build it and install it yourself, here's how to do it.

### Building the Add-on

In addition to a shell such as bash, the following standard Linux/Unix
utilities will be required in order to build the extension: make, cat,
grep, head, sed, zip.

Building the extension is straightforward. After cloning the repository
or downloading an archive of the repository and extracting it to a
directory, simply type `make` at the command prompt to build the .xpi
file.

In addition, `make version` will display the source code version and `make
clean` will clean up the repository folder structure, deleting the xpi file, as
well as files with names like *.bak, etc.

### Installing the add-on

Once you have the xpi file, it can be installed using the following procedure.

  1. Open Thunderbird.
  2. Click on the Tools menu and then click on Add-ons to open the Add-ons Manager. Alternatively, type Alt+t followed by a.
  3. Click on the "Tools for all add-ons" button, which appears as a cog wheel. It is just before the "Search all add-ons" edit field in the tab order.
  4. Click on the "Install Add-on from file" item in the pop-up menu that appears.
  5. An open file dialog wil appear. Use it to select the xpi file for the keynav add-on.
  6. Follow the instructions to complete the installation.

