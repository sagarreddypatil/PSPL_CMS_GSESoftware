#define exprtk_disable_comments
#define exprtk_disable_break_continue
#define exprtk_disable_sc_andor
#define exprtk_disable_return_statement
#define exprtk_disable_enhanced_features
#define exprtk_disable_string_capabilities
#define exprtk_disable_rtl_io
#define exprtk_disable_rtl_io_file
#define exprtk_disable_rtl_vecops

#include <exprtk.hpp>
#include <unordered_map>
#include "sensor-store.hpp"

extern SensorsStore* psdb;

void init_calibration() {
}

std::unordered_map<std::string, std::pair<std::string, exprtk::expression<double>>> expr_cache;
exprtk::parser<double> parser;
double dvalue = 0.0;

double apply_calibration(const std::string& sensor_id, const int64_t value) {
    auto& sensor = psdb->get(sensor_id);

    if (expr_cache.find(sensor_id) == expr_cache.end() || expr_cache[sensor_id].first != sensor.calibration) {
        exprtk::symbol_table<double> symbol_table;

        symbol_table.add_variable("x", dvalue, false); // temp value
        exprtk::expression<double> expression;
        expression.register_symbol_table(symbol_table);

        parser.compile(sensor.calibration, expression);

        expr_cache[sensor_id] = std::make_pair(sensor.calibration, expression);
    }

    dvalue = (double) value;
    auto& expression = expr_cache[sensor_id].second;
    return expression.value();
}
