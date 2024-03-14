FROM ubuntu:latest as build

# install build essentials and cmake
RUN apt-get update && apt-get install -y build-essential cmake git wget ninja-build

COPY . /app
WORKDIR /app

RUN make deps
RUN make release

