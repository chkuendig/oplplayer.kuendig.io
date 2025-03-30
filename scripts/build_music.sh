#!/bin/bash

# exit when any command fails
set -e
ROOT_FOLDER=$(pwd)

# https://vgmrips.net/packs/pack/sound-blaster-series-demo-songs-ibm-pc-xt-at
mkdir -p  "$ROOT_FOLDER/music"
wget -nc "https://vgmrips.net/files/Computers/IBM_PC/Sound_Blaster_Series_Demo_Songs_%28IBM_PC_XT_AT%29.zip" -P "$ROOT_FOLDER/vendor/"
unzip -n "$ROOT_FOLDER/vendor/Sound_Blaster_Series_Demo_Songs_(IBM_PC_XT_AT).zip" -d "$ROOT_FOLDER/music"
