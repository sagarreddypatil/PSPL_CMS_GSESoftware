#include "sensor-store.hpp"
#include <exprtk.hpp>

extern SensorsStore* psdb;
double apply_calibration(const std::string& sensor_id, const int64_t value) {
    auto& sensor = psdb->get(sensor_id);

    double dvalue = (double) value;

    exprtk::symbol_table<double> symbol_table;

    symbol_table.add_variable("x", dvalue, true);
    exprtk::expression<double> expression;
    expression.register_symbol_table(symbol_table);

    exprtk::parser<double> parser;
    parser.compile(sensor.calibration, expression);

    return expression.value();
}
