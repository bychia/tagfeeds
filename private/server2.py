import json
import os

import datetime
import logging, logging.handlers
from flask import Flask, Response, request
# from flask_cors import CORS, cross_origin

import urllib #python2.7
import urlparse

LOG_FILENAME = 'access_logs.log'
STR_URL = 'https://newsapi.org/v1/articles?source=bbcnews&apiKey=48afb311aa54416dbb7190f4b88caa93'
# STR_PICSIZE ="&w=1500&h=1000&c=7&rs=2"

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


def formatData(item, newsSrc):
    news = {
        "title": item["title"],
        "link": item["url"],
        "description": item["description"],
        "pubDate": item["publishedAt"],
        "image": item["urlToImage"],
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
@app.route('/news', methods=['GET'])
def newsapi_handler():
    strJson = urllib.urlopen(STR_URL).read()
    data = json.loads(strJson)
    hasLoaded = data["status"]
    newsList = []

    if(hasLoaded):
        newsSource = data["source"].upper()
        items = data["articles"]
        itemsCount = len(items)

        if(itemsCount>0):
            for item in items:
                news = formatData(item, newsSource)
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
    app.run(host='0.0.0.0',port=int(os.environ.get("PORT", 3001)),threaded=True)
