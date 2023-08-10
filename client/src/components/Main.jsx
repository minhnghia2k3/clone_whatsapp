import React, { useEffect, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import { reducerCases } from "@/context/constants";
import { onAuthStateChanged } from "firebase/auth";

function Main() {
  // Handle user side effect
  const router = useRouter();
  const [{ userInfo }, dispatch] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);

  useEffect(() => {
    if (redirectLogin) router.push("/login")
  }, [redirectLogin])

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
        const { id, name, email, profilePicture: profileImage, about } = data.data
        // console.log('data from main: ', data)`

        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id, name, email, profileImage, about
          }
        })
      }

    }
  })

  return (
    <>
      <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden ">
        <ChatList />
        <Empty />
      </div>
    </>
  )


}

export default Main;
