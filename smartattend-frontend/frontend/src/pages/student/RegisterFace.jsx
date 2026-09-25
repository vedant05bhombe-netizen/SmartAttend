import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ScanFace, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/PageHeader'
import { Card, Button, Loader } from '../../components/ui'
import WebcamCapture from '../../components/WebcamCapture'
import * as api from '../../api/endpoints'
import { errMsg } from '../../api/client'
import { registerFace } from '../../api/faceClient'

export default function RegisterFace() {
  const camRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [capturing, setCapturing] = useState(false)

  const loadProfile = () => api.getMyProfile().then(setProfile).catch((err) => toast.error(errMsg(err))).finally(() => setLoading(false))

  useEffect(() => { loadProfile() }, [])

  const capture = async () => {
    setCapturing(true)
    try {
      const blob = await camRef.current?.captureBlob()
      if (!blob) throw new Error('Could not capture frame')
      const res = await registerFace(profile.id, blob)
      if (res.status === 'success') {
        toast.success(res.message || 'Face registered successfully')
        loadProfile()
      } else {
        toast.error(res.message || 'Registration failed — try better lighting')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setCapturing(false)
    }
  }

  if (loading) return <Loader />

  return (
    <>
      <PageHeader title="Face ID" subtitle="This is how you'll be marked present in lectures — no roll call needed" />

      {profile?.faceRegistered && (
        <Card className="mb-6 border border-volt/30 bg-volt/5 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-volt" />
          <p className="text-sm text-white/80">Your face is already registered. Re-capture below anytime to improve accuracy.</p>
        </Card>
      )}

      <Card className="max-w-lg">
        <div className="flex items-center gap-2 mb-4">
          <ScanFace className="h-5 w-5 text-volt" />
          <p className="font-display font-semibold">Capture your face</p>
        </div>
        <WebcamCapture ref={camRef} active={true} className="aspect-video w-full mb-4" />
        <p className="text-xs text-white/40 mb-4">Look straight at the camera in good lighting. Remove masks or sunglasses.</p>
        <Button onClick={capture} loading={capturing} className="w-full">
          {profile?.faceRegistered ? 'Re-capture face' : 'Register my face'}
        </Button>
      </Card>
    </>
  )
}
