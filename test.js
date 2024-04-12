import cacheAudioFile from "./service-worker.js";
import playCachedAudioFile from "./cacheSong.js";
const backButton = document.querySelector(".back");

// import a plugin

// Note: Never import/require the *.min.js files from the npm package.
const audioEl = document.querySelector("audio");
const nextButton = document.querySelector(".next");
const img = document.querySelector("img");
const button = document.querySelector(".pause");
let duration;
let Ctime;
let minutes; //end time
let second; //end time
let Cminutes; //curret minutes get from curret time
let Csecond; //current seconds get from curretn time
let isStart = true; // consider for initial or next and back
let songIndex = 0;
let some;
let photo;
let currentAudio;
let previousAudio;
let isPLaying = false;
let songLength;
let previousSong;

// fetch the data from song.php to get the file list in music folder;

// fetch("api/fetch.php")
//   .then((response) => response.json())
//   .then((data) => {});

// getPhoto

// use eventTimeupdate to get the duration adn current time

// play pause button event

// audioEl.addEventListener("ended", next);
// nextButton.addEventListener("click", back);
// backButton.addEventListener("click", next);
async function generate() {
  const url = "api/connect.php";
  const fetchData = await fetch(url);
  const jsonData = await fetchData.json();

  songLength = jsonData.length;

  document.querySelector(".lds-ellipsis").classList.add("hide");
  jsonData.map((item) => {
    const linkEl = document.createElement("a");
    linkEl.textContent = "click";
    linkEl.href = item.id;
    linkEl.className = "col-6 col-md-4 col-lg-3";
    document.querySelector(".link-container").appendChild(linkEl);
    linkEl.addEventListener("click", (e) => {
      // reset the audio;
      let link = e.target.getAttribute("href");
      e.preventDefault();
      document.querySelector(".audio-main").classList.add("see");
      songSheft(e, link);

      previousSong = link;
    });
  });
  audioEl.addEventListener("ended", (e) => {
    songLength = jsonData.indexOf(previousSong);
    songSheft(e, jsonData[songLength + 1]);
    previousSong = jsonData[songLength + 1];
  });
}

//
generate();

// to get timeupadte
function Time(duration, item) {
  // isstart means is it initial state or playing
  // if (!isStart) {
  //   // start time part
  //   Csecond = Math.floor(Ctime % 60);
  //   Cminutes = Math.floor(Ctime / 60);
  //   if (Csecond >= 0) {
  //     document.querySelector(".start").textContent = `${Cminutes} : ${String(
  //       Csecond
  //     ).padStart(2, 0)}`;
  //   }
  // } else {
  //   document.querySelector(".start").textContent = "0 : 00";
  //   isStart = false;
  // }
  // end time part
  second = Math.floor(duration % 60);
  minutes = Math.floor(duration / 60);
  // if(second) makes to avoid NAN , only when  i got seconds make this actions
  if (second) {
    // padStart make need 2 space if 1 space substitute   with 0;
    const end = item.parentElement;
    end.querySelector(".end").textContent = `${minutes} : ${String(
      second
    ).padStart(2, 0)}`;
    // change with cause timeupdate event
    end.querySelector(".p-bar").style.width = `${(Ctime / duration) * 100}%`;
  }
}

function next() {
  songIndex++;
  if (songIndex > some.length - 1) {
    songIndex = 0;
  }
  audioEl.src = `music/${some[songIndex]}`;
  img.src = `photo/${photo[songIndex]}`;
}
function back() {
  songIndex--;
  if (songIndex === 0) {
    songIndex = some.length - 1;
  }
  audioEl.src = `music/${some[songIndex]}`;
  img.src = `photo/${[songIndex]}`;
}

function toggle() {
  if (!isPLaying) {
    button.textContent = "play";
    audioEl.pause();

    isPLaying = true;
  } else {
    button.textContent = "pause";
    audioEl.play();
    isPLaying = false;
  }
}

// ativated song current width

function withActivated(audio, e) {
  // in fire fox  cant see offsetvalue;

  let eDuration = audio.duration;
  let ePer = (e.offsetX / e.target.clientWidth) * 100;
  let percentage = (e.offsetX / e.target.clientWidth) * eDuration;
  // .current time takes song location with seconds
  audio.currentTime = percentage;
  const para = audio.parentElement;
  para.querySelector(".p-bar").style.width = `${ePer}%`;
}

async function songSheft(e, link) {
  button.textContent = "pause";
  isPLaying = false;
  e.preventDefault();
  const cache = await caches.open("audio-cache");
  const cachedResponse = await cache.match(link);

  if (cachedResponse) {
    console.log(cachedResponse);
    console.log("hi");
    playCachedAudioFile(cachedResponse, audioEl);
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "api/play.php", true);
    xhr.responseType = "json";
    xhr.setRequestHeader("Content-Type", "application/json");
    https: xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          console.log(this.response[0].name);
          const audioCtx = new AudioContext();
          const audioUrl = this.response[0].name;
          const audio = new Audio(audioUrl);
          audio.setAttribute("crossorigin", "anonymous");
          const source = audioCtx.createMediaElementSource(audio);
          source.connect(audioCtx.destination);
          audio.play();
        } else {
        }
      }
    };
    var data = JSON.stringify({ song: link });
    xhr.send(data);
  }
}