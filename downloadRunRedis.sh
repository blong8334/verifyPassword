#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
DIRECTORY=redis-4.0.10
FILE=$DIRECTORY.tar.gz

cd $DIR
if [ ! -d "$DIRECTORY" ]; then
    curl -o $FILE http://download.redis.io/releases/$FILE
    tar xzf $downloadName
    cd $DIRECTORY
    make
else
    cd $DIRECTORY
fi
src/redis-server