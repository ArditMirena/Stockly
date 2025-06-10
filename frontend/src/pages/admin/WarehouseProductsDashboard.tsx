import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Paper,
  Title,
  Divider,
  Stack,
  Box,
  Loader,
  TextInput,
  Group
} from '@mantine/core';
import DashboardTable, { Column } from '../../components/DashboardTable';
import {
  WarehouseProductDTO,
  useGetWarehouseProductsWithPaginationQuery,
} from '../../api/WarehousesApi';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

const WarehouseProductsDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: paginatedResponse, isLoading } = useGetWarehouseProductsWithPaginationQuery({
    offset: page,
    pageSize: 10,
    ...((user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) && { managerId: user.id }),
  });

  const columns: Column<WarehouseProductDTO>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'productTitle',
      header: 'Product Title',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Product Unit Price',
      enableSorting: true,
      cell: (info: any) => `$${info.getValue().toFixed(2)}`,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'availability',
      header: 'Availability',
      enableSorting: false,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'warehouseName',
      header: 'Warehouse',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
  ];

  const tableData = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 1;

  return (
    <Paper>
      <Stack>
        <Group align="center" mb="sm">
          <Title order={3}>Warehouse Products Dashboard</Title>
          <TextInput
            placeholder="Search products..."
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

        {isLoading ? (
          <Box py="xl" style={{ textAlign: 'center' }}>
            <Loader />
          </Box>
        ) : (
          <DashboardTable
            title='Warehouse Products'
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

export default WarehouseProductsDashboard;
