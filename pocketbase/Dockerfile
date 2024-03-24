# from https://pocketbase.io/docs/going-to-production/

FROM alpine:latest

ARG PB_VERSION=0.18.6
ARG ARCH

RUN apk add --no-cache \
    unzip \
    ca-certificates

# determine the architecture and store in $ARCH
# download and unzip PocketBase
RUN case $(uname -m) in x86_64) ARCH=amd64;; aarch64) ARCH=arm64;; *) ARCH=$(uname -m);; esac \
    && wget -O /tmp/pb.zip https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip

# ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${ARCH}.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# uncomment to copy the local pb_migrations dir into the image
# COPY ./pb_migrations /pb/pb_migrations

# uncomment to copy the local pb_hooks dir into the image
# COPY ./pb_hooks /pb/pb_hooks

EXPOSE 8093

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8093"]