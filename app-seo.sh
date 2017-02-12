#!/bin/bash
cd /home/ec2-user/tagfeeds.com
phantomjs --disk-cache=yes --max-disk-cache-size=100000 app-seo.js 3030 http://127.0.0.1:3000
