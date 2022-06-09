/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from 'react';
import { useUser } from '../../../context/user-context';
import Modal from '../../Modal';

export default function DeleteUserModal(props) {
  const {
    open,
    setOpen,
    selectedUser,
    setDeleteUserStatus,
    setShowDeleteUserNotification,
  } = props
  const [isDeleting, setIsDeleting] = useState(false);
  const [didDelete, setDidDelete] = useState(false);
  const { fetchWithAccessToken } = useUser();

  useEffect(() => {
    if (open) {
      setIsDeleting(false);
      setDidDelete(false);
    }
  }, [open]);

  return (
    <Modal {...props} color="red" title="Delete User" message="Are you sure you want to delete this user? This action cannot be undone."
    Button={<button
      role='button'
      onClick={async () => {
        setIsDeleting(true);
        const response = await fetchWithAccessToken(`/api/account/delete-account?userId=${selectedUser.id}`);
        setIsDeleting(false);
        setDidDelete(true);
        const { status } = await response.json();
        setDeleteUserStatus(status);
        setShowDeleteUserNotification(true);
        setOpen(false);
      }}
      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {isDeleting
        ? 'Deleting User...'
        : didDelete
        ? 'Deleted User!'
        : 'Delete User'}
    </button>}
    ></Modal>
  )
}
