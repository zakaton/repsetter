import "../styles/index.css";
import { UserContextProvider } from "../context/user-context";
import { OnlineContextProvider } from "../context/online-context";
import { ClientContextProvider } from "../context/client-context";
import { ExerciseVideoContextProvider } from "../context/exercise-videos-context";
import { SelectedExerciseTypeContextProvider } from "../context/selected-exercise-context";
import { ProgressContextProvider } from "../context/progress-context";
import { CoachPicturesContextProvider } from "../context/coach-picture-context";
import { PicturesContextProvider } from "../context/picture-context";
import { ExerciseTypesContextProvider } from "../context/exercise-types-context";
import Layout from "../components/layouts/Layout";
import { useEffect } from "react";
import { isIOS } from "react-device-detect";

function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page);

  const updateManifest = async () => {
    const manifestElement = document.querySelector("link[rel='manifest']");
    if (manifestElement) {
      manifestElement.href = isIOS ? "manifest-ios.json" : "manifest.json";
    }
  };
  useEffect(() => {
    updateManifest();
  }, [isIOS]);
  return (
    <OnlineContextProvider>
      <UserContextProvider>
        <ExerciseTypesContextProvider>
          <ExerciseVideoContextProvider>
            <ClientContextProvider>
              <SelectedExerciseTypeContextProvider>
                <ProgressContextProvider>
                  <CoachPicturesContextProvider>
                    <PicturesContextProvider>
                      <Layout>{getLayout(<Component {...pageProps} />)}</Layout>
                    </PicturesContextProvider>
                  </CoachPicturesContextProvider>
                </ProgressContextProvider>
              </SelectedExerciseTypeContextProvider>
            </ClientContextProvider>
          </ExerciseVideoContextProvider>
        </ExerciseTypesContextProvider>
      </UserContextProvider>
    </OnlineContextProvider>
  );
}

export default MyApp;
