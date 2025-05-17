import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PredictionResult } from '../api/PredictionsApi.ts';
import '../style/Prediction.module.css';

const COLORS = ['#0088FE', '#00C49F'];

export const RestockPieChart: React.FC<{ data: PredictionResult[] }> = ({ data }) => {
    const needsRestock = data.filter(item => item.recommendation.suggested_restock > 0).length;
    const adequateStock = data.filter(item => item.recommendation.suggested_restock === 0).length;
    const totalItems = data.length;

    const restockData = [
        {
            name: `Needs Restock (${needsRestock})`,
            value: needsRestock,
            description: `${needsRestock} items need restocking`
        },
        {
            name: `Adequate Stock (${adequateStock})`,
            value: adequateStock,
            description: `${adequateStock} items have sufficient stock`
        },
    ];

    return (
        <div className="chart-container">
            <h3>Restock Recommendations</h3>
            <p className="chart-subtitle">Total Items: {totalItems}</p>
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={restockData}
                        cx="50%"
                        cy="50%"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={500}
                    >
                        {restockData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name, props) => [
                            props.payload.description,
                            name
                        ]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};