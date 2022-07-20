import "../styles/index.css";
import { UserContextProvider } from "../context/user-context";
import { OnlineContextProvider } from "../context/online-context";
import { ClientContextProvider } from "../context/client-context";
import { ExerciseVideoContextProvider } from "../context/exercise-videos-context";
import { SelectedExerciseTypeContextProvider } from "../context/selected-exercise-context";
import { ProgressContextProvider } from "../context/progress-context";
import { CoachPicturesContextProvider } from "../context/coach-picture-context";
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
                <CoachPicturesContextProvider>
                  <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
                </CoachPicturesContextProvider>
              </ProgressContextProvider>
            </SelectedExerciseTypeContextProvider>
          </ClientContextProvider>
        </ExerciseVideoContextProvider>
      </UserContextProvider>
    </OnlineContextProvider>
  );
}

export default MyApp;
