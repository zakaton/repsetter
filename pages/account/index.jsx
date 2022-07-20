/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
import { useEffect, useState } from "react";
import { useUser } from "../../context/user-context";
import DeleteAccountModal from "../../components/account/modal/DeleteAccountModal";
import CoachPictureModal from "../../components/account/modal/CoachPictureModal";
import MyLink from "../../components/MyLink";
import { getAccountLayout } from "../../components/layouts/AccountLayout";
import Notification from "../../components/Notification";
import { supabase } from "../../utils/supabase";

export default function AccountGeneral() {
  const { user, isLoading, stripeLinks } = useUser();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [showCoachPictureModal, setShowCoachPictureModal] = useState(false);
  const [showCoachPictureNotification, setShowCoachPictureNotification] =
    useState(false);
  const [coachPictureStatus, setCoachPictureStatus] = useState();

  const [isGettingCoachPicture, setIsGettingCoachPicture] = useState(false);
  const [coachPictureUrl, setCoachPictureUrl] = useState();
  const getCoachPicture = async () => {
    if (isGettingCoachPicture) {
      return;
    }
    console.log("getting coach picture...");
    setIsGettingCoachPicture(true);
    const { data: picturesList, error: listPicturesError } =
      await supabase.storage
        .from("coach-picture")
        .list("", { limit: 1, search: user.id });
    if (listPicturesError) {
      console.error(listPicturesError);
    } else {
      console.log("picturesList", picturesList);
    }
    if (picturesList.length > 0) {
      const { publicURL, error } = await supabase.storage
        .from("coach-picture")
        .getPublicUrl(`${user.id}/coach-picture.jpg`);
      console.log("publicURL", publicURL);
      if (error) {
        console.error(error);
      } else {
        setCoachPictureUrl(publicURL);
      }
    }
    setIsGettingCoachPicture(false);
  };
  useEffect(() => {
    if (user?.can_coach && !coachPictureUrl) {
      getCoachPicture();
    }
  }, [user]);

  useEffect(() => {
    if (coachPictureStatus?.type === "succeeded") {
      getCoachPicture();
    }
  }, [coachPictureStatus]);

  return (
    <>
      <DeleteAccountModal
        open={showDeleteAccount}
        setOpen={setShowDeleteAccount}
      />

      <CoachPictureModal
        open={showCoachPictureModal}
        setOpen={setShowCoachPictureModal}
        setResultStatus={setCoachPictureStatus}
        setShowResultNotification={setShowCoachPictureNotification}
      />
      <Notification
        open={showCoachPictureNotification}
        setOpen={setShowCoachPictureNotification}
        status={coachPictureStatus}
      />

      <div className="space-y-6 bg-white px-4 pb-2 pt-4 sm:px-6">
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            General Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This information is private and will not be shared with anyone
          </p>
        </div>
        {!isLoading && user && (
          <div className="mt-5 border-t border-gray-200">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.email}
                </dd>
              </div>
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                <dt className="text-sm font-medium text-gray-500">
                  Can coach?
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {user.can_coach ? (
                    <>
                      Yes.{" "}
                      <MyLink
                        href={stripeLinks.dashboard}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-2 py-1 text-sm font-medium leading-4 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Go to Stripe Dashboard
                        </button>
                      </MyLink>
                    </>
                  ) : (
                    <>
                      No.{" "}
                      <MyLink
                        href={stripeLinks.onboarding}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-2 py-1 text-sm font-medium leading-4 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Setup your Stripe account
                        </button>
                      </MyLink>{" "}
                      in order to coach.
                    </>
                  )}
                </dd>
              </div>
              {user.can_coach && (
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">
                    Coach Picture
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {coachPictureUrl && (
                      <>
                        <img
                          alt="coach picture"
                          src={coachPictureUrl}
                          width={200}
                        />
                        <br></br>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowCoachPictureModal(true)}
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-1 px-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {coachPictureUrl ? "Update" : "Set"} Picture
                    </button>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
      <div className="flex items-end justify-end gap-2 bg-gray-50 px-4 py-3 text-right text-xs sm:px-6 sm:text-sm">
        <MyLink
          href={stripeLinks.customerPortal}
          target="_blank"
          rel="noreferrer"
        >
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Customer Portal
          </button>
        </MyLink>
        <button
          type="button"
          onClick={() => setShowDeleteAccount(true)}
          className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Account
        </button>
      </div>
    </>
  );
}

AccountGeneral.getLayout = getAccountLayout;
