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
import { isMobile } from "react-device-detect";
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
import { weightEventColors } from "../../utils/weight-utils";
import {
  poundsToKilograms,
  kilogramsToPounds,
  exerciseFeatures,
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
  "weight",
  "bodyweight",
  "number of sets",
  "number of reps",
  "difficulty",
  "speed",
  "level",
  "duration",
  "rest duration",
  "exercise time",
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
      value: "past 3 months",
      label: "Past 3 Months",
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
        value: "weight",
        label: "Top Set",
        feature: "weight",
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
        feature: "reps",
      },
      {
        value: "difficulty",
        label: "Difficulty",
        requiresExercise: true,
      },
      {
        value: "duration",
        label: "Set Duration",
        requiresExercise: true,
        feature: "duration",
      },
      {
        value: "rest duration",
        label: "Rest Duration",
        requiresExercise: true,
      },
      {
        value: "speed",
        label: "Speed",
        feature: "speed",
        requiresExercise: true,
      },
      {
        value: "level",
        label: "Level",
        feature: "level",
        requiresExercise: true,
      },
      {
        value: "exercise time",
        label: "Exercise Time",
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
      { value: "kg", label: "kg" },
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
      { value: "kg", label: "kg" },
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
  weight: {
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
        const showKilograms = (filters["weight-unit"] || "kg") === "kg";
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
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: topWeightPerformed,
          denominator: topWeightAssigned,
          suffix: showKilograms ? "kg" : "lbs",
          includeTime: exercise.time,
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
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y,
          denominator: exercise.number_of_sets_assigned,
          includeTime: exercise.time,
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
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: maxRepsPerformed,
          denominator: maxRepsAssigned,
          includeTime: exercise.time,
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
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: difficulty,
          denominator: 10,
          includeTime: exercise.time,
        };
      });
    },
    yAxisID: "y3",
  },
  "exercise time": {
    label: "Exercise Time",
    type: "bar",
    borderColor: "rgb(250, 10, 21)",
    backgroundColor: "rgba(250, 10, 21, 0.5)",
    getData: ({ exercises }) => {
      return exercises
        ?.filter((exercise) => exercise.time != null)
        .map((exercise) => {
          const date = dateFromDateAndTime(exercise.date, exercise.time);
          const timeInterpolation =
            date.getHours() / 24 + date.getMinutes() / (60 * 24);
          return {
            x: date,
            y: 1 - timeInterpolation,
            label: date.toLocaleTimeString([], { timeStyle: "short" }),
          };
        });
    },
    yAxisID: "y5",
  },
  duration: {
    label: "Set Duration",
    type: "bar",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let setDurationPerformed = 0;
        let topSetDurationAssigned = 0;
        exercise.set_duration_assigned?.forEach(
          (setDurationAssigned, index) => {
            if (setDurationAssigned > topSetDurationAssigned) {
              topSetDurationAssigned = setDurationAssigned;
              setDurationPerformed =
                exercise.set_duration_performed?.[index] || 0;
            }
          }
        );
        return {
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: setDurationPerformed,
          denominator: topSetDurationAssigned,
          includeTime: exercise.time,
          suffix: "minutes",
        };
      });
    },
    yAxisID: "y7",
  },
  "rest duration": {
    label: "Rest Duration",
    type: "bar",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let topRestDuration = 0;
        exercise.rest_duration?.forEach((restDuration) => {
          if (restDuration > topRestDuration) {
            topRestDuration = restDuration;
          }
        });
        return {
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: topRestDuration,
          includeTime: exercise.time,
          suffix: "minutes",
        };
      });
    },
    yAxisID: "y6",
  },
  speed: {
    label: "Speed",
    type: "bar",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let topSpeedPerformed = 0;
        let topSpeedAssigned = 0;
        exercise.speed_assigned?.forEach((speedAssigned, index) => {
          if (speedAssigned > topSpeedAssigned) {
            topSpeedAssigned = speedAssigned;
            topSpeedPerformed = exercise.speed_performed?.[index] || 0;
          }
        });
        return {
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: topSpeedPerformed,
          denominator: topSpeedAssigned,
          includeTime: exercise.time,
        };
      });
    },
    yAxisID: "y8",
  },
  level: {
    label: "Level",
    type: "bar",
    borderColor: "rgb(34, 197, 94)",
    backgroundColor: "rgba(34, 197, 94, 0.5)",
    getData: ({ exercises }) => {
      return exercises?.map((exercise) => {
        let topLevelPerformed = 0;
        let topLevelAssigned = 0;
        exercise.level_assigned?.forEach((levelAssigned, index) => {
          if (levelAssigned > topLevelAssigned) {
            topLevelAssigned = levelAssigned;
            topLevelPerformed = exercise.level_performed?.[index] || 0;
          }
        });
        return {
          x: dateFromDateAndTime(exercise.date, exercise.time),
          y: topLevelPerformed,
          denominator: topLevelAssigned,
          includeTime: exercise.time,
        };
      });
    },
    yAxisID: "y9",
  },
  bodyweight: {
    label: "Bodyweight",
    type: "line",
    borderColor: "rgb(250, 204, 21)",
    backgroundColor: "rgba(250, 204, 21, 0.5)",
    getData: ({ weights, filters }) => {
      const data = [];
      weights?.forEach((weight) => {
        const showKilograms = (filters["bodyweight-unit"] || "lbs") === "kg";
        let weightValue = Number(weight.weight);
        if (weight.is_weight_in_kilograms !== showKilograms) {
          if (showKilograms) {
            weightValue = poundsToKilograms(weightValue);
          } else {
            weightValue = kilogramsToPounds(weightValue);
          }
        }

        const showIndividualWeights = filters["date-range"] == "past week";
        const date = dateFromDateAndTime(weight.date, weight.time);
        let datum = data.find((_data) => _data._date === weight.date);
        if (datum && !showIndividualWeights) {
          datum.sum += weightValue;
          datum.numberOfWeights += 1;
          datum.y = datum.sum / datum.numberOfWeights;
          if (weightValue > datum.max) {
            datum.max = weightValue;
            datum.maxTime = date.toLocaleTimeString([], { timeStyle: "short" });
          }
          if (weightValue < datum.min) {
            datum.min = weightValue;
            datum.minTime = date.toLocaleTimeString([], { timeStyle: "short" });
          }
        } else {
          datum = {
            x: date,
            y: weightValue,
            sum: weightValue,
            numberOfWeights: 1,
            _date: weight.date,
            suffix: showKilograms ? "kg" : "lbs",
            toFixed: 1,
            max: weightValue,
            maxTime: date.toLocaleTimeString([], { timeStyle: "short" }),
            min: weightValue,
            minTime: date.toLocaleTimeString([], { timeStyle: "short" }),
            includeTime: showIndividualWeights,
            event: showIndividualWeights ? weight.event : null,
          };
          data.push(datum);
        }
      });

      return data;
    },
    segment: {
      borderColor: (context) => {
        const event = context?.p1?.raw?.event;
        return weightEventColors[event || "none"];
      },
    },
    pointBackgroundColor: (context) => {
      const event = context?.raw?.event;
      return weightEventColors[event || "none"];
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
      //newBaseFilter.coach = user.id;
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

  useEffect(() => {
    if (
      selectedExerciseType &&
      containsFilters?.type &&
      selectedExerciseType.features
    ) {
      const newContainsFilters = { ...containsFilters };
      console.log("type", containsFilters.type);
      newContainsFilters.type = newContainsFilters.type.filter((type) =>
        selectedExerciseType.features.includes(type)
      );
      setContainsFilters(newContainsFilters);
    }
  }, [selectedExerciseType]);

  const getFromDate = (dayOffset = 0) => {
    let date = new Date();
    switch (filters["date-range"] || defaultDateRange) {
      case "past week":
        date.setUTCDate(date.getUTCDate() - 7 - dayOffset);
        break;
      case "past month":
        date.setUTCMonth(date.getUTCMonth() - 1);
        break;
      case "past 3 months":
        date.setUTCMonth(date.getUTCMonth() - 3);
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
  const chartRef = useRef();
  useEffect(() => {
    const numberOfBarCharts = containsFilters.type?.reduce(
      (count, filterType) =>
        graphTypes[filterType].type === "bar" ? count + 1 : count,
      0
    );
    console.log("numberOfBarCharts", numberOfBarCharts);
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
              segment,
              pointBackgroundColor,
            } = graphTypes[filterType];
            return {
              type,
              label,
              borderColor,
              backgroundColor,
              data: getData({ weights, exercises, filters }),
              yAxisID: yAxisID || "y",
              id: graphTypeOrder.indexOf(filterType),
              barThickness: 6,
              maxBarThickness: 10,
              minBarLength: 2,
              segment,
              pointBackgroundColor,
            };
          }) || [],
    };
    console.log("newChartData", newChartData);
    setChartData(newChartData);

    const isWeightInKgs = (filters["weight-unit"] || "kg") === "kg";
    const isBodyweightInKgs = (filters["bodyweight-unit"] || "lbs") === "kg";
    let numberOfAvailableTypes = 2;
    if (containsFilters.type?.includes("weight")) {
      numberOfAvailableTypes -= 1;
    }
    if (containsFilters.type?.includes("bodyweight")) {
      numberOfAvailableTypes -= 1;
    }
    const typesToDisplay = graphTypeOrder
      .slice(2)
      .filter((type) => containsFilters.type?.includes(type))
      .slice(0, numberOfAvailableTypes);
    console.log("typesToDisplay", typesToDisplay);

    const getPosition = (type) =>
      typesToDisplay.indexOf(type) === 0 &&
      (typesToDisplay.length === 2 || numberOfAvailableTypes == 2)
        ? "left"
        : "right";
    const getGridDrawOnChartArea = (type) =>
      typesToDisplay.indexOf(type) === 0 &&
      (typesToDisplay.length === 2 || numberOfAvailableTypes == 2);

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
            autoSkip: true,
          },
        },
        y: {
          type: "linear",
          display: containsFilters.type?.includes("weight") || false,
          position: "left",
          title: {
            display: true,
            text: `Top Set (${isWeightInKgs ? "kg" : "lbs"})`,
          },
        },
        y1: {
          type: "linear",
          display: typesToDisplay.includes("number of sets"),
          beginAtZero: true,
          position: getPosition("number of sets"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("number of sets"),
          },
          title: {
            display: true,
            text: `Number of Sets`,
          },
        },
        y2: {
          type: "linear",
          display: typesToDisplay.includes("number of reps"),
          position: getPosition("number of reps"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("number of reps"),
          },
          title: {
            display: true,
            text: `Number of Reps`,
          },
        },
        y3: {
          type: "linear",
          display: typesToDisplay.includes("difficulty"),
          position: getPosition("difficulty"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("difficulty"),
          },
          title: {
            display: true,
            text: `Difficulty`,
          },
        },
        y4: {
          type: "linear",
          display: containsFilters.type?.includes("bodyweight") || false,
          position: containsFilters.type?.includes("weight") ? "right" : "left",
          title: {
            display: true,
            text: `Bodyweight (${isBodyweightInKgs ? "kg" : "lbs"})`,
          },
          grid: {
            drawOnChartArea: !containsFilters.type?.includes("weight"),
          },
          beginAtZero: true,
        },
        y5: {
          type: "linear",
          display: typesToDisplay.includes("exercise time"),
          min: 0,
          max: 1,
          position: getPosition("exercise time"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("exercise time"),
          },
          title: {
            display: true,
            text: `Exercise Time`,
          },
        },
        y6: {
          type: "linear",
          display: typesToDisplay.includes("rest duration"),
          min: 0,
          //max: 1,
          position: getPosition("rest duration"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("rest duration"),
          },
          title: {
            display: true,
            text: `Rest Duration`,
          },
        },
        y7: {
          type: "linear",
          display: typesToDisplay.includes("duration"),
          min: 0,
          //max: 1,
          position: getPosition("duration"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("duration"),
          },
          title: {
            display: true,
            text: `Set Duration`,
          },
        },
        y8: {
          type: "linear",
          display: typesToDisplay.includes("speed"),
          min: 0,
          //max: 1,
          position: getPosition("speed"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("speed"),
          },
          title: {
            display: true,
            text: `Speed`,
          },
        },
        y9: {
          type: "linear",
          display: typesToDisplay.includes("level"),
          min: 0,
          //max: 1,
          position: getPosition("level"),
          grid: {
            drawOnChartArea: getGridDrawOnChartArea("level"),
          },
          title: {
            display: true,
            text: `Level`,
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
              const { includeTime } = context[0].raw;
              let label = context[0].label;
              if (!includeTime) {
                label = label.split(",").slice(0, 2).join(",");
              }
              return label;
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
              if ("label" in data) {
                value = data.label;
              }
              return `${label}: ${value}`;
            },
            footer: function (context) {
              const { dataset, raw } = context?.[0];
              if (dataset.label == "Bodyweight") {
                const { min, max, suffix, minTime, maxTime, event } = raw;
                let label = "";
                if (event) {
                  if (event?.length > 0 && event !== "none") {
                    return `${event}`;
                  }
                } else if (min != max) {
                  return `min: ${min.toFixed(
                    1
                  )} ${suffix} @${minTime}\nmax: ${max.toFixed(
                    1
                  )} ${suffix} @${maxTime}`;
                }
              }
            },
          },
        },
      },
    };
    console.log("newChartOptions", newChartOptions);
    setChartOptions(newChartOptions);
  }, [exercises, weights, containsFilters, filters, chartRef]);

  const router = useRouter();
  const onChartClick = (event) => {
    const { current: chart } = chartRef;

    if (!chart) {
      return;
    }
    if (isMobile) {
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
      <div className="bg-white px-4 pb-2 pt-4 sm:px-6">
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
                containsFilters.type?.includes("weight")
            )
            .map((filterType) => {
              if (filterType.requiresExercise) {
                if (!selectedExerciseType) {
                  filterType = {
                    ...filterType,
                    checkboxes: filterType.checkboxes.filter(
                      (checkbox) => !checkbox.requiresExercise
                    ),
                  };
                } else {
                  filterType = {
                    ...filterType,
                    checkboxes: filterType.checkboxes.filter(
                      (checkbox) =>
                        !checkbox.feature ||
                        selectedExerciseType.features?.includes(
                          checkbox.feature
                        )
                    ),
                  };
                }
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
                datasetIdKey="id"
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
