import { Router } from "hyper-express";
import {
  getSensors,
  bulkSensors,
  getSensor,
  addSensor,
  updateSensor,
  deleteSensor,
} from "../models/sensorModel";

const sensorsRouter = new Router();

sensorsRouter.get("/", async (req, res) => {
  return res.json(await getSensors());
});

sensorsRouter.get("/:id", async (req, res) => {
  try {
    return res.json(await getSensor(req.path_parameters.id));
  } catch (err: any) {
    return res.status(err.status).json({ error: err.message });
  }
});

sensorsRouter.post("/", async (req, res) => {
  try {
    const json = await req.json();
    const ok = await addSensor(json);
    if (ok) res.status(201).send("Sensor added");
    else res.status(500).send("Error adding sensor");
  } catch (err: any) {
    return res.status(err.status).json({ error: err.message });
  }
});

sensorsRouter.post("/bulk", async (req, res) => {
  try {
    const json = await req.json();
    const ok = await bulkSensors(json);
    if (ok) res.status(201).send("Sensors updating");
    else res.status(500).send("Error updating sensors");
  } catch (err: any) {
    return res.status(err.status).json({ error: err.message });
  }
});

sensorsRouter.put("/:id", async (req, res) => {
  try {
    const json = await req.json();
    const ok = await updateSensor(req.path_parameters.id, json);
    if (ok) res.status(200).send("Sensor updated");
    else res.status(500).send("Error updating sensor");
  } catch (err: any) {
    return res.status(err.status).json({ error: err.message });
  }
});

sensorsRouter.delete("/:id", async (req, res) => {
  if (await deleteSensor(req.path_parameters.id))
    res.status(200).send("Sensor deleted");
  else res.status(500).send("Error deleting sensor");
});

export default sensorsRouter;
