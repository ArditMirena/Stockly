import { useEffect, useState } from 'react';
import {
  useCreateOrderMutation,
  useGetPaginatedOrdersQuery,
  useSearchOrdersQuery,
  OrderDTO,
} from '../../api/ordersApi';
import { useGetAllWarehousesQuery, useGetWarehouseProductsQuery } from '../../api/WarehousesApi';
import { useGetCompaniesByTypeQuery } from '../../api/CompaniesApi';
import { useCreateShipmentMutation } from '../../api/ShipmentsApi';
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
  Button,
  Select,
  NumberInput,
  Notification
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {
  PiMagnifyingGlassBold,
  PiPencilSimpleLineBold,
  PiTrashBold,
  PiEyeBold
} from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import DashboardCrudModal from '../../components/DashboardCrudModal';

const OrdersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const { data: warehouses = [] } = useGetAllWarehousesQuery();
  const { data: buyers = [] } = useGetCompaniesByTypeQuery('BUYER');

  const { 
    data: warehouseProducts = [], 
    isFetching: isFetchingProducts 
  } = useGetWarehouseProductsQuery(
    { warehouseId: Number(warehouseId) }, 
    { skip: !warehouseId }
  );

  useEffect(() => {
    if (warehouseId) {
      setProductId(null);
    }
  }, [warehouseId]);

  const [error, setError] = useState<string | null>(null);
  const [createOrder] = useCreateOrderMutation();
  const [createShipment, { isLoading: isCreatingShipment }] = useCreateShipmentMutation();

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

  const handleOpenModal = (order: OrderDTO | null, type: 'view' | 'edit') => {
    setSelectedOrder(order);
    setModalType(type);
    setModalOpen(true);

    if (order) {
      setBuyerId(order.buyerId.toString());
      setWarehouseId(order.warehouseId.toString());
      if (order.items && order.items.length > 0) {
        setProductId(order.items[0].productId.toString());
        setQuantity(order.items[0].quantity);
      }
    } else {
      setBuyerId(null);
      setWarehouseId(null);
      setProductId(null);
      setQuantity(1);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setModalType(null);
    setBuyerId(null);
    setWarehouseId(null);
    setProductId(null);
    setQuantity(1);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!warehouseId || !productId || !buyerId) {
      setError('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        warehouseId: parseInt(warehouseId, 10),
        buyerId: parseInt(buyerId, 10),
        items: [{
          productId: parseInt(productId, 10),
          quantity: Number(quantity)
        }]
      };
      console.log(JSON.stringify(payload, null, 2));
      await createOrder(payload).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save order:', err);
      setError('Failed to save order. Please try again.');
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder) return;

    try {
      await createShipment(selectedOrder.id).unwrap();
      handleCloseModal();
      showNotification({
        title: 'Shipment Created',
        message: `Shipment successfully created for order #${selectedOrder.id}`,
        color: 'green',
      });
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to create shipment. Try again.',
        color: 'red',
      });
      console.error(error);
    }
  };


  const productSelect = (
    <Select
      label="Product"
      placeholder={warehouseId ? "Select a product" : "First select a warehouse"}
      data={warehouseProducts.map(p => ({ 
        label: p.title, 
        value: p.id.toString(),
        description: p.sku
      }))}
      value={productId}
      onChange={setProductId}
      disabled={modalType === 'view' || !warehouseId || isFetchingProducts}
      required
      nothingFoundMessage="No products found in this warehouse"
    />
  );

  const warehouseSelect = (
    <Select
      label="Warehouse"
      placeholder="Select a warehouse"
      data={warehouses.map(w => ({ 
        label: w.name, 
        value: w.id.toString(),
        description: w.address.country
      }))}
      value={warehouseId}
      onChange={(value) => {
        setWarehouseId(value);
      }}
      disabled={modalType === 'view'}
      required
    />
  );

  const columns: Column<OrderDTO>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'buyerId',
      header: 'Buyer',
      enableSorting: false,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'supplierId',
      header: 'Supplier',
      enableSorting: false,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      enableSorting: true,
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'shipmentId',
      header: 'Shipment ID',
      enableSorting: true,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      enableSorting: true,
      cell: (info) => `$${info.getValue()?.toFixed(2)}`,
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Group justify="center">
            <ActionIcon color="green" variant="light" onClick={() => handleOpenModal(order, 'view')}>
              <PiEyeBold size={18} />
            </ActionIcon>
            <ActionIcon color="blue" variant="light" onClick={() => handleOpenModal(order, 'edit')}>
              <PiPencilSimpleLineBold size={18} />
            </ActionIcon>
            <ActionIcon color="red" variant="light">
              <PiTrashBold size={18} />
            </ActionIcon>
          </Group>
        );
      },
    }
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
        <Group>
          <Button onClick={() => handleOpenModal(null, 'edit')}>
            + Create Order
          </Button>
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

      <DashboardCrudModal
        opened={modalOpen}
        title={modalType === 'edit' ? (selectedOrder ? 'Edit Order' : 'Create Order') : 'View Order'}
        onClose={handleCloseModal}
        onSubmit={modalType === 'edit' ? handleSubmit : undefined}
        submitLabel={selectedOrder ? 'Update' : 'Create'}
        showSubmitButton={modalType === 'edit'}
      >
        <Stack>
          <Select
            label="Buyer"
            placeholder="Select a buyer"
            data={buyers.map(b => ({ label: b.companyName, value: b.id.toString() }))}
            value={buyerId}
            onChange={setBuyerId}
            disabled={modalType === 'view'}
            required
          />
          {warehouseSelect}
          {productSelect}
          <NumberInput
            label="Quantity"
            value={quantity}
            onChange={(value) => setQuantity(Number(value))}
            disabled={modalType === 'view'}
            min={1}
            required
          />
        </Stack>
        {error && (
          <Notification color="red" onClose={() => setError(null)}>
            {error}
          </Notification>
        )}
        {modalType === 'view' && selectedOrder && (
          <Button
            mt="md"
            fullWidth
            loading={isCreatingShipment}
            onClick={handleCreateShipment}
            disabled={!!selectedOrder.shipmentId}
          >
            {selectedOrder.shipmentId ? 'Shipment Already Created' : 'Create Shipment'}
          </Button>
        )}
      </DashboardCrudModal>
    </Paper>
  );
};

export default OrdersDashboard;
