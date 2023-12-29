window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const db = new Dexie("audioDB");
const playButton = document.querySelector(".tape-controls-play");
const informationPanel = document.getElementById("informationPanel");

const audio = new Audio();
db.version(3).stores({
  sounds: `
        id,
        data,
        audio,
        url`,
});
const audioFiles = document.getElementsByClassName("item");
const visualizeAudio = (url, id) => {
  db.sounds
    .get({ id: id })
    .then((sound) => sound.data)
    .then((data) => draw(data, id))
    .catch((_) =>
      fetch(url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => normalizeData(filterData(audioBuffer)))
        .then(
          (data) =>
            db.sounds.add({ id: id, data: data, url: url }) && draw(data, id),
        ),
    );
};

const filterData = (audioBuffer) => {
  const rawData = audioBuffer.getChannelData(0);
  const samples = 50;
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData = [];
  for (let i = 0; i < samples; i++) {
    let blockStart = blockSize * i;
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum = sum + Math.abs(rawData[blockStart + j]);
    }
    filteredData.push(sum / blockSize);
  }

  return filteredData;
};

const normalizeData = (filteredData) => {
  const multiplier = Math.pow(Math.max(...filteredData), -1);
  return filteredData.map((n) => n * multiplier);
};

const draw = (normalizedData, id) => {
  // Set up the canvas
  const canvas = document.getElementById(id);
  canvas.addEventListener("click", (ev) => {
    const old = document.querySelector('[aria-selected="true"]');
    if (old && old == ev.target) {
      audio.pause();
      informationPanel.classList.toggle("hidden");
      ev.target.ariaSelected = false;
      return;
    } else if (old) {
      old.ariaSelected = false;
    }

    if (informationPanel.classList.contains("hidden")) {
      informationPanel.classList.toggle("hidden");
    }
    informationPanel.firstChild.textContent = ev.target.id;

    audio.pause();
    audio.src = ev.target.dataset.url;
    audio.play();
    ev.target.ariaSelected = true;
  });

  const dpr = window.devicePixelRatio || 1;
  const padding = 50;
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = (canvas.offsetHeight + padding * 2) * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.translate(0, canvas.offsetHeight / 2 + padding); // Set Y = 0 to be in the middle of the canvas

  // draw the line segments
  const width = canvas.offsetWidth / normalizedData.length;
  for (let i = 0; i < normalizedData.length; i++) {
    const x = width * i;
    let height = normalizedData[i] * canvas.offsetHeight - padding;
    if (height < 0) {
      height = 0;
    } else if (height > canvas.offsetHeight / 2) {
      height = height > canvas.offsetHeight / 2;
    }
    drawLineSegment(ctx, x, height, width, (i + 1) % 2);
  }
};

const drawLineSegment = (ctx, x, y, width, isEven) => {
  ctx.lineWidth = 2; // how thick the line is
  ctx.strokeStyle = "#666"; // what color our line is
  ctx.beginPath();
  y = isEven ? y : -y;
  ctx.moveTo(x, 0);
  ctx.lineTo(x, y);
  ctx.arc(x + width, y, width, Math.PI, 0, isEven);
  ctx.lineTo(x + width, 0);
  ctx.stroke();
};

for (const audioFile of audioFiles) {
  visualizeAudio(audioFile.dataset.url, audioFile.id);
}
