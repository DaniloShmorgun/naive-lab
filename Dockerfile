FROM node:18

WORKDIR /app

COPY naivecoin/package*.json ./

RUN npm install

COPY naivecoin .

EXPOSE 3001

ENV NODE_OPTIONS=--openssl-legacy-provider

CMD [ "npm", "start" ]
