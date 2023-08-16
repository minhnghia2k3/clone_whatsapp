import React, { useEffect, useRef, useState } from "react";
import { BsEmojiSmile } from "react-icons/bs"
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { ADD_IMAGE_MESSAGE_ROUTE, ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import EmojiPicker from "emoji-picker-react";
import PhotoPicker from "../common/PhotoPicker";
import dynamic from "next/dynamic";


// dynamic import to avoid SSR error
const CaptureAudio = dynamic(() => import("../common/CaptureAudio"), { ssr: false });

function MessageBar() {
  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [grabPhoto, setGrabPhoto] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.id !== "emoji-open") {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
          setShowEmojiPicker(false)
        }
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    }
  }, [showEmojiPicker === true])

  const handleEmojiModal = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage += emoji.emoji) //example: "hello😀"
  }

  const sendMessage = async () => {
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        message, // data.message
        to: currentChatUser?.id,
        from: userInfo?.id
      })

      socket.current.emit("send-msg", {
        message: data.message,
        to: currentChatUser?.id,
        from: userInfo?.id
      })

      dispatch({
        type: reducerCases.ADD_MESSAGE,
        newMessage: {
          ...data.message
        },
        fromSelf: true
      })

      setMessage("");
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (grabPhoto) {
      const photoPicker = document.getElementById("photo-picker");
      photoPicker.click();

      // document.body.onfocus event for when user clicks outside of the photo picker
      document.body.onfocus = (e) => {
        setTimeout(() => {
          setGrabPhoto(false);
        }, 1000)
      }
    }
  }, [grabPhoto])

  const photoPickerChange = async (e) => {
    try {
      const file = e.target.files[0];
      let formData = new FormData();
      formData.append("image", file); // append into existing formData
      // post data with Multipart form data
      const response = await axios.post(ADD_IMAGE_MESSAGE_ROUTE, formData, {
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


  return (
    <div className="bg-panel-header-background h-20 gap-6 px-4 flex items-center relative">
      {!showAudioRecorder && (
        <>
          <div className='flex gap-6'>
            <BsEmojiSmile
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Emoji"
              id="emoji-open"
              onClick={handleEmojiModal} />
            {
              showEmojiPicker &&
              <div
                className="absolute bottom-16 left-24 z-[45]"
                ref={emojiPickerRef}
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
              </div>
            }
            <ImAttachment
              className="text-panel-header-icon cursor-pointer text-xl"
              title="Attach File"
              onClick={() => setGrabPhoto(true)}
            />
          </div>
          <div className="w-full h-10 rounded-lg flex items-center">
            <input
              type="text"
              placeholder="Type a message"
              className="bg-input-background w-full text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4"
              onChange={e => setMessage(e.target.value)}
              value={message} />
          </div>
          <div className="flex w-10 items-center justify-center ">
            <button>
              {message.length
                ? (
                  <MdSend
                    className="text-panel-header-icon cursor-pointer text-xl"
                    title="Send message"
                    onClick={sendMessage}
                  />
                )
                :
                (
                  <FaMicrophone
                    className="text-panel-header-icon cursor-pointer text-xl"
                    title="Record"
                    onClick={() => setShowAudioRecorder(true)}
                  />
                )
              }
            </button>
          </div>
          {grabPhoto && <PhotoPicker onChange={photoPickerChange} />}
        </>
      )}
      {showAudioRecorder && <CaptureAudio setShowAudioRecorder={setShowAudioRecorder} />}
    </div>
  )
}

export default MessageBar;
