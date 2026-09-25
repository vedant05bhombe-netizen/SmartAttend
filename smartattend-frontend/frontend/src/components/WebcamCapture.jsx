import React, { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

/**
 * Lightweight webcam component. Exposes captureBlob() via ref for parents
 * that need a still frame (e.g. face registration).
 */
const WebcamCapture = React.forwardRef(function WebcamCapture({ active = true, className = '' }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
      .then((stream) => {
        if (cancelled) return
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch((e) => setError(e.message))

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [active])

  React.useImperativeHandle(ref, () => ({
    captureBlob: () =>
      new Promise((resolve) => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas) return resolve(null)
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
      }),
  }))

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-panel2 border border-edge rounded-xl text-white/40 ${className}`}>
        <CameraOff className="h-8 w-8 mb-2" />
        <p className="text-xs font-mono text-center px-4">{error}</p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-edge bg-black ${className}`}>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2 py-1 rounded-md">
        <Camera className="h-3 w-3 text-volt" />
        <span className="text-[10px] font-mono text-white/70 uppercase">Live</span>
      </div>
    </div>
  )
})

export default WebcamCapture
