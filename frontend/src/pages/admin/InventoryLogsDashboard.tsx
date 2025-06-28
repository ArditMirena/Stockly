// src/pages/inventory/InventoryLogsDashboard.tsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Stack,
    Group,
    Text,
    TextInput,
    Select,
    Tabs,
    Badge,
    Card,
    Grid,
    Alert,
    Button,
    Modal,
    Avatar,
    Loader,
    Switch,
    MultiSelect
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiPencilSimpleLineBold, PiEyeBold, PiWarehouseBold, PiWarningBold, PiPackageBold, PiClockBold, PiFileXls } from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import { useGetInventoryLogsWithPaginationQuery, useExportInventoryLogsExcelMutation } from '../../api/InventoryLogsApi';
import { useGetWarehousesByManagerQuery } from '../../api/WarehousesApi';
import { useGetProductsQuery } from '../../api/ProductsApi';
import { saveAs } from 'file-saver';
import { RootState } from '../../redux/store';
import { InventoryLog } from '../../api/InventoryLogsApi.ts';
import { DateValue } from '@mantine/dates';

const actionTypeOptions = [
    { value: 'RESTOCK', label: 'Restock' },
    { value: 'ORDER', label: 'Order' },
    { value: 'ADJUSTMENT', label: 'Adjustment' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' }
];

const sourceOptions = [
    { value: 'SYSTEM', label: 'System' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'API', label: 'API' },
    { value: 'IMPORT', label: 'Import' }
];

const InventoryLogsDashboard = () => {
    // Pagination and filter state
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const [sortBy, setSortBy] = useState('timestamp');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [exportInventoryLogs] = useExportInventoryLogsExcelMutation();
    const [isExporting, setIsExporting] = useState(false);

    // Filter state
    const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [selectedActionTypes, setSelectedActionTypes] = useState<string[]>([]);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<[DateValue, DateValue]>([null, null]);

    const user = useSelector((state: RootState) => state.auth.user);

    // API hooks
    const { data: warehouses = [], isLoading: isLoadingWarehouses } = useGetWarehousesByManagerQuery(user.id);
    const { data: products = [], isLoading: isLoadingProducts } = useGetProductsQuery();

    const {
        data: paginatedResponse,
        isLoading,
        error,
        refetch
    } = useGetInventoryLogsWithPaginationQuery({
        offset: page,
        pageSize: 10,
        sortBy,
        direction: sortDirection,
        searchTerm: debouncedSearch,
        warehouseId: selectedWarehouse ? Number(selectedWarehouse) : undefined,
        productId: selectedProduct ? Number(selectedProduct) : undefined,
        actionType: selectedActionTypes.length > 0 ? selectedActionTypes.join(',') : undefined,
        userId: user?.id,
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString()
    });

    const handleExportToExcel = async () => {
        setIsExporting(true);
        try {
            const response = await exportInventoryLogs({
                warehouseId: selectedWarehouse ? Number(selectedWarehouse) : undefined,
                productId: selectedProduct ? Number(selectedProduct) : undefined,
                actionType: selectedActionTypes.length > 0 ? selectedActionTypes.join(',') : undefined,
                source: selectedSources.length > 0 ? selectedSources.join(',') : undefined,
                userId: user?.id,
                startDate: dateRange[0]?.toISOString(),
                endDate: dateRange[1]?.toISOString(),
                searchTerm: debouncedSearch
            }).unwrap();

            // Create blob from response
            const blob = new Blob([response], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Create filename with current date
            const dateStr = new Date().toISOString().slice(0, 10);
            const filename = `inventory_logs_${dateStr}.xlsx`;

            // Use file-saver to download the file
            saveAs(blob, filename);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Warehouse options for select
    const warehouseOptions = warehouses.map(warehouse => ({
        value: warehouse.id.toString(),
        label: warehouse.name
    }));

    // Product options for select
    const productOptions = products.map(product => ({
        value: product.id.toString(),
        label: `${product.sku} - ${product.title}`
    }));

    // Handle sort
    const handleSort = (columnKey: string) => {
        if (sortBy === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(columnKey);
            setSortDirection('desc');
        }
        setPage(0);
    };

    // Reset filters
    const resetFilters = () => {
        setSelectedWarehouse(null);
        setSelectedProduct(null);
        setSelectedActionTypes([]);
        setSelectedSources([]);
        setDateRange([null, null]);
        setSearchTerm('');
        setPage(0);
    };

    // Define table columns
    const columns: Column<InventoryLog>[] = [
        {
            accessorKey: 'timestamp',
            header: 'Date & Time',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm">
                    {new Date(info.getValue() as string).toLocaleString()}
                </Text>
            ),
            size: 160
        },
        {
            accessorKey: 'actionType',
            header: 'Action',
            enableSorting: true,
            cell: (info) => {
                const actionType = info.getValue() as string;
                let color = 'gray';

                switch(actionType) {
                    case 'RESTOCK': color = 'green'; break;
                    case 'ORDER': color = 'blue'; break;
                    case 'ADJUSTMENT': color = 'orange'; break;
                    case 'TRANSFER_IN': color = 'teal'; break;
                    case 'TRANSFER_OUT': color = 'indigo'; break;
                }

                return (
                    <Badge color={color} variant="light">
                        {actionType}
                    </Badge>
                );
            },
            size: 120
        },
        {
            accessorKey: 'warehouseName',
            header: 'Warehouse',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm" fw={500}>
                    {info.getValue() as string}
                </Text>
            ),
            size: 150
        },
        {
            accessorKey: 'productTitle',
            header: 'Product',
            enableSorting: true,
            cell: (info) => (
                <div>
                    <Text size="sm" fw={500}>
                        {info.row.original.productSku} - {info.getValue() as string}
                    </Text>
                </div>
            ),
            size: 200
        },
        {
            accessorKey: 'quantityChange',
            header: 'Qty Change',
            enableSorting: true,
            cell: (info) => {
                const change = info.getValue() as number;
                return (
                    <Text
                        size="sm"
                        fw={600}
                        c={change > 0 ? 'green' : change < 0 ? 'red' : 'gray'}
                    >
                        {change > 0 ? `+${change}` : change}
                    </Text>
                );
            },
            size: 100
        },
        {
            accessorKey: 'previousQuantity',
            header: 'Previous Qty',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm">
                    {info.getValue() as number}
                </Text>
            ),
            size: 100
        },
        {
            accessorKey: 'newQuantity',
            header: 'New Qty',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm" fw={500}>
                    {info.getValue() as number}
                </Text>
            ),
            size: 100
        },
        {
            accessorKey: 'userName',
            header: 'User',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm">
                    {info.getValue() as string}
                </Text>
            ),
            size: 150
        },
        {
            accessorKey: 'source',
            header: 'Source',
            enableSorting: true,
            cell: (info) => (
                <Badge variant="outline" color="gray">
                    {info.getValue() as string}
                </Badge>
            ),
            size: 100
        },
        {
            accessorKey: 'notes',
            header: 'Notes',
            enableSorting: false,
            cell: (info) => (
                <Text size="sm" lineClamp={1}>
                    {info.getValue() as string}
                </Text>
            ),
            size: 200
        }
    ];

    // Define table actions
    const actions: DashboardAction<InventoryLog>[] = [
        {
            icon: <PiEyeBold size={16} />,
            color: 'blue',
            title: 'View Details',
            onClick: (log) => console.log('View log:', log)
        }
    ];

    return (
        <>
            <Group justify="space-between" mb="md" align="center">
                <Button
                    variant="outline"
                    leftSection={<PiFileXls size={16} />}
                    onClick={handleExportToExcel}
                    loading={isExporting}
                >
                    Export to Excel
                </Button>
            </Group>
            {/* Filter Section */}
            <Card withBorder mb="md" p="md">
                <Group justify="space-between" align="flex-start">
                    <Text fw={600} size="sm">Filter Inventory Logs</Text>
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={resetFilters}
                    >
                        Clear Filters
                    </Button>
                </Group>

                <Grid mt="sm">
                    <Grid.Col span={3}>
                        <Select
                            label="Warehouse"
                            placeholder="Filter by warehouse"
                            data={warehouseOptions}
                            value={selectedWarehouse}
                            onChange={setSelectedWarehouse}
                            clearable
                            searchable
                            leftSection={<PiWarehouseBold size={16} />}
                            disabled={isLoadingWarehouses}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <Select
                            label="Product"
                            placeholder="Filter by product"
                            data={productOptions}
                            value={selectedProduct}
                            onChange={setSelectedProduct}
                            clearable
                            searchable
                            leftSection={<PiPackageBold size={16} />}
                            disabled={isLoadingProducts}
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <MultiSelect
                            label="Action Types"
                            placeholder="Select action types"
                            data={actionTypeOptions}
                            value={selectedActionTypes}
                            onChange={setSelectedActionTypes}
                            clearable
                            searchable
                        />
                    </Grid.Col>
                    <Grid.Col span={3}>
                        <MultiSelect
                            label="Sources"
                            placeholder="Select sources"
                            data={sourceOptions}
                            value={selectedSources}
                            onChange={setSelectedSources}
                            clearable
                            searchable
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <Group gap="sm">
                            <TextInput
                                type="date"
                                label="From Date"
                                value={dateRange[0]?.toISOString().split('T')[0] || ''}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : null;
                                    setDateRange([date, dateRange[1]]);
                                }}
                            />
                            <TextInput
                                type="date"
                                label="To Date"
                                value={dateRange[1]?.toISOString().split('T')[0] || ''}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : null;
                                    setDateRange([dateRange[0], date]);
                                }}
                            />
                        </Group>
                    </Grid.Col>
                </Grid>
            </Card>

            {/* Inventory Logs Table */}
            <DashboardTable
                tableData={paginatedResponse?.content || []}
                allColumns={columns}
                actions={actions}
                totalPages={paginatedResponse?.totalPages || 1}
                currentPage={page}
                fetchData={setPage}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search logs..."
                title="Inventory Activity Logs"
                subtitle="Track all inventory movements and changes"
                titleIcon={<PiPackageBold size={28} />}
                isLoading={isLoading}
                error={error}
                enableSort
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
                totalItems={paginatedResponse?.totalElements}
            />
        </>
    );
};

export default InventoryLogsDashboard;