// function API call

export const HOST = "http://localhost:3005";

const AUTH_API = `${HOST}/api/auth`;
const MESSAGES_API = `${HOST}/api/messages`;

export const CHECK_USER_ROUTE = `${AUTH_API}/check-user`;
export const ONBOARD_USER_ROUTE = `${AUTH_API}/onboard-user`;
export const GET_ALL_CONTACTS_ROUTE = `${AUTH_API}/get-contacts`


export const ADD_MESSAGE_ROUTE = `${MESSAGES_API}/add-message`
export const GET_MESSAGES_ROUTE = `${MESSAGES_API}/get-messages`