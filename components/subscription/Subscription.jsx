/* eslint-disable no-param-reassign */
import { useEffect, useState } from "react";
import { QrcodeIcon } from "@heroicons/react/outline";
import { supabase } from "../../utils/supabase";
import { formatDollars } from "../../utils/subscription-utils";
import { useUser } from "../../context/user-context";
import DeleteSubscriptionModal from "../account/modal/DeleteSubscriptionModal";
import Notification from "../Notification";
import QRCodeModal from "../QRCodeModal";
import { ClipboardListIcon } from "@heroicons/react/outline";
import MyLink from "../MyLink";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Subscription({ subscriptionId, setCoachEmail }) {
  const [isGettingSubscription, setIsGettingSubscription] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const { user, isAdmin, isLoading, session } = useUser();

  const [isMySubscription, setIsMySubscription] = useState(null);
  useEffect(() => {
    if (user && subscription) {
      setIsMySubscription(user.id === subscription.coach);
    }
  }, [user, subscription]);

  const getSubscription = async () => {
    // eslint-disable-next-line no-shadow
    const { data: subscription } = await supabase
      .from("subscription")
      .select("*")
      .eq("id", subscriptionId)
      .maybeSingle();
    console.log("setting subscription", subscription);
    if (subscription) {
      setCoachEmail(subscription.coach_email);
    }
    setSubscription(subscription);
    setIsGettingSubscription(false);
  };
  useEffect(() => {
    if (subscriptionId) {
      getSubscription();
    }
  }, [subscriptionId]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (subscription) {
      console.log("subscribing to subscription updates", subscription);
      const supabaseSubscription = supabase
        .from(`subscription:id=eq.${subscription.id}`)
        .on("UPDATE", (payload) => {
          console.log("updated subscription");
          setSubscription({ ...subscription, ...payload.new });
        })
        .on("DELETE", (payload) => {
          console.log("deleted subscription", payload);
          setSubscription(null);
        })
        .subscribe();
      return () => {
        console.log("unsubscribing to subscription updates");
        supabase.removeSubscription(supabaseSubscription);
      };
    }
  }, [subscription]);

  const [existingSubscription, setExistingSubscription] = useState(null);
  const [isGettingExistingSubscription, setIsGettingExistingSubscription] =
    useState(true);
  const checkForExistingSubscription = async () => {
    const { data: existingSubscription } = await supabase
      .from("subscription")
      .select("*")
      .match({ client: user.id, coach: subscription.coach })
      .maybeSingle();
    setExistingSubscription(existingSubscription);
    setIsGettingExistingSubscription(false);
  };
  useEffect(() => {
    if (subscription && user) {
      checkForExistingSubscription();
    }
  }, [subscription, user]);

  const [selectedSubscription, setSelectedSubscription] = useState(null);
  useEffect(() => {
    if (subscription) {
      setSelectedSubscription(subscription);
    }
  }, [subscription]);

  const [showDeleteSubscriptionModal, setShowDeleteSubscriptionModal] =
    useState(false);
  const [deleteSubscriptionStatus, setDeleteSubscriptionStatus] = useState();
  const [
    showDeleteSubscriptionNotification,
    setShowDeleteSubscriptionNotification,
  ] = useState(false);

  const removeNotifications = () => {
    setShowDeleteSubscriptionNotification(false);
  };
  useEffect(() => {
    if (showDeleteSubscriptionModal) {
      removeNotifications();
    }
  }, [showDeleteSubscriptionModal]);

  const [showQRCodeModal, setShowQRCodeModal] = useState(false);

  const canSubscribe =
    user &&
    !isGettingSubscription &&
    !isMySubscription &&
    !isGettingExistingSubscription &&
    !existingSubscription;

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
        .list(subscription.coach, { limit: 1, search: "coach-picture" });
    if (listPicturesError) {
      console.error(listPicturesError);
    } else {
      console.log("picturesList", picturesList);
    }
    if (picturesList.length > 0) {
      const { publicURL, error } = await supabase.storage
        .from("coach-picture")
        .getPublicUrl(`${subscription.coach}/coach-picture.jpg`);
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
    if (subscription?.coach && !coachPictureUrl) {
      getCoachPicture();
    }
  }, [subscription]);

  return (
    <>
      <DeleteSubscriptionModal
        open={showDeleteSubscriptionModal}
        setOpen={setShowDeleteSubscriptionModal}
        selectedResult={selectedSubscription}
        setDeleteResultStatus={setDeleteSubscriptionStatus}
        setShowDeleteResultNotification={setShowDeleteSubscriptionNotification}
      />
      <Notification
        open={showDeleteSubscriptionNotification}
        setOpen={setShowDeleteSubscriptionNotification}
        status={deleteSubscriptionStatus}
      />

      {subscription && (
        <QRCodeModal
          open={showQRCodeModal}
          setOpen={setShowQRCodeModal}
          Icon={ClipboardListIcon}
          title="Subscription QR Code"
          text={`https://repsetter.me/${subscription.id}`}
        />
      )}

      <div className="mx-auto max-w-prose bg-white text-lg shadow sm:rounded-lg">
        <div className="py-3 px-5 pb-5 sm:py-4 sm:pb-5">
          {isGettingSubscription && (
            <div className="style-links prose prose-lg mx-auto text-center text-xl text-gray-500">
              <p>Loading subscription...</p>
            </div>
          )}

          {!isGettingSubscription &&
            (subscription ? (
              <>
                <div className="mx-auto max-w-prose text-lg">
                  <h1>
                    <span className="mt-2 block text-center text-2xl font-bold leading-8 tracking-tight text-gray-900 sm:text-3xl">
                      Coaching Invitation
                    </span>
                  </h1>
                </div>
                <div className="mx-auto max-w-prose text-lg">
                  <div
                    className={classNames(
                      "prose prose-lg prose-blue mx-auto mt-4 text-xl text-gray-500",
                      coachPictureUrl
                        ? "sm:grid sm:grid-cols-2 sm:items-center sm:gap-4"
                        : ""
                    )}
                  >
                    {
                      <p className="sm:col-start-2 sm:row-start-1">
                        You have been invited by {subscription.coach_email} to
                        be coached for{" "}
                        <span>{formatDollars(subscription.price, false)}</span>{" "}
                        per month.
                      </p>
                    }
                    {coachPictureUrl && (
                      <img
                        alt="coach picture"
                        src={coachPictureUrl}
                        width={250}
                        className="m-auto mt-2 sm:col-start-1"
                      />
                    )}
                    {!isLoading && !user && (
                      <p>
                        <MyLink
                          href={`/sign-in?redirect_pathname=${window.location.pathname}`}
                          as="/sign-in"
                          className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-2 py-2 font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Sign in
                        </MyLink>{" "}
                        to redeem this subscription.
                      </p>
                    )}
                    {existingSubscription && (
                      <p>
                        {existingSubscription.id === subscription.id
                          ? "You've already redeemed this subscription."
                          : "You are already subscribed to this coach."}
                      </p>
                    )}
                    {isMySubscription && subscription.redeemed && (
                      <p>
                        This subscription has been redeemed by{" "}
                        {subscription.client_email} at{" "}
                        {new Date(subscription.redeemed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="style-links prose prose-lg mx-auto text-center text-xl text-gray-500">
                <p>Subscription not found or is no longer available.</p>
              </div>
            ))}
        </div>
        {subscription && !subscription.redeemed && (
          <div className="mt-1 flex items-end justify-end gap-2 bg-gray-50 px-4 py-3 text-right text-xs sm:px-6 sm:text-sm">
            {!subscription.redeemed && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setShowQRCodeModal(true);
                  }}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-1 px-1 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="sr-only">QR Code</span>
                  <QrcodeIcon className="h-7 w-7" aria-hidden="true" />
                </button>
                {navigator.canShare && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.share({
                        title: `Repsetter Coaching Invitation`,
                        text: `Follow this link to start getting coached on Repsetter!`,
                        url: `https://repsetter.me/${subscription.id}`,
                      });
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Share
                  </button>
                )}
              </>
            )}
            {canSubscribe && (
              <MyLink
                href={`/api/subscription/redeem-subscription?subscriptionId=${subscription.id}&access_token=${session.access_token}`}
                target="_blank"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Subscribe
              </MyLink>
            )}
            {(isMySubscription || isAdmin) && (
              <button
                type="button"
                onClick={() => setShowDeleteSubscriptionModal(true)}
                className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
