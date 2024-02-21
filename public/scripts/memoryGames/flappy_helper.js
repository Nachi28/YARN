document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.getElementById('menuButton');
    var menuDropdown = document.getElementById('menuDropdown');
    
    window.addEventListener('resize', resizeCanvas);
    // Initialize canvas size
    resizeCanvas();

    document.getElementById("fullscreen").addEventListener("click", toggleFullscreen);
    document.addEventListener('keydown', function(event) {
      if (event.key === 'f') {
        toggleFullscreen();
      }
    });

    menuButton.addEventListener('click', function (event) {
    // event.stopPropagation(); // Prevent the click event from reaching the document
  });
});

function updateLabel(value) {
  const levelLabel = document.getElementById('levelLabel');
  const levels = ['Easy', 'Medium', 'Hard'];
  const level = value < 1 ? 0 : value < 2 ? 1 : 2;
  levelLabel.innerText = levels[level];
  console.log(value);
}
function toggleFullscreen() {
  if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
    exitFullscreen();
  } else {
    requestFullscreen();
  }
}
function requestFullscreen() {
  const element = document.documentElement;
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function resizeCanvas() {
  var canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.7; // Adjust height as needed
}

let isMusicMuted = false; // Initialize the mute state
let isGamePaused = false; // Initialize the pause state

function muteMusic() {
  var bgMusic = document.getElementById('bgMusic'); 
  if (bgMusic.volume === 0) {
    bgMusic.volume = 1;
  } else {
    bgMusic.volume = 0;
  }
}

function toggleMusic() {
  const musicToggle = document.getElementById('muteToggle');
  const bgMusic = document.getElementById('bgMusic');
  const volumePercentage = document.getElementById('volumePercentage');
  const volumeAdjuster = document.getElementById('volumeSlider'); 

  if (isMusicMuted) {
    // Unmute music
    musicToggle.innerHTML = '<i class="bi bi-volume-mute"></i> Mute Music';
    isMusicMuted = false;

    // Check if the game is paused, and resume music accordingly
    if (!isGamePaused) {
      bgMusic.play(); 
    }

    // Set volume to 10% when unmuted
    bgMusic.volume = 0.1;
    volumePercentage.textContent = '10%';
    volumeAdjuster.value = 10;
  } else {
    // Mute music
    musicToggle.innerHTML = '<i class="bi bi-volume-up"></i> Unmute Music';
    bgMusic.pause(); // Pause the music
    isMusicMuted = true;

    // Set volume to 0% when muted
    bgMusic.volume = 0;
    volumePercentage.textContent = '0%';
    volumeAdjuster.value = 0; 
  }
}

function adjustVolume(value) {
  const volumePercentage = document.getElementById('volumePercentage');
  const bgMusic = document.getElementById('bgMusic');
  const volumeAdjuster = document.getElementById('volumeSlider');

  const clampedValue = Math.min(100, Math.max(0, value));
  volumePercentage.textContent = `${clampedValue}%`;
  const volume = clampedValue / 100;

  // Adjust the volume only if the game is not paused
  if (!isGamePaused) {
    bgMusic.volume = volume;
  }

  volumeAdjuster.value = clampedValue;
}

function togglePause() {
  const pauseIcon = document.getElementById('pauseIcon');
  const bgMusic = document.getElementById('bgMusic');

  if (isGamePaused) {
    // If currently paused, switch to play icon and resume the game
    pauseIcon.setAttribute('class', 'bi bi-pause-fill');
    isGamePaused = false;
    
    // Check if music is unmuted, and resume music accordingly
    if (!isMusicMuted) {
      bgMusic.play();
    }

    // Add logic for resuming the game (e.g., render());
    console.log('Resuming the game...');
  } else {
    // If currently playing, switch to pause icon and pause the game
    pauseIcon.setAttribute('class', 'bi bi-play-fill');
    isGamePaused = true;

    // Pause the music when the game is paused
    bgMusic.pause();

    // Add logic for pausing the game
    console.log('Pausing the game...');
  }
}

function calibrate() {
  console.log('Calibrating...');
}


  
 