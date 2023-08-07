import { firebaseAuth } from "@/utils/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import axios from "axios";
import { CHECK_USER } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
function login() {
  const router = useRouter();
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Nested destructuring
    const {
      user: { displayName: name, email: email, photoURL: profileImage }
    } = await signInWithPopup(firebaseAuth, provider);

    // Call API => handle error with (try,catch)
    try {
      // Call API from utils/ApiRoutes.js
      if (email) {
        const { data } = await axios.post(CHECK_USER, { email })
        // console.log({ data })
        if (!data.status) {
          router.push('/onboarding')
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
