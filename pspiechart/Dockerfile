FROM node:latest

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

COPY . /app
RUN yarn build

EXPOSE 4173
CMD ["yarn", "preview", "--host"]