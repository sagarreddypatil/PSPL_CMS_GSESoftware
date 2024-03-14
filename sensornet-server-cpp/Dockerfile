FROM ubuntu:latest as build

# install build essentials and cmake
RUN apt-get update && apt-get install -y build-essential cmake git wget ninja-build ccache

# COPY . /app
# WORKDIR /app

# RUN make deps
# RUN make release

WORKDIR /app
COPY Makefile .
COPY external/ external/
RUN make deps

COPY . .
RUN make release

FROM ubuntu:latest

COPY --from=build /app/build/sensornet-server /app/sensornet-server

WORKDIR /app

CMD ["/app/sensornet-server"]