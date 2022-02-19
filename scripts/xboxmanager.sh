#!/bin/bash
#
# Manage games over FTP
# 
# we will extract the curftpfs op to its own library and import it
#
# in backup mode XISO with be a directory
# in install mode XISO is an iso
#

#set -u

IFS=$'\n'

function _log {
  echo "$1"
}

function _usage {
cat << EOF
usage $0
 -h this help message
 -u xbox user
 -p xbox password
 -i xbox ip address
 -f ftp directory (default E:)
 -t type (programs|games|emulators)
 -l local mount dir
 -a local iso archive dir 
 -x iso file to process
 -m mode of operation (un)install|list-(available|installed)|(u)mount|status
EOF
exit
}

### CONVERT these to getopts
X_USER=xbox
X_PASS=xbox
X_IPADD=192.168.0.200
DIR_FTP=E
DIR_TYPE=games
DIR_MOUNT=$HOME/utils/consoles/xbox
DIR_ARCHIVE=/data/retronas/xbox/games
DIR_TMP=/tmp/rnxtp
XISO=""
MODE="list-available"

OPTSTRING="hu:p:i:f:t:l:x:m:a:"

while getopts $OPTSTRING ARG
do
  case $ARG in
    h)
      _usage
      ;;
    u)
      X_USER=${OPTARG}
      ;;
    p)
      X_PASS=${OPTARG}
      ;;
    i)
      X_IPADD=${OPTARG}
      ;;
    f)
      DIR_FTP=${OPTARG}
      ;;
    t)
      DIR_TYPE=${OPTARG}
      ;;
    l)
      DIR_MOUNT=${OPTARG}
      ;;
    x)
      XISO="${OPTARG}"
      ;;
    m)
      MODE=${OPTARG}
      ;;
    a)
      DIR_ARCHIVE=${OPTARG}
      ;;
    *)
      _usage
      ;;
  esac
done

CURLFTPFS=$(which curlftpfs)
EXTRACTXISO=$(which extract-xiso)
CURLFTPFS_OPT=auto_unmount

REQFAIL=0
[ -z $CURLFTPFS ] && echo "Couldn't find curlftpfs, can't help you bro" && REQFAIL=1
[ ! -x $CURLFTPFS ] && echo "Couldn't find curlftpfs, can't help you bro" && REQFAIL=1
[ -z $EXTRACTXISO ] && echo "Couldn't find extract-xiso, can't help you bro" && REQFAIL=1
[ ! -x $EXTRACTXISO ] && echo "Couldn't find extract-xiso, can't help you bro" && REQFAIL=1
[ $REQFAIL -ne 0 ] && exit $REQFAIL

# get folder name from iso
DIR_NAME=$(echo "${XISO}" | sed -r 's/(.*)\.(.+)$/\1/')
DIR_TMPA="${DIR_TMP}/${DIR_NAME}"

# make out dirs
[ ! -d "${DIR_TMP}" ] && mkdir -p "${DIR_TMP}/${DIR_NAME}"
[ ! -d "${DIR_MOUNT}" ] && mkdir -p "${DIR_MOUNT}"

# curlftpfs has issues with double fslash // so replace em with a single
INSTALL_PATH=$( echo "${DIR_MOUNT}/${DIR_FTP}/${DIR_TYPE}" | sed 's/\/\//\//g')


function list_available {
  local DIR=$1
  ls -la "${DIR}" 2>/dev/null | awk '/^-/{print substr($0,index($0,$9))}'
}

function list_installed {
  local DIR=$1
  ls -la "${DIR}" 2>/dev/null  | awk '/^d/{print substr($0,index($0,$9))}'
}

function mount_ftp {
  # mount the ftp locally if its not mounted already
  if [ ! -d "${DIR_MOUNT}/${DIR_FTP}" ]
  then
    $CURLFTPFS -o ${CURLFTPFS_OPT} "${X_USER}:${X_PASS}@${X_IPADD}" "${DIR_MOUNT}"
    [ $? -ne 0 ] && echo "Mount operation appears to have failed, couldn't find ${DIR_FTP}" && exit 1
  fi
}

function unmount_ftp {
  # kill the ftp, we could probably target this better
  local PID=$(pidof $CURLFTPFS)
  [ ! -z "${PID}" ] && kill $PID
}

function repack_iso {
  local BACKUP_PATH="${1}"
  _log "REPACK"
  OUTPUT_FILE="${DIR_ARCHIVE}/${XISO}.iso"
  if [ ! -f "${OUTPUT_FILE}" ]
  then
    mount_ftp
    ${EXTRACTXISO} -Q -c "${BACKUP_PATH}" "${DIR_ARCHIVE}/${XISO}.iso"
    unmount_ftp
  else
    _log "File exists, will not overwrite, remove it first"
  fi
}

# basic status check for xbox availablity
function check_status {
  local IP_ADDR="${1}"
  ping -c 1 -q -n -W 1 $IP_ADDR &>/dev/null
  if [ $? -eq 0 ]
  then
    mount_ftp
    exit 0
  else
    unmount_ftp
    exit 1
  fi
}


case $MODE in
  install)
    _log "install"
    #mount_ftp
    [ ! -f "${DIR_ARCHIVE}/${XISO}" ] && echo "Couldn't locate iso file to install" && exit 1
    ${EXTRACTXISO} "${DIR_ARCHIVE}/${XISO}" -s -Q -d "${DIR_TMP}/${DIR_NAME}"
    if [ $? -eq 0 ]
    then
      [ ! -d "${INSTALL_PATH}" ] && mkdir -p "${INSTALL_PATH}"
      cp -R "${DIR_TMPA}" "${INSTALL_PATH}" 2>/dev/null
      [ -d "${DIR_TMPA}" ] && rm -R "${DIR_TMPA}"
    fi
    #unmount_ftp
    ;;
  uninstall)
    _log "uninstall"
    #mount_ftp
    [ -d "${INSTALL_PATH}/${DIR_NAME}" ] && rm -R "${INSTALL_PATH}/${DIR_NAME}"
    #unmount_ftp
    ;;
  list-available)
    #echo "list-available"
    list_available "${DIR_ARCHIVE}"
    ;;
  list-installed)
    #echo "list-installed"
    #mount_ftp
    list_installed "${DIR_MOUNT}/${DIR_FTP}/${DIR_TYPE}"
    #unmount_ftp
    ;;
  mount)
    mount_ftp
    ;;
  umount)
    unmount_ftp
    ;;
  backup)
    repack_iso "${INSTALL_PATH}/${DIR_NAME}"
    ;;
  status)
    check_status "${X_IPADD}"
    ;;
esac

