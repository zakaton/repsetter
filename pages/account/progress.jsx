/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useState } from "react";
import { useUser } from "../../context/user-context";
import MyLink from "../../components/MyLink";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ClientsSelect from "../../components/account/ClientsSelect";
import { useClient } from "../../context/client-context";
import ExerciseTypesSelect from "../../components/account/modal/ExerciseTypesSelect";

export default function Progress() {
  const { selectedClient } = useClient();
  const [selectedExerciseType, setSelectedExerciseType] = useState();

  return (
    <>
      <div className="space-y-6 bg-white px-4 pb-2 pt-6 sm:px-6 sm:pt-6">
        <div>
          <h3 className="inline text-lg font-medium leading-6 text-gray-900">
            Progress
          </h3>
          <ClientsSelect />
          <p className="mt-2 text-sm text-gray-500">
            View {selectedClient ? `${selectedClient.client_email}'s` : "your"}{" "}
            progress{" "}
            {selectedExerciseType ? ` doing ${selectedExerciseType.name}` : ""}
          </p>
        </div>

        <ExerciseTypesSelect
          selectedExerciseType={selectedExerciseType}
          setSelectedExerciseType={setSelectedExerciseType}
        />
      </div>
    </>
  );
}

Progress.getLayout = getAccountLayout;
