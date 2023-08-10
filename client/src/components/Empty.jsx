import Image from "next/image";
import React from "react";

function Empty() {
  return (
    <div className="border-conversation-border border-l border-b-icon-green border-b-4 w-full max-h-screen bg-panel-header-background flex flex-col items-center justify-center">
      <Image src='/whatsapp.gif' alt='whatsapp' width={300} height={300} />
    </div>
  )
}

export default Empty;
