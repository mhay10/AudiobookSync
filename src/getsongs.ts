import path from "path";
import { execSync } from "child_process";
import fs from "fs";
import fg from "fast-glob";

let files = fg.sync("./audio/**/*.mp3");

const getDuration = (path: string) => {
    const cmd = `ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${path}"`;
    const output = execSync(cmd);

    return parseFloat(output.toString());
};

interface DBFile {
    name: string;
    path: string;
    position: number;
    duration: number;
}

try {
    const trackData = JSON.parse(
        fs.readFileSync("./db.json").toString()
    ) as DBFile[];

    files.forEach((file) => {
        const exists = trackData.filter((v) => v.path == file).length == 1;
        if (!exists) {
            trackData.push({
                name: path.basename(file),
                path: file,
                position: 0,
                duration: getDuration(file)
            });
        }
    });

    trackData.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    fs.writeFileSync("./db.json", JSON.stringify(trackData, null, "\t"));
} catch {
    const trackData = files.map((file) => {
        return {
            name: path.basename(file),
            path: file,
            position: 0,
            duration: getDuration(file)
        };
    });

    trackData.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
    fs.writeFileSync("./db.json", JSON.stringify(trackData, null, "\t"));
}
