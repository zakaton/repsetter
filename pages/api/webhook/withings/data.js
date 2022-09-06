/* eslint-disable camelcase */
import { getSupabaseService } from "../../../../utils/supabase";
import { getWithingsMeasure } from "../../../../utils/withings";

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
    if (measureJSON.status === 0) {
      measureJSON.body.measuregrps.forEach((measuregrp) => {
        const date = new Date(measuregrp.date * 1000);
        console.log("date", date);
        // FILL - update profile by adding exercises
        measuregrp.measures.forEach((measure) => {
          switch (measure.type) {
            case 1:
              // weight (kg)
              const weightInKilograms = measure.value / 1000;
              console.log("weightInKilograms", weightInKilograms);
              break;
            case 6:
              // bodyfat (%)
              const bodyfatPercentage = measure.value / 1000;
              console.log("bodyfatPercentage", bodyfatPercentage);
              break;
            default:
              break;
          }
        });
      });
    }
    console.log(measureJSON);
  }

  res.status(200).json({ hello: "world" });
}
