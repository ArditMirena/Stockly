import { useState, useEffect } from 'react';
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
  Select
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  PiMagnifyingGlassBold,
  PiPencilSimpleLineBold,
  PiTrashBold,
  PiEyeBold
} from 'react-icons/pi';
import { useForm, Controller } from 'react-hook-form';
import DashboardTable, { Column } from '../../components/DashboardTable';
import DashboardCrudModal from '../../components/DashboardCrudModal';

const UsersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const formMethods = useForm<Pick<User, 'username' | 'email' | 'role'>>({});

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

  const handleSubmit = async (data: Pick<User, 'username' | 'email' | 'role'>) => {
    if(!selectedUser) return;

    try {
      await updateUser({
        id: selectedUser.id,
        user: {
          username: data.username,
          email: data.email,
          role: data.role
        }
      }).unwrap();

      setModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      formMethods.reset({
        username: selectedUser.username,
        email: selectedUser.email,
        role: selectedUser.role
      });
    }
  }, [selectedUser]);

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
          <DashboardCrudModal
            opened={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={formMethods.handleSubmit(handleSubmit)}
            title="View / Edit User"
            submitLabel={isUpdating ? "Updating..." : "Update"}
            isSubmitting={isUpdating}
          >
            <TextInput
            label="Username"
            placeholder="Enter username"
            {...formMethods.register('username')}
            error={formMethods.formState.errors.username?.message}
          />
          
          <TextInput
            label="Email"
            placeholder="Enter email"
            type="email"
            {...formMethods.register('email')}
            error={formMethods.formState.errors.email?.message}
          />
          
          <Controller
            name="role"
            control={formMethods.control}
            render={({ field }) => (
              <Select
                label="Role"
                placeholder="Select role"
                data={[
                  { value: 'USER', label: 'User' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'SUPERADMIN', label: 'Super Admin' },
                  { value: 'BUYER', label: 'Buyer' },
                  { value: 'SUPPLIER', label: 'Supplier' }
                ]}
                value={field.value}
                onChange={field.onChange}
                error={formMethods.formState.errors.role?.message}
              />
            )}
          />
          </DashboardCrudModal>
      </Stack>
    </Paper>

  );
};

export default UsersDashboard;
