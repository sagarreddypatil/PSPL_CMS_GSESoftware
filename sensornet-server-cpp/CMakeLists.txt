cmake_minimum_required(VERSION 3.13)

project(sensornet-server)

set(CMAKE_CXX_STANDARD 23)

set (CMAKE_CXX_FLAGS "-Wall -Werror")
set (CMAKE_CXX_FLAGS_DEBUG "-g -O2 -pg")
set (CMAKE_CXX_FLAGS_RELEASE "-O3")

include_directories(include)

add_executable (sensornet-server src/main.cpp)