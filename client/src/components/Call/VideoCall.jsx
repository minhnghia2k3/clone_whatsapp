import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStateProvider } from "@/context/StateContext";
import Container from "./Container";
// ssr false  prevent the component from rendering on the server
// const Container = dynamic(() => import("./Container"), { ssr: false })
function VideoCall() {
  const [{ videoCall, socket, userInfo }, dispatch] = useStateProvider();
  useEffect(() => {
    if (videoCall.type === "out-going") {
      socket.current.emit("outgoing-video-call", {
        to: videoCall.id,
        from: {
          id: userInfo.id,
          profilePicture: userInfo.profilePicture,
          name: userInfo.name
        },
        callType: videoCall.videoType,
        roomId: videoCall.roomId,
      })
    }
  }, [videoCall])

  return (
    <Container data={videoCall} />
  )
}

export default VideoCall;
