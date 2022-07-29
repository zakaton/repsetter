import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import Head from "next/head";

const faqs = [
  {
    question: "Are are any fees to get started?",
    answer: () => (
      <>
        <p>
          Nope. You can sign up for free and just use this as standalone workout
          app if you aren&apos;t a coach.
        </p>
        <p>
          The only time you&apos;d be charged is if you subscribe to a coach
          with a nonzero subscription fee.
        </p>
        <p>
          If you want to be a coach, it&apos;s free to sign up and we only take
          a flat 5% fee on any subscriptions.
        </p>
      </>
    ),
  },
  {
    question: "Can I cancel my coaching subscription anytime?",
    answer: () => (
      <>
        <p>Yep. You&apos;re free to cancel anytime.</p>
      </>
    ),
  },
  {
    question: "What percent does Repsetter take from coaching subscriptions?",
    answer: () => (
      <>
        <p>We take a flat 5% fee from coaching subscriptions.</p>
      </>
    ),
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FAQ() {
  return (
    <>
      <Head>
        <title>FAQ - Repsetter</title>
      </Head>
      <div className="style-links mx-auto mt-2 max-w-3xl divide-y-2 divide-gray-200">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <dl className="mt-6 space-y-6 divide-y divide-gray-200">
          {faqs.map((faq) => (
            <Disclosure as="div" key={faq.question} className="pt-6">
              {({ open }) => (
                <>
                  <dt className="text-lg">
                    <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-400">
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <ChevronDownIcon
                          className={classNames(
                            open ? "-rotate-180" : "rotate-0",
                            "h-6 w-6 transform"
                          )}
                          aria-hidden="true"
                        />
                      </span>
                    </Disclosure.Button>
                  </dt>
                  <Disclosure.Panel
                    as="dd"
                    className="prose mt-4 text-base text-gray-500"
                  >
                    <faq.answer />
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </dl>
      </div>
    </>
  );
}
