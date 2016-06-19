import json
import os

import datetime
import logging, logging.handlers
from flask import Flask, Response, request
from flask_cors import CORS, cross_origin

from xml.dom import minidom
#import urllib.request as request #python3
import urllib #python2.7


LOG_FILENAME = 'access_logs.log'
STR_URL = 'http://www.bing.com/news?q=&format=RSS'
STR_PICSIZE ="&w=1500&h=1000&c=7&rs=2"

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.logger.setLevel(logging.INFO) # use the native logger of flask
handler = logging.handlers.RotatingFileHandler(
    LOG_FILENAME,
    maxBytes=1024 * 1024 * 100,
    backupCount=14
    )
app.logger.addHandler(handler)

@app.before_request
def preRequest_logging():
    #Logging statement
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
    #strXml = request.urlopen(STR_URL).read()
    strXml = urllib.urlopen(STR_URL).read()
    docXml = minidom.parseString(strXml)
    items = docXml.getElementsByTagName("item")
    itemsCount = len(items)

    newsList = []

    if(itemsCount>0):
        for item in items:
            news = {"title": item.getElementsByTagName("title")[0].firstChild.nodeValue,
            "link": item.getElementsByTagName("link")[0].firstChild.nodeValue,
            "description": item.getElementsByTagName("description")[0].firstChild.nodeValue,
            "pubDate": item.getElementsByTagName("pubDate")[0].firstChild.nodeValue,
            "image": item.getElementsByTagName("News:Image")[0].firstChild.nodeValue+STR_PICSIZE,
            "newsSrc": item.getElementsByTagName("News:Source")[0].firstChild.nodeValue
            }
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
    app.run(host='0.0.0.0',port=int(os.environ.get("PORT", 3000)),threaded=True)
