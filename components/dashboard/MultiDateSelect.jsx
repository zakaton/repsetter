import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { isMobile, isDesktop } from "react-device-detect";

const items = [
  { label: "Current Day", value: "day" },
  { label: "Current Week", value: "week" },
  { label: "Current Month", value: "month" },
  { label: "4 Weeks (Inc Current)", value: "block" },
];
const colorPalletes = {
  default: {
    border: "border-gray-300",
    bg: "bg-white",
    text: "text-gray-700",
    "menu-text": "text-gray-500",
    "hover:bg": "hover:bg-gray-50",
    "focus:border": "focus:border-blue-500",
    "focus:ring": "focus:ring-blue-500",
    ring: "ring-black",
    active: "bg-gray-100 text-gray-900",
    inactive: "text-gray-700",
  },
  blue: {
    border: "border-blue-500",
    bg: "bg-blue-600",
    text: "text-white",
    "menu-text": "text-white",
    "hover:bg": "hover:bg-blue-700",
    "focus:border": "focus:border-blue-500",
    "focus:ring": "focus:ring-blue-500",
    ring: "ring-black",
    active: "hover:bg-blue-700 text-white",
    inactive: "text-white",
  },
  red: {
    border: "border-red-500",
    bg: "bg-red-600",
    text: "text-white",
    "menu-text": "text-white",
    "hover:bg": "hover:bg-red-700",
    "focus:border": "focus:border-red-500",
    "focus:ring": "focus:ring-red-500",
    ring: "ring-black",
    active: "hover:bg-red-700 text-white",
    inactive: "text-white",
  },
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function MultiDateSelect({
  className,
  title,
  setDateRange,
  color,
  onClick,
  activeOption,
  setActiveOption,
}) {
  const colorPallete = colorPalletes[color] || colorPalletes.default;

  return (
    <div className={classNames("inline-flex rounded-md shadow-sm", className)}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => {
          setActiveOption("day");
        }}
        onMouseLeave={() => {
          if (activeOption === "day") {
            setActiveOption();
          }
        }}
        className={classNames(
          "relative inline-flex w-full items-center rounded-l-md border px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1",
          colorPallete["bg"],
          colorPallete["border"],
          colorPallete["text"],
          colorPallete["hover:bg"],
          colorPallete["focus:border"],
          colorPallete["focus:ring"]
        )}
      >
        {title}
      </button>
      <Menu as="div" className="relative -ml-px block">
        <Menu.Button
          onMouseEnter={(e) => {
            setActiveOption("");
          }}
          onMouseLeave={(e) => {}}
          className={classNames(
            "relative inline-flex items-center rounded-r-md border px-2 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1",
            colorPallete["border"],
            colorPallete["bg"],
            colorPallete["menu-text"],
            colorPallete["hover:bg"],
            colorPallete["focus:border"],
            colorPallete["focus:ring"]
          )}
        >
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={classNames(
              "absolute right-0 z-10 mt-2 -mr-1 w-48 origin-top-right rounded-md shadow-lg ring-1 ring-opacity-5 focus:outline-none",
              colorPallete["bg"],
              colorPallete["ring"]
            )}
          >
            <div className="py-1">
              {items.map((item) => (
                <Menu.Item key={item.value}>
                  {({ active }) => {
                    return (
                      <button
                        onMouseEnter={() => setActiveOption(item.value)}
                        onMouseLeave={() => {
                          if (activeOption === item.value) {
                            setActiveOption();
                          }
                        }}
                        className={classNames(
                          active
                            ? colorPallete["active"]
                            : colorPallete["inactive"],
                          "block w-full px-4 py-2 text-left text-sm"
                        )}
                        onClick={() => setDateRange(item.value)}
                      >
                        {item.label}
                      </button>
                    );
                  }}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
