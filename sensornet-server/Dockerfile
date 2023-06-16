FROM node:latest

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

COPY . /app
RUN yarn build

EXPOSE 8080
EXPOSE 5001/udp

CMD ["yarn", "start"]