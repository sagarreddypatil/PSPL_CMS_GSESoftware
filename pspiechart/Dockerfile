FROM node:latest

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

ARG VITE_SENSORNET_SERVER
ENV VITE_SENSORNET_SERVER=$VITE_SENSORNET_SERVER

ARG VITE_CMDNET_SERVER
ENV VITE_CMDNET_SERVER=$VITE_CMDNET_SERVER

COPY . /app
RUN yarn build

EXPOSE 4173
CMD ["yarn", "preview", "--host"]