import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import PhotoPicker from "./PhotoPicker";
import PhotoLibrary from "./PhotoLibrary";
import CapturePhoto from "./CapturePhoto";

function Avatar({ type, image, setImage }) {
  const [hover, setHover] = useState(false)
  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false)
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({ x: 0, y: 0 })
  const [grabPhoto, setGrabPhoto] = useState(false)
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [showCapturePhoto, setShowCapturePhoto] = useState(false)

  // Convert the image to base64
  const photoPickerChange = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    const data = document.createElement("img");

    // <img src={event.target.result} data-src={event.target.result}/>
    reader.onload = function (event) {
      data.src = event.target.result;
      data.setAttribute("data-src", event.target.result);
    }
    reader.readAsDataURL(file);
    setTimeout(() => {
      // store into image state
      setImage(data.src)
    }, 100)
  }
  useEffect(() => {
    if (grabPhoto) {
      const photoPickerBtn = document.getElementById("photo-picker")
      photoPickerBtn.click()
      document.body.onfocus = (e) => {
        // setTimeout for photoPickerChange to finish
        setTimeout(() => {
          setGrabPhoto(false)
        }, 1000)
      }
    }
  }, [grabPhoto])

  const contextMenuOptions = [
    {
      name: "Take photo", callback: () => {
        setShowCapturePhoto(true)
      }
    },
    {
      name: "Choose from library", callback: () => {
        setShowPhotoLibrary(true)
      }
    },
    {
      name: "Upload photo", callback: () => {
        setGrabPhoto(true)
      }
    },
    {
      name: "Remove photo", callback: () => {
        setImage("/default_avatar.png")
      }
    },
  ]

  const showContextMenu = (e) => {
    e.preventDefault() // Prevent default browser context menu
    setIsContextMenuVisible(true)
    setContextMenuCoordinates({ x: e.pageX, y: e.pageY })
  }

  return <>
    <div className="flex items-center justify-center">
      {type === "sm" && (
        <div className="relative w-10 h-10">
          <Image src={image} alt="Avatar" className="rounded-full" fill />
        </div>
      )}
      {type === "lg" && (
        <div className="relative w-14 h-14">
          <Image src={image} alt="Avatar" className="rounded-full" fill />
        </div>
      )}
      {type === "xl" && (
        <div className="relative cursor-pointer"
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <div
            className={`bg-photopicker-overlay-background absolute top-0 left-0 w-60 h-60 flex items-center justify-center flex-col rounded-full text-center gap-2
            ${hover ? "visible" : "hidden"} z-10`}
            onClick={e => showContextMenu(e)}
            id="context-opener">
            <FaCamera className="text-2xl" onClick={e => showContextMenu(e)} />
          </div>
          <div className="w-60 h-60 ">
            <Image src={image} alt="Avatar" className="rounded-full" fill />
          </div>
        </div>
      )}
    </div >
    {isContextMenuVisible && (
      <ContextMenu
        options={contextMenuOptions}
        coordinates={contextMenuCoordinates}
        contextMenu={isContextMenuVisible}
        setContextMenu={setIsContextMenuVisible} />
    )}
    {showPhotoLibrary && (
      <PhotoLibrary setImage={setImage} hidePhotoLibrary={setShowPhotoLibrary} />
    )}
    {grabPhoto && (
      <PhotoPicker onChange={photoPickerChange} />
    )}
    {showCapturePhoto && (
      <CapturePhoto setImage={setImage} showCapturePhoto={setShowCapturePhoto} />
    )}
  </>;
}

export default Avatar;
