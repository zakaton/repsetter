import "../styles/index.css";
import { UserContextProvider } from "../context/user-context";
import { OnlineContextProvider } from "../context/online-context";
import { ClientContextProvider } from "../context/client-context";
import { ExerciseVideoContextProvider } from "../context/exercise-videos-context";
import { SelectedExerciseTypeContextProvider } from "../context/selected-exercise-context";
import { ProgressContextProvider } from "../context/progress-context";
import Layout from "../components/layouts/Layout";

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);
  return (
    <OnlineContextProvider>
      <UserContextProvider>
        <ExerciseVideoContextProvider>
          <ClientContextProvider>
            <SelectedExerciseTypeContextProvider>
              <ProgressContextProvider>
                <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
              </ProgressContextProvider>
            </SelectedExerciseTypeContextProvider>
          </ClientContextProvider>
        </ExerciseVideoContextProvider>
      </UserContextProvider>
    </OnlineContextProvider>
  );
}

export default MyApp;
