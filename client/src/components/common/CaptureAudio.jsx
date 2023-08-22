import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPause, FaPauseCircle, FaPlay, FaTrash } from "react-icons/fa";
import { MdSend } from "react-icons/md";
import WaveSurfer from "wavesurfer.js";
import { ADD_AUDIO_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
function CaptureAudio({ setShowAudioRecorder }) {

  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [renderedAudio, setRenderedAudio] = useState(null);

  const audioRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const waveformRef = useRef(null)


  // increase time when recording
  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1)
          return prevDuration + 1
        })
      }, 1000)
    }

    // when unmount
    return () => {
      clearInterval(interval)
    }
  }, [isRecording])

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#4a9aff",
      cursorColor: "7ae3c3",
      barWidth: 2,
      height: 30,
      responsive: true
    })
    setWaveform(wavesurfer)

    // when playing is finish
    wavesurfer.on("finish", () => {
      setIsPlaying(false)
    })

    return () => {
      wavesurfer.destroy()
    }
  }, [])

  useEffect(() => {
    if (waveform) handleStartRecording();
  }, [waveform])


  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    setRecordedAudio(null);

    // get user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        // assign stream to audioRef
        audioRef.current.srcObject = stream;

        const chunks = []

        // ondataavailable event fired when recorder has data to send
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
          const audioURL = URL.createObjectURL(blob)
          const audio = new Audio(audioURL)
          setRecordedAudio(audio)

          waveform.load(audioURL)
        }

        mediaRecorder.start();
      }).catch((error) => {
        console.log("Error accessing microphone: ", error);
      })
  }

  const handleStopRecording = () => {
    // if mediaRecorderRef.current is not null and isRecording is true
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      waveform.stop();

      const audioChunks = []
      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        audioChunks.push(e.data)
      })

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        const audioFile = new File([audioBlob], "recording.mp3");
        setRenderedAudio(audioFile);
      })

    }
  }


  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime)
      }
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime)
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime)
      }
    }

  }, [recordedAudio])

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  }
  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio.pause();
    setIsPlaying(false);
  }


  const sendRecording = async () => {
    try {
      let formData = new FormData();
      formData.append("audio", renderedAudio); // append into existing formData
      // post data with Multipart form data
      const response = await axios.post(ADD_AUDIO_MESSAGE_ROUTE, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        params: {
          from: userInfo?.id,
          to: currentChatUser?.id
        }
      })

      if (response.status === 201) {
        socket.current.emit("send-msg", {
          message: response.data.message,
          to: currentChatUser?.id,
          from: userInfo?.id
        })

        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...response.data.message
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex justify-end items-center text-2xl w-full">
      <div className="pt-1">
        <FaTrash className="text-panel-header-icon"
          onClick={() => setShowAudioRecorder(false)} />
      </div>
      <div className="mx-4 px-4 py-2 text-white text-lg flex justify-center items-center gap-3 bg-search-input-container-background rounded-full drop-shadow-lg">
        {
          isRecording
            ?
            (
              <div className="text-red-500 animate-pulse 2-60 text-center">
                Recording <span>{recordingDuration}</span>
              </div>
            )
            :
            (
              <div>
                {recordedAudio && (
                  <>
                    {!isPlaying ? (<FaPlay onClick={handlePlayRecording} />) : (<FaPause onClick={handlePauseRecording} />)}
                  </>
                )}
              </div>
            )
        }
        <div className="w-60" ref={waveformRef} hidden={isRecording} />
        {
          recordedAudio && isPlaying && (<span>{formatTime(currentPlaybackTime)}</span>)
        }
        {
          recordedAudio && !isPlaying && (<span>{formatTime(totalDuration)}</span>)
        }
        <audio ref={audioRef} hidden />

        <div className="mr-4">
          {!isRecording
            ?
            <FaMicrophone className="text-red-500" onClick={handleStartRecording} />
            :
            <FaPauseCircle className="text-red-500" onClick={handleStopRecording} />
          }
        </div>
        <div>
          <MdSend
            className="text-panel-header-icon cursor-pointer mr-4"
            title="Send"
            onClick={sendRecording}
          />
        </div>
      </div>
    </div >
  )
}

export default CaptureAudio;
