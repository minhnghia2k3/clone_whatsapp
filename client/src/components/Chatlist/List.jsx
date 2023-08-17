import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_INITIAL_CONTACTS_ROUTER } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, currentChatUser, userContacts }, dispatch] = useStateProvider();

  useEffect(() => {
    const getContacts = async () => {
      try {
        const { data: { users, onlineUsers } } = await axios.get(`${GET_INITIAL_CONTACTS_ROUTER}/${userInfo.id}`)
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers
        })
        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: users
        })

      } catch (err) {
        console.log(err)
      }
    }
    if (userInfo) getContacts()
  }, [userInfo])
  return (
    < div className="bg-search-input-container-background flex-auto over-flow-auto max-h-full custom-scrollbar" >
      {
        userContacts.map((contact) => <ChatLIstItem data={contact} key={contact.id} />)
      }
    </div >
  )
}

export default List;
