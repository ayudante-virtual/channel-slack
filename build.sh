#!/bin/bash

CURRENT_DIR=$(pwd)
MODULE_NAME="channel-slack-av"

# Submodulos.
printf "Clonando submodulos... "
git submodule update --init --remote || exit
printf "OK\n"

# Link dentro de botpress.
if [ ! -L "botpress/modules/$MODULE_NAME" ]; then
  printf "Creating module symlink... "
  cd botpress/modules && ln -s ../../module "$MODULE_NAME"
  cd "$CURRENT_DIR" || exit
  printf "OK\n"
else
  printf "Symlink already exists... OK\n"
fi

# Construir botpress.
printf "Building botpress... "
cd botpress && yarn && yarn build || exit
cd "$CURRENT_DIR" || exit
printf "OK\n"
