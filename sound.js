const WIDTH = 1500
const HEIGHT = 1500
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = WIDTH
canvas.height = HEIGHT
let analyser
let bufferLength

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(e => console.log('You need to allow permission to the microphone'))
  const audioCtx = new AudioContext()
  analyser = audioCtx.createAnalyser()
  const src = audioCtx.createMediaStreamSource(stream)
  src.connect(analyser)

  analyser.fftSize = 2 ** 10

  bufferLength = analyser.frequencyBinCount
  const timeData = new Uint8Array(bufferLength)
  const frequencyData = new Uint8Array(bufferLength)
  drawTimeData(timeData)
  drawFrequencyData(frequencyData)
}

function drawTimeData(timeData) {
  analyser.getByteTimeDomainData(timeData)

  ctx.clearRect(0, 0, WIDTH, HEIGHT)

  ctx.lineWidth = 10
  ctx.strokeStyle = '#ff5555'
  ctx.beginPath()
  const sliceWidth = WIDTH / bufferLength
  let x = 0
  timeData.forEach((data, i) => {
    const v = data / 128
    const y = (v * HEIGHT) / 2
    if (i == 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }

    x += sliceWidth
  })

  ctx.stroke()

  requestAnimationFrame(() => drawTimeData(timeData))
}

function drawFrequencyData(frequencyData) {
  analyser.getByteFrequencyData(frequencyData)
  const barWidth = WIDTH / bufferLength * 2.5

  let x = 0
  frequencyData.forEach(amount => {
    const percent = amount / 255
    const barHeight = HEIGHT/2 * percent
    ctx.fillStyle = '#ff5555'
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)
    x += barWidth + 1 
  })


  requestAnimationFrame(() => drawFrequencyData(frequencyData))
}

getAudio()
