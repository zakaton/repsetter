/* eslint-disable camelcase */
import { getSupabaseService } from "../../../../utils/supabase";
import { getWithingsMeasure } from "../../../../utils/withings";
import { dateToString } from "../../../../utils/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseService();

  const { userid, startdate, enddate, appli } = req.body;
  console.log(req.body);

  const { data: profile, error: getProfileError } = await supabase
    .from("profile")
    .select("*")
    .eq("withings_userid", userid)
    .maybeSingle();

  if (profile) {
    const measureJSON = await getWithingsMeasure(
      profile.withings_access_token,
      startdate,
      enddate
    );
    console.log("measureJSON", measureJSON);
    if (measureJSON.status === 0) {
      const newWeightData = [];
      const { timezone } = measureJSON.body;
      measureJSON.body.measuregrps.forEach((measuregrp) => {
        const date = new Date(measuregrp.date * 1000);
        console.log("date", date);
        const newWeightDatum = {
          date: dateToString(date),
          time: date.toLocaleTimeString("en-US", { timeZone: timezone }),
          client: profile.id,
          client_email: profile.email,
        };
        let addWeightDatum = false;
        measuregrp.measures.forEach((measure) => {
          switch (measure.type) {
            case 1:
              const weightInKilograms = measure.value * 10 ** measure.unit;
              newWeightDatum.weight = weightInKilograms;
              newWeightDatum.is_weight_in_kilograms = true;
              addWeightDatum = true;
              console.log("weightInKilograms", weightInKilograms);
              break;
            case 6:
              const bodyfatPercentage = measure.value * 10 ** measure.unit;
              newWeightDatum.bodyfat_percentage = bodyfatPercentage;
              console.log("bodyfatPercentage", bodyfatPercentage);
              addWeightDatum = true;
              break;
            default:
              break;
          }
        });

        if (addWeightDatum) {
          newWeightData.push(newWeightDatum);
        }
      });

      console.log("newWeightData", newWeightData);
      if (newWeightData.length) {
        const { data: addedWeight, error: addWeightError } = await supabase
          .from("weight")
          .insert(newWeightData);
        if (addWeightError) {
          console.error(addWeightError);
        } else {
          console.log("addedWeight", addedWeight);
        }
      }
    }
  }

  res.status(200).json({ hello: "world" });
}
