add_subdirectory(uSockets)
add_subdirectory(uWebSockets)
add_subdirectory(json)

add_library(tsdb INTERFACE)
target_include_directories(tsdb INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/tsdb)

add_library(ExprTk INTERFACE)
target_include_directories(ExprTk INTERFACE ${CMAKE_CURRENT_SOURCE_DIR}/ExprTk)