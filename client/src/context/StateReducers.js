import { reducerCases } from "./constants"

export const initialState = {
    // userInfo: { email, name, about, image: profilePicture } => send to server (req.body)
    userInfo: null,
    newUser: false,
}

const reducer = (state, action) => {
    switch (action.type) {
        case reducerCases.SET_USER_INFO:
            return {
                ...state,
                userInfo: action.userInfo
            }
        case reducerCases.SET_NEW_USER:
            return {
                ...state,
                newUser: action.newUser
            }
        default:
            return state
    }
}

export default reducer