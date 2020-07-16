#!/usr/bin/env bash

IDENTIFIER=$1

sed -e "s:__IDENTIFIER__:${IDENTIFIER}:g" script/template/documentation.html > docs/${IDENTIFIER}.html
