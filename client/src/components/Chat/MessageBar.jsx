import React from "react";
import { BsEmojiSmile } from "react-icons/bs"
import { ImAttachment } from "react-icons/im";
import { MdSend } from "react-icons/md";
import { FaMicrophone } from "react-icons/fa";

function MessageBar() {
  return (
    <div className="bg-panel-header-background h-20 gap-6 px-4 flex items-center relative">
      <>
        <div className='flex gap-6'>
          <BsEmojiSmile className="text-panel-header-icon cursor-pointer text-xl" title="Emoji" />
          <ImAttachment className="text-panel-header-icon cursor-pointer text-xl" title="Attach File" />
        </div>
        <div className="w-full h-10 rounded-lg flex items-center">
          <input type="text" placeholder="Type a message" className="bg-input-background w-full text-sm focus:outline-none text-white h-10 rounded-lg px-5 py-4" />
        </div>
        <div className="flex w-10 items-center justify-center ">
          <MdSend className="text-panel-header-icon cursor-pointer text-xl" title="Send message" />
          {/* <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record" /> */}
        </div>
      </>
    </div>
  )
}

export default MessageBar;
