FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

# Bundle app source
COPY . .
RUN rm -f public/scripts/main.js
RUN rm -f public/scripts/main.babel.js
RUN rm -f public/scripts/utils.js

EXPOSE 8080
CMD ["node", "app.js"]