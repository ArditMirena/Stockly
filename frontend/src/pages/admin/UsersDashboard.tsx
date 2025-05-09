import { useState } from 'react';
import {
  useGetUsersWithPaginationQuery,
  useSearchUsersQuery,
  User,
  useUpdateUserMutation,
} from '../../api/UsersApi';
import {
  ActionIcon,
  Box,
  Paper,
  Title,
  TextInput,
  Group,
  Divider,
  Stack,
  Loader,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  PiMagnifyingGlassBold,
  PiPencilSimpleLineBold,
  PiTrashBold,
  PiEyeBold
} from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import { DashboardCrudModal } from '../../components/DashboardCrudModal';

type FieldOption = {
  value: string;
  label: string;
};

type Field = {
  name: keyof User;
  label: string;
  type: 'text' | 'select';
  options?: FieldOption[];
};


const UsersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();


  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading,
  } = useGetUsersWithPaginationQuery({
    offset: page,
    pageSize: 10,
  });

  const {
    data: searchedUsers,
    isFetching: isSearchLoading,
  } = useSearchUsersQuery(debouncedSearch, {
    skip: debouncedSearch.length === 0,
  });

  const columns: Column<User>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'username',
      header: 'Username',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }: any) => (
        <Group justify="center">
          <ActionIcon
            color="green"
            variant="light"
            onClick={() => {
              setSelectedUser(row.original);
              setModalOpen(true);
            }}
          >
            <PiEyeBold size={18} />
          </ActionIcon>
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => {
              setSelectedUser(row.original);
              setModalOpen(true);
            }}
          >
            <PiPencilSimpleLineBold size={18} />
          </ActionIcon>
          <ActionIcon color="red" variant="light">
            <PiTrashBold size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const tableData = debouncedSearch.length > 0 ? searchedUsers || [] : paginatedResponse?.content || [];
  const totalPages = debouncedSearch.length > 0 ? 1 : paginatedResponse?.totalPages || 1;

  const userFields: Field[] = [
    { name: 'username', label: 'Username', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { value: 'USER', label: 'USER' },
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'SUPERADMIN', label: 'SUPERADMIN' },
        { value: 'BUYER', label: 'BUYER' },
        { value: 'SUPPLIER', label: 'SUPPLIER' }
      ],
    },
  ];

  const handleSubmit = async (updatedUser: User) => {
    try {
      const updatePayload = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      };

      await updateUser({
        id: updatedUser.id,
        user: updatePayload
      }).unwrap();

      setModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  return (
    <Paper>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Users Dashboard</Title>
          <TextInput
            placeholder="Search users..."
            leftSection={<PiMagnifyingGlassBold size={16} />}
            w={250}
            value={searchTerm}
            onChange={(e) => {
              setPage(0); // Reset page on search
              setSearchTerm(e.currentTarget.value);
            }}
          />
        </Group>

        <Divider />

        {(isPaginatedLoading || isSearchLoading) ? (
          <Box py="xl" style={{ textAlign: 'center' }}>
            <Loader />
          </Box>
        ) : (
          <DashboardTable
            tableData={tableData}
            allColumns={columns}
            enableSort
            totalPages={totalPages}
            currentPage={page}
            fetchData={setPage}
          />
        )}
        {selectedUser && (
          <DashboardCrudModal<User>
            opened={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={handleSubmit}
            defaultValues={selectedUser}
            fields={userFields}
            title="View / Edit User"
            submitLabel={isUpdating ? "Updating..." : "Update"}
          />
        )}
      </Stack>
    </Paper>

  );
};

export default UsersDashboard;
