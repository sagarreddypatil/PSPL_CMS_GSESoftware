FROM ubuntu:latest as build

# install build essentials and cmake
RUN apt-get update && apt-get install -y build-essential cmake git wget ninja-build ccache

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