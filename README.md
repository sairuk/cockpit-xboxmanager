# Cockpit XBOX ISO Manager
Manage XBOX games through a Cockpit interface

This is a highly EXPERIMENTAL alpha version which is intended as a tech preview for what should become a generalised ftp management solution for retro hardware through a webui.

## Installation

```
# apt install -y curl
# curl -O https://raw.githubusercontent.com/sairuk/cockpit-xboxmanager/main/xboxmanager-install.sh
# chmod a+x ./xboxmanager-install.sh
# ./xboxmanager-install.sh
```

Login into Cockpit and look in the menu on the left.

### Basic functionality supported
- install games
- backup games
- uninstall games

leverages extract-xiso and curlftpfs programs

### Requirements:
- extract-xiso
- curlftpfs
- cockpit

## Security
Passwords for the xbox ftp are stored in plain text, world readable, since these are generally xbox/xbox I don't see an issue.

The Cockpit project by its very nature is intended for Systems Administation, it should not be exposed to the public internet


## RetroNAS
You will also be able to install this interface through [RetroNAS](https://github.com/danmons/retronas/ "RetroNAS") once added, since RetroNAS was the driving force behind this solution.


## Credits
- logo was from some post on reddit
- loading bar was results in google image search

if its yours and you're not happy, raise an issue and ask for it be removed from the project