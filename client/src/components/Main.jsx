import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { onAuthStateChanged } from "firebase/auth";
import Chat from "./Chat/Chat";
import { io } from "socket.io-client";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";

function Main() {
  // Handle user side effect
  const router = useRouter();
  const socket = useRef();
  const [{ userInfo, currentChatUser, messagesSearch, videoCall, voiceCall, incomingVoiceCall, incomingVideoCall }, dispatch] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [socketEvent, setSocketEvent] = useState(false);

  useEffect(() => {
    if (redirectLogin) router.push("/login")
  }, [redirectLogin])

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.get(`${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`)
      dispatch({
        type: reducerCases.SET_MESSAGES,
        messages: data.messages
      })
    }
    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser])

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST)
      socket.current.emit("add-user", userInfo.id)
      dispatch({ type: reducerCases.SET_SOCKET, socket })
    }
  }, [userInfo])

  // Handle socket events
  useEffect(() => {
    // when socket is ready and socketEvent is false

    if (socket.current && !socketEvent) {
      socket.current.on("receive-msg", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...data.message
          }
        })
      })

      socket.current.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType }
        })
      })

      socket.current.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType }
        })
      })

      socket.current.on("voice-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL
        })
      })

      socket.current.on("video-call-rejected", () => {
        dispatch({
          type: reducerCases.END_CALL
        })
      })

      socket.current.on("online-users", ({ onlineUsers }) => {
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers
        })
      })
      setSocketEvent(true)
    }
  }, [socket.current])

  // Hook from firebase auth
  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) {
      return setRedirectLogin(true);
    }
    if (!userInfo && currentUser?.email) {
      const { data } = await axios.post(CHECK_USER_ROUTE, { email: currentUser.email })

      if (!data.status) {
        return setRedirectLogin(true);
      } else {
        const { id, name, email, profilePicture: profilePicture, about } = data.data

        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id, name, email, profilePicture, about
          }
        })
      }

    }
  })

  return (
    <>
      {
        incomingVideoCall && <IncomingVideoCall />
      }
      {
        incomingVoiceCall && <IncomingCall />
      }
      {
        videoCall && (
          <div className="h-screen w-screen max-h-full overflow-hidden">
            <VideoCall />
          </div>
        )
      }

      {
        voiceCall && (
          <div className="h-screen w-screen max-h-full overflow-hidden">
            <VoiceCall />
          </div>
        )
      }
      {
        !videoCall && !voiceCall && (
          <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden ">
            <ChatList />
            {
              currentChatUser
                ?
                <div className={messagesSearch ? "grid grid-cols-2" : ""}>
                  <Chat />
                  {
                    messagesSearch && <SearchMessages />
                  }
                </div>
                :
                <Empty />
            }
          </div>
        )
      }
    </>
  )


}

export default Main;
