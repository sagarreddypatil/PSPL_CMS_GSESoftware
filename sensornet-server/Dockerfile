FROM node:18-alpine AS builder

WORKDIR /app
COPY . .

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
RUN npm ci

RUN npm run build && npm run build-server

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install 


COPY --from=builder /app/public ./public

EXPOSE 5000
EXPOSE 5001

CMD [ "node", "build/server/server.js" ]