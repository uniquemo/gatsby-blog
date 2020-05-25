#!/bin/sh

echo "Start to deploy gatsby-blog"

rm -rf ./.cache
rm -rf ./public
yarn build

scp -r ./public/** root@47.115.57.59:/usr/share/nginx/html/blog

echo "Successfully deploy gatsby-blog"
