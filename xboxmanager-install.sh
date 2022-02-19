#!/bin/bash
#
# Cockpit package to manager XBOX games
#

set -u

[ ! $UID -eq 0 ] && echo "This needs to be run as root" && exit 1

APP=xboxmanager
DATADIR=/opt/${APP}
SCRIPTDIR=${DATADIR}/${SCRIPTS}
COCKPIT=/usr/share/cockpit

apt-get update
apt-get install -y curlftpfs

[ ! -d $COCKPIT ] && echo "Cockpit doesn't seem to be installed in $COCKPIT" && exit 1

cd $COCKPIT
git clone https://github.com/sairuk/cockpit-xboxmanager.git ${APP}

if [ $? -eq 0 ]
then

    mkdir ${DATADIR}
    chmod 755 ${DATADIR}

    cp ${COCKPIT}/${APP}/dist/xboxmanager.cfg ${DATADIR}
    cp ${COCKPIT}/${APP}/dist/xboxmanager.sh ${DATADIR}/${SCRIPTDIR}

    chmod 755 ${SCRIPTDIR}/xboxmanager.sh
    chmod 666 ${DATADIR}/xboxmanager.cfg

fi
