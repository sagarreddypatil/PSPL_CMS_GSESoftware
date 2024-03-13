# use ninja, DONT DO DEBUG HERE DO IT LATER
CMAKE_FLAGS := -DCMAKE_EXPORT_COMPILE_COMMANDS=ON -G Ninja

CCACHE_EXISTS := $(shell command -v ccache 2> /dev/null)

ifdef CCACHE_EXISTS
    CMAKE_FLAGS += -DCMAKE_C_COMPILER_LAUNCHER=ccache
else
    $(warning ccache not found, build may be slower)
endif

all: build

build: CMAKE_FLAGS += -DCMAKE_BUILD_TYPE=Debug
build: cmake

release: CMAKE_FLAGS += -DCMAKE_BUILD_TYPE=Release
release: cmake

# create 
cmake: builddir deps
	cd build && cmake .. $(CMAKE_FLAGS) && ninja

builddir:
	mkdir -p build

clean:
	rm -rf build

deps: external/tsdb

external/tsdb:
	mkdir external/tsdb
	wget -O external/tsdb/database.hpp https://raw.githubusercontent.com/sagarreddypatil/tsdb-cpp/main/include/database.hpp

.PHONY: cmake
.PHONY: builddir
.PHONY: clean
