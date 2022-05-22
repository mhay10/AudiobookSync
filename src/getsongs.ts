import path from "path";
import fs from "fs";

let checkedDirs: string[] = [];
let files: string[] = [];

const getAudioFiles = (currentDir: string, parentDir: string) => {
    const paths = fs.readdirSync(currentDir);
    paths.forEach((p) => {
        const absPath = path.resolve("./audio", parentDir, p);
        if (fs.statSync(absPath).isDirectory()) {
            if (!checkedDirs.includes(p)) {
                checkedDirs.push(p);
                getAudioFiles(absPath, fs.realpathSync(absPath));
            }
        } else {
            if (path.extname(absPath) == ".mp3") files.push(absPath);
        }
    });
};

getAudioFiles("./audio", ".");

try {
    const trackData = JSON.parse(
        fs.readFileSync("./db.json").toString()
    ) as any[];

    files.forEach((file) => {
        const exists = trackData.filter((v) => v.path == file).length == 1;
        if (!exists) {
            trackData.push({
                name: path.basename(file),
                path: file,
                position: 0,
            });
        }
    });

    fs.writeFileSync("./db.json", JSON.stringify(trackData, null, "\t"));
} catch {
    const trackData = files.map((file) => {
        return {
            name: path.basename(file),
            path: file,
            position: 0
        };
    });

    fs.writeFileSync("./db.json", JSON.stringify(trackData, null, "\t"));
}
