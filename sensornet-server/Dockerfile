FROM node:lts

RUN wget https://dl.influxdata.com/influxdb/releases/influxdb2-client-2.7.3-linux-amd64.tar.gz
RUN tar xvzf influxdb2-client-2.7.3-linux-amd64.tar.gz
RUN cp influx /usr/local/bin/

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

COPY . /app
RUN yarn build

EXPOSE 8080
EXPOSE 5001/udp

CMD ["yarn", "start"]