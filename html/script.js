/// <reference path="jquery-3.6.0.js" />

let tracks = [];
let folders = [];

const formatSeconds = (seconds) => {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
};

const findTrack = (track, db) => {
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

const findTrackIndex = (track, tracklist) => {
    let start = 0;
    let end = tracklist.length - 1;

    while(start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (tracklist[middle].children[0].textContent === track) return middle;
        else if (tracklist[middle].children[0].textContent < track) start = middle + 1;
        else end = middle - 1;
    }

    return -1;
}

const updateTracks = () => {
    $.ajax({
        url: "/tracks",
        method: "GET",
        context: document.body,
        success: (res) => {
            tracks.push(...JSON.parse(res));
            folders.push(
                ...new Set(
                    tracks
                        .map((track) => [
                            track.path
                                .match(/(?<=(\\|\/)).*?(?=(\\|\/))/g)
                                .at(-1),
                        ])
                        .map((v) => v[0])
                )
            );

            folders.forEach((value) => {
                $("#books").append(
                    `<option value=${value
                        .replace(" ", "")
                        .toLowerCase()}>${value}</option>`
                );
            });
        },
    });
};

$(() => {
    updateTracks();

    $("#update").on("click", () => location.reload());
    $("#books").on("change", (e) => {
        $("#tracklist").empty();

        const selectedOption = $("#books").find(":selected")[0].textContent;
        const matchingTracks = tracks.filter((track) =>
            track.path.includes(selectedOption)
        );

        matchingTracks
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: "base",
                })
            )
            .forEach((track) => {
                const pos = formatSeconds(track.position);
                $("#tracklist").append(
                    `<tr><td>${track.name}</td><td>${
                        pos.slice(0, 2) != "00" ? pos : pos.slice(3)
                    }</td></tr>`
                );
            });
    });

    /**
     * @type {HTMLMediaElement} audio
     */

    const audio = $("#audio")[0];
    const control = $("#control");
    const progress = $("#progress");
    const next = $("#next");
    const prev = $("#previous");
    const time = $("#time");
    const duration = $("#duration");

    let trackName, trackIndex, trackData, selectedTrack, trackList;

    audio.onpause = (e) => {
        const basename = e.target.src.match(/\?(.+mp3)/)[1];
        $.ajax({
            url: `/sync?${audio.currentTime}&${basename}`,
            method: "GET",
            context: document.body,
            success: (res) => {
                console.log(res);
            },
        });

        selectedTrack[1].textContent = formatSeconds(audio.currentTime);
    };

    audio.onloadedmetadata = (e) => {
        progress.attr("max", e.target.duration);
        progress.val(0);

        const date = new Date(e.target.duration * 1000)
            .toISOString()
            .slice(11, 19);

        duration.text(date);

        audio.currentTime = trackData.position;
        $("#now-playing").text(trackName);
    };

    audio.ontimeupdate = (e) => {
        progress.val(e.target.currentTime);
        const date = new Date(audio.currentTime * 1000)
            .toISOString()
            .slice(11, 19);

        time.text(date);
    };

    progress.on("input", (e) => {
        const date = new Date(e.target.value * 1000)
            .toISOString()
            .slice(11, 19);

        time.text(date);
    });

    progress.on("change", (e) => {
        audio.currentTime = parseInt(e.target.value);
    });

    control.on("click", async (e) => {
        if (audio.paused) {
            await audio.play();
            control.attr("src", "pause.png");
        } else {
            audio.pause();
            control.attr("src", "play.png");
        }
    });

    $("#tracklist").on("click", "tr", async (e) => {
        tracklist = $("#tracklist").children("tr");
        selectedTrack = e.target.parentNode.children;
        trackName = selectedTrack[0].textContent;
        trackData = findTrack(trackName, tracks);
        trackIndex = findTrackIndex(trackName, tracklist);

        console.log(trackIndex);

        audio.src = `/play?${trackName}`;
        audio.load();
    });
});
