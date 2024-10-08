#!/bin/bash
#
# Cockpit package to manager XBOX games
#

set -u

[ ! $UID -eq 0 ] && echo "This needs to be run as root" && exit 1

APP=xboxmanager
DATADIR=/opt/${APP}
SCRIPTDIR=${DATADIR}/scripts
COCKPIT=/usr/share/cockpit

apt-get update &>/dev/null
apt-get install -y curlftpfs &>/dev/null

[ ! -d $COCKPIT ] && echo "Cockpit doesn't seem to be installed in $COCKPIT" && exit 1

cd /opt
if [ ! -f "${DATADIR}/.git/config" ]
then
    git clone https://github.com/sairuk/cockpit-xboxmanager.git ${APP}
else
    cd ${DATADIR}
    git pull
fi

#[ ! -d ${SCRIPTDIR} ] && mkdir -p ${SCRIPTDIR}
find ${DATADIR} -type d -exec chmod 755 {} \;

[ ! -d ${COCKPIT}/${APP} ] && mkdir ${COCKPIT}/${APP}

cp dist/* ${COCKPIT}/${APP}/
cp -R assets ${COCKPIT}/${APP}/

if [ ! -f "${DATADIR}/xboxmanager.cfg" ]
then
    cp ${DATADIR}/xboxmanager.cfg.example "${DATADIR}/xboxmanager.cfg"
    chmod 666 "${DATADIR}/xboxmanager.cfg"
fi

chmod 755 ${SCRIPTDIR}/xboxmanager.sh
