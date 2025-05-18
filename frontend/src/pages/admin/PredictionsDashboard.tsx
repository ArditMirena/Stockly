// src/pages/admin/PredictionsDashboard.tsx
import React, { useState } from 'react';
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
    Pagination,
    Text,
    Container,
    Stack
} from '@mantine/core';

export const PredictionsDashboard: React.FC = () => {
    const { data: predictions = [], isLoading, isError } = useGetCurrentPredictionsQuery();
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    if (isLoading) return <LoadingOverlay visible />;
    if (isError) return <Alert color="red" title="Error">Error loading predictions</Alert>;

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

    // Pagination logic
    const totalPages = Math.ceil(filteredPredictions.length / itemsPerPage);
    const paginatedData = filteredPredictions.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const columns: Column<PredictionResult>[] = [
        {
            accessorKey: 'product_id',
            header: 'Product ID',
            enableSorting: true,
            cell: (info) => info.getValue()
        },
        {
            accessorKey: 'warehouse_id',
            header: 'Warehouse',
            enableSorting: true,
            cell: (info) => info.getValue()
        },
        {
            accessorKey: 'stock_data',
            header: 'Current Stock',
            enableSorting: true,
            cell: ({ getValue }) => {
                const stockData = getValue() as { current: number };
                return stockData.current;
            }
        },
        {
            accessorKey: 'recommendation',
            header: 'Safety Stock',
            enableSorting: true,
            cell: ({ getValue }) => {
                const recommendation = getValue() as { safety_stock: number };
                return recommendation.safety_stock;
            }
        },
        {
            accessorKey: 'recommendation',
            header: 'Restock Qty',
            enableSorting: true,
            cell: ({ getValue }) => {
                const recommendation = getValue() as { suggested_restock: number };
                return (
                    <Text 
                        c={recommendation.suggested_restock > 0 ? 'red' : 'green'}
                        fw={recommendation.suggested_restock > 0 ? 'bold' : 'normal'}
                    >
                        {recommendation.suggested_restock}
                    </Text>
                );
            }
        },
        {
            accessorKey: 'stock_data',
            header: 'Days Remaining',
            enableSorting: true,
            cell: ({ getValue }) => {
                const stockData = getValue() as { days_remaining: number };
                return stockData.days_remaining.toFixed(1);
            }
        }
    ];

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Mantine Pagination is 1-based
    };

    return (
        <Container size="xl" p="md">
            <Stack gap="md">
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Select
                            label="Warehouse"
                            placeholder="All Warehouses"
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
                            placeholder="All Products"
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

                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder radius="md" p="md" h="100%">
                            <StockLevelChart 
                                data={filteredPredictions} 
                                warehouseId={selectedWarehouse || undefined}
                            />
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder radius="md" p="md" h="100%">
                            <RestockPieChart data={filteredPredictions} />
                        </Card>
                    </Grid.Col>
                </Grid>

                <Card withBorder radius="md" p="md">
                    <DashboardTable<PredictionResult>
                        tableData={paginatedData}
                        allColumns={columns}
                        enableSort={true}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        fetchData={handlePageChange}
                    />
                    {totalPages > 1 && (
                        <Pagination
                            total={totalPages}
                            value={currentPage + 1}
                            onChange={handlePageChange}
                            mt="md"
                            siblings={1}
                            boundaries={1}
                        />
                    )}
                </Card>
            </Stack>
        </Container>
    );
};

export default PredictionsDashboard;