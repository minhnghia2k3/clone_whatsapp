import React, { useState } from "react";
import { BsEmojiSmile } from "react-icons/bs"
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";
import { useStateProvider } from "@/context/StateContext";
import axios from "axios";
import { ADD_MESSAGE_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";

function MessageBar() {

  const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    try {
      const { data } = await axios.post(ADD_MESSAGE_ROUTE, {
        message, // data.message
        to: currentChatUser?.id,
        from: userInfo?.id
      })

      // socket.current.emit("send-msg", {
      //   message: data.message,
      //   to: currentChatUser?.id,
      //   from: userInfo?.id
      // })
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

      // dispatch({
      //   type: reducerCases.ADD_MESSAGE,
      //   newMessage: {
      //     ...data.message
      //   }, // [...state.messages, data.message]
      //   fromSelf: true
      // })


      setMessage("");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="bg-panel-header-background h-20 gap-6 px-4 flex items-center relative">
      <>
        <div className='flex gap-6'>
          <BsEmojiSmile className="text-panel-header-icon cursor-pointer text-xl" title="Emoji" />
          <ImAttachment className="text-panel-header-icon cursor-pointer text-xl" title="Attach File" />
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
          <MdSend
            className="text-panel-header-icon cursor-pointer text-xl"
            title="Send message"
            onClick={sendMessage} />
          {/* <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record" /> */}
        </div>
      </>
    </div>
  )
}

export default MessageBar;
