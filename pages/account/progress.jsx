/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useEffect, useState } from "react";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ClientsSelect from "../../components/account/ClientsSelect";
import { useClient } from "../../context/client-context";
import { useUser } from "../../context/user-context";
import ExerciseTypesSelect from "../../components/account/modal/ExerciseTypesSelect";
import Filters from "../../components/Filters";
import { useSelectedExerciseType } from "../../context/selected-exercise-context";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { supabase } from "../../utils/supabase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const filterTypes = [
  {
    name: "Type",
    query: "type",
    column: "type",
    checkboxes: [
      {
        value: "top set",
        label: "Top Set",
      },
      {
        value: "number of sets",
        label: "Number of Sets",
      },
      {
        value: "number of reps",
        label: "Number of Reps",
      },
      {
        value: "difficulty",
        label: "Difficulty",
      },
    ],
  },
  {
    name: "Date Range",
    query: "date-range",
    column: "date-range",
    options: [
      {
        value: "past week",
        label: "Past Week",
      },
      {
        value: "past month",
        label: "Past Month",
      },
      {
        value: "past 6 months",
        label: "Past 6 Months",
      },
      {
        value: "past year",
        label: "Past Year",
      },
    ],
  },
];
const orderTypes = [
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: ["date", { ascending: true }],
    current: false,
  },
];

export default function Progress() {
  const { selectedClient } = useClient();
  const { user } = useUser();

  const {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  } = useSelectedExerciseType();

  const [filters, setFilters] = useState({ "date-range": "past month" });
  const [containsFilters, setContainsFilters] = useState({ type: ["top set"] });
  const [order, setOrder] = useState(orderTypes[0].value);

  const [baseFilter, setBaseFilter] = useState({});
  useEffect(() => {
    const newBaseFilter = {};

    if (selectedClient) {
      newBaseFilter.client = selectedClient.client;
      newBaseFilter.coach = user.id;
    } else {
      newBaseFilter.client = user.id;
    }

    if (selectedExerciseType) {
      newBaseFilter["type.name"] = selectedExerciseType.name;
    }
    console.log("newBaseFilter", newBaseFilter);
    setBaseFilter(newBaseFilter);
  }, [selectedClient, user, selectedExerciseType]);

  const getFromDate = () => {
    let date = new Date();
    switch (filters["date-range"]) {
      case "past week":
        date.setUTCDate(date.getUTCDate() - 7);
        break;
      case "past month":
        date.setUTCMonth(date.getUTCMonth() - 1);
        break;
      case "past 6 months":
        date.setUTCMonth(date.getUTCMonth() - 6);
        break;
      case "past year":
        date.setUTCFullYear(date.getUTCFullYear() - 1);
        break;
    }
    return date;
  };

  const [exercises, setExercises] = useState();
  const [isGettingExercises, setIsGettingExercises] = useState(false);
  const getExercises = async (refresh) => {
    if (!exercises || refresh) {
      if (isGettingExercises) {
        return;
      }
      setIsGettingExercises(true);

      console.log("getting exercises with filters", baseFilter, filters);

      const fromDate = getFromDate();
      const { data: exercises, error } = await supabase
        .from("exercise")
        .select("*, type!inner(*)")
        .match(baseFilter)
        .gte("date", fromDate.toDateString())
        .order("date", { ascending: true });
      if (error) {
        console.error(error);
      } else {
        console.log("exercises", exercises);
        setExercises(exercises);
      }

      setIsGettingExercises(false);
    }
  };

  useEffect(() => {
    if ("type.name" in baseFilter && "client" in baseFilter) {
      getExercises(true);
    }
  }, [baseFilter, filters]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Dataset 1",
        data: labels.map(() => Math.random() * 100),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Dataset 2",
        data: labels.map(() => Math.random() * 100),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <>
      <div className="bg-white px-4 pb-2 pt-6 sm:px-6 sm:pt-6">
        <div className="pb-4">
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

        <Filters
          filters={filters}
          setFilters={setFilters}
          containsFilters={containsFilters}
          setContainsFilters={setContainsFilters}
          order={order}
          setOrder={setOrder}
          filterTypes={filterTypes}
          orderTypes={orderTypes}
          showSort={false}
        >
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            selectedExerciseTypeName={selectedExerciseTypeName}
            setSelectedExerciseTypeName={setSelectedExerciseTypeName}
          />
          <div>
            <label
              htmlFor="date-range"
              className="block text-sm font-medium text-gray-700"
            >
              Date Range
            </label>
          </div>
        </Filters>

        <div className="border-t border-gray-200 pt-2">
          <div className="">
            <Line options={options} data={data} />
          </div>
        </div>
      </div>
    </>
  );
}

Progress.getLayout = getAccountLayout;
