local grafana = import 'grafonnet-lib/grafonnet/grafana.libsonnet';
local dashboard = grafana.dashboard;
local template = grafana.template;
local timeSeriesPanel = grafana.timeseriesPanel;
local singlestat = grafana.singlestat;

local sensors = std.extVar('sensors');

local panel = timeSeriesPanel.new(
    'Test',
    unit='celsius',
);

local json_datasource = {
  "type": "simpod-json-datasource",
  "uid": std.extVar("json_datasource_uid"),
};

local influxdb_datasource = {
  "type": "influxdb",
  "uid": std.extVar("influxdb_datasource_uid"),
};

dashboard.new(
  'SensorNet Dashboard',
  time_from='now-1h',
  timezone='utc',
  uid='my-dashboard',
  editable=true,
).addTemplates(
  [
    template.new(
      sensor.id + '_' + field,
      json_datasource,
      {
        query: sensor.id + '_' + field,
      },
      sensor.name + ' ' + field,
      refresh='load',
      hide=true,
    )
    for sensor in sensors
    for field in ['slope', 'offset']
  ]
).addAnnotation(
  grafana.annotation.datasource(
    'Annotations & Alerts',
    '-- Grafana --',
    enable=true,
    hide=false,
    iconColor='#e0752d',
    type='dashboard',
    builtIn=1,
  )
).addPanel(
  panel,
  gridPos={ x: 0, y: 0, w: 12, h: 9 },
)
