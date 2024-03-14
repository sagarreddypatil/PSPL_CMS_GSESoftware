#pragma once

#include <nlohmann/json.hpp>
#include <App.h>

using json = nlohmann::json;

struct SensorModel {
    std::string id;
    std::string name;
    std::string unit;
    std::string calibration;
};

void to_json(json& j, const SensorModel& sensor);

void from_json(const json& j, SensorModel& sensor);

namespace boost { namespace serialization {
    template<class Archive>
    void serialize(Archive & ar, SensorModel & sensor, const unsigned int version) {
        ar & sensor.id;
        ar & sensor.name;
        ar & sensor.unit;
        ar & sensor.calibration;
    }
}}

class SensorsStore {
    std::string loc;
    std::map<std::string, SensorModel> sensors; // id is primary key

public:
    SensorsStore(std::string loc);
    void sync();
    SensorModel& get(std::string id);
    bool exists(std::string id);
    void add(SensorModel sensor);
    void update(SensorModel sensor);
    void update(std::vector<SensorModel> sensors);
    void remove(std::string id);
    std::vector<SensorModel> all();
};


void addSensorRoutes(SensorsStore& sdb, uWS::App& app);

template<bool SSL>
void allow_cors(uWS::HttpResponse<SSL> *res) {
    res->writeHeader("Access-Control-Allow-Origin", "*");
    res->writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res->writeHeader("Access-Control-Allow-Headers", "Content-Type");
}