import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StockLevelChart } from '../../components/StockLevelChart.tsx';
import { RestockPieChart } from '../../components/RestockPieChart.tsx';
import DashboardTable, { Column } from '../../components/DashboardTable.tsx';
import { PredictionResult, useGetCurrentPredictionsQuery } from '../../api/PredictionsApi.ts';
import {
    Select,
    Grid,
    Card,
    LoadingOverlay,
    Alert,
    Text,
    Container,
    Stack,
    Title,
    Badge,
    Group,
    ActionIcon,
    Tooltip as MantineTooltip,
    Box,
    Paper,
    ThemeIcon,
    Divider,
    Button,
    Progress
} from '@mantine/core';
import {
    PiWarehouse,
    PiPackage,
    PiChartBar,
    PiChartPie,
    PiTrendUp,
    PiTrendDown,
    PiWarning,
    PiCheckCircle,
    PiXCircle,
    PiDownload,
    PiCalendar,
    PiClock,
    PiArrowUp,
    PiArrowDown,
    PiArrowCounterClockwise,
    PiFunnel
} from 'react-icons/pi';

interface StockLevelChartProps {
    data: any[];
    warehouseId?: number;
}

const StockLevelChartComponent: React.FC<StockLevelChartProps> = ({ data, warehouseId }) => {
    const getGroupedData = () => {
        if (warehouseId) {
            const productMap = new Map<number, {
                name: string;
                current: number;
                safety: number;
                restockNeeded: number;
                items: number;
            }>();

            data.forEach(item => {
                const existing = productMap.get(item.product_id) || {
                    name: `Product ${item.product_id}`,
                    current: 0,
                    safety: 0,
                    restockNeeded: 0,
                    items: 0
                };

                productMap.set(item.product_id, {
                    name: existing.name,
                    current: existing.current + item.stock_data.current,
                    safety: existing.safety + item.recommendation.safety_stock,
                    restockNeeded: existing.restockNeeded + (item.recommendation.suggested_restock > 0 ? 1 : 0),
                    items: existing.items + 1
                });
            });

            return Array.from(productMap.values())
                .sort((a, b) => b.current - a.current)
                .slice(0, 10);
        } else {
            const warehouseMap = new Map<number, {
                name: string;
                current: number;
                safety: number;
                criticalItems: number;
                items: number;
            }>();

            data.forEach(item => {
                const existing = warehouseMap.get(item.warehouse_id) || {
                    name: `WH-${item.warehouse_id}`,
                    current: 0,
                    safety: 0,
                    criticalItems: 0,
                    items: 0
                };

                warehouseMap.set(item.warehouse_id, {
                    name: existing.name,
                    current: existing.current + item.stock_data.current,
                    safety: existing.safety + item.recommendation.safety_stock,
                    criticalItems: existing.criticalItems + (item.stock_data.days_remaining < 7 ? 1 : 0),
                    items: existing.items + 1
                });
            });

            return Array.from(warehouseMap.values())
                .sort((a, b) => b.current - a.current);
        }
    };

    const chartData = getGroupedData();

    if (chartData.length === 0) {
        return (
            <Paper p="xl" ta="center">
                <Text c="dimmed">No data available for the selected filters</Text>
            </Paper>
        );
    }

    return (
        <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
                    barCategoryGap={15}
                    barGap={10}
                    barSize={40}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        type="number"
                    />
                    <Tooltip
                        formatter={(value, name) => {
                            if (name === 'restockNeeded') {
                                return [`${value} of ${chartData.find(d => d.name === name)?.items} items`, 'Needs Restock'];
                            }
                            if (name === 'criticalItems') {
                                return [`${value} of ${chartData.find(d => d.name === name)?.items} items`, 'Critical Items'];
                            }
                            return [value, name];
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="current"
                        name="Current Stock"
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="safety"
                        name="Safety Stock"
                        fill="#82ca9d"
                        radius={[4, 4, 0, 0]}
                    />
                    {warehouseId ? (
                        <Bar
                            dataKey="restockNeeded"
                            name="Items Needing Restock"
                            fill="#ffc658"
                            radius={[4, 4, 0, 0]}
                        />
                    ) : (
                        <Bar
                            dataKey="criticalItems"
                            name="Critical Items"
                            fill="#ff8042"
                            radius={[4, 4, 0, 0]}
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const RestockProgressChart: React.FC<{ data: PredictionResult[] }> = ({ data }) => {
    const totalItems = data.length;
    const needsRestock = data.filter(item => item.recommendation.suggested_restock > 0).length;
    const criticalItems = data.filter(item => item.stock_data.days_remaining < 7).length;
    const healthyItems = totalItems - needsRestock;

    if (totalItems === 0) {
        return (
            <Paper p="xl" ta="center">
                <Text c="dimmed">No data available for the selected filters</Text>
            </Paper>
        );
    }

    return (
        <Box p="md">
                <div>
                    <Text size="sm" c="dimmed" mb="xs">Stock Health Distribution</Text>
                    <Progress.Root size={46}>
                        <MantineTooltip label={`${healthyItems} healthy items (${((healthyItems / totalItems) * 100).toFixed(1)}%)`}>
                            <Progress.Section
                                value={(healthyItems / totalItems) * 100}
                                color="green"
                                label={`${healthyItems} healthy`}
                            />
                        </MantineTooltip>
                        <MantineTooltip label={`${needsRestock - criticalItems} low stock items (${(((needsRestock - criticalItems) / totalItems) * 100).toFixed(1)}%)`}>
                            <Progress.Section
                                value={((needsRestock - criticalItems) / totalItems) * 100}
                                color="yellow"
                                label={`${needsRestock - criticalItems} low`}
                            />
                        </MantineTooltip>
                        <MantineTooltip label={`${criticalItems} critical items (${((criticalItems / totalItems) * 100).toFixed(1)}%)`}>
                            <Progress.Section
                                value={(criticalItems / totalItems) * 100}
                                color="red"
                                label={`${criticalItems} critical`}
                            />
                        </MantineTooltip>
                    </Progress.Root>
                </div>
        </Box>
    );
};

export const PredictionsDashboard: React.FC = () => {
    const { data: predictions = [], isLoading, isError, refetch } = useGetCurrentPredictionsQuery();
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    if (isLoading) return <LoadingOverlay visible />;
    if (isError) return (
        <Container size="xl" p="md">
            <Alert
                color="red"
                title="Error Loading Predictions"
                icon={<PiXCircle size={20} />}
                variant="filled"
            >
                Unable to load prediction data. Please try again.
                <Button
                    variant="white"
                    size="xs"
                    mt="sm"
                    leftSection={<PiArrowCounterClockwise size={14} />}
                    onClick={() => refetch()}
                >
                    Retry
                </Button>
            </Alert>
        </Container>
    );

    const filteredPredictions = predictions.filter(pred => {
        if (selectedWarehouse && selectedProduct) {
            return pred.warehouse_id === selectedWarehouse && pred.product_id === selectedProduct;
        }
        if (selectedWarehouse) return pred.warehouse_id === selectedWarehouse;
        if (selectedProduct) return pred.product_id === selectedProduct;
        return true;
    });

    const availableProducts = selectedWarehouse
        ? Array.from(new Set(
            predictions
                .filter(p => p.warehouse_id === selectedWarehouse)
                .map(p => p.product_id)
        ))
        : Array.from(new Set(predictions.map(p => p.product_id)));

    const totalProducts = filteredPredictions.length;
    const lowStockItems = filteredPredictions.filter(p => p.recommendation.suggested_restock > 0).length;
    const criticalItems = filteredPredictions.filter(p => p.stock_data.days_remaining < 7).length;
    const healthyItems = totalProducts - lowStockItems;

    const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
    const paginatedData = filteredPredictions.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const getStockStatus = (daysRemaining: number, suggestedRestock: number) => {
        if (suggestedRestock > 0 || daysRemaining < 7) {
            return { color: 'red', label: 'Critical', icon: <PiWarning size={14} /> };
        } else if (daysRemaining < 14) {
            return { color: 'yellow', label: 'Low', icon: <PiClock size={14} /> };
        }
        return { color: 'green', label: 'Healthy', icon: <PiCheckCircle size={14} /> };
    };

    const columns: Column<PredictionResult>[] = [
        {
            accessorKey: 'product_id',
            header: 'Product ID',
            enableSorting: true,
            cell: (info) => (
                <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="blue">
                        <PiPackage size={14} />
                    </ThemeIcon>
                    <Text fw={500}>{info.getValue()}</Text>
                </Group>
            )
        },
        {
            accessorKey: 'warehouse_id',
            header: 'Warehouse',
            enableSorting: true,
            cell: (info) => (
                <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="grape">
                        <PiWarehouse size={14} />
                    </ThemeIcon>
                    <Text>WH-{info.getValue()}</Text>
                </Group>
            )
        },
        {
            accessorKey: 'stock_data',
            header: 'Current Stock',
            enableSorting: true,
            cell: ({ getValue }) => {
                const stockData = getValue() as { current: number };
                return (
                    <Text fw={600} c="dark">
                        {stockData.current.toLocaleString()}
                    </Text>
                );
            }
        },
        {
            accessorKey: 'recommendation',
            header: 'Safety Stock',
            enableSorting: true,
            cell: ({ getValue }) => {
                const recommendation = getValue() as { safety_stock: number };
                return (
                    <Text c="dimmed">
                        {recommendation.safety_stock.toLocaleString()}
                    </Text>
                );
            }
        },
        {
            accessorKey: 'recommendation',
            header: 'Restock Qty',
            enableSorting: true,
            cell: ({ getValue }) => {
                const recommendation = getValue() as { suggested_restock: number };
                const needsRestock = recommendation.suggested_restock > 0;
                return (
                    <Group gap="xs">
                        {needsRestock ? (
                            <PiArrowUp color="red" size={16} />
                        ) : (
                            <PiArrowDown color="green" size={16} />
                        )}
                        <Text c={needsRestock ? 'red' : 'green'} fw={needsRestock ? 'bold' : 'normal'} >
                                {recommendation.suggested_restock.toLocaleString()}
                                </Text>
                                </Group>
                                );
                            }
        },
        {
            accessorKey: 'stock_data',
            header: 'Days Remaining',
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const stockData = getValue() as { days_remaining: number };
                const recommendation = row.original.recommendation;
                const status = getStockStatus(stockData.days_remaining, recommendation.suggested_restock);

                return (
                    <Group gap="xs">
                        <Badge
                            color={status.color}
                            variant="light"
                            size="sm"
                            leftSection={status.icon}
                        >
                            {stockData.days_remaining.toFixed(1)} days
                        </Badge>
                    </Group>
                );
            }
        }
    ];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const clearFilters = () => {
        setSelectedWarehouse(null);
        setSelectedProduct(null);
        setCurrentPage(0);
    };

    return (
        <Container size="xl" p="md">
            <Stack gap="lg">
                {/* Header */}
                <Paper p="md" withBorder>
                    <Group justify="space-between" align="center">
                        <div>
                            <Title order={2} mb="xs">
                                <Group gap="sm">
                                    <ThemeIcon size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
                                        <PiTrendUp size={24} />
                                    </ThemeIcon>
                                    Inventory Predictions Dashboard
                                </Group>
                            </Title>
                            <Text c="dimmed" size="sm">
                                Monitor stock levels and get AI-powered restocking recommendations
                            </Text>
                        </div>
                        <Group gap="sm">
                            <MantineTooltip label="Refresh Data">
                                <ActionIcon
                                    variant="light"
                                    size="lg"
                                    onClick={() => refetch()}
                                    loading={isLoading}
                                >
                                    <PiArrowCounterClockwise size={18} />
                                </ActionIcon>
                            </MantineTooltip>
                            <MantineTooltip label="Export Data">
                                <ActionIcon variant="light" size="lg" color="green">
                                    <PiDownload size={18} />
                                </ActionIcon>
                            </MantineTooltip>
                        </Group>
                    </Group>
                </Paper>

                {/* Summary Cards */}
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card withBorder p="md" h="100%">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" mb="xs">Total Products</Text>
                                    <Text size="xl" fw={700}>{totalProducts}</Text>
                                </div>
                                <ThemeIcon size="xl" variant="light" color="blue">
                                    <PiPackage size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card withBorder p="md" h="100%">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" mb="xs">Healthy Stock</Text>
                                    <Text size="xl" fw={700} c="green">{healthyItems}</Text>
                                </div>
                                <ThemeIcon size="xl" variant="light" color="green">
                                    <PiCheckCircle size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card withBorder p="md" h="100%">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" mb="xs">Need Restock</Text>
                                    <Text size="xl" fw={700} c="orange">{lowStockItems}</Text>
                                </div>
                                <ThemeIcon size="xl" variant="light" color="orange">
                                    <PiTrendDown size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card withBorder p="md" h="100%">
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm" c="dimmed" mb="xs">Critical Items</Text>
                                    <Text size="xl" fw={700} c="red">{criticalItems}</Text>
                                </div>
                                <ThemeIcon size="xl" variant="light" color="red">
                                    <PiWarning size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Filters */}
                <Card withBorder p="md">
                    <Group justify="space-between" align="end" mb="md">
                        <Group gap="sm" align="center">
                            <PiFunnel size={20} />
                            <Text fw={500}>Filters</Text>
                        </Group>
                        {(selectedWarehouse || selectedProduct) && (
                            <Button
                                variant="subtle"
                                size="xs"
                                onClick={clearFilters}
                                leftSection={<PiXCircle size={14} />}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </Group>

                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Warehouse"
                                placeholder="Select warehouse..."
                                leftSection={<PiWarehouse size={16} />}
                                value={selectedWarehouse?.toString() || null}
                                onChange={(value) => {
                                    setSelectedWarehouse(value ? Number(value) : null);
                                    setCurrentPage(0);
                                }}
                                data={Array.from(new Set(predictions.map(p => p.warehouse_id))).map(id => ({
                                    value: id.toString(),
                                    label: `Warehouse ${id}`
                                }))}
                                clearable
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Product"
                                placeholder="Select product..."
                                leftSection={<PiPackage size={16} />}
                                value={selectedProduct?.toString() || null}
                                onChange={(value) => {
                                    setSelectedProduct(value ? Number(value) : null);
                                    setCurrentPage(0);
                                }}
                                data={availableProducts.map(id => ({
                                    value: id.toString(),
                                    label: `Product ${id}`
                                }))}
                                clearable
                            />
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Bar Chart */}
                <Card withBorder radius="md" p="md">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size="sm" variant="light" color="blue">
                            <PiChartBar size={16} />
                        </ThemeIcon>
                        <Text fw={500}>Stock Level Trends</Text>
                    </Group>
                    <Divider mb="md" />
                    <StockLevelChartComponent
                        data={filteredPredictions}
                        warehouseId={selectedWarehouse || undefined}
                    />
                </Card>

                {/* Progress Bar Chart */}
                <Card withBorder radius="md" p="md">
                    <Group gap="sm" mb="md">
                        <ThemeIcon size="sm" variant="light" color="grape">
                            <PiChartPie size={16} />
                        </ThemeIcon>
                        <Text fw={500}>Stock Health & Restock Distribution</Text>
                    </Group>
                    <Divider mb="md" />
                    <RestockProgressChart data={filteredPredictions} />
                </Card>

                {/* Data Table */}
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between" align="center" mb="md">
                        <Group gap="sm">
                            <ThemeIcon size="sm" variant="light" color="teal">
                                <PiCalendar size={16} />
                            </ThemeIcon>
                            <Text fw={500}>Prediction Details</Text>
                            <Badge variant="light" color="blue" size="sm">
                                {filteredPredictions.length} items
                            </Badge>
                        </Group>
                        <Group gap="sm">
                            <Text size="sm" c="dimmed">
                                Page {currentPage + 1} of {totalPages || 1}
                            </Text>
                        </Group>
                    </Group>

                    <Divider mb="md" />

                    {filteredPredictions.length === 0 ? (
                        <Paper p="xl" ta="center">
                            <ThemeIcon size="xl" variant="light" color="gray" mx="auto" mb="md">
                                <PiPackage size={32} />
                            </ThemeIcon>
                            <Text size="lg" fw={500} mb="xs">No predictions found</Text>
                            <Text c="dimmed" size="sm">
                                {(selectedWarehouse || selectedProduct)
                                    ? "Try adjusting your filters to see more results"
                                    : "No prediction data available at the moment"
                                }
                            </Text>
                            {(selectedWarehouse || selectedProduct) && (
                                <Button
                                    variant="light"
                                    mt="md"
                                    onClick={clearFilters}
                                    leftSection={<PiXCircle size={16} />}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </Paper>
                    ) : (
                        <>
                            <Box style={{ overflowX: 'auto' }}>
                                <DashboardTable<PredictionResult>
                                    title="Predictions"
                                    tableData={paginatedData}
                                    allColumns={columns}
                                    enableSort={true}
                                    totalPages={totalPages}
                                    currentPage={currentPage}
                                    fetchData={handlePageChange}
                                />
                            </Box>
                        </>
                    )}
                </Card>

                {/* Footer Info */}
                <Paper p="md" withBorder bg="gray.0">
                    <Group justify="space-between" align="center">
                        <Group gap="sm">
                            <ThemeIcon size="sm" variant="light" color="blue">
                                <PiClock size={14} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                                Last updated: {new Date().toLocaleString()}
                            </Text>
                        </Group>
                        <Group gap="lg">
                            <Group gap="xs">
                                <Badge color="green" variant="dot" size="sm">Healthy</Badge>
                                <Text size="xs" c="dimmed">Good stock levels</Text>
                            </Group>
                            <Group gap="xs">
                                <Badge color="yellow" variant="dot" size="sm">Low</Badge>
                                <Text size="xs" c="dimmed">Monitor closely</Text>
                            </Group>
                            <Group gap="xs">
                                <Badge color="red" variant="dot" size="sm">Critical</Badge>
                                <Text size="xs" c="dimmed">Immediate action needed</Text>
                            </Group>
                        </Group>
                    </Group>
                </Paper>
            </Stack>
        </Container>
    );
};

export default PredictionsDashboard;