cmake_minimum_required(VERSION 3.20)

project(sensornet-server)

find_program(CCACHE_FOUND ccache)

if(CCACHE_FOUND)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
    set_property(GLOBAL PROPERTY RULE_LAUNCH_LINK ccache)
    message(STATUS "ccache found, using it for compilation")
else()
    message(STATUS "ccache not found, using regular compilation")
endif()

add_subdirectory(external)
include(FetchContent)

set(BOOST_INCLUDE_LIBRARIES serialization)
set(BOOST_ENABLE_CMAKE ON)

include(FetchContent)
FetchContent_Declare(
    Boost
    URL https://github.com/boostorg/boost/releases/download/boost-1.84.0/boost-1.84.0.tar.gz
)
FetchContent_MakeAvailable(Boost)


set(CMAKE_CXX_STANDARD 23)

set (CMAKE_CXX_FLAGS "-Wall -Wno-deprecated-declarations -Wno-unused-variable")
set (CMAKE_CXX_FLAGS_DEBUG "-g -O2 -pg -Werror")
set (CMAKE_CXX_FLAGS_RELEASE "-O3")

include_directories(include)

# glob cpp files in src/
file(GLOB SOURCES "src/*.cpp")

# add_compile_options(-save-temps)
add_executable (sensornet-server ${SOURCES})

target_link_libraries(sensornet-server
    PRIVATE
        tsdb
        ExprTk
        uWebSockets
        nlohmann_json::nlohmann_json
        Boost::serialization
)