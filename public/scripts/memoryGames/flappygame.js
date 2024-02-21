// Import the necessary modules for MediaPipe
import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

import { PoseLandmarker, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let data = JSON.parse(document.getElementById("userData").dataset.user);
console.log(data);
let selectedGameType = data.selectedGameType;
let difficulty = data.gameLvl;
console.log(difficulty);
console.log(selectedGameType);


window.onload = function () {
  window.scrollTo(0, 80); // Adjust the Y-coordinate as needed
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("webcam"); // Add this line to get the video element
const levelLabel = document.getElementById("levelLabel");
const gameLevelInput = document.getElementById("customRange3");
const vidcanvas = document.getElementById("vidcanvas");
const camCanvasCtx = vidcanvas.getContext("2d");



const img = new Image();
const bgimg = new Image();
bgimg.src = "/assets/landscapebg.jpg";
img.src = "https://i.ibb.co/Q9yv5Jk/flappy-bird-set.png";

let difficultyDes, pipedist, pipeGap, gravity, speed, jump, stages, stage;
let totalStages = 7;
let stagesArr = [];

function updateLabel(difficulty) {
  const levels = ["Easy", "Medium", "Hard"];
  const level = difficulty < 1 ? 0 : difficulty < 2 ? 1 : 2;
  difficultyDes = levels[level];
  levelLabel.innerText = difficultyDes;

  switch (difficulty) {
    case "0":
      pipeGap = 290;
      pipedist = 500;
      // gravity = 0.15;
      speed = 3;
      jump = -3;
      break;
    case "1":
      // gravity = 0.2;
      speed = 4;
      jump = -4;
      pipeGap = 270;
      pipedist = 370;
      break;
    case "2":
      // gravity = 0.25;
      speed = 4.5;
      jump = -5;
      pipeGap = 240;
      pipedist = 290;
      break;
  }
}

gameLevelInput.addEventListener("input", function () {
  const selectedValue = this.value;
  console.log(`Selected Game Level: ${selectedValue}`);

  // Now you can call the updateLabel function or perform any other actions
  updateLabel(selectedValue);
});

updateLabel(difficulty);
const stageRangeHand = [
  { min: 170, max: 175, text: 6 },
  { min: 165, max: 170, text: 5 },
  { min: 155, max: 165, text: 4 },
  { min: 145, max: 155, text: 3 },
  { min: 135, max: 145, text: 2 },
  { min: 125, max: 135, text: 1 },
  { min: 115, max: 125, text: 0 }
];

const stageRangePose = [
  { min: 145, max: 180, text: 0 },
  { min: 125, max: 145, text: 1 },
  { min: 105, max: 125, text: 2 },
  { min: 85, max: 105, text: 3 },
  { min: 65, max: 85, text: 4 },
  { min: 45, max: 65, text: 5 },
  { min: 0, max: 45, text: 6 }
];


// general settings
let gamePlaying = false;

const size = [51, 36];
const cTenth = canvas.width;
let lastVideoTime = -1;
let lastVideoTimeaaa = 0;
let bgm = false;
let videoload = false;
// let fistdet_time=100 //in milli sec (10fps)
let fistdet_time = 125; //in milli sec (8fps)

// let fistdet_time = 167; //in milli sec (6fps)


// let fistdet_time = 200; //in milli sec (5fps)

// let fistdet_time = 250; //in milli sec (4fps)

// let fistdet_time = 500; //in milli sec (2fps)

let gameStartTime;
let gameEndTime;
let moves = 0;

let index = 0,
  bestScore = 0,
  flight,
  flyHeight,
  currentScore,
  pipes;

// pipe settings
const pipeWidth = 78;
const pipeLoc = () =>
  Math.random() * (canvas.height - (pipeGap + pipeWidth) - pipeWidth) +
  pipeWidth;

// Initialize MediaPipe HandLandmarker
let handLandmarker = undefined;
let results = undefined; // Define the results variable
let poseLandmarker = undefined;

function enableCam(event) {
  const constraints = { video: true };
  navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", () => {
      videoload = true;
      video.style.transform = "scaleX(-1)";
    });
  });
}

// Create a function to initialize the HandLandmarker
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO", // Set to video mode for webcam
    numHands: 2,
  });
};

// Inside your createHandLandmarker or createPoseLandmarker functions
function hideLoadingOverlay() {
  document.getElementById("loading-overlay").style.display = "none";
}

// Function to create PoseLandmarker
const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.7,
    minPosePresenceConfidence: 0.8,
    minTrackingConfidence: 0.8,
  });
};

function checkFist(hand) {
  // let thumb = h[4].x > h[3].x
  // to check which hand here not needed as we aint suing thumb
  // if handedness (this is opposite to what u get)

  // let index = h[8].y > h[6].y;
  // let middle = h[12].y > h[10].y;
  // let ring = h[16].y > h[14].y;
  // let little = h[20].y > h[18].y;

  // return index && middle && ring && little;

  const indexFingerAngles = checkFinger("Index", hand[8], hand[7], hand[6], hand[5], hand[0]);
  const middleFingerAngles = checkFinger("Middle", hand[12], hand[11], hand[10], hand[9], hand[0]);
  const ringFingerAngles = checkFinger("Ring", hand[16], hand[15], hand[14], hand[13], hand[0]);
  const littleFingerAngles = checkFinger("Little", hand[20], hand[19], hand[18], hand[17], hand[0]);
  const thumbFingerAngles = checkFinger("Thumb", hand[4], hand[3], hand[2], hand[1], hand[0]);

  const calculateAverageAngle = (angles) => (angles.reduce((acc, angle) => acc + angle, 0) / 3);

  const averageIndexFingerAngle = calculateAverageAngle(indexFingerAngles);
  const averageMiddleFingerAngle = calculateAverageAngle(middleFingerAngles);
  const averageRingFingerAngle = calculateAverageAngle(ringFingerAngles);
  const averageLittleFingerAngle = calculateAverageAngle(littleFingerAngles);
  const averageThumbFingerAngle = calculateAverageAngle(thumbFingerAngles);
  const averageFingerAngles = (averageIndexFingerAngle + averageMiddleFingerAngle + averageRingFingerAngle + averageLittleFingerAngle + averageThumbFingerAngle) / 5;

  return averageFingerAngles.toFixed(2);
}

function determineStage(avgAngleQuocient, selectedGameType) {
  if (selectedGameType === "hand") {
    for (const stage of stageRangeHand) {
      if (avgAngleQuocient >= stage.min && avgAngleQuocient <= stage.max) {
        return stage.text;
      }
    }
    return -1;
  }
  else if (selectedGameType === "pose") {
    for (const stage of stageRangePose) {
      if (avgAngleQuocient >= stage.min && avgAngleQuocient <= stage.max) {
        return stage.text;
      }
    }
    return -1;
  }
}

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

  // Convert radians to degrees and get absolute value
  let angle = Math.abs((radians * 180.0) / Math.PI);

  // Check if angle is greater than 180 and adjust if needed
  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

// Create stages dynamically based on canvas height
function createStages(canvasHeight, numStages) {
  const stageHeight = (canvasHeight - 40) / numStages;
  stages = Array.from({ length: numStages }, (_, index) => canvasHeight - 20 - (index + 1) * stageHeight);
  return stages;
}

function checkFinger(fingerName, a, b, c, d, e) {
  var angle1 = calculateAngle(a, b, c);
  var angle2 = calculateAngle(b, c, d); // Assuming d is the coordinate for angle 2
  var angle3 = calculateAngle(c, d, e); // Assuming e is the coordinate for angle 3

  // console.log(`${fingerName} Finger - Angle 1: ${angle1.toFixed(2)}, Angle 2: ${angle2.toFixed(2)}, Angle 3: ${angle3.toFixed(2)}`);

  return [angle1, angle2, angle3];
}

function checkPose(h) {
  // console.log(h[16],h[14],h[12])
  // if (calculateAngle(h[12], h[14], h[16]) < 90) {
  //   return true;
  // }
  // return false;
  return calculateAngle(h[12], h[14], h[16]);
}



function predictWebcam(prevStage) {
  // Now let's start detecting the stream.
  let startTimeMs = performance.now();

  const timeDifference = startTimeMs - lastVideoTimeaaa;

  if (timeDifference >= fistdet_time && lastVideoTime !== video.currentTime && videoload === true) {
    lastVideoTimeaaa = startTimeMs;
    lastVideoTime = video.currentTime;

    // console.log(selectedGameType,selectedGameType==='pose',selectedGameType==='"hand"')

    if (selectedGameType === "hand") {
      results = handLandmarker.detectForVideo(video, startTimeMs);
      const handLandmarks = results?.landmarks;

      // let handedness= console.log(results.handednesses[0][0].categoryName)
      for (const landmarks of handLandmarks) {
        drawConnectors(camCanvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        drawLandmarks(camCanvasCtx, landmarks, { color: "#FF0000", radius: 2 });
      }

      if (handLandmarks.length != 0) {

        let avgAngleQuocient = checkFist(handLandmarks[0]);
        // console.log(fist)
        // console.log(avgAngleQuocient)
        let stage = determineStage(avgAngleQuocient, selectedGameType);
        // console.log(stage);
        if (stage === -1) {
          stage = prevStage
        }

        stagesArr.push(stage);
        return stage;
      }
      else {

        // pause the game if hand is not in frame 
        // isGamePaused = true;
        return prevStage;

      }
    } else if (selectedGameType === "pose") {
      results = poseLandmarker.detectForVideo(video, startTimeMs);
      const poseLandmarks = results?.landmarks;
      for (const landmark of poseLandmarks) {

        drawConnectors(camCanvasCtx, landmark, PoseLandmarker.POSE_CONNECTIONS, { visibilityMin: 0.65, color: 'green', lineWidth: 5 });
        drawLandmarks(camCanvasCtx, landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
          visibilityMin: 0.65,
          color: 'grey',
          fillColor: 'rgb(255,100,0)',
          lineWidth: 1
        });
      }
      if (poseLandmarks.length != 0) {
        let poseAngle = checkPose(poseLandmarks[0]);
        // console.log(poseAngle)
        let stage = determineStage(poseAngle, selectedGameType);

        if (stage === -1) {
          stage = prevStage
        }

        stagesArr.push(stage);
        return stage;
      }
    } else {
      // console.log("EROOR FINDING THE SLECTED GAMETYPE");
      // pause the game if hand is not in frame 
      // isGamePaused = true;
      return prevStage;
    }
  }
  else {
    return prevStage
  }
}

// Function to play the background music
function playBackgroundMusic() {
  const bgMusic = document.getElementById("bgMusic");
  bgMusic.volume = 0.2; // Set the volume to 0.5 (adjust as needed)
  bgMusic.play();
}

// Function to play the click sound
function playClickSound() {
  const clickSound = document.getElementById("clickSound");
  clickSound.play();
}
function playloseSound() {
  const clickSound = document.getElementById("loseSound");
  clickSound.play();
}

// Create a function to set up the game
const setup = () => {
  currentScore = 0;
  flight = jump;

  // set initial flyHeight (middle of screen - size of the bird)
  flyHeight = canvas.height / 2 - size[1] / 2;

  // setup first 3 pipes
  pipes = Array(3)
    .fill()
    .map((a, i) => [canvas.width + i * (pipedist + pipeWidth), pipeLoc()]);
};

// Create a function to render the game
const render = () => {
  if (!isGamePaused) {
    // make the pipe and bird moving
    index++;

    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background first part
    ctx.drawImage(bgimg, 0, 0, bgimg.width, bgimg.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(bgimg, 0, 0, bgimg.width, bgimg.height, -((index * (speed / 2)) % canvas.width), 0, canvas.width, canvas.height);
    camCanvasCtx.clearRect(0, 0, vidcanvas.width, vidcanvas.height);

    // Draw image on canvas
    camCanvasCtx.drawImage(video, 0, 0, vidcanvas.width, vidcanvas.height);

    // pipe display
    if (gamePlaying) {
      pipes.map((pipe) => {
        // pipe moving
        pipe[0] -= speed;

        // top pipe
        ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);

        ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

        // give 1 point & create new pipe
        if (pipe[0] <= -pipeWidth) {
          currentScore++;
          // check if it's the best score
          bestScore = Math.max(bestScore, currentScore);

          // remove & create new pipe
          // console.log("this is pipes:")
          // console.log(pipes)
          // console.log(...pipe.slice(1))
          pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipedist + pipeWidth, pipeLoc()],];

          // console.log(pipes);
        }

        const pipeCollision = pipe[0] <= cTenth + size[0] && pipe[0] + pipeWidth >= cTenth;
        const birdCollision = pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1];
        const groundCollision = flyHeight <= 0 || flyHeight + size[1] >= canvas.height;

        if (pipeCollision && birdCollision || groundCollision) {
          if (groundCollision) {
            console.log('Ground collision detected.');
          } else if (pipeCollision) {
            console.log('Pipe collision detected.');
          } else if (birdCollision) {
            console.log('Bird collision detected.');
          }
        }
        // if hit the pipe or touch top/bottom, end
        if ([pipe[0] <= cTenth + size[0], pipe[0] + pipeWidth >= cTenth, pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1],].every((elem) => elem) || flyHeight <= 0 || flyHeight + size[1] >= canvas.height) {
          gamePlaying = false;

          gameEndTime = Date.now(); // Record the end time
          const timePerRunMilliseconds = gameEndTime - gameStartTime;
          const timePerRunSeconds = Math.floor(timePerRunMilliseconds / 1000);

          const gameOverData = {
            score: currentScore,
            gameType: selectedGameType,
            difficulty: difficultyDes,
            timePerrun: timePerRunSeconds,
            movesPerrun: moves,
            rangeOfMovement: stagesArr,
          };

          // pop all the elements of stagesArr
          stagesArr = [];
          console.log(gameOverData);

          // console.log("Sending game over data:", JSON.stringify(gameOverData));
          fetch("/game-over", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gameOverData),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log(data);
            })
            .catch((error) => {
              console.error("Error sending game over data:", error);
            });

          moves = 0;
          playloseSound();
          setup();
        }
      });
    }
    // draw bird
    if (gamePlaying) {
      stage = predictWebcam(stage);


      // if (shouldJump === true) {
      //   // console.log("jump")
      //   flight = jump;
      //   moves += 1;
      //   playClickSound();
      // }

      if (stage !== -1) {
        // Instead of adjusting the flyHeight based on gravity, set it to the current stage height
        flyHeight = stages[stage];
        // console.log(stage, flyHeight);
      }

      ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
      // flight += gravity;
      flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);

      // // Draw a red circle at flyHeight
      // ctx.beginPath();
      // ctx.arc(cTenth + size[0] / 2, flyHeight + size[1] / 2, 10, 0, Math.PI * 2, false);
      // ctx.fillStyle = 'red';
      // ctx.fill();
      // ctx.closePath();

    } else {
      ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, canvas.width / 2 - size[0] / 2, flyHeight, ...size);
      flyHeight = canvas.height / 2 - size[1] / 2;

      ctx.fillText(`Best score : ${bestScore}`, canvas.width / 2 - 120, canvas.height / 2 - 150);
      ctx.fillText("Click to play", canvas.width / 2 - 120, canvas.height / 2 + 190);
      ctx.font = "bold 30px courier";
    }

    document.getElementById("bestScore").innerHTML = `Best : ${bestScore}`;
    document.getElementById(
      "currentScore"
    ).innerHTML = `Current : ${currentScore}`;
  }
  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};

// launch setup

if (selectedGameType === "hand") {
  createHandLandmarker()
    .then(() => {
      setup();
      enableCam();
      stages = createStages(canvas.height, totalStages);
      // console.log(stages);
    })
    .then(() => {
      console.log("loaded hand models");
      hideLoadingOverlay();
    });
} else if (selectedGameType === "pose") {
  createPoseLandmarker()
    .then(() => {
      setup();
      enableCam();
      stages = createStages(canvas.height, totalStages);

    })
    .then(() => {
      console.log("loaded pose models");
      hideLoadingOverlay();
    });
}

// start game
img.onload = render;

function startGame() {
  gamePlaying = true;
  flight = jump;
  playClickSound();
  if (!bgm) {
    bgm = true;
    playBackgroundMusic();
  }
  gameStartTime = Date.now(); // Record the start time
}

canvas.onclick = startGame;
document.addEventListener('keydown', function (event) {
  if (event.code === 'Space') {
    startGame();
  }
});