import React, { useEffect, useRef, useState } from 'react'
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react'

import PageHeader from '../../components/PageHeader'
import { Card, Badge } from '../../components/ui'
import WebcamCapture from '../../components/WebcamCapture'
import { useAuth } from '../../context/AuthContext'
import { openAttendanceSocket } from '../../api/faceClient'

const FRAME_INTERVAL_MS = 800

export default function LiveAttendance() {
  const { user } = useAuth()

  const camRef = useRef(null)
  const wsRef = useRef(null)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('Waiting to start…')
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(false)

  // Current recognition result
  const [recognizedStudent, setRecognizedStudent] = useState(null)

  // --------------------------------------------------
  // CLEAR FRAME TIMER
  // --------------------------------------------------

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // --------------------------------------------------
  // STOP SCANNING
  // --------------------------------------------------

  const stopLoop = () => {
    clearTimer()

    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {
        // Ignore already closed socket
      }

      wsRef.current = null
    }

    if (mountedRef.current) {
      setRunning(false)
    }
  }

  // --------------------------------------------------
  // START SCANNING
  // --------------------------------------------------

  const startLoop = () => {
    if (!user?.orgId) {
      setStatus('error')
      setMessage('Organization information is missing.')
      return
    }

    // Clean up previous connection
    clearTimer()

    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {
        // Ignore
      }

      wsRef.current = null
    }

    setRunning(true)
    setStatus('scanning')
    setMessage('Connecting…')
    setRecognizedStudent(null)

    const ws = openAttendanceSocket(user.orgId)

    wsRef.current = ws

    // --------------------------------------------------
    // SOCKET OPEN
    // --------------------------------------------------

    ws.onopen = () => {
      if (!mountedRef.current) return

      setStatus('scanning')
      setMessage('Scanning… hold a face in frame')

      clearTimer()

      intervalRef.current = setInterval(async () => {
        try {
          const blob = await camRef.current?.captureBlob()

          if (
            blob &&
            ws.readyState === WebSocket.OPEN &&
            mountedRef.current
          ) {
            const buffer = await blob.arrayBuffer()

            ws.send(buffer)
          }
        } catch (error) {
          console.error(
            '[LiveAttendance] Frame capture error:',
            error
          )
        }
      }, FRAME_INTERVAL_MS)
    }

    // --------------------------------------------------
    // SOCKET MESSAGE
    // --------------------------------------------------

    ws.onmessage = (event) => {
      if (!mountedRef.current) return

      let result

      try {
        result = JSON.parse(event.data)
      } catch (error) {
        console.error(
          '[LiveAttendance] Invalid WebSocket response:',
          event.data
        )

        return
      }

      console.log(
        '[LiveAttendance] Backend result:',
        result
      )

      // ------------------------------------------------
      // ALWAYS STORE THE CURRENT RESULT
      // ------------------------------------------------

      setRecognizedStudent({
        student_name: result.student_name ?? null,

        student_id:
          result.student_id ??
          result.studentId ??
          result.roll_number ??
          result.rollNumber ??
          null,

        similarity:
          typeof result.similarity === 'number'
            ? result.similarity
            : null,

        subject:
          result.subject ??
          result.subjectName ??
          null,

        status: result.status ?? 'unknown',
      })

      // ------------------------------------------------
      // SUCCESS
      // ------------------------------------------------

      if (result.status === 'success') {
        setStatus('success')

        const studentName =
          result.student_name || 'Student'

        setMessage(
          result.message ||
            `Attendance marked for ${studentName}`
        )

        // Add successful attendance to recent marks
        setLog((currentLog) => {
          const entry = {
            ...result,
            time: new Date(),
          }

          return [entry, ...currentLog].slice(0, 15)
        })

        // Stop scanning after successful attendance
        stopLoop()

        return
      }

      // ------------------------------------------------
      // VOTING / CONFIRMING
      // ------------------------------------------------

      if (result.status === 'voting') {
        setStatus('scanning')

        setMessage(
          result.message ||
            'Confirming face match…'
        )

        // IMPORTANT:
        // Keep scanning during voting.
        return
      }

      // ------------------------------------------------
      // FAIL / NOT RECOGNIZED
      // ------------------------------------------------

      if (result.status === 'fail') {
        setStatus('fail')

        setMessage(
          result.message ||
            'Face not recognized.'
        )

        // IMPORTANT:
        // Stop immediately after a final failed result.
        // This prevents sending frames continuously.
        stopLoop()

        return
      }

      // ------------------------------------------------
      // BACKEND ERROR
      // ------------------------------------------------

      if (result.status === 'error') {
        setStatus('error')

        setMessage(
          result.message ||
            'Face service error.'
        )

        stopLoop()

        return
      }

      // ------------------------------------------------
      // UNKNOWN RESPONSE
      // ------------------------------------------------

      setStatus('error')

      setMessage(
        result.message ||
          'Unknown response from face service.'
      )

      stopLoop()
    }

    // --------------------------------------------------
    // SOCKET ERROR
    // --------------------------------------------------

    ws.onerror = (error) => {
      console.error(
        '[LiveAttendance] WebSocket error:',
        error
      )

      if (!mountedRef.current) return

      setStatus('error')

      setMessage(
        'Connection error — is the FastAPI face service running on :8000?'
      )

      clearTimer()
      setRunning(false)
    }

    // --------------------------------------------------
    // SOCKET CLOSE
    // --------------------------------------------------

    ws.onclose = () => {
      clearTimer()

      if (!mountedRef.current) return

      setRunning(false)
    }
  }

  // --------------------------------------------------
  // RESTART / SCAN NEXT STUDENT
  // --------------------------------------------------

  const restart = () => {
    stopLoop()

    setRecognizedStudent(null)

    setStatus('scanning')
    setMessage('Starting camera scan…')

    setTimeout(() => {
      if (mountedRef.current) {
        startLoop()
      }
    }, 300)
  }

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      clearTimer()

      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch {
          // Ignore
        }
      }

      wsRef.current = null
    }
  }, [])

  // --------------------------------------------------
  // STATUS UI
  // --------------------------------------------------

  const statusTone = {
    idle: 'default',
    scanning: 'cyan',
    success: 'volt',
    fail: 'warn',
    error: 'danger',
  }[status]

  const StatusIcon = {
    idle: Radio,
    scanning: Loader2,
    success: CheckCircle2,
    fail: AlertTriangle,
    error: AlertTriangle,
  }[status]

  const similarityPercent =
    recognizedStudent?.similarity != null
      ? Math.round(
          recognizedStudent.similarity * 100
        )
      : null

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <PageHeader
        title="Live Attendance"
        subtitle="Point the camera at the class — matches mark attendance automatically"
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">

        {/* ============================================
            CAMERA
        ============================================ */}

        <Card className="p-0 overflow-hidden">

          <WebcamCapture
            ref={camRef}
            active={true}
            className="aspect-video w-full rounded-none border-0"
          />

          <div className="p-5 flex items-center justify-between border-t border-edge">

            <div className="flex items-center gap-2.5 min-w-0">

              <StatusIcon
                className={`h-4 w-4 shrink-0 ${
                  status === 'scanning'
                    ? 'animate-spin'
                    : ''
                } ${
                  status === 'success'
                    ? 'text-volt'
                    : status === 'error' ||
                      status === 'fail'
                    ? 'text-warn'
                    : 'text-white/40'
                }`}
              />

              <span className="text-sm text-white/70 truncate">
                {message}
              </span>

            </div>

            {!running ? (
              <button
                onClick={startLoop}
                className="ml-4 shrink-0 bg-volt text-ink font-display font-semibold text-sm px-5 py-2 rounded-lg hover:shadow-volt transition-all"
              >
                Start scanning
              </button>
            ) : (
              <button
                onClick={stopLoop}
                className="ml-4 shrink-0 border border-edge text-white/70 font-display font-semibold text-sm px-5 py-2 rounded-lg hover:border-danger/50 hover:text-danger transition-all"
              >
                Stop
              </button>
            )}

          </div>
        </Card>

        {/* ============================================
            RIGHT PANEL
        ============================================ */}

        <div className="space-y-6">

          {/* ==========================================
              CURRENT RECOGNITION
          ========================================== */}

          <Card>

            <div className="flex items-center justify-between mb-4">

              <p className="font-display font-semibold">
                Current recognition
              </p>

              {recognizedStudent ? (
                <Badge
                  tone={
                    recognizedStudent.status === 'success'
                      ? 'volt'
                      : recognizedStudent.status === 'fail'
                      ? 'warn'
                      : 'cyan'
                  }
                >
                  {recognizedStudent.status === 'success'
                    ? 'Recognized'
                    : recognizedStudent.status === 'fail'
                    ? 'Not recognized'
                    : 'Scanning'}
                </Badge>
              ) : (
                <Badge tone="default">
                  Waiting
                </Badge>
              )}

            </div>

            {/* ========================================
                NOTHING YET
            ======================================== */}

            {!recognizedStudent ? (

              <div className="flex flex-col items-center justify-center py-8 text-center">

                <Radio className="h-8 w-8 text-white/20 mb-3" />

                <p className="text-sm text-white/50">
                  No student recognized yet
                </p>

                <p className="text-xs text-white/25 mt-1">
                  Start scanning and hold a face in frame
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {/* ======================================
                    PERSON ICON + NAME
                ====================================== */}

                <div className="flex items-center gap-3">

                  <div
                    className={`h-11 w-11 rounded-full flex items-center justify-center ${
                      recognizedStudent.status === 'success'
                        ? 'bg-volt/10 border border-volt/20'
                        : recognizedStudent.status === 'fail'
                        ? 'bg-yellow-500/10 border border-yellow-500/20'
                        : 'bg-white/5 border border-edge'
                    }`}
                  >

                    {recognizedStudent.status === 'success' ? (
                      <UserCheck className="h-5 w-5 text-volt" />
                    ) : recognizedStudent.status === 'fail' ? (
                      <UserX className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <Loader2 className="h-5 w-5 text-white/40 animate-spin" />
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="text-base text-white font-semibold truncate">

                      {recognizedStudent.student_name ||
                        (recognizedStudent.status === 'fail'
                          ? 'Unknown / No match'
                          : 'Processing...')}

                    </p>

                    {recognizedStudent.student_id && (
                      <p className="text-xs text-white/35 font-mono mt-0.5">
                        {recognizedStudent.student_id}
                      </p>
                    )}

                  </div>

                </div>

                {/* ======================================
                    SIMILARITY + STATUS
                ====================================== */}

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-lg border border-edge bg-white/[0.02] p-3">

                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-mono">
                      Similarity
                    </p>

                    <p className="text-lg text-white font-semibold mt-1">

                      {similarityPercent != null
                        ? `${similarityPercent}%`
                        : '—'}

                    </p>

                  </div>

                  <div className="rounded-lg border border-edge bg-white/[0.02] p-3">

                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-mono">
                      Status
                    </p>

                    <p className="text-sm text-white font-semibold mt-2 capitalize">
                      {recognizedStudent.status || '—'}
                    </p>

                  </div>

                </div>

                {/* ======================================
                    SUBJECT
                ====================================== */}

                {recognizedStudent.subject && (
                  <div className="rounded-lg border border-edge bg-white/[0.02] p-3">

                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-mono">
                      Subject
                    </p>

                    <p className="text-sm text-white mt-1">
                      {recognizedStudent.subject}
                    </p>

                  </div>
                )}

                {/* ======================================
                    SUCCESS MESSAGE
                ====================================== */}

                {status === 'success' && (
                  <div className="flex items-center gap-2 rounded-lg border border-volt/20 bg-volt/5 p-3">

                    <CheckCircle2 className="h-4 w-4 text-volt shrink-0" />

                    <p className="text-xs text-white/70">
                      Attendance marked successfully.
                    </p>

                  </div>
                )}

                {/* ======================================
                    FAILED RECOGNITION
                ====================================== */}

                {status === 'fail' && (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">

                    <UserX className="h-4 w-4 text-yellow-400 shrink-0" />

                    <p className="text-xs text-white/70">
                      {message}
                    </p>

                  </div>
                )}

                {/* ======================================
                    SCANNING / VOTING
                ====================================== */}

                {status === 'scanning' && (
                  <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">

                    <Loader2 className="h-4 w-4 text-cyan-400 animate-spin shrink-0" />

                    <p className="text-xs text-white/70">
                      {message}
                    </p>

                  </div>
                )}

                {/* ======================================
                    ERROR
                ====================================== */}

                {status === 'error' && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">

                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />

                    <p className="text-xs text-white/70">
                      {message}
                    </p>

                  </div>
                )}

              </div>
            )}

          </Card>

          {/* ==========================================
              RECENT MARKS
          ========================================== */}

          <Card>

            <p className="font-display font-semibold mb-4">
              Recent marks
            </p>

            {log.length === 0 ? (

              <p className="text-sm text-white/30">
                No attendance marked yet this session.
              </p>

            ) : (

              <div className="space-y-3">

                {log.map((entry, index) => (

                  <div
                    key={`${entry.student_name}-${entry.time?.getTime?.() || index}`}
                    className="flex items-start justify-between border-b border-edge/60 pb-3 last:border-0 last:pb-0"
                  >

                    <div className="min-w-0">

                      <p className="text-sm text-white font-medium truncate">
                        {entry.student_name || 'Unknown student'}
                      </p>

                      <p className="text-xs text-white/35">
                        {entry.subject || 'Attendance marked'}
                      </p>

                    </div>

                    <div className="text-right ml-3 shrink-0">

                      <Badge tone="volt">
                        {Math.round(
                          (entry.similarity ?? 0) * 100
                        )}
                        %
                      </Badge>

                      <p className="text-[10px] text-white/25 mt-1 font-mono">

                        {entry.time instanceof Date
                          ? entry.time.toLocaleTimeString()
                          : ''}

                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

            <button
              onClick={restart}
              disabled={running}
              className="mt-5 w-full text-xs font-mono uppercase tracking-wider text-white/40 hover:text-volt border border-edge hover:border-volt/40 rounded-lg py-2 transition-colors disabled:opacity-40"
            >
              Scan next student
            </button>

          </Card>

        </div>
      </div>
    </>
  )
}