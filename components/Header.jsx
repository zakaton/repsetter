import { Fragment, useState, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";

import { useUser } from "../context/user-context";
import MyLink from "./MyLink";

const navigation = [
  { name: "About", href: "/" },
  { name: "FAQ", href: "/faq" },
  { name: "Dashboard", href: "/dashboard", requiresUser: true },
];
const dashboardNavigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Sign Out", href: "/sign-out" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const router = useRouter();
  const shouldHighlightHref = (href) =>
    router.pathname.startsWith(href) &&
    (!(href === "/") || router.pathname === href);

  const { isLoading, user, signOut } = useUser();

  const [useSSR, setUseSSR] = useState(false);
  useEffect(() => {
    setUseSSR(true);
  }, []);

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <MyLink href="/" className="flex flex-shrink-0 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="hidden h-7 w-auto xxs:block"
                    src="/images/icon.svg"
                    alt="Repsetter"
                  />
                  <span className="hidden px-2 text-xl font-medium xs:block">
                    Repsetter
                  </span>
                </MyLink>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {useSSR &&
                    navigation.map(({ name, href, requiresUser }) => {
                      return (
                        <MyLink
                          href={href}
                          key={name}
                          className={classNames(
                            requiresUser && !user ? "hidden" : "",
                            shouldHighlightHref(href)
                              ? "border-blue-500 text-gray-900"
                              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "text-md inline-flex items-center border-b-2 px-1 pt-1 font-medium"
                          )}
                        >
                          {name}
                        </MyLink>
                      );
                    })}
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {!isLoading &&
                  (user ? (
                    <>
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative z-20 ml-3">
                        <div>
                          <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <span className="sr-only">Open user menu</span>
                            <UserCircleIcon
                              className="h-9 w-9"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {dashboardNavigation.map(({ name, href }) => (
                              <Menu.Item key={name}>
                                {({ active }) => (
                                  <MyLink
                                    href={href}
                                    onClick={(e) => {
                                      if (name === "Sign Out") {
                                        e.preventDefault();
                                        signOut();
                                      }
                                    }}
                                    className={classNames(
                                      shouldHighlightHref(href)
                                        ? "font-medium text-blue-700"
                                        : "text-gray-700",
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm"
                                    )}
                                  >
                                    {name}
                                  </MyLink>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </>
                  ) : (
                    <MyLink
                      href={`/sign-in?redirect_pathname=${window.location.pathname}`}
                      as="/sign-in"
                      className="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700"
                    >
                      Sign in
                    </MyLink>
                  ))}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-4">
              {navigation.map(({ name, href, requiresUser }) => (
                <Disclosure.Button
                  key={name}
                  className={classNames(
                    requiresUser && !user ? "hidden" : "",
                    shouldHighlightHref(href) &&
                      (!(href === "/") || router.pathname === href)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-transparent  text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                  )}
                >
                  <MyLink href={href}>{name}</MyLink>
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
