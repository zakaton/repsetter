/* eslint-disable react/destructuring-assignment */
import { useState, useEffect } from 'react';
import { useUser } from '../../../context/user-context';
import Modal from '../../Modal'

export default function DeleteUserModal(props) {
  const {
    open,
    selectedSubscription,
    setDeleteSubscriptionStatus,
    setShowDeleteSubscriptionNotification,
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
    <Modal {...props} title="Delete Subscription" message="Are you sure you want to delete this subscription? This action cannot be undone." color="red"></Modal>
  );
}
