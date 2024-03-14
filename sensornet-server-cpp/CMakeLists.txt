cmake_minimum_required(VERSION 3.24)

project(sensornet-server)

add_subdirectory(external)

include(FetchContent)
set(BOOST_INCLUDE_LIBRARIES serialization)
set(BOOST_ENABLE_CMAKE ON)
FetchContent_Declare(
  Boost
  GIT_REPOSITORY https://github.com/boostorg/boost.git
  GIT_TAG boost-1.80.0
)
FetchContent_MakeAvailable(Boost)

set(CMAKE_CXX_STANDARD 23)

set (CMAKE_CXX_FLAGS "-Wall -Werror -Wno-deprecated-declarations -Wno-unused-variable")
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
        Boost::serialization
)