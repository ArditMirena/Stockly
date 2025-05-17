// src/pages/admin/PredictionsDashboard.tsx
import React, { useState } from 'react';
import { StockLevelChart } from '../../components/StockLevelChart.tsx'
import { RestockPieChart } from '../../components/RestockPieChart.tsx';
import DashboardTable, { Column } from '../../components/DashboardTable.tsx';
import { PredictionResult, useGetCurrentPredictionsQuery } from '../../api/PredictionsApi.ts';

export const PredictionsDashboard: React.FC = () => {
    const { data: predictions = [], isLoading, isError } = useGetCurrentPredictionsQuery();
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10;

    if (isLoading) return <div>Loading predictions...</div>;
    if (isError) return <div>Error loading predictions</div>;

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
            cell: ({ getValue, row }) => {
                const recommendation = getValue() as { suggested_restock: number };
                return (
                    <span style={{
                        color: recommendation.suggested_restock > 0 ? 'red' : 'green',
                        fontWeight: recommendation.suggested_restock > 0 ? 'bold' : 'normal'
                    }}>
            {recommendation.suggested_restock}
          </span>
                );
            }
        },
        {
            accessorKey: 'stock_data',
            header: 'Days Remaining',
            enableSorting: true,
            cell: ({ getValue, row }) => {
                const stockData = getValue() as { days_remaining: number };
                return stockData.days_remaining.toFixed(1);
            }
        }
    ];

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="dashboard-container">
            <div className="filters">
                <select
                    value={selectedWarehouse || ''}
                    onChange={e => {
                        setSelectedWarehouse(e.target.value ? Number(e.target.value) : null);
                        setCurrentPage(0);
                    }}
                >
                    <option value="">All Warehouses</option>
                    {Array.from(new Set(predictions.map(p => p.warehouse_id))).map(id => (
                        <option key={id} value={id}>Warehouse {id}</option>
                    ))}
                </select>

                <select
                    value={selectedProduct || ''}
                    onChange={e => {
                        setSelectedProduct(e.target.value ? Number(e.target.value) : null);
                        setCurrentPage(0);
                    }}
                >
                    <option value="">All Products</option>
                    {availableProducts.map(id => (
                        <option key={id} value={id}>Product {id}</option>
                    ))}
                </select>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <StockLevelChart data={filteredPredictions} warehouseId={selectedWarehouse || undefined}/>
                </div>
                <div className="chart-card">
                <RestockPieChart data={filteredPredictions} />
                </div>
            </div>

            <div className="table-section">
                <DashboardTable<PredictionResult>
                    tableData={paginatedData}
                    allColumns={columns}
                    enableSort={true}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    fetchData={handlePageChange}
                />
            </div>
        </div>
    );
};

export default PredictionsDashboard;