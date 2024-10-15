currentSong = new Audio();
let songs;

let currentFolder = "bollywood";
function SecondsToMinutes(seconds) {
    let minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds);
    let remainingSeconds = seconds % 60;
    if (isNaN(seconds)) {
        return "00:00";
    }

    if (remainingSeconds < 10) {
        remainingSeconds = '0' + remainingSeconds;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    return `${minutes}:${remainingSeconds}`;
}


async function songList(folder = currentFolder) {
    let a = await fetch(`http://127.0.0.1:3000/assets/songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let song = div.getElementsByTagName("a");
    songs = [];
    Array.from(song).forEach((value) => {
        let element = value.innerText;
        if (element.endsWith(".mp3") || element.endsWith(".m4a")) {
            // console.log(element);
            songs.push(element);
        }
    });
    return songs;
}
async function addAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/assets/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    Array.from(anchors).forEach(async (e) => {
        let folder = e.innerText
        if (folder != "../") {
            let data = await fetch(`http://127.0.0.1:3000/assets/songs/${folder}info.json`);
            let metadata = await data.json();        
            let cards = document.querySelector(".albums");

            cards.innerHTML += `<div data-folder="${folder.replaceAll("/", "")}" class="card">
                    <img src="/assets/songs/${folder}cover.jpg" alt="cover">
                    <i class="fa-solid fa-circle-play" style="color: #74ec8c;"></i>
                    <p>${metadata.title}</p>
                    <p>${metadata.description}</p>
                </div>`

        }
        addCardPlaylist();
    });
}
addAlbums();
function playMusic(track, pause = false) {
    currentSong.src = `assets/songs/${currentFolder}/`+encodeURIComponent(track);
    if (!pause) {
        play.src = "Assets/svgImages/pause.svg";
        currentSong.play();
        let songName = document.querySelector(".song-name-playbar");
        songName.innerHTML =(track.length>40)?track.substring(0,40):track;        
        
    }
}

function addSongsPlaylist(songs) {
    // add songs in playlist
    let songUL = document.getElementById("song-name");
    songUL.innerHTML = "";
    songs.forEach((song) => {
        // this line give a short name of a long song name 
        songUL.innerHTML += `<li class="flex"><i class="fa-solid fa-music"></i>${song}<i class="fa-solid fa-circle-play"></i></li>`;
    })
    // when we click on a song name song play 
    let songLI = document.getElementById("song-name").childNodes;
    songLI.forEach((e) => {
        // console.log(e);
        e.addEventListener("click", () => {            
            playMusic(e.innerText);
        })

    })
}
async function main() {
    songs = await songList();
    playMusic(songs[0], true);

    addSongsPlaylist(songs);

    //Play or pause the song
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Assets/svgImages/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "Assets/svgImages/play.svg";
        }
    })

    // update time 
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.duration,currentSong.currentTime);
        document.querySelector(".time").innerText = `${SecondsToMinutes(currentSong.currentTime)}/${SecondsToMinutes(currentSong.duration)}`
        document.querySelector(".progress").firstElementChild.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })
    // update seekbar
    document.querySelector(".progress").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".progress").firstElementChild.style.left = percent + "%";
        currentSong.currentTime = percent * currentSong.duration / 100;
    })
    // add an event listner when click on humburger icon
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
        document.querySelector(".humburger").style.display = "none";
        document.querySelector(".cross").style.display = "inline-block";

    })

    // add an event listner when click on cross icon
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
        document.querySelector(".humburger").style.display = "inline-block";
        document.querySelector(".cross").style.display = "none";
    })

    // Event listener for previous song
    previous.addEventListener("click", () => {
        // Extract song name from current song URL and decode it
        let songName = decodeURIComponent(currentSong.src.split(`http://127.0.0.1:3000/assets/songs/${currentFolder}/`)[1]);

        // Remove any URL-encoded characters (e.g., %20)
        songName = songName.replaceAll("%20", " ");

        // Find the index of the current song in the songs array
        let index = songs.indexOf(songName);

        // If the song is not the first one, play the previous song
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    // Event listener for next song
    next.addEventListener("click", () => {                
        let songName = decodeURIComponent(currentSong.src.split(`http://127.0.0.1:3000/assets/songs/${currentFolder}/`)[1]);

        songName = songName.replaceAll("%20", " ");
        console.log(songName);

        // Find the index of the current song in the songs array
        let index = songs.indexOf(songName);

        // If the song is not the last one, play the next song
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    // add an event listner for song volume
    volume.addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
        if (e.target.value == 0) {
            document.querySelector(".range>img").src = "Assets/svgImages/mute.svg";
            currentSong.volume = 0;
        } else {
            document.querySelector(".range>img").src = "Assets/svgImages/volume.svg";
        }


    })
    // add an event lisnter when click on volume button to mute 
    document.querySelector(".range>img").addEventListener("click", (e) => {
        document.querySelector(".range>img").src = "Assets/svgImages/mute.svg";
        volume.value = 0;
        currentSong.volume = 0;
    })

}
main();
function addCardPlaylist() {
    // add an event when click on card 
    Array.from(document.querySelectorAll(".card")).forEach((e) => {
        e.addEventListener("click", async () => {
            currentFolder = e.dataset.folder;
            songs = await songList(currentFolder)
            // console.log(songs);
            addSongsPlaylist(songs);
            playMusic(songs[0]);
        })
    });
}
addCardPlaylist(); 
