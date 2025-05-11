import { useState } from 'react';
import {
  useGetPaginatedOrdersQuery,
  useSearchOrdersQuery,
  OrderDTO,
} from '../../api/ordersApi';
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

const OrdersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading,
  } = useGetPaginatedOrdersQuery({
    offset: page,
    pageSize: 10,
  });

  const {
    data: searchedOrders,
    isFetching: isSearchLoading,
  } = useSearchOrdersQuery(debouncedSearch, {
    skip: debouncedSearch.length === 0,
  });

  const columns: Column<OrderDTO>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'buyerId',
      header: 'Buyer',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'supplierId',
      header: 'Supplier',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      enableSorting: true,
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'shipmentId',
      header: 'Shipment ID',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      enableSorting: true,
      cell: (info: any) => `$${info.getValue()?.toFixed(2)}`,
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

  const tableData = debouncedSearch.length > 0 ? searchedOrders || [] : paginatedResponse?.content || [];
  const totalPages = debouncedSearch.length > 0 ? 1 : paginatedResponse?.totalPages || 1;

  return (
    <Paper>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Orders Dashboard</Title>
          <TextInput
            placeholder="Search orders..."
            leftSection={<PiMagnifyingGlassBold size={16} />}
            w={250}
            value={searchTerm}
            onChange={(e) => {
              setPage(0);
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

export default OrdersDashboard;