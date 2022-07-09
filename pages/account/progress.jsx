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
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { supabase } from "../../utils/supabase";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale
);

const defaultDateRange = "past month";

const filterTypes = [
  {
    name: "Graph Types",
    query: "type",
    column: "type",
    requiresExercise: true,
    checkboxes: [
      {
        value: "top set",
        label: "Top Set",
        requiresExercise: true,
      },
      {
        value: "number of sets",
        label: "Number of Sets",
        requiresExercise: true,
      },
      {
        value: "number of reps",
        label: "Number of Reps",
        requiresExercise: true,
      },
      {
        value: "difficulty",
        label: "Difficulty",
        requiresExercise: true,
      },
      {
        value: "weight",
        label: "weight",
        requiresExercise: true,
      },
      {
        value: "bodyweight",
        label: "bodyweight",
      },
    ],
  },
  {
    name: "Date Range",
    query: "date-range",
    column: "date-range",
    defaultValue: defaultDateRange,
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

// FILL
const graphTypes = {
  "top set": {
    label: "Top Set",
    type: "bar",
    getData(exercises) {
      return [];
    },
  },
};

export default function Progress() {
  const { selectedClient } = useClient();
  const { user } = useUser();

  const {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  } = useSelectedExerciseType();

  const [filters, setFilters] = useState({});
  const [containsFilters, setContainsFilters] = useState({});
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
    switch (filters["date-range"] || defaultDateRange) {
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
    console.log("from date", date);
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

  const [chartOptions, setChartOptions] = useState();
  const [chartData, setChartData] = useState();

  useEffect(() => {
    if (exercises) {
      const baseDataset = {
        borderColor: "rgb(29, 78, 216)",
        backgroundColor: "rgba(29, 78, 216, 0.5)",
      };
      const newChartData = {
        _datasets: filters.type?.map((filterType) => {
          // FILL
          const { type, label, getData } = graphTypes[filterType];
          return {
            type,
            label,
            data: getData(exercises),
            ...baseDataset,
          };
        }),
        datasets: [
          {
            type: "bar",
            label: "Top Set",
            data: exercises.map((exercise) => ({
              x: exercise.date,
              y: exercise.weight_assigned.reduce(
                (max, value) => Math.max(max, value),
                0
              ),
            })),
            ...baseDataset,
          },
        ],
      };
      setChartData(newChartData);

      const newChartOptions = {
        animation: true,
        scales: {
          x: {
            type: "time",
            time: {
              unit: "day",
              unitStepSize: 1,
            },
            min: getFromDate(),
            max: new Date(),
            ticks: {
              maxTicksLimit: 20,
            },
          },
          y: {
            min: 0,
          },
        },
        responsive: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
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
      setChartOptions(newChartOptions);
    }
  }, [exercises]);

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
          filterTypes={filterTypes.map((filterType) =>
            filterType.requiresExercise && !selectedExerciseType
              ? {
                  ...filterType,
                  checkboxes: filterType.checkboxes.filter(
                    (checkbox) => !checkbox.requiresExercise
                  ),
                }
              : filterType
          )}
          orderTypes={orderTypes}
          showSort={false}
          clearFiltersListener={() => {
            setSelectedExerciseType();
            setSelectedExerciseTypeName("");
          }}
        >
          <ExerciseTypesSelect
            selectedExerciseType={selectedExerciseType}
            setSelectedExerciseType={setSelectedExerciseType}
            selectedExerciseTypeName={selectedExerciseTypeName}
            setSelectedExerciseTypeName={setSelectedExerciseTypeName}
          />
        </Filters>

        <div className="border-t border-gray-200 pt-2">
          {chartOptions && chartData && (
            <div className="">
              <Chart type="bar" data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Progress.getLayout = getAccountLayout;
