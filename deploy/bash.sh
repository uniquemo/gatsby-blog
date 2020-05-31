#!/bin/sh

echo "Start to deploy gatsby-blog"

rm -rf ./.cache
rm -rf ./public
yarn build

cp -r ./public/** /usr/share/nginx/html/blog

echo "Successfully deploy gatsby-blog"
