FROM node:slim as build

COPY package.json yarn.lock /app/
WORKDIR /app
RUN yarn install --frozen-lockfile

COPY . /app
RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]