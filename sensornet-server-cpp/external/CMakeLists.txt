add_subdirectory(uSockets)
add_subdirectory(uWebSockets)

add_library(tsdb INTERFACE)
target_include_directories(tsdb INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/tsdb)