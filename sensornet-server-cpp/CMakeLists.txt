cmake_minimum_required(VERSION 3.24)

project(sensornet-server)

add_subdirectory(external)

set(CMAKE_CXX_STANDARD 23)

set (CMAKE_CXX_FLAGS "-Wall -Werror -Wno-deprecated-declarations")
set (CMAKE_CXX_FLAGS_DEBUG "-g -O2 -pg")
set (CMAKE_CXX_FLAGS_RELEASE "-O3")

include_directories(include)
add_executable (sensornet-server src/main.cpp)

target_link_libraries(sensornet-server
    PRIVATE
        tsdb
        ExprTk
        uWebSockets
        nlohmann_json::nlohmann_json
)