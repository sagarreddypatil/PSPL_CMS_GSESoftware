#include "sensor-store.hpp"
#include <App.h> // uWebSockets, not sure why it's not nested

void addSensorRoutes(SensorsStore& sdb, uWS::App& app) {
    app.get("/sensors", [&](auto *res, auto *req) {
        allow_cors(res);
        json sensors = sdb.all();
        res->end(sensors.dump());
    });

    app.get("/sensors/:id", [&](auto *res, auto *req) {
        allow_cors(res);
        std::string id(req->getParameter(0));

        if(!sdb.exists(id)) {
            res->writeStatus("404 Not Found")
            ->end("Sensor not found");
        }
        else {
            auto& sensor = sdb.get(id);
            json sensorJson = sensor;
            res->end(sensorJson.dump());
        }
    });

    app.post("/sensors", [&](auto *res, auto *req) {
        allow_cors(res);
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), &sdb](std::string_view data, bool last) mutable {
            buffer.append(data.data(), data.length());

            if (last) {
                json sensor = json::parse(data);

                // verify
                if (!sensor.contains("id") || !sensor.contains("name") || !sensor.contains("unit") || !sensor.contains("calibration")) {
                    res->writeStatus("400 Bad Request")
                    ->end("Invalid sensor data");
                    return;
                }

                sdb.add(sensor.template get<SensorModel>());
                sdb.sync();
            }
        });

        res->onAborted([res] {
            res->writeStatus("400 Bad Request")
            ->end("Aborted");
        });

        res->writeStatus("201");
        res->end("Sensor added");
    });

    app.post("/sensors/bulk", [&](auto *res, auto *req) {
        allow_cors(res);
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), &sdb](std::string_view data, bool last) mutable {
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

                sdb.update(sensors.get<std::vector<SensorModel>>());
                sdb.sync();
            }
        });

        res->onAborted([res] {
            res->writeStatus("400 Bad Request")
            ->end("Aborted");
        });

        res->writeStatus("201");
        res->end("Sensor added");
    });

    app.put("/sensors/:id", [&](auto *res, auto *req) {
        allow_cors(res);
        std::string id(req->getParameter(0));
        std::string buffer;

        res->onData([res, buffer = std::move(buffer), id, &sdb](std::string_view data, bool last) mutable {
            buffer.append(data.data(), data.length());

            if (last) {
                json sensor = json::parse(data);

                sdb.update(sensor.template get<SensorModel>());

                res->writeStatus("404 Not Found");
                res->end("Sensor not found");
            }
        });

        res->onAborted([res] {
            res->writeStatus("400 Bad Request")
            ->end("Aborted");
        });

        res->end("Sensor updated");
    });

    app.del("/sensors/:id", [&](auto *res, auto *req) {
        allow_cors(res);
        std::string id(req->getParameter(0));

        sdb.remove(id);

        res->writeStatus("404 Not Found");
        res->end("Sensor not found");
    });
}