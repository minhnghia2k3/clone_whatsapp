import { createContext, useReducer, useContext } from "react";

// Configuring React Context API to use global state
// React hooks: useReducer => redux store, useContext => read context from components

const StateContext = createContext();

// Higher order component which wraps the entire app
export const StateProvider = ({ children, reducer, initialState }) => (
    <StateContext.Provider value={useReducer(reducer, initialState)}>
        {children}
    </StateContext.Provider>
)

// Hook which allows to access & update global state
export const useStateProvider = () => useContext(StateContext)