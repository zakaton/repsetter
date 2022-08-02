/* eslint-disable react/destructuring-assignment */
import { useEffect, useState } from "react";
import { useUser } from "../../../context/user-context";
import Modal from "../../Modal";
import { UserAddIcon } from "@heroicons/react/outline";
import MyLink from "../../MyLink";
import { useRouter } from "next/router";

import { maxNumberOfUnredeemedSubscriptionsPerCoach } from "../../../utils/subscription-utils";

export default function CreateSubscriptionModal(props) {
  const {
    open,
    setOpen,
    setCreateResultStatus: setCreateSubscriptionStatus,
    setShowCreateResultNotification: setShowCreateSubscriptionNotification,
  } = props;

  const router = useRouter();

  const { fetchWithAccessToken, user } = useUser();
  useEffect(() => {
    if (
      open &&
      user.number_of_unredeemed_subscriptions >=
        maxNumberOfUnredeemedSubscriptionsPerCoach
    ) {
      setCreateSubscriptionStatus({
        type: "failed",
        title: "You've exceeded the number of unredeemed subscriptions",
        message:
          "You must wait for any existing ones to be redeemed or delete one to create a new one.",
      });
      setShowCreateSubscriptionNotification(true);
      setOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setDidCreateSubscription(false);
      setSubscriptionPrice(0);
      setIsSubscriptionPriceEmptyString(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && didCreateSubscription) {
      setShowCreateSubscriptionNotification(false);
    }
  }, [open]);

  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [didCreateSubscription, setDidCreateSubscription] = useState(false);

  const [subscriptionPrice, setSubscriptionPrice] = useState(0);
  const [isSubscriptionPriceEmptyString, setIsSubscriptionPriceEmptyString] =
    useState(true);

  return (
    <Modal
      {...props}
      title="Create Coaching Subscription"
      message="Set a monthly price your client will pay for your coaching services (set 0 if you want to coach them for free)"
      Icon={UserAddIcon}
      Button={
        <button
          type="submit"
          form="subscriptionForm"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isCreatingSubscription
            ? "Creating Subscription..."
            : didCreateSubscription
            ? "Created Subscription!"
            : "Create Subscription"}
        </button>
      }
    >
      <form
        id="subscriptionForm"
        method="POST"
        action="/api/subscription/create-subscription"
        onSubmit={async (e) => {
          e.preventDefault();
          setIsCreatingSubscription(true);
          const form = e.target;
          const formData = new FormData(form);
          const data = new URLSearchParams();
          formData.forEach((value, key) => {
            data.append(key, value);
          });
          const response = await fetchWithAccessToken(form.action, {
            method: form.method,
            body: data,
          });
          setIsCreatingSubscription(false);
          setDidCreateSubscription(true);
          const { status, subscription } = await response.json();
          setCreateSubscriptionStatus(status);
          setShowCreateSubscriptionNotification(true);
          setOpen(false);
          if (status.type === "succeeded") {
            router.push(`/subscription/${subscription}`);
          } else {
            console.error(status);
          }
        }}
      >
        <div className="my-4">
          <label
            htmlFor="subscriptionPrice"
            className="block text-sm font-medium text-gray-700"
          >
            Monthly Subscription Price
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              required
              type="number"
              inputMode="numeric"
              name="subscriptionPrice"
              id="subscriptionPrice"
              className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="0"
              value={isSubscriptionPriceEmptyString ? "" : subscriptionPrice}
              step="1"
              min="0"
              max="1000"
              aria-describedby="subscriptionPrice-currency"
              onInput={(e) => {
                setIsSubscriptionPriceEmptyString(e.target.value === "");
                setSubscriptionPrice(Math.floor(Number(e.target.value)));
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className="text-gray-500 sm:text-sm"
                id="subscriptionPrice-currency"
              >
                USD
              </span>
            </div>
          </div>
        </div>
        <div className="style-links relative mt-4 flex items-start">
          <div className="flex h-5 items-center">
            <input
              required
              id="agreeToTermsOfUse"
              aria-describedby="agreeToTermsOfUse-description"
              name="agreeToTermsOfUse"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="style-links ml-3 text-sm">
            <label
              htmlFor="agreeToTermsOfUse"
              className="font-medium text-gray-700"
            >
              By coaching I agree{" "}
            </label>
            <span id="agreeToTermsOfUse-description" className="text-gray-500">
              <span className="sr-only">By coaching I agree </span> to the{" "}
              <MyLink target="_blank" href="/terms">
                terms of use
              </MyLink>
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
