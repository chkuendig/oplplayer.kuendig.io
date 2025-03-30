#!/bin/bash

# exit when any command fails
set -e

mkdir -p "build"
esbuild src/app.js --bundle --minify --outfile=build/app.min.js --sourcemap 
esbuild --bundle src/app.css --outfile=build/app.min.css  --external:"*.woff"  --external:"*.ttf" 
cp RetroWave/build/RetroWave_Player.data build/
cp RetroWave/build/RetroWave_Player.wasm build/
cp src/RetroWave_Player.html build/index.html
cp "vendor/perfect_dos_vga_437/Perfect DOS VGA 437 Win.ttf" build/
cp favicon/* build/
