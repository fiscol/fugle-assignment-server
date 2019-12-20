FROM node:8

WORKDIR /fugle_assignment_server

ADD . /fugle_assignment_server
RUN npm install

EXPOSE 3000
CMD npm start