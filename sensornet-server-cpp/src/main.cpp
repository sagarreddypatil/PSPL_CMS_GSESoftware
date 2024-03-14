#include <iostream>
#include <csignal>

#include <database.hpp>
#include <App.h> // uWebSockets, not sure why it's not nested

#include "sensor-store.hpp"

using json = nlohmann::json;
static const uint port = 3180;
static const uint udpPort = 3746;

struct PerSocketData {
    /* Fill with user data */
};

uWS::App* papp = nullptr;
tsdb::Database* ptimedb = nullptr;
SensorsStore* psdb = nullptr;

struct SensorNetRemotePacket {
    // 2 bytes id, 6 bytes pad, 8 byte timestamp, counter, value, value is signed
    uint16_t id;
    uint8_t pad[6];
    uint64_t timestamp;
    uint64_t counter;
    int64_t value;
} __attribute__((packed));

struct SensorNetStored {
    uint64_t counter;
    int64_t value;
};

double apply_calibration(const std::string& sensor_id, const int64_t value);

void handle_packet(char* payload, int length) {
    if (length % sizeof(SensorNetRemotePacket) != 0) {
        // TODO: remove error log, might be slow
        std::cerr << "Invalid packet length" << std::endl;
        return;
    }

    int packets = length / sizeof(SensorNetRemotePacket);
    SensorNetRemotePacket* packet = (SensorNetRemotePacket*) payload;

    for (int i = 0; i < packets; i++) {
        SensorNetRemotePacket* p = packet + i;

        if(!psdb->exists(std::to_string(p->id))) {
            // sensor not found
            return;
        }

        auto table = ptimedb->get_table<SensorNetStored>(std::to_string(p->id));
        table->append(p->timestamp, {p->counter, p->value});

        // send it over websocket
        double value_calibrated = apply_calibration(std::to_string(p->id), p->value);

        json wsPacket = {
            {"id", std::to_string(p->id)},
            {"timestamp", (double)p->timestamp},
            {"value", value_calibrated}
        };

        papp->publish(std::to_string(p->id), wsPacket.dump(), uWS::OpCode::TEXT, false);
    }
}

void on_server_drain(us_udp_socket_t *s) {}

void on_server_data(us_udp_socket_t *s, us_udp_packet_buffer_t *buf, int packets) {
    for (int i = 0; i < packets; i++) {
        char *payload = us_udp_packet_buffer_payload(buf, i);
        int length = us_udp_packet_buffer_payload_length(buf, i);

        handle_packet(payload, length);
    }
}

std::map<std::string, std::string> parseQueryString(const std::string& queryString) {
    std::map<std::string, std::string> result;

    // Split the query string by '&'
    size_t pos = 0;
    while (pos < queryString.size()) {
        size_t found = queryString.find('&', pos);
        if (found == std::string::npos) {
            found = queryString.size();
        }
        std::string pair = queryString.substr(pos, found - pos);

        // Split each pair by '='
        size_t sepPos = pair.find('=');
        if (sepPos != std::string::npos) {
            std::string key = pair.substr(0, sepPos);
            std::string value = pair.substr(sepPos + 1);
            result[key] = value;
        }

        pos = found + 1; // Move to the next pair
    }

    return result;
}

int main() {
    uWS::App app = uWS::App();
    papp = &app;

    if (!std::filesystem::exists("data")) {
        std::filesystem::create_directory("data");
    }

    tsdb::Database timedb("data/tsdb");
    ptimedb = &timedb;

    SensorsStore sdb("data/sensors.dat");
    psdb = &sdb;

    app.ws<PerSocketData>("/data", {
        .message = [](auto *ws, std::string_view message, uWS::OpCode opCode) {
            auto req = json::parse(message);
            std::string subId = req["id"];

            if (req["type"] == "subscribe") ws->subscribe(subId);
            if (req["type"] == "unsubscribe") ws->unsubscribe(subId);
        },
    });

    app.get("/", [](auto *res, auto *req) {
        allow_cors(res);
        res->end("Hello world!");
    });

    app.options("/*", [](auto *res, auto *req) {
        allow_cors(res);
        res->end();
    });

    addSensorRoutes(sdb, app);

    app.get("/sources", [&](auto *res, auto *req) {
        allow_cors(res);
        // same thing as sensors
        json sensors = sdb.all();
        res->end(sensors.dump());
    });

    app.get("/historical/:id", [](auto *res, auto *req) {
        allow_cors(res);
        std::string id(req->getParameter(0));

        auto query = std::string(req->getQuery());
        auto params = parseQueryString(query);

        double start, end, dt;

        try {
            start = std::stod(params["start"]);
            end = std::stod(params["end"]);
            dt = std::stod(params["dt"]);
        }
        catch (std::invalid_argument& e) {
            res->writeStatus("400 Bad Request")
            ->end("Invalid query parameters");
            return;
        }

        uint64_t start_us = start * 1e6;
        uint64_t end_us = end * 1e6;
        uint64_t dt_us = dt * 1e6;

        auto table = ptimedb->get_table<SensorNetStored>(id);
        auto data = table->reduce(start_us, end_us, dt_us);

        json resp = json::array();
        for (auto& entry : data) {
            resp.push_back({
                {"timestamp", (double)entry.timestamp}, // convert to ms
                {"value", apply_calibration(id, entry.value.value)}
            });
        }

        res->end(resp.dump());
    });

    app.listen(port, [](auto *listen_socket) {
        if (listen_socket) {
            std::cout << "Listening on port " << port << std::endl;
        }
        else {
            std::cout << "Failed to listen on port " << port << std::endl;
        }
    });

    us_loop_t* loop = (us_loop_t*) uWS::Loop::get();
    us_udp_packet_buffer_t *receive_buf = us_create_udp_packet_buffer();
    us_udp_socket_t *server = us_create_udp_socket(loop, receive_buf, on_server_data, on_server_drain, "0.0.0.0", udpPort, 0);

    if(!server) {
        std::cerr << "Failed to create UDP server" << std::endl;
        return 1;
    }
    else {
        std::cout << "UDP server created" << std::endl;
    }

    app.run();

    std::signal(SIGINT, [](int signal) {
        // sync all dbs
        psdb->sync();
        ptimedb->sync();

        exit(0);
    });

    return 0;
}