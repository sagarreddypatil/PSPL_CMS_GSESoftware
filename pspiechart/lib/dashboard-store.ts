import fs from "fs";
import { userAgentFromString } from "next/server";

interface Dashboard {
  id?: number;
  name: string;
  dateCreated?: Date;
  dateModified?: Date;
  layout: any;
  panels: any;
}

const filename = "data/dashboards.json";

let dashboards: Dashboard[] = require(filename);

export function createDashboard(dashboard: Dashboard) {
  dashboard.id = dashboards.length
    ? Math.max(...dashboards.map((dashboard) => dashboard.id ?? -1)) + 1
    : 1;

  dashboard.dateCreated = new Date();
  dashboard.dateModified = new Date();

  dashboards.push(dashboard);
  saveDashboards();

  return dashboard;
}

export function getDashboard(id: number) {
  return dashboards.find((dashboard) => dashboard.id === id);
}

export function getDashboards() {
  return dashboards;
}

export function updateDashboard(dashboard: Dashboard) {
  const original = dashboards.find((original) => original.id === dashboard.id);
  if (!original) {
    return;
  }

  dashboard.dateCreated = original.dateCreated;
  dashboard.dateModified = new Date();

  Object.assign(original, dashboard);

  saveDashboards();
}

export function deleteDashboard(id: number) {
  dashboards = dashboards.filter((dashboard) => dashboard.id !== id);
  saveDashboards();
}

function saveDashboards() {
  fs.writeFileSync(filename, JSON.stringify(dashboards, null, 2));
}
