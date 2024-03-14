#pragma once

#include <iostream>
#include <boost/archive/text_oarchive.hpp>
#include <boost/archive/text_iarchive.hpp>

using json = nlohmann::json;

struct SensorModel {
    std::string id;
    std::string name;
    std::string unit;
    std::string calibration;

};

void to_json(json& j, const SensorModel& sensor) {
    j = json{{"id", sensor.id}, {"name", sensor.name}, {"unit", sensor.unit}, {"calibration", sensor.calibration}};
};

void from_json(const json& j, SensorModel& sensor) {
    j.at("id").get_to(sensor.id);
    j.at("name").get_to(sensor.name);
    j.at("unit").get_to(sensor.unit);
    j.at("calibration").get_to(sensor.calibration);
}

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
    SensorsStore(std::string loc) : loc(loc) {
        // create if it doesn't exist
        std::ifstream file(loc);
        if (!file.is_open()) {
            sync();
        }
        else {
            boost::archive::text_iarchive ia(file);
            ia >> sensors;
            file.close();
        }
    }

    void sync() {
        std::ofstream file(loc);

        if (file.is_open()) {
            boost::archive::text_oarchive oa(file);
            oa << sensors;
            file.close();
        }
    }

    SensorModel& get(std::string id) {
        return sensors[id];
    }

    bool exists(std::string id) {
        return sensors.find(id) != sensors.end();
    }

    void add(SensorModel sensor) {
        sensors[sensor.id] = sensor;
    }

    void update(SensorModel sensor) {
        sensors[sensor.id] = sensor;
    }

    void update(std::vector<SensorModel> sensors) {
        for (auto &sensor : sensors) {
            update(sensor);
        }
    }

    void remove(std::string id) {
        sensors.erase(id);
    }

    std::vector<SensorModel> all() {
        std::vector<SensorModel> result;

        for (auto &sensor : sensors) {
            result.push_back(sensor.second);
        }

        return result;
    }
};
