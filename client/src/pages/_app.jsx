import "@/styles/globals.css";
import { StateProvider } from "@/context/StateContext";
import Head from "next/head";
import reducer, { initialState } from "@/context/StateReducers";
export default function App({ Component, pageProps }) {
  return (
    // Wrap the entire app components inside StateProvider
    <StateProvider initialState={initialState} reducer={reducer}>
      <Head>
        <title>Whatsapp</title>
        <link rel="Whatsapp icon" href="/favicon.png" />
      </Head>
      {/* display pages & components */}
      <Component {...pageProps} />
    </StateProvider>
  )

}
