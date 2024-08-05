window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const infoLine = document.querySelector("#infoLine")
const rand = Math.random;
let lastSource = null
let lastCanvas = null

function play(audioBuffer) {
  if (lastSource) {
    lastSource.stop();
  }
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
  lastSource = source;
}

const initHydra = ({ makeGlobal, c }) => {
  console.log(c, makeGlobal);
  c.width = 200;
  c.height = 200;
  const hydra = new Hydra({
    canvas: c,
    detectAudio: false,
    enableStreamCapture: false,
    makeGlobal,
    autoLoop: true,
  });

  document.querySelector("#container").appendChild(c);
  return hydra;
}

const songs = [
  {
    name: "09302018",
    url: "assets/09302018.mp3"
  },
  {
    name: "10152018",
    url: "assets/10152018.mp3"
  },
  {
    name: "Blind",
    url: "assets/Blind.mp3"
  },
  {
    name: "Compassion",
    url: "assets/Compassion.mp3"
  },
  {
    name: "Cashews Poppin",
    url: "assets/Cashews Poppin.mp3"
  },
  {
    name: "Crouched One Time",
    url: "assets/Crouched One Time.mp3"
  },
  {
    name: "Deasil",
    url: "assets/Deasil.mp3"
  },
  {
    name: "Free Fall",
    url: "assets/Free Fall.mp3"
  },
  {
    name: "Get Me One",
    url: "assets/Get Me One.mp3"
  },
]


function createCanvas(n) {
  for (i = 0; i < n; i++) {
    const c = document.createElement("CANVAS")
    c.id = "Canvas_" + n
    c.songname = songs[i].name
    c.url = songs[i].url
    const h = initHydra({ c: c, makeGlobal: false })
    draw(h)
    c.addEventListener("click", () => {
      if (lastCanvas == c) {
        lastCanvas.classList.remove("selected")
        lastSource.stop()
        infoLine.innerHTML = "Nothing Playing"
        lastCanvas = null
        return;
      }
      infoLine.innerHTML = "Loading..."

      if (lastCanvas) {
        lastCanvas.classList.remove("selected")
      }
      c.classList.add("selected")
      // switch current audioContext node to be c.url
      window.fetch(c.url).then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          play(audioBuffer)
          infoLine.innerHTML = c.songname
        })

      lastCanvas = c
      // change info line to say song name

    })
  }
}

function draw(canvas) {
  c = canvas.synth;
  let c1 = rand() * 10 + 2;
  let c2 = rand() * 10 + 2;
  let c3 = rand() * 10 + 2;
  c.shape(4, [rand(), rand()].smooth(), rand())
    .mult(c.osc(rand() + 5, rand() * 0.5).modulate(c.osc(rand() + 2, rand() * 0.5).rotate(rand(), rand() * 0.5), 3))
    .color(c1, c2, c3)
    .saturate(rand())
    .luma(2, 0.1)
    .scale(1, 1)
    .diff(c.o0, 0.8)// o0
    .out(c.o0)// o1
}

createCanvas(songs.length)
