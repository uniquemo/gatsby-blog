#!/bin/sh

echo "Start to deploy mo-gatsby-blog"

rm -rf ./.cache
rm -rf ./public
yarn build

cp ./public/** /usr/share/nginx/html/blog -r

echo "Successfully deploy mo-gatsby-blog"

