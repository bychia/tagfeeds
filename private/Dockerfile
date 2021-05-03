FROM python:2.7.18-alpine3.11

WORKDIR /usr/src/server

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

EXPOSE 8080
CMD [ "python", "server.py"]