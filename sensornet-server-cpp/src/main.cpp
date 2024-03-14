#include <iostream>
#include <fstream>
#include <csignal>

#include <nlohmann/json.hpp>
#include <database.hpp>
#include "App.h"

using json = nlohmann::json;
static const uint port = 3180;

struct PerSocketData {
    /* Fill with user data */
};

struct SensorModel {
    std::string id;
    std::string name;
    std::string unit;
    std::string calibration;
};

class JSONDb {
    std::string loc;
    json db;

public:
    JSONDb(std::string loc, json init) : loc(loc) {
        std::ifstream file(loc);

        if (file.is_open()) {
            file >> db;
            file.close();
        }
        else {
            db = init;
            save();
        }
    }

    void save() {
        std::ofstream file(loc);
        file << db.dump(4);
        file.close();
    }

    json &get() {
        return db;
    }

};

int main() {
    uWS::App app = uWS::App();
    JSONDb db("sensor_list.json", json::array());

    app.ws<PerSocketData>("/data", {
        .message = [](auto *ws, std::string_view message, uWS::OpCode opCode) {
            auto req = json::parse(message);
            std::string subId = req["id"];

            if (req["type"] == "subscribe") ws->subscribe(subId);
            if (req["type"] == "unsubscribe") ws->unsubscribe(subId);
        },
    });

    app.get("/", [](auto *res, auto *req) {
        res->end("Hello world!");
    });

    app.get("/sensors", [&](auto *res, auto *req) {
        res->end(db.get().dump());
    });

    app.get("/sensors/:id", [&](auto *res, auto *req) {
        std::string id(req->getParameter(0));
        json &sensors = db.get();

        for (auto &sensor : sensors) {
            if (sensor["id"] == id) {
                res->end(sensor.dump());
                return;
            }
        }
    
        res->writeStatus("404 Not Found");
        res->end("Sensor not found");
    });

    app.post("/sensors", [&](auto *res, auto *req) {
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), &db](std::string_view data, bool last) mutable {
            buffer.append(data.data(), data.length());

            if (last) {
                json sensor = json::parse(data);

                // verify
                if (!sensor.contains("id") || !sensor.contains("name") || !sensor.contains("unit") || !sensor.contains("calibration")) {
                    res->writeStatus("400 Bad Request");
                    res->end("Invalid sensor data");
                    return;
                }

                db.get().push_back(sensor);
                db.save();

                res->end("Sensor added");
            }
        });
    });

    app.post("/sensors/bulk", [&](auto *res, auto *req) {
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), &db](std::string_view data, bool last) mutable {
            buffer.append(data.data(), data.length());

            if (last) {
                json sensors = json::parse(data);

                if (!sensors.is_array()) {
                    res->writeStatus("400 Bad Request");
                    res->end("Invalid sensor data");
                    return;
                }

                for (auto &sensor : sensors) {
                    if (!sensor.contains("id") || !sensor.contains("name") || !sensor.contains("unit") || !sensor.contains("calibration")) {
                        res->writeStatus("400 Bad Request");
                        res->end("Invalid sensor data");
                        return;
                    }
                }

                db.get().insert(db.get().end(), sensors.begin(), sensors.end());
                db.save();

                res->end("Sensors added");
            }
        });
    });

    app.put("/sensors/:id", [&](auto *res, auto *req) {
        std::string id(req->getParameter(0));
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), &db, id](std::string_view data, bool last) mutable {
            buffer.append(data.data(), data.length());

            if (last) {
                json sensor = json::parse(data);
                json &sensors = db.get();

                for (auto &s : sensors) {
                    if (s["id"] == id) {
                        s = sensor;
                        db.save();
                        res->end();
                        return;
                    }
                }

                res->writeStatus("404 Not Found");
                res->end("Sensor not found");
            }
        });
    });

    app.del("/sensors/:id", [&](auto *res, auto *req) {
        std::string id(req->getParameter(0));
        json &sensors = db.get();

        for (auto it = sensors.begin(); it != sensors.end(); it++) {
            if ((*it)["id"] == id) {
                sensors.erase(it);
                db.save();
                res->end();
                return;
            }
        }

        res->writeStatus("404 Not Found");
        res->end("Sensor not found");
    });

    app.get("/sources", [](auto *res, auto *req) {
        res->end("Sources");
    });

    app.get("/historical/:id", [](auto *res, auto *req) {
        std::string id(req->getParameter(0));

        res->end("Historical data for " + id);
    });

    app.listen(port, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << port << std::endl;
        }
        else {
            std::cout << "Failed to listen on port " << port << std::endl;
        }
    });

    app.run();

    std::signal(SIGINT, [](int) {
        
    });

    return 0;
}