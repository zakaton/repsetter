/* eslint-disable react/destructuring-assignment */
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, ExclamationIcon } from "@heroicons/react/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const colorPalletes = {
  red: {
    "bg-100": "bg-red-100",
    "text-600": "text-red-600",
    "bg-600": "bg-red-600",
    "focus:ring-500": "focus:ring-red-500",
    "hover:bg-700": "hover:bg-red-700",
  },
  indigo: {
    "bg-100": "bg-indigo-100",
    "text-600": "text-indigo-600",
    "bg-600": "bg-indigo-600",
    "focus:ring-500": "focus:ring-indigo-500",
    "hover:bg-700": "hover:bg-indigo-700",
  },
  blue: {
    "bg-100": "bg-blue-100",
    "text-600": "text-blue-600",
    "bg-600": "bg-blue-600",
    "focus:ring-500": "focus:ring-blue-500",
    "hover:bg-700": "hover:bg-blue-700",
  },
};

export default function Modal({
  children,
  title,
  message,
  open,
  setOpen,
  Icon = ExclamationIcon,
  color,
  Button,
  className = "",
}) {
  const colorPallete = colorPalletes[color] || colorPalletes.blue;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={classNames(
                  "relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6 sm:align-middle",
                  className
                )}
              >
                <div className="absolute top-0 right-0 block pt-4 pr-4">
                  <button
                    type="button"
                    className={classNames(
                      "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      colorPallete["focus:ring-500"]
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div
                    className={classNames(
                      "mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10",
                      colorPallete["bg-100"]
                    )}
                  >
                    <Icon
                      className={classNames(
                        "h-6 w-6",
                        colorPallete["text-600"]
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{message}</p>
                    </div>
                  </div>
                </div>
                {children}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  {Button}
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
