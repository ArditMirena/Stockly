// src/components/StockLevelChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PredictionResult } from '../api/PredictionsApi.ts';
import '../style/Prediction.module.css';

interface StockLevelChartProps {
    data: PredictionResult[];
    warehouseId?: number;
}

export const StockLevelChart: React.FC<StockLevelChartProps> = ({ data, warehouseId }) => {
    const chartData = warehouseId
        ? data.map(item => ({
            productId: item.product_id,
            name: `Product ${item.product_id}`,
            currentStock: item.stock_data.current,
            safetyStock: item.recommendation.safety_stock,
        }))
        : Object.values(data.reduce((acc, item) => {
            const key = item.product_id;
            if (!acc[key]) {
                acc[key] = {
                    productId: key,
                    name: `Product ${key}`,
                    currentStock: 0,
                    safetyStock: 0,
                };
            }
            acc[key].currentStock += item.stock_data.current;
            acc[key].safetyStock += item.recommendation.safety_stock;
            return acc;
        }, {} as Record<number, { productId: number; name: string; currentStock: number; safetyStock: number }>));

    return (
        <div className="chart-container">
            <h3>{warehouseId ? `Warehouse ${warehouseId} Stock Levels` : 'Overall Stock Levels'}</h3>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="currentStock" fill="#8884d8" name="Current Stock" />
                    <Bar dataKey="safetyStock" fill="#82ca9d" name="Safety Stock" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};