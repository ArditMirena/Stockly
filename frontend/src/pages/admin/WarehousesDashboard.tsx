import { useMemo, useState} from 'react';
import {
    Paper,
    Title,
    Divider,
    Stack,
    Group,
    ActionIcon,
    Box,
    Loader,
    Modal,
    Button,
    Text,
    TextInput,
    Menu
} from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold, PiCaretDownBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import {
    useGetAllWarehousesWithPaginationQuery,
    useSearchWarehousesQuery,
    useDeleteWarehouseMutation,
    WarehouseDTO
} from '../../api/WarehousesApi';
import { useGetCompaniesQuery } from '../../api/CompaniesApi';

const WarehousesDashboard = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const location = useLocation();
    const [companyFilter, setCompanyFilter] = useState<number | null>(
        location.state?.preselectedCompany?.id || null
    );

    // Fetch companies for the filter dropdown
    const { data: companies } = useGetCompaniesQuery();

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading
    } = useGetAllWarehousesWithPaginationQuery({
        offset: page,
        pageSize: 10,
        sortBy: 'id',
        companyId: companyFilter || undefined // Send undefined instead of null
    });


    const {
        data: searchedWarehouses = [],
        isFetching: isSearchLoading,
    } = useSearchWarehousesQuery(
        {
            searchTerm: debouncedSearch.trim(),
            companyId: companyFilter || undefined
        },
        {
            skip: debouncedSearch.trim().length === 0,
            refetchOnMountOrArgChange: true
        }
    );

    const [deleteWarehouse] = useDeleteWarehouseMutation();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        if (deleteId !== null) {
            await deleteWarehouse(deleteId);
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const columns: Column<WarehouseDTO>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'companyId',
            header: 'Company',
            enableSorting: true,
            cell: (info) => {
                const company = companies?.find(c => c.id === info.getValue());
                return company?.companyName || info.getValue();
            },
        },
        {
            accessorKey: 'address',
            header: 'Address',
            enableSorting: false,
            cell: (info) => {
                const address = info.getValue();
                return address ? `${address.street}, ${address.postalCode}` : 'N/A';
            },
        },
        {
            accessorKey: 'id',
            header: 'Actions',
            enableSorting: false,
            cell: ({ getValue }) => (
                <Group justify="center">
                    <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => {
                            setDeleteId(getValue());
                            setConfirmOpen(true);
                        }}
                    >
                        <PiTrashBold size={18} />
                    </ActionIcon>
                </Group>
            ),
        },
    ];


    const tableData = useMemo(() => {
        if (debouncedSearch.trim().length > 0) {
            return searchedWarehouses || [];
        }
        return paginatedResponse?.content || [];
    }, [debouncedSearch, searchedWarehouses, paginatedResponse]);

    const totalPages = debouncedSearch.length > 0
        ? 1
        : paginatedResponse?.totalPages || 1;

    return (
        <Paper>
            <Stack>
                <Group justify="space-between">
                    <Title order={3}>
                        {location.state?.preselectedCompany
                            ? `${location.state.preselectedCompany.name}'s Warehouses`
                            : 'Warehouses Dashboard'}
                    </Title>
                    <Group>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Button
                                    rightSection={<PiCaretDownBold size={14} />}
                                    variant="outline"
                                >
                                    {companyFilter
                                        ? companies?.find(c => c.id === companyFilter)?.companyName || `Company ${companyFilter}`
                                        : 'All Companies'}
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => setCompanyFilter(null)}>
                                    All Companies
                                </Menu.Item>
                                {companies?.map(company => (
                                    <Menu.Item
                                        key={company.id}
                                        onClick={() => setCompanyFilter(company.id)}
                                    >
                                        {company.companyName}
                                    </Menu.Item>
                                ))}
                            </Menu.Dropdown>
                        </Menu>
                        <TextInput
                            placeholder="Search warehouses..."
                            leftSection={<PiMagnifyingGlassBold size={16} />}
                            w={250}
                            value={searchTerm}
                            onChange={(e) => {
                                setPage(0);
                                setSearchTerm(e.currentTarget.value);
                            }}
                        />
                    </Group>
                </Group>

                <Divider />

                {(isPaginatedLoading || isSearchLoading) ? (
                    <Box py="xl" style={{ textAlign: 'center' }}>
                        <Loader />
                    </Box>
                ) : tableData.length === 0 ? (
                    <Box py="xl" style={{ textAlign: 'center' }}>
                        <Text>No warehouses found</Text>
                        {debouncedSearch.trim().length > 0 && (
                            <Text size="sm" c="dimmed">
                                No results for "{debouncedSearch}"
                                {companyFilter ? ` in selected company` : ''}
                            </Text>
                        )}
                    </Box>
                ) : (
                    <DashboardTable
                        tableData={tableData}
                        allColumns={columns}
                        enableSort
                        totalPages={totalPages}
                        currentPage={page}
                        fetchData={setPage}
                    />
                )}

                <Modal
                    opened={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    title="Confirm Delete"
                    centered
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0'
                    }}
                >
                    <Text>Are you sure you want to delete this warehouse?</Text>
                    <Group mt="md" justify="flex-end">
                        <Button variant="default" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Group>
                </Modal>
            </Stack>
        </Paper>
    );
};

export default WarehousesDashboard;