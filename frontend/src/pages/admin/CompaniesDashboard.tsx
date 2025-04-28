import { useState } from 'react';
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
    Badge,
    Menu,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold, PiCaretDownBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import {
    useGetCompaniesWithPaginationQuery,
    useGetCompaniesByTypeWithPaginationQuery,
    useSearchCompaniesQuery,
    useDeleteCompanyMutation,
    Company
} from '../../api/CompaniesApi';

const CompaniesDashboard = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const [companyTypeFilter, setCompanyTypeFilter] = useState<string | null>(null);
    const pageSize = 10;

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading,
    } = companyTypeFilter
        ? useGetCompaniesByTypeWithPaginationQuery({
            offset: page,
            pageSize,
            sortBy: 'id',
            companyType: companyTypeFilter
        })
        : useGetCompaniesWithPaginationQuery({
            offset: page,
            pageSize,
            sortBy: 'id',
        });

    const {
        data: searchedCompanies,
        isFetching: isSearchLoading,
    } = useSearchCompaniesQuery(debouncedSearch, {
        skip: debouncedSearch.length === 0,
    });

    const [deleteCompany] = useDeleteCompanyMutation();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleDelete = async () => {
        if (deleteId !== null) {
            await deleteCompany(deleteId);
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const columns: Column<Company>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'companyName',
            header: 'Company Name',
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: false,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone',
            enableSorting: false,
            cell: (info) => info.getValue(),
        },
        {
            accessorKey: 'companyType',
            header: 'Type',
            enableSorting: false,
            cell: (info) => (
                <Badge color={info.getValue() === 'SUPPLIER' ? 'blue' : 'green'}>
                    {info.getValue()}
                </Badge>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Address',
            enableSorting: false,
            cell: (info) => {
                const address = info.getValue() as AddressDTO;
                return address ? `${address.street}, ${address.postalCode}` : 'N/A';
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            enableSorting: true,
            cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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

    const tableData = debouncedSearch.length > 0 ? searchedCompanies || [] : paginatedResponse?.content || [];
    const totalPages = debouncedSearch.length > 0 ? 1 : paginatedResponse?.totalPages || 1;

    return (
        <Paper>
            <Stack>
                <Group justify="space-between">
                    <Title order={3}>Companies Dashboard</Title>
                    <Group>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Button
                                    rightSection={<PiCaretDownBold size={14} />}
                                    variant="outline"
                                >
                                    {companyTypeFilter ? `${companyTypeFilter}S` : 'All Companies'}
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => setCompanyTypeFilter(null)}>
                                    All Companies
                                </Menu.Item>
                                <Menu.Item onClick={() => setCompanyTypeFilter('BUYER')}>
                                    Buyers
                                </Menu.Item>
                                <Menu.Item onClick={() => setCompanyTypeFilter('SUPPLIER')}>
                                    Suppliers
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                        <TextInput
                            placeholder="Search companies..."
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
                >
                    <Text>Are you sure you want to delete this company?</Text>
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

export default CompaniesDashboard;