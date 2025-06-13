import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Divider,
  Stack,
  Loader,
  Group,
  Switch,
  Modal,
  Button,
  Text,
  Select,
  NumberInput,
  Badge,
  Card,
  Grid,
  Alert,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { 
  PiTrashBold,
  PiPencilSimpleLineBold, 
  PiEyeBold,
  PiPackageBold,
  PiWarningBold,
  PiRobotBold,
  PiTrendUpBold,
  PiInfoBold,
} from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import {
  WarehouseProductDTO,
  useGetWarehouseProductsWithPaginationQuery,
  useGetAllWarehousesQuery,
  useAddWarehouseProductMutation,
  useUpdateWarehouseProductMutation,
  useDeleteWarehouseProductMutation
} from '../../api/WarehousesApi';
import { useGetProductsQuery } from '../../api/ProductsApi';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

// Availability color mapping
const getAvailabilityColor = (availability: string) => {
  switch (availability?.toLowerCase()) {
    case 'in_stock': return 'green';
    case 'low_stock': return 'yellow';
    case 'out_of_stock': return 'red';
    default: return 'gray';
  }
};

// Availability display mapping
const getAvailabilityDisplay = (availability: string) => {
  switch (availability?.toLowerCase()) {
    case 'in_stock': return 'In Stock';
    case 'low_in_stock': return 'Low Stock';
    case 'out_of_stock': return 'Out of Stock';
    default: return availability;
  }
};

// Form validation helper
const validateWarehouseProductForm = (
  selectedProduct: number | null,
  selectedWarehouse: number | null,
  quantity: number
) => {
  const errors: string[] = [];
  
  if (!selectedProduct) errors.push('Product is required');
  if (!selectedWarehouse) errors.push('Warehouse is required');
  if (quantity < 0) errors.push('Quantity must be greater than or equal to 0');
  
  return errors;
};

const WarehouseProductsDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const pageSize = 10;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');
  const [selectedWarehouseProduct, setSelectedWarehouseProduct] = useState<WarehouseProductDTO | null>(null);

  // Form state
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [automatedRestock, setAutomatedRestock] = useState<boolean>(false);

  // Error and loading state
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.auth.user);

  // API hooks
  const [addWarehouseProduct] = useAddWarehouseProductMutation();
  const [updateWarehouseProduct] = useUpdateWarehouseProductMutation();
  const [deleteWarehouseProduct] = useDeleteWarehouseProductMutation();

  const { data: warehouses = [], isLoading: isWarehousesLoading } = useGetAllWarehousesQuery();
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery();

  const { 
    data: paginatedResponse, 
    isLoading: isPaginatedLoading,
    refetch: refetchWarehouseProducts,
    error: warehouseProductsError
  } = useGetWarehouseProductsWithPaginationQuery({
    offset: page,
    pageSize,
    sortBy: 'id',
    ...((user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) && { managerId: user.id }),
  });

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Clear form errors when form values change
  useEffect(() => {
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  }, [selectedProduct, selectedWarehouse, quantity]);

  const warehouseOptions = warehouses.map(warehouse => ({
    value: warehouse.id.toString(),
    label: warehouse.name,
  }));

  const productOptions = products.map(product => ({
    value: product.id.toString(),
    label: `${product.title} - $${product.price?.toFixed(2) || '0.00'}`,
    description: product.sku
  }));

  const resetForm = () => {
    setSelectedProduct(null);
    setSelectedWarehouse(null);
    setQuantity(0);
    setAutomatedRestock(false);
    setFormErrors([]);
    setError(null);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      try {
        await deleteWarehouseProduct(deleteId).unwrap();
        showNotification({
          title: 'Success',
          message: 'Warehouse product deleted successfully',
          color: 'green',
        });
        refetchWarehouseProducts();
      } catch (error: any) {
        showNotification({
          title: 'Error',
          message: error?.data?.message || 'Failed to delete warehouse product',
          color: 'red',
        });
      }
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const handleOpenModal = (warehouseProduct: WarehouseProductDTO | null, type: ModalType) => {
    setSelectedWarehouseProduct(warehouseProduct);
    setModalType(type);
    setModalOpen(true);

    if (warehouseProduct && type !== 'create') {
      setSelectedProduct(warehouseProduct.productId);
      setSelectedWarehouse(warehouseProduct.warehouseId);
      setQuantity(warehouseProduct.quantity);
      setAutomatedRestock(warehouseProduct.automatedRestock);
    } else {
      resetForm();
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedWarehouseProduct(null);
    setModalType('create');
    resetForm();
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    // Validate form
    const errors = validateWarehouseProductForm(
      selectedProduct,
      selectedWarehouse,
      quantity
    );

    if (errors.length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      if (selectedWarehouseProduct && modalType === 'edit') {
        await updateWarehouseProduct({
          id: selectedWarehouseProduct.id,
          quantity: quantity,
          automatedRestock: automatedRestock
        }).unwrap();
        showNotification({
          title: 'Success',
          message: 'Warehouse product updated successfully',
          color: 'green',
        });
      } else {
        await addWarehouseProduct({
          productId: selectedProduct!,
          quantity: quantity,
          warehouseId: selectedWarehouse!
        }).unwrap();
        showNotification({
          title: 'Success',
          message: 'Warehouse product added successfully',
          color: 'green',
        });
      }

      handleCloseModal();
      refetchWarehouseProducts();
    } catch (err: any) {
      console.error('Failed to save warehouse product:', err);
      const errorMessage = err?.data?.message || 'Failed to save warehouse product. Please try again.';
      setError(errorMessage);
      showNotification({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define table columns
  const columns: Column<WarehouseProductDTO>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
      cell: (info) => (
        <Text fw={500} c="blue">
          #{info.getValue() as string}
        </Text>
      ),
      size: 80,
    },
    {
      accessorKey: 'productTitle',
      header: 'Product',
      enableSorting: true,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div>
            <Text fw={500} size="sm">
              {info.getValue() as string}
            </Text>
            <Text size="xs" c="dimmed">
              SKU: {row.productSku}
            </Text>
          </div>
        );
      },
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      enableSorting: true,
      cell: (info) => (
        <Text fw={500} c="green">
          ${(info.getValue() as number).toFixed(2)}
        </Text>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      enableSorting: true,
      cell: (info) => {
        const quantity = info.getValue() as number;
        const color = quantity > 20 ? 'green' : quantity > 0 ? 'yellow' : 'red';
        return (
          <Badge color={color} variant="light" size="lg">
            {quantity}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'automatedRestock',
      header: 'Auto Restock',
      enableSorting: false,
      cell: (info) => (
        <Group gap="xs" style={{ justifyContent: 'center' }}>
          <Switch 
            checked={info.getValue() as boolean} 
            disabled
            size="sm"
          />
          {info.getValue() && (
            <Tooltip label="AI-powered demand forecasting enabled">
              <ActionIcon variant="subtle" color="blue" size="sm">
                <PiRobotBold size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      ),
    },
    {
      accessorKey: 'availability',
      header: 'Availability',
      enableSorting: false,
      cell: (info) => {
        const availability = info.getValue() as string;
        const color = getAvailabilityColor(availability);
        return (
          <Badge color={color} variant="light">
            {getAvailabilityDisplay(availability)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'warehouseName',
      header: 'Warehouse',
      enableSorting: true,
      cell: (info) => (
        <Text fw={500} size="sm">
          {info.getValue() as string}
        </Text>
      ),
    },
  ];

  // Define table actions
  const actions: DashboardAction<WarehouseProductDTO>[] = [
    {
      icon: <PiEyeBold size={16} />,
      color: 'green',
      title: 'View Details',
      onClick: (warehouseProduct) => handleOpenModal(warehouseProduct, 'view')
    },
    {
      icon: <PiPencilSimpleLineBold size={16} />,
      color: 'blue',
      title: 'Edit Product',
      onClick: (warehouseProduct) => handleOpenModal(warehouseProduct, 'edit')
    },
    {
      icon: <PiTrashBold size={16} />,
      color: 'red',
      title: 'Remove Product',
      onClick: (warehouseProduct) => {
        setDeleteId(warehouseProduct.id);
        setConfirmOpen(true);
      }
    }
  ];

  const tableData = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 1;
  const isLoading = isPaginatedLoading;

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
        title="Warehouse Products Dashboard"
        subtitle="Manage inventory across all warehouses with AI-powered demand forecasting"
        titleIcon={<PiPackageBold size={28} />}
        onCreateNew={() => handleOpenModal(null, 'create')}
        createButtonLabel="Add Product to Warehouse"
        createButtonLoading={isWarehousesLoading || isProductsLoading}
        isLoading={isLoading}
        error={warehouseProductsError}
        enableSort
        enableSearch
      />

      {/* Delete Confirmation Modal */}
      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Delete"
        centered
        size="sm"
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
        <Stack>
          <Alert 
            icon={<PiWarningBold size={16} />} 
            title="Warning" 
            color="red"
            variant="light"
          >
            Are you sure you want to remove this product from the warehouse? This action cannot be undone.
          </Alert>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Remove Product
            </Button>
          </Group>
        </Stack>
      </Modal>

            {/* Enhanced CRUD Modal */}
      <DashboardCrudModal
        opened={modalOpen}
        title={
          modalType === 'create' ? 'Add Product to Warehouse' :
          modalType === 'edit' ? `Edit ${selectedWarehouseProduct?.productTitle}` :
          `Product Details - ${selectedWarehouseProduct?.productTitle}`
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

          {/* AI Disclaimer for Automated Restock */}
          <Alert 
            icon={<PiRobotBold size={16} />} 
            title="AI-Powered Demand Forecasting" 
            color="blue"
            variant="light"
          >
            <Text size="sm">
              When automated restock is enabled, our AI-trained model analyzes demand patterns 
              and automatically updates stock quantities based on forecasted demand. This helps 
              maintain optimal inventory levels and prevents stockouts.
            </Text>
          </Alert>

          {modalType === 'view' && selectedWarehouseProduct ? (
            /* View Mode - Display Information */
            <Stack gap="lg">
              {/* Product Information Card */}
              <Card withBorder>
                <Text fw={600} mb="md" size="lg">Product Information</Text>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Product Name:</Text>
                    <Text fw={500}>{selectedWarehouseProduct.productTitle}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">SKU:</Text>
                    <Text fw={500}>{selectedWarehouseProduct.productSku}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Unit Price:</Text>
                    <Text fw={500} c="green">${selectedWarehouseProduct.unitPrice.toFixed(2)}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Warehouse:</Text>
                    <Text fw={500}>{selectedWarehouseProduct.warehouseName}</Text>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Inventory Information Card */}
              <Card withBorder>
                <Text fw={600} mb="md" size="lg">Inventory Information</Text>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Current Quantity:</Text>
                    <Badge 
                      color={selectedWarehouseProduct.quantity > 20 ? 'green' : selectedWarehouseProduct.quantity > 0 ? 'yellow' : 'red'} 
                      variant="light" 
                      size="lg"
                      mt="xs"
                    >
                      {selectedWarehouseProduct.quantity} units
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Availability Status:</Text>
                    <Badge 
                      color={getAvailabilityColor(selectedWarehouseProduct.availability)} 
                      variant="light"
                      size="lg"
                      mt="xs"
                    >
                      {getAvailabilityDisplay(selectedWarehouseProduct.availability)}
                    </Badge>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <Text size="sm" c="dimmed">Automated Restock:</Text>
                    <Group mt="xs">
                      <Switch 
                        checked={selectedWarehouseProduct.automatedRestock} 
                        disabled
                        size="md"
                      />
                      <Text fw={500}>
                        {selectedWarehouseProduct.automatedRestock ? 'Enabled' : 'Disabled'}
                      </Text>
                      {selectedWarehouseProduct.automatedRestock && (
                        <Badge color="blue" variant="light" leftSection={<PiRobotBold size={12} />}>
                          AI Forecasting Active
                        </Badge>
                      )}
                    </Group>
                    {selectedWarehouseProduct.automatedRestock && (
                      <Text size="xs" c="dimmed" mt="xs">
                        Stock levels are automatically managed by our AI demand forecasting system
                      </Text>
                    )}
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Timeline Information Card */}
              <Card withBorder>
                <Text fw={600} mb="md" size="lg">Timeline</Text>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Added to Warehouse:</Text>
                    <Text fw={500}>
                      {new Date(selectedWarehouseProduct.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Last Updated:</Text>
                    <Text fw={500}>
                      {new Date(selectedWarehouseProduct.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>

              {/* Inventory Insights Card */}
              <Card withBorder bg="blue.0">
                <Group>
                  <PiTrendUpBold size={24} color="blue" />
                  <div>
                    <Text fw={600} c="blue">Inventory Insights</Text>
                    <Text size="sm" c="dimmed">
                      Total inventory value: ${(selectedWarehouseProduct.quantity * selectedWarehouseProduct.unitPrice).toFixed(2)}
                    </Text>
                    {selectedWarehouseProduct.quantity <= 20 && selectedWarehouseProduct.quantity > 0 && (
                      <Text size="sm" c="orange" mt="xs">
                        ⚠️ Low stock alert - Consider restocking soon
                      </Text>
                    )}
                    {selectedWarehouseProduct.quantity <= 0 && (
                      <Text size="sm" c="red" mt="xs">
                        🚫 Out of stock - Immediate restocking required
                      </Text>
                    )}
                  </div>
                </Group>
              </Card>
            </Stack>
          ) : (
            /* Create/Edit Mode - Form Fields */
            <Stack gap="lg">
              {/* Product Selection Section */}
              <div>
                <Text fw={600} mb="sm">Product Selection</Text>
                <Grid>
                  <Grid.Col span={modalType === 'edit' ? 12 : 6}>
                    <Select
                      label="Product"
                      placeholder="Select a product"
                      value={selectedProduct?.toString() || null}
                      onChange={(value) => setSelectedProduct(value ? Number(value) : null)}
                      data={productOptions}
                      disabled={modalType === 'edit'} // Can't change product in edit mode
                      required
                      searchable
                      error={formErrors.includes('Product is required') ? 'Product is required' : null}
                      rightSection={isProductsLoading ? <Loader size="xs"/> : null}
                      description={modalType === 'edit' ? 'Product cannot be changed in edit mode' : 'Choose the product to add to warehouse'}
                    />
                  </Grid.Col>
                  {modalType !== 'edit' && (
                    <Grid.Col span={6}>
                      <Select
                        label="Warehouse"
                        placeholder="Select a warehouse"
                        value={selectedWarehouse?.toString() || null}
                        onChange={(value) => setSelectedWarehouse(value ? Number(value) : null)}
                        data={warehouseOptions}
                        required
                        searchable
                        error={formErrors.includes('Warehouse is required') ? 'Warehouse is required' : null}
                        rightSection={isWarehousesLoading ? <Loader size="xs"/> : null}
                        description="Choose the warehouse to store this product"
                      />
                    </Grid.Col>
                  )}
                </Grid>
              </div>

              {/* Inventory Configuration Section */}
              <div>
                <Text fw={600} mb="sm">Inventory Configuration</Text>
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Quantity"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(value) => setQuantity(Number(value) || 0)}
                      min={0}
                      required
                      error={formErrors.some(e => e.includes('Quantity')) ? 'Valid quantity is required' : null}
                      description="Number of units to stock"
                      leftSection={<PiPackageBold size={16} />}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <div>
                      <Text size="sm" fw={500} mb="xs">Automated Restock</Text>
                      <Card withBorder p="md" bg={automatedRestock ? "blue.0" : "gray.0"}>
                        <Group>
                          <Switch
                            checked={automatedRestock}
                            onChange={(event) => setAutomatedRestock(event.currentTarget.checked)}
                            size="md"
                            color="blue"
                          />
                          <div>
                            <Text fw={500} size="sm">
                              {automatedRestock ? 'AI Forecasting Enabled' : 'Manual Management'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {automatedRestock 
                                ? 'Stock will be managed automatically' 
                                : 'You will manage stock levels manually'
                              }
                            </Text>
                          </div>
                          {automatedRestock && (
                            <PiRobotBold size={20} color="blue" />
                          )}
                        </Group>
                      </Card>
                    </div>
                  </Grid.Col>
                </Grid>
              </div>

              {/* AI Forecasting Details */}
              {automatedRestock && (
                <Card withBorder bg="blue.0">
                  <Group align="flex-start">
                    <PiInfoBold size={20} color="blue" />
                    <div>
                      <Text fw={600} c="blue" mb="xs">AI Demand Forecasting Details</Text>
                      <Text size="sm" mb="sm">
                        When enabled, our system will:
                      </Text>
                      <Stack gap="xs">
                        <Text size="sm">• Analyze historical sales data and trends</Text>
                        <Text size="sm">• Predict future demand patterns</Text>
                        <Text size="sm">• Automatically adjust stock quantities</Text>
                        <Text size="sm">• Send notifications for critical stock levels</Text>
                        <Text size="sm">• Optimize inventory costs and prevent stockouts</Text>
                      </Stack>
                    </div>
                  </Group>
                </Card>
              )}

              {/* Form Summary */}
              {selectedProduct && (modalType !== 'edit' ? selectedWarehouse : true) && (
                <div>
                  <Divider />
                  <Card withBorder p="md" bg="green.0" mt="md">
                    <Text fw={600} mb="sm" c="green">Configuration Summary</Text>
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Product:</Text>
                        <Text fw={500}>
                          {products.find(p => p.id === selectedProduct)?.title || 'Selected Product'}
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Warehouse:</Text>
                        <Text fw={500}>
                          {modalType === 'edit' 
                            ? selectedWarehouseProduct?.warehouseName
                            : warehouses.find(w => w.id === selectedWarehouse)?.name || 'Selected Warehouse'
                          }
                        </Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Quantity:</Text>
                        <Badge color="blue" variant="light" size="lg">
                          {quantity} units
                        </Badge>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">Management:</Text>
                        <Badge 
                          color={automatedRestock ? "blue" : "gray"} 
                          variant="light"
                          leftSection={automatedRestock ? <PiRobotBold size={12} /> : undefined}
                        >
                          {automatedRestock ? "AI Automated" : "Manual"}
                        </Badge>
                      </Grid.Col>
                      {selectedProduct && (
                        <Grid.Col span={12}>
                          <Text size="sm" c="dimmed">Estimated Value:</Text>
                          <Text fw={500} c="green" size="lg">
                            ${((products.find(p => p.id === selectedProduct)?.price || 0) * quantity).toFixed(2)}
                          </Text>
                        </Grid.Col>
                      )}
                    </Grid>
                  </Card>
                </div>
              )}
            </Stack>
          )}
        </Stack>
      </DashboardCrudModal>
    </>
  );
};

export default WarehouseProductsDashboard;
