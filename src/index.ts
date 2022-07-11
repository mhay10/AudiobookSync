import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

interface DBFile {
    name: string;
    path: string;
    position: number;
}

const findTrack = (track: string, db: DBFile[]) => {
    let start = 0;
    let end = db.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (db[middle].name === track) return db[middle];
        else if (db[middle].name < track) start = middle + 1;
        else end = middle - 1;
    }
    return null;
};

const getDbFile = (path: string) => {
    const dbFile = JSON.parse(fs.readFileSync(path).toString()) as DBFile[];
    dbFile.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
        else return 0;
    });
    return dbFile;
};

const app = express();
const port = 3000;

app.use(express.static("./html"));

app.get("/", (_, res) => {
    res.sendFile("/html/index.html");
});

app.get("/tracks", (_, res) => {
    const cmd = exec("node lib/getsongs.js");
    cmd.on("close", () => {
        const dbFile = fs.readFileSync("./db.json");

        res.setHeader("Content-Type", "text/plain");
        res.end(dbFile);
    });
});

app.get("/data", (req, res) => {
    const query = req.query;
    const dbFile = getDbFile("./db.json");

    const trackName = Object.keys(query)[0];
    if (trackName !== undefined) {
        const track = findTrack(trackName, dbFile);
        if (track !== null) {
            res.setHeader("Content-Type", "text/plain");
            res.end(JSON.stringify(track));
        } else {
            res.status(404).send("Track not found");
        }
    } else {
        res.status(400).send("No track name");
    }
})

app.get("/play", (req, res) => {
    const query = req.query;

    const trackName = Object.keys(query)[0];
    if (trackName !== undefined) {
        const dbFile = getDbFile("./db.json");

        const track = findTrack(trackName, dbFile);
        if (track !== null) {
            res.sendFile(path.resolve(track.path));
        } else {
            res.sendStatus(404);
        }
    } else {
        res.sendStatus(404);
    }
});

app.get("/sync", (req, res) => {
    const query = req.query;
    const queryKeys = Object.keys(query);
    if (queryKeys.length === 2) {
        const time = queryKeys[0];
        const track = queryKeys[1];

        const dbFile = getDbFile("./db.json");
        const trackDb = findTrack(track, dbFile);

        trackDb!.position = parseFloat(time);

        dbFile.sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });

        fs.writeFileSync("./db.json", JSON.stringify(dbFile, null, 4));

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
