const video = document.querySelector("video")
const canvas = document.querySelector("canvas")
const input = document.querySelector("input")
const button = document.querySelector("button")

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

if (!isMobile) {
  video.classList.add("non-mobile")
  input.classList.add("non-mobile")
}

navigator.mediaDevices.getUserMedia({
  audio: false, 
  video: {
    facingMode: {
      exact: isMobile? "environment" : "user",
      zoom: true
    }
  }
}).then(stream => {
  const videoTracks = stream.getVideoTracks()
  console.log(videoTracks[0].getSettings())
  zoom(videoTracks)
  video.srcObject = stream
  video.addEventListener("loadedmetadata", () => button.addEventListener("click", sendData))
  input.addEventListener("input", e => zoom(videoTracks, parseInt(e.target.value)))
  input.addEventListener("change", e => zoom(videoTracks, parseInt(e.target.value)))
})

function zoom(videoTracks, factor = 2) {
  const settings = videoTracks[0].getSettings()
  if (!settings.zoom) return
  videoTracks[0].applyConstraints({
    advanced: [{zoom: factor}]
  })
}

async function sendData() {
  const msg = document.querySelector("p")

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
  button.disabled = true

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
  button.disabled = false
}