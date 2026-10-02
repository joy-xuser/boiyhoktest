let currentIndex = 0;
let ytPlayer = null;
let isPlaying = false;
let updateInterval = null;

// YouTube IFrame API লোড করা
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('hiddenPlayer', {
    height: '0',
    width: '0',
    videoId: playlist[0].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  loadTrack(0);
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayPauseIcon();
    startProgressTimer();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    updatePlayPauseIcon();
    clearInterval(updateInterval);
  } else if (event.data === YT.PlayerState.ENDED) {
    nextTrack();
  }
}

// প্লেলিস্ট DOM-এ দেখানো
const trackListEl = document.getElementById('trackList');

function renderPlaylist() {
  trackListEl.innerHTML = '';
  playlist.forEach((track, index) => {
    const card = document.createElement('div');
    card.className = 'track-card';
    card.onclick = () => playSelectedTrack(index);
    card.innerHTML = `
      <img src="${track.cover}" alt="${track.title}">
      <h4>${track.title}</h4>
      <p>${track.artist}</p>
    `;
    trackListEl.appendChild(card);
  });
}

function loadTrack(index) {
  currentIndex = index;
  const track = playlist[index];
  document.getElementById('currentTitle').innerText = track.title;
  document.getElementById('currentArtist').innerText = track.artist;
  document.getElementById('currentCover').src = track.cover;
}

function playSelectedTrack(index) {
  loadTrack(index);
  if (ytPlayer && ytPlayer.loadVideoById) {
    ytPlayer.loadVideoById(playlist[index].id);
    ytPlayer.playVideo();
  }
}

function togglePlay() {
  if (!ytPlayer) return;
  if (isPlaying) {
    ytPlayer.pauseVideo();
  } else {
    ytPlayer.playVideo();
  }
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % playlist.length;
  playSelectedTrack(currentIndex);
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  playSelectedTrack(currentIndex);
}

function updatePlayPauseIcon() {
  const icon = document.querySelector('#playPauseBtn i');
  if (isPlaying) {
    icon.className = 'fa-solid fa-pause';
  } else {
    icon.className = 'fa-solid fa-play';
  }
}

function startProgressTimer() {
  clearInterval(updateInterval);
  updateInterval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime) {
      const cur = ytPlayer.getCurrentTime() || 0;
      const dur = ytPlayer.getDuration() || 0;
      if (dur > 0) {
        document.getElementById('progressFill').style.width = (cur / dur * 100) + '%';
        document.getElementById('currentTime').innerText = formatTime(cur);
        document.getElementById('duration').innerText = formatTime(dur);
      }
    }
  }, 1000);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// প্রগ্রেসবারে ক্লিক করে স্কিপ করা
document.getElementById('progressBar').addEventListener('click', (e) => {
  const bar = e.currentTarget;
  const clickPos = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth;
  if (ytPlayer && ytPlayer.getDuration) {
    const seekTime = clickPos * ytPlayer.getDuration();
    ytPlayer.seekTo(seekTime, true);
  }
});

// ভলিউম স্লাইডার
document.getElementById('volumeSlider').addEventListener('input', (e) => {
  if (ytPlayer && ytPlayer.setVolume) {
    ytPlayer.setVolume(e.target.value);
  }
});

// নতুন লিংক যোগ করা
document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('customInput').value.trim();
  const match = input.match(/(?:youtu\.be\/|watch\?v=)([\w-]{11})/);
  const videoId = match ? match[1] : input;

  if (videoId.length === 11) {
    playlist.push({
      id: videoId,
      title: "Custom Added Song",
      artist: "YouTube",
      cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    });
    renderPlaylist();
    document.getElementById('customInput').value = '';
    alert("নতুন গান যোগ হয়েছে!");
  } else {
    alert("সঠিক ইউটিউব ভিডিও লিংক বা ID দিন");
  }
});

// ইভেন্ট লিসেনারস
document.getElementById('playPauseBtn').onclick = togglePlay;
document.getElementById('nextBtn').onclick = nextTrack;
document.getElementById('prevBtn').onclick = prevTrack;

// প্রাথমিক রেন্ডার
renderPlaylist();
