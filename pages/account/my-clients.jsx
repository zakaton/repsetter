import { useRouter } from 'next/router';
import { getAccountLayout } from '../../components/layouts/AccountLayout';
import DeleteUserModal from '../../components/account/modal/DeleteUserModal';
import Table from '../../components/Table';

const filterTypes = [
  {
    name: 'Has Completed Onboarding?',
    query: 'has-completed-onboarding',
    column: 'has_completed_onboarding',
    radios: [
      { value: true, label: 'yes', defaultChecked: false },
      { value: false, label: 'no', defaultChecked: false },
      { value: null, label: 'either', defaultChecked: true },
    ],
  },
  {
    name: 'Can Coach?',
    query: 'can-coach',
    column: 'can_coach',
    radios: [
      { value: true, label: 'yes', defaultChecked: false },
      { value: false, label: 'no', defaultChecked: false },
      { value: null, label: 'either', defaultChecked: true },
    ],
  },
];

const orderTypes = [
  {
    label: 'Date Joined',
    query: 'date-joined',
    value: ['created_at', { ascending: false }],
    current: false,
  },
  {
    label: 'Email',
    query: 'email',
    value: ['email', { ascending: true }],
    current: false,
  },
];

export default function AllUsers() {
  const router = useRouter();
  return (
     (
      <>
        <Table filterTypes={filterTypes} orderTypes={orderTypes} tableName='profile' resultName='client' title="My Clients" numberOfResultsPerPage={4} DeleteResultModal={DeleteUserModal}></Table>
      </>
    )
  );
}

AllUsers.getLayout = getAccountLayout;
