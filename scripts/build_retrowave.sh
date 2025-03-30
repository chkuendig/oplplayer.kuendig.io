#!/bin/bash
# https://web.dev/articles/emscripten-npm

# exit when any command fails
set -e
ROOT_FOLDER=$(pwd)

EMSDK_VERSION="3.1.51"
EMSCRIPTEN_VERSION="$EMSDK_VERSION"

#################################
# Setup Toolchain
#################################

# Activate Emscripten
if [[ ! -d "$ROOT_FOLDER/emsdk-$EMSDK_VERSION" ]]; then
  echo "$ROOT_FOLDER/emsdk-$EMSDK_VERSION not found. Installing Emscripten"
  cd "$ROOT_FOLDER"
  if [[ "$EMSDK_VERSION" = "tot" ]]; then
    git clone "https://github.com/emscripten-core/emsdk/" emsdk-tot
  else
    wget -nc --content-disposition --no-check-certificate "https://github.com/emscripten-core/emsdk/archive/refs/tags/${EMSDK_VERSION}.tar.gz"
    tar -xf "emsdk-${EMSDK_VERSION}.tar.gz"
  fi

fi

cd "$ROOT_FOLDER/emsdk-${EMSDK_VERSION}"
ret=0 # https://stackoverflow.com/questions/18621990/bash-get-exit-status-of-command-when-set-e-is-active
./emsdk activate ${EMSCRIPTEN_VERSION} || ret=$?
if [[ $ret != 0 ]]; then
  echo "install missing emscripten version"
  cd "$ROOT_FOLDER/emsdk-${EMSDK_VERSION}"
  ./emsdk install ${EMSCRIPTEN_VERSION}

  cd "$ROOT_FOLDER/emsdk-${EMSDK_VERSION}"
  ./emsdk activate ${EMSCRIPTEN_VERSION}


fi

source "$ROOT_FOLDER/emsdk-$EMSDK_VERSION/emsdk_env.sh"
cd "$ROOT_FOLDER/RetroWave"
mkdir -p "build"
cd "$ROOT_FOLDER/RetroWave/build"

LDFLAGS="-g -sASSERTIONS=2" # build with assertions 
LDFLAGS="${LDFLAGS} -sMODULARIZE=1 -sEXPORTED_FUNCTIONS=['_raise','_main']" # build with modularize
LDFLAGS="${LDFLAGS} -sINVOKE_RUN=0 -sEXPORTED_RUNTIME_METHODS=['FS','callMain','PTY']" # to manually start the main function
LDFLAGS="${LDFLAGS} --preload-file ../../music/" # preload music folder 
LDFLAGS="${LDFLAGS} --js-library ../../node_modules/xterm-pty/emscripten-pty.js" # build with xterm-pty 
CXXFLAGS="-g"
echo ${LDFLAGS}
LDFLAGS="${LDFLAGS}" CXXFLAGS="${CXXFLAGS}" emcmake cmake ../
LDFLAGS="${LDFLAGS}" CXXFLAGS="${CXXFLAGS}" emmake make

