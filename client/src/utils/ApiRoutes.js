// function API call

export const HOST = "http://localhost:3005";

const AUTH_API = `${HOST}/api/auth`;

export const CHECK_USER_ROUTE = `${AUTH_API}/check-user`;
export const ONBOARD_USER_ROUTE = `${AUTH_API}/onboard-user`;
export const GET_ALL_CONTACTS_ROUTE = `${AUTH_API}/get-contacts`