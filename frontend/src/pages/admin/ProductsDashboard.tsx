import { useState } from 'react';
import {
  Product,
  useGetProductsWithPaginationQuery,
  useDeleteProductMutation,
  useSearchProductsQuery,
} from '../../api/ProductsApi';
import {
  Paper,
  Title,
  Divider,
  Stack,
  Group,
  ActionIcon,
  Box,
  Loader,
  Image,
  Modal,
  Button,
  Text,
  TextInput
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';

const ProductsDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading
  } = useGetProductsWithPaginationQuery({
    offset: page,
    pageSize: 10,
  });

  const {
      data: searchedProducts,
      isFetching: isSearchLoading,
    } = useSearchProductsQuery(debouncedSearch, {
      skip: debouncedSearch.length === 0,
    });

  const [deleteProduct] = useDeleteProductMutation();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteProduct(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    { 
      accessorKey: 'title', 
      header: 'Title',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      enableSorting: true,
      cell: (info: any) => `$${info.getValue().toFixed(2)}`,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      enableSorting: true,
      cell: (info: any) => info.getValue(),
    },
    { 
      accessorKey: 'availabilityStatus',
      header: 'Status',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'qrCode',
      header: 'QR Code',
      enableSorting: false,
      cell: ({ getValue }) => (
        <Image src={getValue()} alt="QR" h={40} w={40} fit="contain" />
      ),
    },
    {
      accessorKey: 'thumbnailUrl',
      header: 'Thumbnail',
      enableSorting: false,
      cell: ({ getValue }) => (
        <Image src={getValue()} alt="Thumbnail" h={40} w={40} fit="contain" />
      ),
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      enableSorting: false,
      cell: (info: any) => info.getValue(),
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: ({ getValue }) => (
        <Group justify="center">
          <ActionIcon
            color="red"
            variant="light"
            onClick={() => {
              setDeleteId(getValue());
              setConfirmOpen(true);
            }}
          >
            <PiTrashBold size={18} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const tableData = debouncedSearch.length > 0 ? searchedProducts || [] : paginatedResponse?.content || [];
  const totalPages = debouncedSearch.length > 0 ? 1 : paginatedResponse?.totalPages || 1;

  return (
    <Paper>
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Products Dashboard</Title>
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

        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm Delete"
          centered
          style={{
            position: 'fixed',
            top: '0',
            left: '0'
          }}
        >
          <Text>Are you sure you want to delete this product?</Text>
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Stack>
    </Paper>
  );
};

export default ProductsDashboard;
