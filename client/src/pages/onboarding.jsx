import Avatar from "@/components/common/Avatar";
import Input from "@/components/common/Input";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import React, { useState } from "react";
import { ONBOARD_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";
import { useEffect } from "react";
import axios from "axios";

function onboarding() {
  const router = useRouter();

  const [{ userInfo, newUser }, dispatch] = useStateProvider(); // get the user info from the context
  const [name, setName] = useState(userInfo?.name || "")
  const [about, setAbout] = useState("")
  const [image, setImage] = useState("/default_avatar.png")

  // Protect the router => if the user is not logged in, redirect to login page
  useEffect(() => {
    if (!newUser && !userInfo?.email) router.push("/login")
    else if (!newUser && userInfo?.email) router.push("/")
  }, [newUser, userInfo, router])

  const onBoardUserHandler = async () => {
    if (validateDetails()) {
      const email = userInfo?.email
      try {
        const { data } = await axios.post(ONBOARD_USER_ROUTE, { email, name, about, image })
        if (data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profileImage: image,
              status: about
            }
          });
          router.push("/")
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const validateDetails = () => {
    if (name < 3) {
      return false
    }
    return true

  }

  return (
    <div className='flex flex-col items-center justify-center h-screen w-screen text-white bg-panel-header-background gap-2'>
      <div className="flex items-center justify-center">
        <Image src='/whatsapp.gif' alt='Whatsapp' width={300} height={300} />
        <span className="text-white text-7xl">Whatsapp</span>
      </div>
      <h2 className="text-2xl">Create your profile</h2>
      <div className="flex gap-6 mt-6">
        <div className="flex  flex-col items-center justify-center gap-6 mt-5">
          <Input name="Display name" state={name} setState={setName} label={true} />
          <Input name="About" state={about} setState={setAbout} label={true} />
          <div className="flex items-center justify-center">
            <button className='flex justify-center items-center gap-7 bg-search-input-container-background p-5 rounded-lg' onClick={onBoardUserHandler}>
              <span className='text-white text-2xl'>Create Profile</span>
            </button>
          </div>
        </div>
        <div>
          <Avatar type="xl" image={image} setImage={setImage} />
        </div>
      </div>
    </div>
  )
}

export default onboarding;
