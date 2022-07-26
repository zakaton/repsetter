import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import {
  BellIcon,
  UserCircleIcon,
  UserGroupIcon,
  ClipboardListIcon,
  CameraIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  ChartBarIcon,
  HeartIcon,
  ScaleIcon,
  ClipboardCopyIcon,
  TableIcon,
  TemplateIcon,
  ViewGridIcon,
} from "@heroicons/react/outline";
import MyLink from "../MyLink";
import { useUser } from "../../context/user-context";

const navigation = [
  {
    name: "General",
    href: "/dashboard",
    icon: UserCircleIcon,
  },
  {
    name: "All Users",
    href: "/dashboard/all-users",
    icon: UserGroupIcon,
    isAdmin: true,
  },
  {
    name: "My Coaches",
    href: "/dashboard/my-coaches",
    icon: ClipboardIcon,
  },
  {
    name: "My Clients",
    href: "/dashboard/my-clients",
    icon: UserGroupIcon,
    canCoach: true,
  },
  {
    name: "Exercise Types",
    href: "/dashboard/exercise-types",
    icon: ClipboardListIcon,
  },
  {
    name: "Diary",
    href: "/dashboard/diary",
    icon: ClipboardCopyIcon,
  },
  {
    name: "Exercises",
    href: "/dashboard/exercises",
    icon: ClipboardCheckIcon,
  },
  {
    name: "Blocks",
    href: "/dashboard/blocks",
    icon: TemplateIcon,
  },
  {
    name: "Progress",
    href: "/dashboard/progress",
    icon: ChartBarIcon,
  },
  {
    name: "Bodyweight",
    href: "/dashboard/bodyweight",
    icon: ScaleIcon,
  },
  {
    name: "Pictures",
    href: "/dashboard/pictures",
    icon: CameraIcon,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: BellIcon,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isLoading, user, isAdmin } = useUser();

  useEffect(() => {
    if (router.isReady && !isLoading && !user) {
      router.replace(
        {
          pathname: "/sign-in",
          query: { ...router.query, ...{ redirect_pathname: router.pathname } },
        },
        "/sign-in",
        {
          shallow: true,
        }
      );
    }
  }, [isLoading, user, router.isReady]);

  return (
    !isLoading &&
    user && (
      <>
        <Head>
          <title>Dashboard - Repsetter</title>
        </Head>
        <div className="lg:grid lg:grid-cols-7 lg:gap-x-5">
          <aside className="lg:col-span-1 lg:py-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const current = router.route === item.href;
                return (
                  (!item.isAdmin || isAdmin) &&
                  (!item.canCoach || user.can_coach) && (
                    <MyLink
                      key={item.href}
                      href={item.href}
                      className={classNames(
                        current
                          ? "bg-gray-50 text-blue-700 hover:bg-white hover:text-blue-700"
                          : "text-gray-900 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium"
                      )}
                      {...(current ? { "aria-current": "page" } : {})}
                    >
                      <item.icon
                        className={classNames(
                          current
                            ? "text-blue-500 group-hover:text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500",
                          "-ml-1 mr-3 h-6 w-6 flex-shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </MyLink>
                  )
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6 lg:col-span-6">
            <div className="shadow sm:rounded-md">{children}</div>
          </div>
        </div>
      </>
    )
  );
}

export function getDashboardLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
}
