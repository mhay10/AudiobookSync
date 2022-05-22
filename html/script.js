/// <reference path="jquery-3.6.0.js" />

let tracks = [];
let folders = [];

const formatSeconds = (seconds) => {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
};

const findTrackIndex = (track, tracklist) => {
    let start = 0;
    let end = tracklist.length - 1;

    while (start <= end) {
        let middle = Math.floor((start + end) / 2);

        if (tracklist[middle].children[0].textContent === track) return middle;
        else if (tracklist[middle].children[0].textContent < track)
            start = middle + 1;
        else end = middle - 1;
    }

    return -1;
};

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
    tracks.sort((a, b) => {
        if (a.name < b.name) return -1;
        else if (a.name > b.name) return 1;
        else return 0;
    });

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

        duration.text(formatSeconds(e.target.duration * 1000));

        // audio.currentTime = trackData.position;
        $("#now-playing").text(trackName);
    };

    audio.ontimeupdate = (e) => {
        progress.val(e.target.currentTime);

        time.text(formatSeconds(audio.currentTime * 1000));
    };

    progress.on("input", (e) => {
        time.text(formatSeconds(e.target.value * 1000));
    });

    progress.on("change", (e) => {
        audio.currentTime = e.target.value;
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

    next.on("click", (e) => {
        if (trackIndex + 1 < trackList.length) {
            trackIndex++;
            trackData = tracks.find(
                (track) =>
                    track.name == trackList[trackIndex].children[0].textContent
            );
            trackName = trackData.name;
            audio.src = `/play?${trackName}`;
            audio.position = trackData.position;
            $("#now-playing").text(trackName);
        }
    });

    prev.on("click", (e) => {
        if (trackIndex - 1 >= 0) {
            trackIndex--;
            trackData = tracks.find(
                (track) =>
                    track.name == trackList[trackIndex].children[0].textContent
            );
            trackName = trackData.name;
            audio.src = `/play?${trackName}`;
            audio.position = trackData.position;
            time.text(formatSeconds(trackData.position * 1000));
            $("#now-playing").text(trackName);
        }
    });

    $("#tracklist").on("click", "tr", async (e) => {
        trackList = [...$("#tracklist").children("tr")];
        selectedTrack = e.target.parentNode.children;
        trackName = selectedTrack[0].textContent;
        trackData = tracks.find((track) => track.name === trackName);
        trackIndex = trackList.findIndex(
            (track) => track.children[0].textContent === trackName
        );

        console.log(trackIndex);

        audio.src = `/play?${trackName}`;
        audio.load();
    });
});
