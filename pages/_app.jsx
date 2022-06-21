import "../styles/index.css";
import { UserContextProvider } from "../context/user-context";
import { OnlineContextProvider } from "../context/online-context";
import { ClientContextProvider } from "../context/client-context";
import Layout from "../components/layouts/Layout";

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <OnlineContextProvider>
      <UserContextProvider>
        <ClientContextProvider>
          <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
        </ClientContextProvider>
      </UserContextProvider>
    </OnlineContextProvider>
  );
}

export default MyApp;
