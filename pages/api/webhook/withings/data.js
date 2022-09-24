/* eslint-disable camelcase */
import { getSupabaseService } from "../../../../utils/supabase";
import {
  getWithingsMeasure,
  refreshWithingsAccessToken,
} from "../../../../utils/withings";
import { dateToString } from "../../../../utils/supabase";

export default async function handler(req, res) {
  const supabase = getSupabaseService();

  const { userid, startdate, enddate, appli } =
    typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  console.log(req.body, typeof req.body);

  console.log("going to fetch profile...", userid);
  const { data: profile, error: getProfileError } = await supabase
    .from("profile")
    .select("*")
    .eq("withings_userid", userid)
    .maybeSingle();

  console.log("profile", profile);
  console.log("getProfileError", getProfileError);

  if (profile && profile.withings_refresh_token) {
    const refreshResponseJSON = await refreshWithingsAccessToken(
      profile.withings_refresh_token
    );
    if (refreshResponseJSON.status == 0) {
      const { access_token, refresh_token, expires_in } =
        refreshResponseJSON.body;

      await supabase
        .from("profile")
        .update({
          withings_access_token: access_token,
          withings_refresh_token: refresh_token,
          withings_token_expiration: expires_in,
        })
        .eq("id", profile.id);

      const measureJSON = await getWithingsMeasure(
        access_token,
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
            //date: dateToString(date),
            date: date.toLocaleDateString("en-US", { timeZone: timezone }),
            time: date.toLocaleTimeString("en-US", {
              timeZone: timezone,
              hour12: false,
              timeStyle: "short",
            }),
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
  }
  console.log("Sending OK");
  res.status(200).send("OK");
}
