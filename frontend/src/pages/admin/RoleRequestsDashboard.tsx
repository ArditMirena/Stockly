import { useState } from 'react';
import {
  Stack,
  Group,
  Modal,
  Button,
  Text,
  Badge,
  Card,
  Alert,
  Avatar
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { PiTrashBold, PiCheckBold, PiUserBold, PiWarningBold } from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import {
  useApproveRoleRequestMutation,
  useGetRoleRequestsWithPaginationQuery,
  useDeleteRoleRequestMutation,
  RoleRequest
} from '../../api/RoleRequestApi';

// Simple role configuration
const ROLE_CONFIG = {
  USER: { label: 'User', color: 'blue' },
  ADMIN: { label: 'Admin', color: 'orange' },
  SUPER_ADMIN: { label: 'Super Admin', color: 'red' },
  BUYER: { label: 'Buyer', color: 'green' },
  SUPPLIER: { label: 'Supplier', color: 'purple' },
};

const RoleRequestDashboard = () => {
  const [page, setPage] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleRequestToDelete, setRoleRequestToDelete] = useState<RoleRequest | null>(null);

  const [approveRoleRequest, { isLoading: isApproving }] = useApproveRoleRequestMutation();
  const [deleteRoleRequest, { isLoading: isDeleting }] = useDeleteRoleRequestMutation();

  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading,
    refetch: refetchRoleRequests,
    error: roleRequestsError
  } = useGetRoleRequestsWithPaginationQuery({
    offset: page,
    pageSize: 10,
    sortBy: 'id',
  });

  const handleApprove = async (roleRequest: RoleRequest) => {
    if (roleRequest.approved) {
      showNotification({
        title: 'Info',
        message: 'This request is already approved',
        color: 'blue',
      });
      return;
    }

    try {
      await approveRoleRequest(roleRequest.id).unwrap();
      
      showNotification({
        title: 'Success',
        message: 'Role request approved successfully',
        color: 'green',
      });

      refetchRoleRequests();
    } catch (err: any) {
      showNotification({
        title: 'Error',
        message: 'Failed to approve role request',
        color: 'red',
      });
    }
  };

  const handleDeleteClick = (roleRequest: RoleRequest) => {
    setRoleRequestToDelete(roleRequest);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleRequestToDelete) return;

    try {
      await deleteRoleRequest(roleRequestToDelete.id).unwrap();
      
      showNotification({
        title: 'Success',
        message: 'Role request deleted successfully',
        color: 'green',
      });

      setDeleteModalOpen(false);
      setRoleRequestToDelete(null);
      refetchRoleRequests();
    } catch (err: any) {
      showNotification({
        title: 'Error',
        message: 'Failed to delete role request',
        color: 'red',
      });
    }
  };

  // Table columns
  const columns: Column<RoleRequest>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info) => (
        <Text fw={500} c="dimmed" size="sm">
          #{info.getValue() as string}
        </Text>
      ),
      size: 80,
    },
    {
      accessorKey: 'userId',
      header: 'User ID',
      cell: (info) => (
        <Text fw={500} size="sm">
          {info.getValue() as string}
        </Text>
      ),
      size: 100,
    },
    {
      accessorKey: 'role',
      header: 'Requested Role',
      cell: (info) => {
        const role = info.getValue() as keyof typeof ROLE_CONFIG;
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
        
        return (
          <Badge color={config.color} variant="light" size="sm">
            {config.label}
          </Badge>
        );
      },
      size: 150,
    },
    {
      accessorKey: 'approved',
      header: 'Status',
      cell: (info) => {
        const approved = info.getValue() as boolean;
        
        return (
          <Badge 
            color={approved ? 'green' : 'yellow'} 
            variant="light" 
            size="sm"
          >
            {approved ? 'Approved' : 'Pending'}
          </Badge>
        );
      },
      size: 120,
    },
  ];

  // Table actions
  const actions: DashboardAction<RoleRequest>[] = [
    {
      icon: <PiCheckBold size={16} />,
      color: 'green',
      title: 'Approve Request',
      onClick: handleApprove
    },
    {
      icon: <PiTrashBold size={16} />,
      color: 'red',
      title: 'Delete Request',
      onClick: handleDeleteClick
    }
  ];

  const tableData = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 1;

  return (
    <>
      {/* Simple Table */}
      <DashboardTable
        tableData={tableData}
        allColumns={columns}
        actions={actions}
        totalPages={totalPages}
        currentPage={page}
        fetchData={setPage}
        title="Role Requests Dashboard"
        subtitle="Manage user role change requests"
        titleIcon={<PiUserBold size={28} />}
        isLoading={isPaginatedLoading}
        error={roleRequestsError}
        enableSort={false}
        enableSearch={false}
      />

      {/* Simple Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRoleRequestToDelete(null);
        }}
        title="Delete Role Request"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Alert 
            icon={<PiWarningBold size={16} />} 
            title="Warning" 
            color="red"
            variant="light"
          >
            This action cannot be undone.
          </Alert>

          {roleRequestToDelete && (
            <Card withBorder p="md">
              <Text fw={500}>Request #{roleRequestToDelete.id}</Text>
              <Text size="sm" c="dimmed">User ID: {roleRequestToDelete.userId}</Text>
              <Text size="sm" c="dimmed">Role: {roleRequestToDelete.role}</Text>
            </Card>
          )}

          <Group justify="flex-end" gap="sm">
            <Button 
              variant="default" 
              onClick={() => {
                setDeleteModalOpen(false);
                setRoleRequestToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              loading={isDeleting}
              onClick={handleDeleteConfirm}
              leftSection={<PiTrashBold size={16} />}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default RoleRequestDashboard;
