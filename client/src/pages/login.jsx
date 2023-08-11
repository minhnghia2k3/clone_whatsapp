import { firebaseAuth } from "@/utils/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React, { useEffect } from "react";
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";

function login() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider()

  useEffect(() => {
    if (!newUser && userInfo?.id) router.push("/")
  }, [userInfo, newUser])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName: name, email: email, photoURL: profilePicture }
    } = await signInWithPopup(firebaseAuth, provider);
    try {
      // Call API from utils/ApiRoutes.js
      if (email) {
        const { data } = await axios.post(CHECK_USER_ROUTE, { email })
        if (!data.status) {
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: true
          })
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: { name, email, profilePicture, about: "" }
          })

          router.push('/onboarding')
        } else if (data.status) {
          const { id, email, name, profilePicture, about } = data.data
          dispatch({
            type: reducerCases.SET_NEW_USER,
            newUser: false
          })
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: { id, name, email, profilePicture, about }
          })
          router.push("/")
        }
      }
    } catch (e) {
      console.log(e)
    }

    // console.log({ user }) // Get display name, email, and profile photo URL
  }
  return <div className='flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6'>
    <div className='flex justify-center items-center gap-2 text-white'>
      <Image src='/whatsapp.gif' alt='Whatsapp' width={300} height={300} />
      <span className='text-7xl'>Whatsapp</span>
    </div>
    <button className='flex justify-center items-center gap-7 bg-search-input-container-background p-5 rounded-lg' onClick={handleLogin}>
      <FcGoogle className='text-4xl' />
      <span className='text-white text-2xl'>Login with Google</span>
    </button>
  </div>;
}

export default login;
