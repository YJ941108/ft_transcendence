FROM node:16-alpine3.14

WORKDIR /usr/app

COPY	. .

RUN		npm install

RUN		npm run build

# TODO: Add API keys to the environment at BUILD time

CMD		[ "npm", "start" ]
