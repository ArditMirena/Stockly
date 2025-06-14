import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { downloadReceiptWithAxios } from "../../utils/api.tsx";
import {
    useGetReceiptsWithPaginationQuery,
    useSearchReceiptsQuery,
    useSendReceiptMutation,
    useDownloadReceiptMutation,
    ReceiptDTO
} from '../../api/receiptsApi';
import {
    Badge,
    Text,
    Card,
    Grid,
    Alert,
    Divider,
    Group,
    Loader,
    Button,
    Stack,
    ActionIcon,
    Tooltip,
    Anchor,
    ScrollArea,
    Table
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {
    PiEyeBold,
    PiEnvelopeBold,
    PiDownloadBold,
    PiWarningBold,
    PiCurrencyDollarBold,
    PiReceiptBold
} from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';
import { saveAs } from 'file-saver';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

// Status color mapping
const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'yellow';
        case 'processing': return 'blue';
        case 'shipped': return 'green';
        case 'delivered': return 'teal';
        case 'cancelled': return 'red';
        default: return 'gray';
    };
};

const ReceiptsDashboard = () => {
    // Pagination and search state
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('view');
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDTO | null>(null);

    // API hooks
    const [sendReceipt, { isLoading: isSendingReceipt }] = useSendReceiptMutation();
    const [downloadReceipt, { isLoading: isDownloadingReceipt }] = useDownloadReceiptMutation();

    const user = useSelector((state: RootState) => state.auth.user);

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading,
        error: receiptsError
    } = useGetReceiptsWithPaginationQuery({
        offset: page,
        pageSize: 10,
        ...(user?.role === ROLES.BUYER && { 
            buyerManagerId: user.id
        }),
        ...(user?.role === ROLES.SUPPLIER && { 
            supplierManagerId: user.id
        }),
    });

    const {
        data: searchedReceipts,
        isFetching: isSearchLoading,
        error: searchError
    } = useSearchReceiptsQuery(debouncedSearch, {
        skip: debouncedSearch.length === 0,
    });

    const handleOpenModal = (receipt: ReceiptDTO, type: ModalType) => {
        setSelectedReceipt(receipt);
        setModalType(type);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedReceipt(null);
    };

    const handleSendReceipt = async () => {
        if (!selectedReceipt) return;

        try {
            const result = await sendReceipt(selectedReceipt.orderId).unwrap();
            showNotification({
                title: 'Success',
                message: result || 'Receipt sent successfully',
                color: 'green',
            });
        } catch (error) {
            showNotification({
                title: 'Error',
                message: 'Failed to send receipt',
                color: 'red',
            });
        }
    };

    const handleDownloadReceipt = async () => {
        if (!selectedReceipt) return;

        try {
            const pdfBlob = await downloadReceiptWithAxios(selectedReceipt.orderId);

            if (!(pdfBlob instanceof Blob)) {
                throw new Error('Invalid response type - expected Blob');
            }

            // Validate it's a real PDF
            const firstBytes = await pdfBlob.slice(0, 4).text();
            console.log('PDF header:', firstBytes);
            if (firstBytes !== '%PDF') {
                throw new Error('Invalid PDF format received');
            }

            const blobUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `receipt-order-${selectedReceipt.orderId}.pdf`;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);

            showNotification({
                title: 'Success',
                message: 'Receipt downloaded successfully',
                color: 'green',
            });

        } catch (error) {
            console.error('Download failed:', {
                error,
                orderId: selectedReceipt?.orderId,
            });

            showNotification({
                title: 'Error',
                message: error instanceof Error ? error.message : 'Failed to download receipt',
                color: 'red',
            });
        }
    };

    // Define table columns
    const columns: Column<ReceiptDTO>[] = [
        {
            accessorKey: 'orderId',
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
            accessorKey: 'buyer.companyName',
            header: 'Buyer',
            enableSorting: false,
            cell: (info) => (
                <Text size="sm" fw={500}>
                    {info.row.original.buyer.companyName || 'N/A'}
                </Text>
            ),
        },
        {
            accessorKey: 'supplier.companyName',
            header: 'Supplier',
            enableSorting: false,
            cell: (info) => (
                <Text size="sm">
                    {info.row.original.supplier.companyName || 'N/A'}
                </Text>
            ),
        },
        {
            accessorKey: 'sourceWarehouse.name',
            header: 'Source Warehouse',
            enableSorting: false,
            cell: (info) => {
                const warehouse = info.row.original.sourceWarehouse;
                return warehouse ? (
                    <Badge variant="light" color="blue" size="sm">
                        {warehouse.name}
                    </Badge>
                ) : (
                    <Text size="xs" c="dimmed">No source</Text>
                );
            },
            size: 150,
        },
        {
            accessorKey: 'destinationWarehouse.name',
            header: 'Destination Warehouse',
            enableSorting: false,
            cell: (info) => {
                const warehouse = info.row.original.destinationWarehouse;
                return warehouse ? (
                    <Badge variant="light" color="green" size="sm">
                        {warehouse.name}
                    </Badge>
                ) : (
                    <Text size="xs" c="dimmed">No destination</Text>
                );
            },
            size: 150,
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
    const actions: DashboardAction<ReceiptDTO>[] = [
        {
            icon: <PiEyeBold size={16} />,
            color: 'blue',
            title: 'View Receipt',
            onClick: (receipt) => handleOpenModal(receipt, 'view')
        },
        {
            icon: <PiEnvelopeBold size={16} />,
            color: 'green',
            title: 'Send Receipt',
            onClick: (receipt) => handleOpenModal(receipt, 'view')
        },
        {
            icon: <PiDownloadBold size={16} />,
            color: 'orange',
            title: 'Download Receipt',
            onClick: (receipt) => handleOpenModal(receipt, 'view')
        }
    ];

    const tableData = debouncedSearch.length > 0 ? searchedReceipts || [] : paginatedResponse?.content || [];
    const totalPages = debouncedSearch.length > 0 ? 1 : paginatedResponse?.totalPages || 1;
    const isLoading = isPaginatedLoading || isSearchLoading;
    const hasError = receiptsError || searchError;

    return (
        <>
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
                searchPlaceholder="Search receipts..."
                title="Receipts Dashboard"
                subtitle="View and manage all receipts in your system"
                titleIcon={<PiReceiptBold size={28} />}
                isLoading={isLoading}
                error={hasError}
                enableSort
                enableSearch
            />

            {/* Receipt Details Modal */}
            <DashboardCrudModal
                opened={modalOpen}
                title={`Receipt Details #${selectedReceipt?.orderId || ''}`}
                onClose={handleCloseModal}
                modalType={modalType}
                hideSubmitButton
                size="lg"
            >
                {selectedReceipt && (
                    <Stack gap="md">
                        {/* Receipt Header */}
                        <Group justify="space-between">
                            <div>
                                <Text size="sm" c="dimmed">Order Date</Text>
                                <Text fw={500}>
                                    {new Date(selectedReceipt.orderDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </div>
                            <Badge color={getStatusColor(selectedReceipt.status)} size="lg">
                                {selectedReceipt.status}
                            </Badge>
                        </Group>

                        <Divider />

                        {/* Buyer and Supplier Information */}
                        <Grid>
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} mb="xs">Buyer Information</Text>
                                <Card withBorder p="sm">
                                    <Text fw={500}>{selectedReceipt.buyer.companyName}</Text>
                                    <Text size="sm" c="dimmed">{selectedReceipt.buyer.email}</Text>
                                    <Text size="sm" c="dimmed">{selectedReceipt.buyer.phoneNumber}</Text>
                                    <Text size="sm" mt="xs">{selectedReceipt.buyer.address}</Text>
                                </Card>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} mb="xs">Supplier Information</Text>
                                <Card withBorder p="sm">
                                    <Text fw={500}>{selectedReceipt.supplier.companyName}</Text>
                                    <Text size="sm" c="dimmed">{selectedReceipt.supplier.email}</Text>
                                    <Text size="sm" c="dimmed">{selectedReceipt.supplier.phoneNumber}</Text>
                                    <Text size="sm" mt="xs">{selectedReceipt.supplier.address}</Text>
                                </Card>
                            </Grid.Col>
                        </Grid>

                        {/* Warehouse Information */}
                        <Grid>
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} mb="xs">Source Warehouse</Text>
                                <Card withBorder p="sm">
                                    <Text fw={500}>{selectedReceipt.sourceWarehouse.name}</Text>
                                    <Text size="sm">{selectedReceipt.sourceWarehouse.address}</Text>
                                </Card>
                            </Grid.Col>
                            {selectedReceipt.destinationWarehouse && (
                                <Grid.Col span={6}>
                                    <Text size="sm" fw={600} mb="xs">Destination Warehouse</Text>
                                    <Card withBorder p="sm">
                                        <Text fw={500}>{selectedReceipt.destinationWarehouse.name}</Text>
                                        <Text size="sm">{selectedReceipt.destinationWarehouse.address}</Text>
                                    </Card>
                                </Grid.Col>
                            )}
                        </Grid>

                        {/* Items Table - Now with proper ScrollArea */}
                        <Text size="sm" fw={600} mb="xs">Order Items</Text>
                        <ScrollArea style={{ height: 200 }}>
                            <Table striped highlightOnHover>
                                <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedReceipt.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.productTitle}</td>
                                        <td>{item.productSku}</td>
                                        <td>{item.quantity}</td>
                                        <td>${item.unitPrice.toFixed(2)}</td>
                                        <td>${item.totalPrice.toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </ScrollArea>

                        {/* Order Summary */}
                        <Card withBorder bg="gray.0" p="md">
                            <Group justify="space-between">
                                <Text size="sm" fw={600}>Order Total</Text>
                                <Text size="xl" fw={700} c="green">
                                    ${selectedReceipt.totalPrice.toFixed(2)}
                                </Text>
                            </Group>
                        </Card>

                        {/* Action Buttons */}
                        <Group grow mt="md">
                            <Button
                                leftSection={<PiEnvelopeBold size={16} />}
                                onClick={handleSendReceipt}
                                loading={isSendingReceipt}
                                color="green"
                                variant="light"
                            >
                                Send Receipt via Email
                            </Button>
                            <Button
                                leftSection={<PiDownloadBold size={16} />}
                                onClick={handleDownloadReceipt}
                                loading={isDownloadingReceipt}
                                color="blue"
                                variant="light"
                            >
                                Download PDF Receipt
                            </Button>
                        </Group>
                    </Stack>
                )}
            </DashboardCrudModal>
        </>
    );
};

export default ReceiptsDashboard;