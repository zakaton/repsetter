/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useEffect, useState, useRef } from "react";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import ClientsSelect from "../../components/account/ClientsSelect";
import { useClient } from "../../context/client-context";
import { useUser } from "../../context/user-context";
import ExerciseTypesSelect from "../../components/account/modal/ExerciseTypesSelect";
import Filters from "../../components/Filters";
import { useSelectedExerciseType } from "../../context/selected-exercise-context";
import { useProgress } from "../../context/progress-context";
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
  BarController,
} from "chart.js";
import { Chart, getElementAtEvent } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { supabase, dateFromDateAndTime } from "../../utils/supabase";

import {
  poundsToKilograms,
  kilogramsToPounds,
} from "../../utils/exercise-utils";
import { useRouter } from "next/router";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  TimeScale,
  BarController
);

const defaultDateRange = "past month";
const graphTypeOrder = [
  "top set",
  "number of sets",
  "number of reps",
  "difficulty",
  "bodyweight",
];
const dateRangeFilterType = {
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
};
const dateRanges = dateRangeFilterType.options.map(({ value }) => value);
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
        value: "bodyweight",
        label: "Bodyweight",
      },
    ],
  },
  {
    name: "Weight Unit",
    query: "weight-unit",
    column: "weight-unit",
    requiresTopSet: true,
    defaultValue: "lbs",
    radios: [
      { value: "lbs", label: "lbs", defaultChecked: true },
      { value: "kgs", label: "kgs" },
    ],
  },
  {
    name: "Bodyweight Unit",
    query: "bodyweight-unit",
    column: "bodyweight-unit",
    requiresBodyweight: true,
    defaultValue: "lbs",
    radios: [
      { value: "lbs", label: "lbs", defaultChecked: true },
      { value: "kgs", label: "kgs" },
    ],
  },
  dateRangeFilterType,
];
const orderTypes = [
  {
    label: "Date (Oldest)",
    query: "date-oldest",
    value: ["date", { ascending: true }],
    current: false,
  },
];

const graphTypes = {
  "top set": {
    label: "Top Set",
    type: "bar",
    borderColor: "rgb(53, 162, 235)",
    backgroundColor: "rgba(53, 162, 235, 0.5)",
    getData: ({ exercises, filters }) => {
      return exercises?.map((exercise) => {
        let topWeightAssigned = 0;
        let topWeightPerformed = 0;
        exercise.weight_assigned?.forEach((weightAssigned, index) => {
          if (weightAssigned > topWeightAssigned) {
            topWeightAssigned = weightAssigned;
            topWeightPerformed = exercise.weight_performed?.[index] || 0;
          }
        });
        const showKilograms = (filters["weight-unit"] || "kgs") === "kgs";
        if (exercise.is_weight_in_kilograms !== showKilograms) {
          if (showKilograms) {
            topWeightPerformed =
              poundsToKilograms(topWeightPerformed).toFixed(0);
            topWeightAssigned = poundsToKilograms(topWeightAssigned).toFixed(0);
          } else {
            topWeightPerformed =
              kilogramsToPounds(topWeightPerformed).toFixed(0);
            topWeightAssigned = kilogramsToPounds(topWeightAssigned).toFixed(0);
          }
        }
        return {
          x: dateFromDateAndTime(exercise.date),
          y: topWeightPerformed,
          denominator: topWeightAssigned,
          suffix: showKilograms ? "kgs" : "lbs",
        };
      });
    },
  },
  "number of sets": {
    label: "Number of Sets",
    type: "bar",
    borderColor: "rgb(255, 99, 132)",
    backgroundColor: "rgba(255, 99, 132, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        const y = exercise.number_of_sets_performed || 0;
        return {
          x: dateFromDateAndTime(exercise.date),
          y,
          denominator: exercise.number_of_sets_assigned,
        };
      });
    },
    yAxisID: "y1",
  },
  "number of reps": {
    label: "Number of Reps",
    type: "bar",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let maxRepsAssigned = 0;
        let maxRepsPerformed = 0;
        exercise.number_of_reps_assigned?.forEach((repsAssigned, index) => {
          if (repsAssigned > maxRepsAssigned) {
            maxRepsAssigned = repsAssigned;
            maxRepsPerformed = exercise.number_of_reps_performed?.[index] || 0;
          }
        });
        return {
          x: dateFromDateAndTime(exercise.date),
          y: maxRepsPerformed,
          denominator: maxRepsAssigned,
        };
      });
    },
    yAxisID: "y2",
  },
  difficulty: {
    label: "Difficulty",
    type: "bar",
    borderColor: "rgb(250, 204, 21)",
    backgroundColor: "rgba(250, 204, 21, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let difficulty = 0;
        let topWeightAssigned = 0;
        exercise.weight_assigned?.forEach((weightAssigned, index) => {
          if (weightAssigned > topWeightAssigned) {
            topWeightAssigned = weightAssigned;
            difficulty = exercise.difficulty?.[index] || 0;
          }
        });
        return {
          x: dateFromDateAndTime(exercise.date),
          y: difficulty,
          denominator: 10,
        };
      });
    },
    yAxisID: "y3",
  },
  bodyweight: {
    label: "Bodyweight",
    type: "line",
    borderColor: "rgb(250, 204, 21)",
    backgroundColor: "rgba(250, 204, 21, 0.5)",
    getData: ({ weights, filters }) => {
      const data = [];
      weights?.forEach((weight) => {
        const showKilograms = (filters["bodyweight-unit"] || "lbs") === "kgs";
        let weightValue = Number(weight.weight);
        if (weight.is_weight_in_kilograms !== showKilograms) {
          if (showKilograms) {
            weightValue = poundsToKilograms(weightValue);
          } else {
            weightValue = kilogramsToPounds(weightValue);
          }
        }

        const date = dateFromDateAndTime(weight.date);
        let datum = data.find((_data) => _data._date === weight.date);
        if (datum) {
          datum.sum += weightValue;
          datum.numberOfWeights += 1;
          datum.y = datum.sum / datum.numberOfWeights;
        } else {
          datum = {
            x: date,
            y: weightValue,
            sum: weightValue,
            numberOfWeights: 1,
            _date: weight.date,
            suffix: showKilograms ? "kgs" : "lbs",
            toFixed: 1,
          };
          data.push(datum);
        }
      });

      return data;
    },
    yAxisID: "y4",
  },
};

export default function Progress() {
  const { selectedClient, setSelectedDate } = useClient();
  const { user } = useUser();

  const {
    selectedExerciseType,
    setSelectedExerciseType,
    selectedExerciseTypeName,
    setSelectedExerciseTypeName,
  } = useSelectedExerciseType();

  const {
    progressFilters: filters,
    setProgressFilters: setFilters,
    progressContainsFilters: containsFilters,
    setProgressContainsFilters: setContainsFilters,
  } = useProgress();
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

    setMaxDateRange();
    setPreviousFilters();

    if (selectedExerciseType) {
      newBaseFilter["type.name"] = selectedExerciseType.name;
    }
    console.log("newBaseFilter", newBaseFilter);
    setBaseFilter(newBaseFilter);
  }, [selectedClient, user, selectedExerciseType]);

  const getFromDate = (dayOffset = 0) => {
    let date = new Date();
    switch (filters["date-range"] || defaultDateRange) {
      case "past week":
        date.setUTCDate(date.getUTCDate() - 7 - dayOffset);
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
  const [previousFilters, setPreviousFilters] = useState();
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

  const [weights, setWeights] = useState();
  const [isGettingWeights, setIsGettingWeights] = useState(false);
  const getWeights = async (refresh) => {
    if (!weights || refresh) {
      if (isGettingWeights) {
        return;
      }
      setIsGettingWeights(true);

      console.log("getting weights with filters", baseFilter, filters);

      const matchFilters = {
        client: baseFilter.client,
      };
      const fromDate = getFromDate(1);
      const { data: weights, error } = await supabase
        .from("weight")
        .select("*")
        .match(matchFilters)
        .gte("date", fromDate.toDateString())
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (error) {
        console.error(error);
      } else {
        console.log("weights", weights);
        setWeights(weights);
      }

      setIsGettingWeights(false);
    }
  };

  const [maxDateRange, setMaxDateRange] = useState();
  useEffect(() => {
    if ("client" in baseFilter) {
      let didDateRangeExpand = didDateRangeExpand;
      if (previousFilters?.["date-range"] !== filters["date-range"]) {
        console.log("new date range");
        setPreviousFilters(filters);

        if (
          !maxDateRange ||
          dateRanges.indexOf(filters["date-range"]) >
            dateRanges.indexOf(maxDateRange)
        ) {
          didDateRangeExpand = true;
          setMaxDateRange(filters["date-range"]);
        }
      }

      if ("type.name" in baseFilter) {
        getExercises(didDateRangeExpand);
      } else if (didDateRangeExpand) {
        setExercises();
      }

      if (containsFilters?.type?.includes("bodyweight")) {
        getWeights(didDateRangeExpand);
      } else if (didDateRangeExpand) {
        setWeights();
      }
    }
  }, [baseFilter, filters, containsFilters]);

  const [chartOptions, setChartOptions] = useState();
  const [chartData, setChartData] = useState();

  useEffect(() => {
    const newChartData = {
      datasets:
        containsFilters.type
          ?.sort((a, b) => {
            const aIndex = graphTypeOrder.indexOf(a);
            const bIndex = graphTypeOrder.indexOf(b);
            return aIndex - bIndex;
          })
          .map((filterType) => {
            console.log("filterType", filterType, graphTypes);
            const {
              type,
              label,
              getData,
              borderColor,
              backgroundColor,
              yAxisID,
            } = graphTypes[filterType];
            return {
              type,
              label,
              borderColor,
              backgroundColor,
              data: getData({ weights, exercises, filters }),
              yAxisID: yAxisID || "y",
            };
          }) || [],
    };
    console.log("newChartData", newChartData);
    setChartData(newChartData);

    const isWeightInKgs = (filters["weight-unit"] || "kgs") === "kgs";
    const isBodyweightInKgs = (filters["bodyweight-unit"] || "lbs") === "kgs";
    const newChartOptions = {
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
            //maxTicksLimit: 20,
          },
        },
        y: {
          type: "linear",
          display: containsFilters.type?.includes("top set") || false,
          position: "left",
          title: {
            display: true,
            text: `Top Set (${isWeightInKgs ? "kgs" : "lbs"})`,
          },
        },
        y1: {
          type: "linear",
          display: false,
        },
        y2: {
          type: "linear",
          display: false,
        },
        y3: {
          type: "linear",
          display: false,
        },
        y4: {
          type: "linear",
          display: containsFilters.type?.includes("bodyweight") || false,
          position: containsFilters.type?.includes("top set")
            ? "right"
            : "left",
          title: {
            display: containsFilters.type?.includes("bodyweight"),
            text: `Bodyweight (${isBodyweightInKgs ? "kgs" : "lbs"})`,
          },
          grid: {
            drawOnChartArea: !containsFilters.type?.includes("top set"),
          },
        },
      },
      responsive: true,
      animation: true,
      interaction: {
        mode: "x",
        intersect: false,
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return context[0].label.split(",").slice(0, 2).join(",");
            },
            label: function (context) {
              const label = context.dataset.label;
              let data = context.dataset.data[context.dataIndex];
              let value = data.y;
              if ("toFixed" in data) {
                value = value.toFixed(data.toFixed);
              }
              if ("denominator" in data) {
                value += `/${data.denominator}`;
              }
              if ("suffix" in data) {
                value += ` ${data.suffix}`;
              }
              console.log(context); // DELETE
              return `${label}: ${value}`;
            },
          },
        },
      },
    };
    console.log("newChartOptions", newChartOptions);
    setChartOptions(newChartOptions);
  }, [exercises, weights, containsFilters, filters]);

  const router = useRouter();
  const chartRef = useRef();
  const onChartClick = (event) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }
    if (event.nativeEvent.pointerType === "touch") {
      return;
    }

    const elementAtEvent = getElementAtEvent(chart, event)[0];
    if (!elementAtEvent) {
      return;
    }
    const { datasetIndex, index } = elementAtEvent;
    const dataset = chartData.datasets[datasetIndex];
    const data = dataset.data[index];
    const date = new Date(data.x);
    setSelectedDate(date);
    router.push("/account/diary");
  };

  return (
    <>
      <div className="bg-whitepx-4 pb-2 pt-6 sm:px-6 sm:pt-6">
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
          filterTypes={filterTypes
            .filter(
              (filterType) =>
                !filterType.requiresBodyweight ||
                containsFilters.type?.includes("bodyweight")
            )
            .filter(
              (filterType) =>
                !filterType.requiresTopSet ||
                containsFilters.type?.includes("top set")
            )
            .map((filterType) => {
              if (filterType.requiresExercise && !selectedExerciseType) {
                filterType = {
                  ...filterType,
                  checkboxes: filterType.checkboxes.filter(
                    (checkbox) => !checkbox.requiresExercise
                  ),
                };
              }
              return filterType;
            })}
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
              <Chart
                type="bar"
                data={chartData}
                options={chartOptions}
                ref={chartRef}
                onClick={onChartClick}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

Progress.getLayout = getAccountLayout;
