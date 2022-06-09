import { getAccountLayout } from '../../components/layouts/AccountLayout';
import DeleteSubscriptionModal from '../../components/account/modal/DeleteSubscriptionModal';
import Table from '../../components/Table';
import Head from 'next/head';

const filterTypes = [
  {
    name: 'Redeemed?',
    query: 'redeemed',
    column: 'redeemed',
    radios: [
      { value: true, label: 'yes', defaultChecked: false },
      { value: false, label: 'no', defaultChecked: false },
      { value: null, label: 'either', defaultChecked: true },
    ],
  },
];

const orderTypes = [
  {
    label: 'Date Created',
    query: 'date-created',
    value: ['created_at', { ascending: false }],
    current: false,
  },
  {
    label: 'Date Redeemed',
    query: 'date-redeemed',
    value: ['redeemed_at', { ascending: false }],
    current: false,
  },
  {
    label: 'Price',
    query: 'price',
    value: ['price', { ascending: false }],
    current: false,
  },
];

export default function Subscriptions() {
  return (
  <>
    <Head>
      <title>Subscriptions - Repsetter</title>
    </Head>
    <Table filterTypes={filterTypes} orderTypes={orderTypes} tableName='subscription' numberOfResultsPerPage={4} DeleteResultModal={DeleteSubscriptionModal}></Table>
  </>
  )
}

Subscriptions.getLayout = getAccountLayout;
