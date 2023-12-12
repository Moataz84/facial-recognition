const video = document.querySelector("video")
const canvas = document.querySelector("canvas")
const input = document.querySelector("input")
const submit = document.querySelector(".submit")
const switchBtn = document.querySelector(".switch")

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
let mode = isMobile? "environment" : "user"
let videoTracks

if (mode === "user") video.classList.add("inverted")

navigator.mediaDevices.getUserMedia({
  audio: false, 
  video: {
    facingMode: {
      ideal: mode,
      zoom: true
    }
  }
}).then(stream => {
  videoTracks = stream.getVideoTracks()
  zoom(videoTracks)
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => {
    submit.addEventListener("click", sendData)
    switchBtn.addEventListener("click", switchMode)
    input.addEventListener("input", e => zoom(videoTracks, parseInt(e.target.value)))
    input.addEventListener("change", e => zoom(videoTracks, parseInt(e.target.value)))
  })
})

function zoom(videoTracks, factor = 1) {
  const settings = videoTracks[0].getSettings()
  if (!settings.zoom || mode === "user") return
  input.classList.remove("hidden")
  videoTracks[0].applyConstraints({
    advanced: [{zoom: factor}]
  })
}

async function switchMode() {
  submit.disabled = switchBtn.disabled = true
  videoTracks.forEach(track => track.stop())
  const newMode = mode === "environment"? "user" : "environment"
  mode = newMode

  video.classList.remove("inverted")
  if (newMode === "user") {
    video.classList.add("inverted")
    input.classList.add("hidden")
  }
  
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false, 
    video: {
      facingMode: {
        ideal: newMode,
        zoom: true
      }
    }
  })
  videoTracks = stream.getVideoTracks()
  zoom(videoTracks)
  video.srcObject = stream
  submit.disabled = switchBtn.disabled = false
}

async function sendData() {
  const msg = document.querySelector("p")

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  submit.disabled = switchBtn.disabled = true

  const dataUri = canvas.toDataURL("image/jpeg", 0.9)
  const res = await fetch("/api/send-image", {
    method: "POST",
    body: JSON.stringify({dataUri}),
    headers: {
      "Content-Type": "application/json"
    }
  })
  const { name } = await res.json()
  msg.innerText = name
  submit.disabled = switchBtn.disabled = false
}