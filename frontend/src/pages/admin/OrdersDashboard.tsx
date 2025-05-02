import React, { useState } from 'react';
import {
    Table,
    Pagination,
    Select,
    Button,
    DatePicker,
    Space,
    Card,
    Tag,
    InputNumber,
    Form,
    message
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGetOrdersQuery, useSearchOrdersQuery } from '../../api/OrdersApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrdersDashboard = () => {
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useState({
        page: 0,
        size: 10
    });
    const [isSearchMode, setIsSearchMode] = useState(false);

    const { data: orders, isLoading } = useGetOrdersQuery({
        page: searchParams.page,
        size: searchParams.size
    }, { skip: isSearchMode });

    const { data: searchResults, isLoading: isSearching } = useSearchOrdersQuery(
        { ...searchParams, page: searchParams.page, size: searchParams.size },
        { skip: !isSearchMode }
    );

    const displayData = isSearchMode ? searchResults : orders;

    const handleSearch = (values: any) => {
        if (values.dateRange) {
            values.startDate = values.dateRange[0].format('YYYY-MM-DD');
            values.endDate = values.dateRange[1].format('YYYY-MM-DD');
            delete values.dateRange;
        }
        setSearchParams(prev => ({
            ...prev,
            ...values,
            page: 0
        }));
        setIsSearchMode(true);
    };

    const handleReset = () => {
        form.resetFields();
        setSearchParams({
            page: 0,
            size: 10
        });
        setIsSearchMode(false);
    };

    const handleTableChange = (page: number, pageSize: number) => {
        setSearchParams(prev => ({
            ...prev,
            page: page - 1,
            size: pageSize
        }));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80
        },
        {
            title: 'Buyer ID',
            dataIndex: 'buyerId',
            key: 'buyerId'
        },
        {
            title: 'Supplier ID',
            dataIndex: 'supplierId',
            key: 'supplierId'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={
                    status === 'COMPLETED' ? 'green' :
                    status === 'CANCELLED' ? 'red' : 'orange'
                }>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Total Price',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price: number) => `$${price.toFixed(2)}`
        },
        {
            title: 'Order Date',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
        },
        {
            title: 'Delivery Date',
            dataIndex: 'deliveryDate',
            key: 'deliveryDate',
            render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : 'N/A'
        }
    ];

    return (
        <Card title="Orders Management" bordered={false}>
            <Form
                layout="inline"
                form={form}
                onFinish={handleSearch}
                initialValues={{
                    status: undefined,
                    dateRange: null
                }}
            >
                <Form.Item name="buyerId" label="Buyer ID">
                    <InputNumber min={1} style={{ width: 100 }} />
                </Form.Item>

                <Form.Item name="supplierId" label="Supplier ID">
                    <InputNumber min={1} style={{ width: 100 }} />
                </Form.Item>

                <Form.Item name="status" label="Status">
                    <Select style={{ width: 120 }} allowClear>
                        <Option value="PENDING">Pending</Option>
                        <Option value="COMPLETED">Completed</Option>
                        <Option value="CANCELLED">Cancelled</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="dateRange" label="Date Range">
                    <RangePicker />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                        Search
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={handleReset}
                        icon={<ReloadOutlined />}
                    >
                        Reset
                    </Button>
                </Form.Item>
            </Form>

            <Table
                columns={columns}
                dataSource={displayData?.content}
                rowKey="id"
                loading={isLoading || isSearching}
                pagination={false}
                style={{ marginTop: 16 }}
                scroll={{ x: true }}
            />

            <Pagination
                current={searchParams.page + 1}
                total={displayData?.totalElements}
                pageSize={searchParams.size}
                onChange={handleTableChange}
                style={{ marginTop: 16, textAlign: 'right' }}
                showSizeChanger
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} orders`}
            />
        </Card>
    );
};

export default OrdersDashboard;