#include "sensor-store.hpp"

#include <fstream>
#include <boost/archive/text_oarchive.hpp>
#include <boost/archive/text_iarchive.hpp>
#include <boost/serialization/map.hpp>

void to_json(json& j, const SensorModel& sensor) {
    j = json{{"id", sensor.id}, {"name", sensor.name}, {"unit", sensor.unit}, {"calibration", sensor.calibration}};
};

void from_json(const json& j, SensorModel& sensor) {
    j.at("id").get_to(sensor.id);
    j.at("name").get_to(sensor.name);
    j.at("unit").get_to(sensor.unit);
    j.at("calibration").get_to(sensor.calibration);
}


SensorsStore::SensorsStore(std::string loc) : loc(loc) {
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

void SensorsStore::sync() {
    std::ofstream file(loc);

    if (file.is_open()) {
        boost::archive::text_oarchive oa(file);
        oa << sensors;
        file.close();
    }
}

SensorModel& SensorsStore::get(std::string id) {
    return sensors[id];
}

bool SensorsStore::exists(std::string id) {
    return sensors.find(id) != sensors.end();
}

void SensorsStore::add(SensorModel sensor) {
    sensors[sensor.id] = sensor;
}

void SensorsStore::update(SensorModel sensor) {
    sensors[sensor.id] = sensor;
}

void SensorsStore::update(std::vector<SensorModel> sensors) {
    for (auto &sensor : sensors) {
        update(sensor);
    }
}

void SensorsStore::remove(std::string id) {
    sensors.erase(id);
}

std::vector<SensorModel> SensorsStore::all() {
    std::vector<SensorModel> result;

    for (auto &sensor : sensors) {
        result.push_back(sensor.second);
    }

    return result;
}