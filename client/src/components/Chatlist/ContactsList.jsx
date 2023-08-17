import React, { useEffect, useState } from "react";
import { GET_ALL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import { BiArrowBack, BiSearchAlt2 } from "react-icons/bi";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import ChatLIstItem from "./ChatLIstItem";

function ContactsList() {
  const [allContacts, setAllContacts] = useState([]);
  const [searchContacts, setSearchContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [{ }, dispatch] = useStateProvider();
  useEffect(() => {

    if (searchTerm.length) {
      const filteredData = {};
      // get all the keys of allContacts, example: Array ['A', 'B', 'C']
      Object.keys(allContacts).forEach(key => {
        filteredData[key] = allContacts[key].filter(obj => obj.name.toLowerCase().includes(searchTerm.toLowerCase()))
      })
      setSearchContacts(filteredData)
    } else {
      setSearchContacts(allContacts)
    }
  }, [searchTerm])
  useEffect(() => {
    const getContacts = async () => {
      try {
        const { data: { users } } = await axios.get(GET_ALL_CONTACTS_ROUTE)
        setAllContacts(users)
        setSearchContacts(users)
      } catch (err) {
        console.log(err)
      }
    }
    getContacts();
  }, [])
  return (
    <div className="h-full flex flex-col">
      <div className="h-24 flex items-end px-3 py-4">
        <div className="flex items-center text-white gap-12">
          <BiArrowBack className="cursor-pointer text-xl" onClick={() => dispatch({ type: reducerCases.SET_ALL_CONTACTS_PAGE })} />
          <span>New chat</span>
        </div>
      </div>
      <div className="bg-search-input-container-background flex-auto h-full overflow-auto custom-scrollbar">
        <div className="flex py-3 items-center gap-3 h-14">
          <div className="bg-panel-header-background flex flex-grow items-center gap-5 px-3 py-1 mx-4 rounded-lg">
            <div>
              <BiSearchAlt2 className='text-panel-header-icon cursor-pointer text-lg' />
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder="Search Contacts"
                className="bg-transparent text-white w-full text-sm focus:outline-none "
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        {Object.entries(searchContacts).map(([initialLetter, userList]) => {
          return (
            <div key={Date.now() + initialLetter}>

              {searchTerm.length === 0 &&
                <div className="text-teal-light pl-10 py-5">{initialLetter}</div>
              }
              <div>
                {userList.map(contact => (
                  <ChatLIstItem
                    data={contact}
                    isContactsPage={true}
                    key={contact.id} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ContactsList;
