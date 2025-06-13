import { useState } from 'react';
import {
  Product,
  useGetProductsWithPaginationQuery,
  useDeleteProductMutation,
  useSearchProductsQuery,
} from '../../api/ProductsApi';
import {
  useGetAllWarehousesQuery,
  useAssignProductToWarehouseMutation
} from '../../api/WarehousesApi';
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
import { showNotification } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold, PiPlusBold, PiCheckBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import DashboardCrudModal from '../../components/DashboardCrudModal';

const ProductsDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [assignProduct] = useAssignProductToWarehouseMutation();
  const { data: allWarehouses } = useGetAllWarehousesQuery();

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
            color="blue"
            variant="light"
            onClick={() => {
              setSelectedProductId(getValue());
              setAssignModalOpen(true);
            }}
            title="Assign to Warehouse"
          >
            <PiPlusBold size={18} />
          </ActionIcon>
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
          <>
            <DashboardTable
            title='Predictions'
              tableData={tableData}
              allColumns={columns}
              enableSort
              totalPages={totalPages}
              currentPage={page}
              fetchData={setPage}
            />
            <DashboardCrudModal
              opened={assignModalOpen}
              onClose={() => {
                setAssignModalOpen(false);
                setSelectedProductId(null);
                setSelectedWarehouseId(null);
                setQuantity(1);
              }}
              title="Assign Product to Warehouse"
              onSubmit={async () => {
                if (!selectedProductId || !selectedWarehouseId) return;

                try {
                  await assignProduct({
                    productId: selectedProductId,
                    quantity,
                    warehouseId: selectedWarehouseId,
                  }).unwrap();
                  showNotification({
                    title: 'Product Assigned',
                    message: `Product was successfully assigned to the warehouse.`,
                    color: 'green',
                    icon: <PiCheckBold />,
                  });

                  setAssignModalOpen(false);
                  setSelectedProductId(null);
                  setSelectedWarehouseId(null);
                  setQuantity(1);
                } catch (error) {
                  console.error('Assignment failed:', error);
                }
              }}
              submitLabel="Assign"
            >
              <Stack>
                <TextInput
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.currentTarget.value))}
                  min={1}
                />
                <Text>Select Warehouse:</Text>
                <Stack>
                  {allWarehouses?.map((w) => (
                    <Button
                      key={w.id}
                      variant={selectedWarehouseId === w.id ? 'filled' : 'light'}
                      onClick={() => setSelectedWarehouseId(w.id)}
                      fullWidth
                    >
                      {w.name}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </DashboardCrudModal>
          </>
        )}

        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm Delete"
          centered
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: 20
          }}
          styles={{
            overlay: {
              zIndex: 20 // Also need to set overlay zIndex
            }
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
