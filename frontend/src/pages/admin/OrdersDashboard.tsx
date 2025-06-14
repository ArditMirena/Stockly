import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useCreateOrderMutation,
  useGetOrdersWithPaginationQuery,
  OrderDTO,
} from '../../api/ordersApi';
import { useGetAllWarehousesQuery, useGetWarehouseProductsQuery, useAssignProductToWarehouseMutation, useGetWarehousesByManagerQuery } from '../../api/WarehousesApi';
import { useGetCompaniesByManagerIdQuery, useGetCompaniesQuery } from '../../api/CompaniesApi';
import { useCreateShipmentMutation } from '../../api/ShipmentsApi';
import {
  Select,
  NumberInput,
  Badge,
  Text,
  Card,
  Grid,
  Alert,
  Divider,
  Group,
  Loader,
  Button,
  Stack
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {
  PiPencilSimpleLineBold,
  PiEyeBold,
  PiTruckBold,
  PiPackageBold,
  PiWarningBold,
  PiCurrencyDollarBold
} from 'react-icons/pi';
import { loadStripe } from '@stripe/stripe-js';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

// Status color mapping for better visual feedback
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'yellow';
    case 'processing': return 'blue';
    case 'shipped': return 'green';
    case 'delivered': return 'teal';
    case 'cancelled': return 'red';
    default: return 'gray';
  }
};

// Form validation helper
const validateOrderForm = (buyerId: string | null, warehouseId: string | null, productId: string | null, quantity: number) => {
  const errors: string[] = [];

  if (!buyerId) errors.push('Buyer is required');
  if (!warehouseId) errors.push('Warehouse is required');
  if (!productId) errors.push('Product is required');
  if (quantity < 1) errors.push('Quantity must be at least 1');

  return errors;
};

const OrdersDashboard = () => {
  // Pagination and search state
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  // Form state
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [warehouseId, setWarehouseId] = useState<string | null>(null);
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Error and loading state
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false); // UNCOMMENTED STATE
  const [error, setError] = useState<string | null>(null);

  // API hooks
  const [assignProduct] = useAssignProductToWarehouseMutation();
  const [createOrder] = useCreateOrderMutation();
  const [createShipment, { isLoading: isCreatingShipment }] = useCreateShipmentMutation();

  const user = useSelector((state: RootState) => state.auth.user);

  const { data: warehouses = [], isLoading: isLoadingWarehouses } = useGetAllWarehousesQuery();

  const { data: myWarehouses = [], isLoading: isLoadingMyWarehouses } = 
    (user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER)
      ? useGetWarehousesByManagerQuery(user.id)
      : useGetAllWarehousesQuery();

  const { data: companies = [], isLoading: isLoadingCompanies } = 
    (user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) 
      ? useGetCompaniesByManagerIdQuery(user.id)
      : useGetCompaniesQuery();

  const {
    data: warehouseProducts = [],
    isFetching: isFetchingProducts
  } = useGetWarehouseProductsQuery(
    { warehouseId: Number(warehouseId) },
    { skip: !warehouseId }
  );

  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading,
    refetch: refetchOrders,
    error: ordersError
  } = useGetOrdersWithPaginationQuery({
    offset: page,
    pageSize: 10,
    ...(user?.role === ROLES.BUYER && { managerId: user.id }),
    ...(user?.role === ROLES.SUPPLIER && { buyerManagerId: user.id, supplierManagerId: user.id }),
    searchTerm: debouncedSearch,
  });

  // Reset product selection when warehouse changes
  useEffect(() => {
    if (warehouseId) {
      setProductId(null);
    }
  }, [warehouseId]);

  // Clear form errors when form values change
  useEffect(() => {
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  }, [buyerId, warehouseId, productId, quantity]);

  const resetForm = () => {
    setBuyerId(null);
    setWarehouseId(null);
    setDestinationWarehouseId(null);
    setProductId(null);
    setQuantity(1);
    setFormErrors([]);
    setError(null);
  };

  const handleOpenModal = (order: OrderDTO | null, type: ModalType) => {
    setSelectedOrder(order);
    setModalType(type);
    setModalOpen(true);

    if (order && type !== 'create') {
      // Populate form with existing order data
      setBuyerId(order.buyerId.toString());
      setWarehouseId(order.sourceWarehouseId.toString());
      setDestinationWarehouseId(order.destinationWarehouseId?.toString() || null);
      if (order.items && order.items.length > 0) {
        setProductId(order.items[0].productId.toString());
        setQuantity(order.items[0].quantity);

      }
    } else {
      resetForm();
    }
  };


  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setModalType('create');
    resetForm();
    setIsSubmitting(false);
    setIsCreatingCheckout(false); // ADDED
  };


  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    setIsCreatingCheckout(true);

    // Validate form
    const errors = validateOrderForm(buyerId, warehouseId, productId, quantity);
    if (errors.length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      setIsCreatingCheckout(false);
      return;
    }

    let orderResponse = null;
    let stripeData = null;

    try {
      console.log('1. Starting order creation...');

      // 1. Create the Order
      const payload: any = {
        buyerId: parseInt(buyerId!, 10),
        sourceWarehouseId: parseInt(warehouseId!, 10),
        items: [{
          productId: parseInt(productId!, 10),
          quantity: Number(quantity)
        }]
      };

      if (destinationWarehouseId) {
        payload.destinationWarehouseId = parseInt(destinationWarehouseId, 10);
      }

      const result = await createOrder(payload);

      if ('error' in result) {
        throw new Error('Order creation failed');
      }

      orderResponse = result.data;
      console.log('✅ Order created:', orderResponse);

      // 2. Create Stripe Checkout Session
      console.log('2. Creating Stripe session...');
      const stripeResponse = await fetch('http://localhost:8081/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          orderId: orderResponse.id,
        }),
      });

      if (!stripeResponse.ok) {
        const errorText = await stripeResponse.text();
        throw new Error(`Stripe error: ${errorText}`);
      }

      stripeData = await stripeResponse.json();
      console.log('✅ Stripe session created:', stripeData);

      // 3. Redirect to Stripe Checkout
      const stripe = await loadStripe('pk_test_51RSOJhRs6J5EqLQsNzbpo1hWYfC5wjSghPWrGUfdDgdf6b6h6rDCmaGiEAbae5jAIuGxNeahSqob6ZydO4JmjXuu00Qmidd6oC');
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: stripeData.id,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      showNotification({
        title: 'Success',
        message: 'Order created and redirecting to payment...',
        color: 'green',
      });

      handleCloseModal();
      refetchOrders();

    } catch (error: any) {
      console.error('❌ Full error:', error);
      setError(error.message || 'Checkout process failed');

      showNotification({
        title: 'Error',
        message: error.message || 'Failed to create order and checkout. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
      setIsCreatingCheckout(false);

      // Log final responses for debugging
      if (orderResponse) {
        console.log('📦 Final Order Response:', orderResponse);
      }
      if (stripeData) {
        console.log('💳 Final Stripe Session:', stripeData);
      }
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedOrder || !selectedOrder.items || selectedOrder.items.length === 0) return;

    try {
      await createShipment(selectedOrder.id).unwrap();

      // If destination warehouse is specified, assign product to it
      if (destinationWarehouseId) {
        const orderItem = selectedOrder.items[0];
        await assignProduct({
          productId: orderItem.productId,
          quantity: orderItem.quantity,
          warehouseId: parseInt(destinationWarehouseId, 10),
        }).unwrap();
      }

      handleCloseModal();
      showNotification({
        title: 'Shipment Created',
        message: `Shipment successfully created for order #${selectedOrder.id}`,
        color: 'green',
      });
      refetchOrders();
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to create shipment. Try again.';
      showNotification({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error(error);
    }
  };

  // Get selected product details
  const selectedProduct = productId ? warehouseProducts.find(product => product.productId === Number(productId)) : undefined;
  const unitPrice = selectedProduct?.unitPrice || 0;
  const availableQuantity = selectedProduct?.quantity || 0;
  const totalPrice = unitPrice * quantity;

  // Define table columns
  const columns: Column<OrderDTO>[] = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      enableSorting: false,
      cell: (info) => (
        <Text fw={500} c="blue">
          #{info.getValue() as string}
        </Text>
      ),
      size: 100,
    },
    {
      accessorKey: 'buyerName',
      header: 'Buyer',
      enableSorting: false,
      cell: (info) => (
        <Text size="sm" fw={500}>
          {(info.getValue() as string) || 'N/A'}
        </Text>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      enableSorting: false,
      cell: (info) => (
        <Text size="sm">
          {(info.getValue() as string) || 'N/A'}
        </Text>
      ),
    },
    {
      accessorKey: 'sourceWarehouseId',
      header: 'Source',
      enableSorting: false,
      cell: (info) => (
        <Badge variant="light" color="blue" size="sm">
          WH-{info.getValue() as string}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: 'destinationWarehouseId',
      header: 'Destination',
      enableSorting: false,
      cell: (info) => {
        const value = info.getValue() as string | undefined;
        return value ? (
          <Badge variant="light" color="green" size="sm">
            WH-{value}
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">No destination</Text>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      enableSorting: true,
      cell: (info) => (
        <Text size="sm">
          {new Date(info.getValue() as string).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <Badge
            color={getStatusColor(status)}
            variant="filled"
            size="sm"
          >
            {status || 'Unknown'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'shipmentId',
      header: 'Shipment',
      enableSorting: true,
      cell: (info) => {
        const shipmentId = info.getValue() as string | undefined;
        return shipmentId ? (
          <Badge variant="light" color="teal" size="sm">
            <PiTruckBold size={12} style={{ marginRight: 4 }} />
            #{shipmentId}
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">Not shipped</Text>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'totalPrice',
      header: 'Total',
      enableSorting: true,
      cell: (info) => {
        const total = info.getValue() as number;
        return (
          <Text fw={500} c={total > 1000 ? 'green' : 'dark'}>
            ${total?.toFixed(2) || '0.00'}
          </Text>
        );
      },
    },
  ];

  // Define table actions
  const actions: DashboardAction<OrderDTO>[] = [
    {
      icon: <PiEyeBold size={16} />,
      color: 'green',
      title: 'View Order',
      onClick: (order) => handleOpenModal(order, 'view')
    },
    {
      icon: <PiPencilSimpleLineBold size={16} />,
      color: 'blue',
      title: 'Edit Order',
      onClick: (order) => handleOpenModal(order, 'edit')
    }
  ];

  const tableData = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 1;
  const isLoading = isPaginatedLoading;
  const hasError = ordersError;

  return (
    <>
      {/* Enhanced Table with all functionality built-in */}
      <DashboardTable
        tableData={tableData}
        allColumns={columns}
        actions={actions}
        totalPages={totalPages}
        currentPage={page}
        fetchData={setPage}
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setPage(0);
          setSearchTerm(term);
        }}
        searchPlaceholder="Search orders..."
        title="Orders Dashboard"
        subtitle="Manage and track all orders in your system"
        titleIcon={<PiPackageBold size={28} />}
        onCreateNew={() => handleOpenModal(null, 'create')}
        createButtonLabel="Create Order"
        createButtonLoading={isLoadingCompanies || isLoadingWarehouses || isLoadingMyWarehouses}
        isLoading={isLoading}
        error={hasError}
        enableSort
        enableSearch
      />

      {/* Enhanced Modal with error handling built-in */}
      <DashboardCrudModal
        opened={modalOpen}
        title={
          modalType === 'create' ? 'Create New Order' :
          modalType === 'edit' ? `Edit Order #${selectedOrder?.id}` :
          `Order Details #${selectedOrder?.id}`
        }
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        modalType={modalType}
        isSubmitting={isSubmitting}
        errors={formErrors}
        size="lg"
      >
        <Stack gap="md">
          {/* Error Display */}
          {error && (
            <Alert
              icon={<PiWarningBold size={16} />}
              title="Error"
              color="red"
              variant="light"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          )}

          {/* Order Information Section */}
          <div>
            <Text fw={600} mb="sm">Order Information</Text>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Buyer Company"
                  placeholder="Select a buyer"
                  data={companies.map(b => ({
                    label: b.companyName,
                    value: b.id.toString(),
                    description: b.email
                  }))}
                  value={buyerId}
                  onChange={setBuyerId}
                  disabled={modalType === 'view'}
                  required
                  searchable
                  error={formErrors.includes('Buyer is required') ? 'Buyer is required' : null}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Source Warehouse"
                  placeholder="Select source warehouse"
                  data={warehouses.map(w => ({
                    label: w.name,
                    value: w.id.toString(),
                    description: `${w.address.cityId}, ${w.address.country}`
                  }))}
                  value={warehouseId}
                  onChange={setWarehouseId}
                  disabled={modalType === 'view'}
                  required
                  searchable
                  error={formErrors.includes('Warehouse is required') ? 'Warehouse is required' : null}
                />
              </Grid.Col>
            </Grid>
          </div>

          {/* Product Information Section */}
          <div>
            <Text fw={600} mb="sm">Product Information</Text>
            <Grid>
              <Grid.Col span={8}>
                <Select
                  label="Product"
                  placeholder={warehouseId ? "Select a product" : "First select a warehouse"}
                  data={warehouseProducts.map(p => ({
                    label: p.productTitle,
                    value: p.productId.toString(),
                    description: `Stock: ${p.quantity || 0} units • $${(p.unitPrice || 0).toFixed(2)}/unit`
                  }))}
                  value={productId}
                  onChange={setProductId}
                  disabled={modalType === 'view' || !warehouseId || isFetchingProducts}
                  required
                  searchable
                  error={formErrors.includes('Product is required') ? 'Product is required' : null}
                  rightSection={isFetchingProducts ? <Loader size="xs" /> : null}
                />
                {warehouseId && warehouseProducts.length === 0 && !isFetchingProducts && (
                  <Text size="xs" c="dimmed" mt="xs">
                    No products available in this warehouse
                  </Text>
                )}
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Quantity"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(value) => setQuantity(Number(value))}
                  disabled={modalType === 'view'}
                  min={1}
                  max={productId ? availableQuantity : 999}
                  required
                  error={formErrors.includes('Quantity must be at least 1') ? 'Invalid quantity' : null}
                />
              </Grid.Col>
            </Grid>

            {/* Product Details Display */}
            {selectedProduct && modalType !== 'view' && (
              <Card withBorder mt="sm" p="sm" bg="gray.0">
                <Text size="sm" fw={600} mb="xs">Product Details</Text>
                <Grid>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">Available Stock</Text>
                    <Text fw={500} c={availableQuantity > 0 ? 'green' : 'red'}>
                      {availableQuantity} units
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">Unit Price</Text>
                    <Text fw={500} c="blue">
                      ${unitPrice.toFixed(2)}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="xs" c="dimmed">Subtotal</Text>
                    <Text fw={600} c="green" size="sm">
                      ${totalPrice.toFixed(2)}
                    </Text>
                  </Grid.Col>
                </Grid>

                {quantity > availableQuantity && (
                  <Alert
                    icon={<PiWarningBold size={14} />}
                    title="Insufficient Stock"
                    color="orange"
                    variant="light"
                    mt="xs"
                  >
                    Requested quantity ({quantity}) exceeds available stock ({availableQuantity})
                  </Alert>
                )}
              </Card>
            )}
          </div>

          {/* Order Total Preview for Create/Edit Mode */}
          {modalType !== 'view' && selectedProduct && (
            <div>
              <Divider />
              <Card withBorder p="md" bg="blue.0">
                <Group justify="space-between" align="center">
                  <div>
                    <Text size="sm" c="dimmed">Order Total</Text>
                    <Group gap="xs" align="center">
                      <PiCurrencyDollarBold size={20} color="green" />
                      <Text size="xl" fw={700} c="green">
                        ${totalPrice.toFixed(2)}
                      </Text>
                    </Group>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text size="xs" c="dimmed">
                      {quantity} × ${unitPrice.toFixed(2)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {selectedProduct.productTitle}
                    </Text>
                  </div>
                </Group>
              </Card>
            </div>
          )}

          {/* Shipping Information Section */}
          <div>
            <Text fw={600} mb="sm">Shipping Information (Optional)</Text>
            <Select
              label="Destination Warehouse"
              placeholder="Select destination warehouse (optional)"
              data={myWarehouses
                .filter(w => w.id.toString() !== warehouseId)
                .map(w => ({
                  label: w.name,
                  value: w.id.toString(),
                  description: `${w.address.cityId}, ${w.address.country}`
                }))}
              value={destinationWarehouseId}
              onChange={setDestinationWarehouseId}
              disabled={modalType === 'view'}
              searchable
              clearable
            />
          </div>

          {/* Order Summary for View Mode */}
          {modalType === 'view' && selectedOrder && (
            <div>
              <Text fw={600} mb="sm">Order Summary</Text>
              <Card withBorder>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Order Date:</Text>
                    <Text fw={500}>
                      {new Date(selectedOrder.orderDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Status:</Text>
                    <Badge color={getStatusColor(selectedOrder.status)} mt="xs">
                      {selectedOrder.status}
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Total Price:</Text>
                    <Text fw={700} size="lg" c="green">
                      ${selectedOrder.totalPrice?.toFixed(2) || '0.00'}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Items:</Text>
                    <Text fw={500}>
                      {selectedOrder.items?.length || 0} item(s)
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>
            </div>
          )}

          {/* Shipment Creation Section for View Mode */}
          {modalType === 'view' && selectedOrder && (
            <div>
              <Text fw={600} mb="sm">Shipment Management</Text>
              {selectedOrder.shipmentId ? (
                <Alert
                  icon={<PiTruckBold size={16} />}
                  title="Shipment Created"
                  color="green"
                  variant="light"
                >
                  This order has been shipped with shipment ID: #{selectedOrder.shipmentId}
                </Alert>
              ) : (
                <Card withBorder>
                  <Text size="sm" mb="md">
                    This order hasn't been shipped yet. You can create a shipment to start the delivery process.
                  </Text>
                  <Button
                    leftSection={<PiTruckBold size={16} />}
                    fullWidth
                    loading={isCreatingShipment}
                    onClick={handleCreateShipment}
                    variant="light"
                  >
                    Create Shipment
                  </Button>
                </Card>
              )}
            </div>
          )}

          {/* RESTORED CHECKOUT LOADING INDICATOR */}
          {isCreatingCheckout && (
            <Alert
              icon={<Loader size={16} />}
              title="Processing Payment"
              color="blue"
              variant="light"
            >
              Creating order and redirecting to Stripe checkout...
            </Alert>
          )}
        </Stack>
      </DashboardCrudModal>
    </>
  );
};

export default OrdersDashboard;