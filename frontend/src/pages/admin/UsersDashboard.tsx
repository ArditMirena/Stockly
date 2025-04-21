import { useState } from 'react';
import {
  useGetUsersWithPaginationQuery,
  useSearchUsersQuery,
  User,
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

const UsersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

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
      cell: () => (
        <Group justify="center">
          <ActionIcon color="green" variant="light">
            <PiEyeBold size={18} />
          </ActionIcon>
          <ActionIcon color="blue" variant="light">
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
      </Stack>
    </Paper>
  );
};

export default UsersDashboard;
