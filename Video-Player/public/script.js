let settings = JSON.parse(localStorage.getItem("settings"));

if (!settings) {
  settings = {
    darkmode: true,
  };
  localStorage.setItem("settings", JSON.stringify(settings));
}

const vidFile = document.getElementById("vidFile");
const vid = document.getElementById("vid");
const playBtn = document.getElementById("playBtn");
const skipBtn = document.getElementById("skipBtn");
const backBtn = document.getElementById("backBtn");
const fullScreenBtn = document.getElementById("fullScreenBtn");
const volumeBtn = document.getElementById("volumeBtn");
const videoTime = document.getElementById("videoTime");
const timeSpan = document.getElementById("time");
const videoControls = document.querySelector(".video-controls");
const videoProgressBar = document.getElementById("videoTimeSlider");
const menuBtn = document.getElementById("menuBtn");
const videoContainer = document.getElementById("videoContainer");

vidFile.addEventListener("change", () => {
  document.getElementById("chooseLabel").textContent = "Upload another Video";
  const file = vidFile.files[0];
  const formData = new FormData();
  formData.append("vidFile", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Upload failed");
      }
    })
    .then((data) => {
      vid.src = data.videoUrl;
      videoContainer.style.display = "block";
      vid.addEventListener("loadedmetadata", () => {
        const currentTime = formatTime(vid.currentTime);
        const duration = formatTime(vid.duration);
        timeSpan.textContent = currentTime + " / " + duration;
        videoTime.max = vid.duration;
        playBtn.click();
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

playBtn.addEventListener("click", () => {
  if (vid.paused) {
    vid.play();
    playBtn.innerHTML = '<img src="/src/pause.svg" alt="Pause Video" width="35" />';
  } else {
    vid.pause();
    playBtn.innerHTML = '<img src="/src/play.svg" alt="Play Video" width="35" />';
  }
});

skipBtn.addEventListener("click", () => {
  vid.currentTime += 10;
});

backBtn.addEventListener("click", () => {
  vid.currentTime -= 10;
});

fullScreenBtn.addEventListener("click", () => {
  if (vid.requestFullscreen) {
    vid.requestFullscreen();
  } else if (vid.mozRequestFullScreen) {
    vid.mozRequestFullScreen();
  } else if (vid.webkitRequestFullscreen) {
    vid.webkitRequestFullscreen();
  } else if (vid.msRequestFullscreen) {
    vid.msRequestFullscreen();
  }
});

volumeBtn.addEventListener("click", () => {
  if (vid.muted) {
    vid.muted = false;
    volumeBtn.innerHTML = '<img src="/src/volume/volume_100.svg" alt="Volume On" width="35" />';
  } else {
    vid.muted = true;
    volumeBtn.innerHTML = '<img src="/src/volume/volume_off.svg" alt="Volume Off" width="35" />';
  }
});

videoTime.addEventListener("input", () => {
  const time = videoTime.value;
  vid.currentTime = time;
});

vid.addEventListener("click", () => {
  playBtn.click();
});

vid.addEventListener("timeupdate", () => {
  const currentTime = formatTime(vid.currentTime);
  const duration = formatTime(vid.duration);
  const progressPercent = (vid.currentTime / vid.duration) * 100;
  const progress = progressPercent + 0.2;

  videoTime.value = vid.currentTime;
  timeSpan.textContent = currentTime + " / " + duration;
  videoProgressBar.style.width = `${progress}%`;
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    videoControls.style.display = "none";
  } else {
    videoControls.style.display = "flex";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    videoControls.style.display = "flex";
  }
});

videoContainer.addEventListener("mouseenter", () => {
  videoControls.style.display = "block";
  setTimeout(() => {
    videoControls.style.opacity = 1;
  }, 50);
});

videoContainer.addEventListener("mouseleave", () => {
  videoControls.style.opacity = 0;
  setTimeout(() => {
    videoControls.style.display = "none";
  }, 200);
});

let vopen = false;
menuBtn.addEventListener("click", () => {
  if (!vopen) {
    const voptions = document.createElement("div");
    voptions.id = "voptions";
    voptions.innerHTML = `
      <div>
        <img src="/src/volume/volume_100.svg" width="45" id="volumeIcon"/>
        <input type="range" value="10" max="10" id="videoVolumeRange"/>
      </div>
      <div>
        <span style="color: #fff">Loop Video</span>
        <img src="/src/loop.svg" width="40" id="loop"/>
        <span id="loopON">✓</span>
      </div>
    `;

    setTimeout(() => {
      const vol = document.getElementById("videoVolumeRange");
      const volIcon = document.getElementById("volumeIcon");
      vol.addEventListener("input", () => {
        if (vol.value == 5 || vol.value < 5) volIcon.src = "/src/volume/volume_50.svg";
        if (vol.value == 0) {
          volIcon.src = "/src/volume/volume_off.svg";
          document.querySelector("#volumeBtn > img").src = "/src/volume/volume_off.svg";
        }
        if (vol.value == 10 || vol.value > 5) volIcon.src = "/src/volume/volume_100.svg";

        if (vol.value > 1) document.querySelector("#volumeBtn > img").src = "/src/volume/volume_100.svg";

        vid.volume = vol.value / 10;
      });

      const loop = document.getElementById("loop");
      const loopON = document.getElementById("loopON");
      let loopActive = false;
      loop.addEventListener("click", () => {
        if (!loopActive) {
          vid.loop = true;
          loopON.style.display = "block";
          loopActive = true;
        } else {
          vid.loop = false;
          loopON.style.display = "none";
          loopActive = false;
        }
      });
    });

    videoControls.append(voptions);

    vopen = true;
  } else {
    document.getElementById("voptions").remove();
    vopen = false;
  }
});

const darkmode = document.getElementById("darkmode");
let darkmodeActive = false;
darkmode.addEventListener("click", () => {
  darkmodeActive = !darkmodeActive;
  settings.darkmode = darkmodeActive;
  localStorage.setItem("settings", JSON.stringify(settings));
  toggleBodyColor(darkmodeActive ? "#151515" : "#fff");
});

(function () {
  toggleBodyColor(settings.darkmode ? "#151515" : "#fff");
  darkmodeActive = settings.darkmode;
})();

function toggleBodyColor(color) {
  document.getElementsByTagName("body")[0].style.background = color;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const formattedTime = padTime(minutes) + ":" + padTime(seconds);
  return formattedTime;
}

function padTime(time) {
  return time.toString().padStart(2, "0");
}
