import type { HttpResponse, HttpRequest } from "uWebSockets.js";
import Database, { SqliteError } from "better-sqlite3";

const configDB = new Database("config.db");
configDB.pragma("journal_mode = WAL");

configDB.exec(
    "CREATE TABLE IF NOT EXISTS config (id INTEGER PRIMARY KEY, name TEXT, unit TEXT, slope REAL, gain REAL)"
);

const getConfig = (res: HttpResponse, req: HttpRequest) => {
    const rows = configDB.prepare("SELECT * FROM config").all();
    if (
        req.getHeader("accept") === "text/csv" ||
        req.getQuery("format") === "csv"
    ) {
        res.writeHeader("content-type", "text/csv");
        res.write("id,name,unit,slope,gain\n");
        res.end(
            rows
                .map((row: any) => {
                    return `${row.id},${row.name},${row.unit},${row.slope},${row.gain}`;
                })
                .join("\n")
        );
    } else {
        res.writeHeader("content-type", "application/json");
        res.end(JSON.stringify(rows));
    }
};

const postConfig = (res: HttpResponse, req: HttpRequest) => {
    if (req.getHeader("content-type") !== "application/json") {
        res.writeStatus("400 Bad Request").end(
            JSON.stringify({ error: "Body must be JSON" })
        );
        return;
    }
    let buffers: Buffer[] = [];
    res.onData((ab, isLast) => {
        if (ab.byteLength > 0) {
            buffers.push(Buffer.from(ab));
        }
        if (isLast) {
            const body = Buffer.concat(buffers).toString();
            const config = JSON.parse(body);
            if (
                config.id === undefined ||
                config.name === undefined ||
                config.unit === undefined ||
                config.slope === undefined ||
                config.gain === undefined
            ) {
                res.writeStatus("400 Bad Request").end(
                    JSON.stringify({ error: "Invalid config" })
                );
                return;
            }
            try {
                const stmt = configDB.prepare(
                    "INSERT INTO config (id, name, unit, slope, gain) VALUES (?, ?, ?, ?, ?)"
                );
                stmt.run(
                    config.id,
                    config.name,
                    config.unit,
                    config.slope,
                    config.gain
                );
                res.end(JSON.stringify(config));
            } catch (e) {
                if (
                    e instanceof SqliteError &&
                    e.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
                ) {
                    res.writeStatus("409 Conflict").end(
                        JSON.stringify({ error: "ID already exists" })
                    );
                } else {
                    throw e;
                }
            }
        }
    });

    res.onAborted(() => {
        buffers = [];
    });
};

const putConfig = (res: HttpResponse, req: HttpRequest) => {
    if (req.getHeader("content-type") !== "application/json") {
        res.writeStatus("400 Bad Request").end(
            JSON.stringify({ error: "Body must be JSON" })
        );
        return;
    }
    let buffers: Buffer[] = [];
    res.onData((ab, isLast) => {
        if (ab.byteLength > 0) {
            buffers.push(Buffer.from(ab));
        }
        if (isLast) {
            const body = Buffer.concat(buffers).toString();
            const config = JSON.parse(body);
            if (
                config.id === undefined ||
                config.name === undefined ||
                config.unit === undefined ||
                config.slope === undefined ||
                config.gain === undefined
            ) {
                res.writeStatus("400 Bad Request").end(
                    JSON.stringify({ error: "Invalid config" })
                );
                return;
            }
            try {
                const stmt = configDB.prepare(
                    "UPDATE config SET name = ?, unit = ?, slope = ?, gain = ? WHERE id = ?"
                );
                stmt.run(
                    config.name,
                    config.unit,
                    config.slope,
                    config.gain,
                    config.id
                );
                res.end(JSON.stringify(config));
            } catch (e) {
                if (
                    e instanceof SqliteError &&
                    e.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
                ) {
                    res.writeStatus("409 Conflict").end(
                        JSON.stringify({ error: "ID already exists" })
                    );
                } else {
                    throw e;
                }
            }
        }
    });
};

const deleteConfig = (res: HttpResponse, req: HttpRequest) => {
    if (req.getHeader("content-type") !== "application/json") {
        res.writeStatus("400 Bad Request").end(
            JSON.stringify({ error: "Body must be JSON" })
        );
        return;
    }
    let buffers: Buffer[] = [];
    res.onData((ab, isLast) => {
        if (ab.byteLength > 0) {
            buffers.push(Buffer.from(ab));
        }
        if (isLast) {
            const body = Buffer.concat(buffers).toString();
            const config = JSON.parse(body);
            if (config.id === undefined) {
                res.writeStatus("400 Bad Request").end(
                    JSON.stringify({ error: "Invalid config" })
                );
                return;
            }
            try {
                const stmt = configDB.prepare(
                    "DELETE FROM config WHERE id = ?"
                );
                stmt.run(config.id);
                res.end(JSON.stringify(config));
            } catch (e) {
                if (
                    e instanceof SqliteError &&
                    e.code === "SQLITE_CONSTRAINT_PRIMARYKEY"
                ) {
                    res.writeStatus("409 Conflict").end(
                        JSON.stringify({ error: "ID already exists" })
                    );
                } else {
                    throw e;
                }
            }
        }
    });
};

const uploadConfig = (res: HttpResponse, req: HttpRequest) => {
    const contentType = req.getHeader("content-type");
    if (!contentType.startsWith("multipart/form-data")) {
        res.writeStatus("400 Bad Request").end(
            JSON.stringify({ error: "Expected File Upload" })
        );
        return;
    }
    let boundary = "--";

    let parsedForm = false;
    contentType.split("; ").forEach((part) => {
        const [key, value] = part.split("=");
        if (key === "boundary") {
            boundary += value;
        }
    });

    res.onData((ab, isLast) => {
        if (ab.byteLength <= 0) {
            return;
        }
        const data = Buffer.from(ab);

        let fileStart = 0;
        let fileEnd = data.length;

        if (!parsedForm) {
            const boundaryIndex = data.indexOf(boundary);
            if (boundaryIndex === -1) {
                console.log("No boundary found");
                res.writeStatus("400 Bad Request").end();
                return;
            }
            const header = data.subarray(boundaryIndex);
            const headerEnd = header.indexOf("\r\n\r\n");
            const headerString = header.subarray(0, headerEnd).toString();
            console.log(headerString);

            const parts = headerString.split("\r\n");

            if (!parts[0].startsWith(boundary)) {
                console.log("No boundary found");
                res.writeStatus("400 Bad Request").end();
                return;
            }
            if (!parts[1].startsWith("Content-Disposition: form-data")) {
                console.log("No content-disposition found");
                res.writeStatus("400 Bad Request").end();
                return;
            }
            parts[1].split("; ").forEach((part) => {
                const [key, value] = part.split("=");
                if (key === "name") {
                    if (value !== '"upload"') {
                        console.log("Invalid name");
                        return res.writeStatus("400 Bad Request").end();
                    }
                }
            });
            if (!parts[2].startsWith("Content-Type: text/csv")) {
                console.log("No content-type found");
                res.writeStatus("400 Bad Request").end();
                return;
            }
            parsedForm = true;
            fileStart = boundaryIndex + headerEnd + 4;
            fileEnd = header.indexOf(boundary, fileStart);
            if (fileEnd === -1) {
                fileEnd = data.length;
            }
            console.log(fileStart, fileEnd);
        }

        if (isLast) {
            res.writeStatus("200 OK").end();
        }
    });
    res.onAborted(() => {});
};

export { getConfig, postConfig, putConfig, deleteConfig, uploadConfig };
