import json
import os

import datetime
import logging, logging.handlers
from flask import Flask, Response, request
# from flask_cors import CORS, cross_origin

from xml.dom import minidom
import urllib #python2.7
import urlparse

LOG_FILENAME = '/var/log/api.tagfeeds.com.log'
STR_URL = 'http://www.bing.com/news?format=RSS'
STR_PICSIZE ="&w=1500&h=1000&c=7&rs=2"
THUMBNAIL_PICSIZE = "&w=300&h=200&c=7&rs=2.jpg"

app = Flask(__name__)
# cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO) # use the native logger of flask
handler = logging.handlers.RotatingFileHandler(
    LOG_FILENAME,
    maxBytes=1024 * 1024 * 100,
    backupCount=14
    )
app.logger.addHandler(handler)


def parseUrl(url):
    parsed = urlparse.urlparse(url)
    try:
        parsedUrl = urlparse.parse_qs(parsed.query)['url']
        return parsedUrl[0]
    except:
        return url


def formatData(item):
    DEFAULT_IMAGEURL = "http://asset.tagfeeds.com/images/newsTfMed.png"
    imageUrl = "" if len(item.getElementsByTagName("News:Image"))==0 else item.getElementsByTagName("News:Image")[0].firstChild.nodeValue+STR_PICSIZE
    thumbnailUrl = DEFAULT_IMAGEURL if len(item.getElementsByTagName("News:Image"))==0 else item.getElementsByTagName("News:Image")[0].firstChild.nodeValue+THUMBNAIL_PICSIZE
    title = "" if len(item.getElementsByTagName("title"))==0 else item.getElementsByTagName("title")[0].firstChild.nodeValue
    link = "" if len(item.getElementsByTagName("link"))==0 else item.getElementsByTagName("link")[0].firstChild.nodeValue
    description = "" if len(item.getElementsByTagName("description"))==0 else item.getElementsByTagName("description")[0].firstChild.nodeValue
    pubDate = "" if len(item.getElementsByTagName("pubDate"))==0 else item.getElementsByTagName("pubDate")[0].firstChild.nodeValue
    newsSrc = "" if len(item.getElementsByTagName("News:Source"))==0 else item.getElementsByTagName("News:Source")[0].firstChild.nodeValue

    news = {   "title": title,
        "link": parseUrl(link),
        "description": description,
        "pubDate": pubDate,
        "image": imageUrl,
        "thumbnail": thumbnailUrl,
        "newsSrc": newsSrc
    }

    return news


@app.before_request
def preRequest_logging():
    if 'text/html' in request.headers['Accept']:
        app.logger.info('\t'.join([
            datetime.datetime.today().ctime(),
            request.remote_addr,
            request.method,
            request.url,
            request.data,
            ', '.join([': '.join(x) for x in request.headers])])
        )

#Endpoints
@app.route('/newsBing', methods=['GET'])
def newsBing_handler():
    strSearch = request.args.get('search');
    strURL = STR_URL if (strSearch==None) else STR_URL+"&q="+strSearch;
    strXml = urllib.urlopen(strURL).read()
    docXml = minidom.parseString(strXml)
    items = docXml.getElementsByTagName("item")
    itemsCount = len(items)
    newsList = []

    if(itemsCount>0):
        for item in items:
            news = formatData(item)
            newsList.append(news)

    return Response(
        json.dumps(newsList),
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )


if __name__ == '__main__':
    app.run(host='localhost',port=int(os.environ.get("PORT", 3001)),threaded=True)
