import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import { BellIcon, UserCircleIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/outline';
import MyLink from '../MyLink';
import { useUser } from '../../context/user-context';

const navigation = [
  {
    name: 'General',
    href: '/account',
    icon: UserCircleIcon,
  },
  {
    name: 'Users',
    href: '/users',
    icon: UserGroupIcon,
    isAdmin: true,
  },
  {
    name: 'Coaches',
    href: '/coaches',
    icon: UsersIcon,
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: UserGroupIcon,
  },
  {
    name: 'Notifications',
    href: '/account/notifications',
    icon: BellIcon,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AccountLayout({ children }) {
  const router = useRouter();
  const { isLoading, user, isAdmin } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        {
          pathname: '/sign-in',
          query: { ...router.query, ...{ redirect_pathname: router.pathname } },
        },
        '/sign-in',
        {
          shallow: true,
        }
      );
    }
  }, [isLoading, user]);

  return (
    !isLoading &&
    user && (
      <>
        <Head>
          <title>Account - Repsetter</title>
        </Head>
        <div className="lg:grid lg:grid-cols-7 lg:gap-x-5">
          <aside className="px-2 sm:px-6 lg:col-span-1 lg:py-0 lg:px-0">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const current = router.route === item.href;
                return (
                  (!item.isAdmin || isAdmin) && (
                    <MyLink
                      key={item.href}
                      href={item.href}
                      className={classNames(
                        current
                          ? 'bg-gray-50 text-blue-700 hover:bg-white hover:text-blue-700'
                          : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                      )}
                      {...(current ? { 'aria-current': 'page' } : {})}
                    >
                      <item.icon
                        className={classNames(
                          current
                            ? 'text-blue-500 group-hover:text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500',
                          '-ml-1 mr-3 h-6 w-6 flex-shrink-0'
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

          <div className="space-y-6 sm:px-6 lg:col-span-6 lg:px-0">
            <div className="shadow sm:rounded-md">{children}</div>
          </div>
        </div>
      </>
    )
  );
}

export function getAccountLayout(page) {
  return <AccountLayout>{page}</AccountLayout>;
}
