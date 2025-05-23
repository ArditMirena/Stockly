import { useMemo, useState } from 'react';
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
    Menu,
    Select,
    Notification,
    Tabs,
    Badge
} from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold, PiCaretDownBold, PiPlusBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import {
    useGetAllWarehousesWithPaginationQuery,
    useSearchWarehousesQuery,
    useDeleteWarehouseMutation,
    useAddWarehouseMutation,
    WarehouseDTO
} from '../../api/WarehousesApi';
import { useGetCompaniesQuery, useGetCountriesQuery, useGetCitiesByCountryQuery } from '../../api/CompaniesApi';
import DashboardCrudModal from '../../components/DashboardCrudModal';

const WarehousesDashboard = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const location = useLocation();
    const [companyFilter, setCompanyFilter] = useState<number | null>(
        location.state?.preselectedCompany?.id || null
    );

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCompanyType, setSelectedCompanyType] = useState<'SUPPLIER' | 'MANUFACTURER'>('SUPPLIER');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    // Fetch data
    const { data: allCompanies = [] } = useGetCompaniesQuery();
    const { data: countries = [], isLoading: isCountriesLoading } = useGetCountriesQuery();
    const {
        data: cities = [],
        isFetching: isCitiesLoading
    } = useGetCitiesByCountryQuery(selectedCountry ? Number(selectedCountry) : 0, {
        skip: !selectedCountry
    });

    // Filter companies based on type
    const filteredCompanies = useMemo(() => {
        return allCompanies.filter(company => {
            if (selectedCompanyType === 'SUPPLIER') {
                return !company.businessType && !company.hasProductionFacility;
            } else { // MANUFACTURER
                return !company.businessType && company.hasProductionFacility;
            }
        });
    }, [allCompanies, selectedCompanyType]);

    const companyOptions = filteredCompanies.map(company => ({
        value: company.id.toString(),
        label: company.companyName,
    }));

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading
    } = useGetAllWarehousesWithPaginationQuery({
        offset: page,
        pageSize: 10,
        sortBy: 'id',
        companyId: companyFilter || undefined
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

    // Mutations
    const [deleteWarehouse] = useDeleteWarehouseMutation();
    const [addWarehouse, { isLoading: isAddingWarehouse }] = useAddWarehouseMutation();

    // Delete confirmation state
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Options for selects
    const countryOptions = countries
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(country => ({
            value: country.id.toString(),
            label: country.name,
        }));

    const cityOptions = cities.map(city => ({
        value: city.id.toString(),
        label: city.name,
    }));

    const handleDelete = async () => {
        if (deleteId !== null) {
            await deleteWarehouse(deleteId);
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
        setError(null);
        setName('');
        setStreet('');
        setPostalCode('');
        setSelectedCountry(null);
        setSelectedCity(null);
        setSelectedCompany(null);
        setSelectedCompanyType('SUPPLIER');
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setError(null);
    };

    const handleSubmit = async () => {
        setError(null);

        // Validation
        const errors = [];
        if (!name) errors.push('Name is required');
        if (!street) errors.push('Street is required');
        if (!postalCode) errors.push('Postal code is required');
        if (!selectedCity) errors.push('City is required');
        if (!selectedCompany) errors.push('Company is required');

        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }

        try {
            const warehouseData = {
                name,
                address: {
                    street,
                    postalCode,
                    cityId: Number(selectedCity),
                },
                companyId: Number(selectedCompany),
            };

            await addWarehouse(warehouseData).unwrap();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to add warehouse:', err);
            setError('Failed to add warehouse. Please try again.');
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
                const company = allCompanies.find(c => c.id === info.getValue());
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
                                        ? allCompanies.find(c => c.id === companyFilter)?.companyName || `Company ${companyFilter}`
                                        : 'All Companies'}
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item onClick={() => setCompanyFilter(null)}>
                                    All Companies
                                </Menu.Item>
                                {allCompanies.map(company => (
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
                        <Button
                            leftSection={<PiPlusBold size={16} />}
                            onClick={handleOpenModal}
                        >
                            Add Warehouse
                        </Button>
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

                <DashboardCrudModal
                    opened={modalOpen}
                    title="Add Warehouse"
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                    submitLabel="Create"
                    isSubmitting={isAddingWarehouse}
                    size="lg"
                >
                    <Stack>
                        <Tabs
                            value={selectedCompanyType}
                            onChange={(value) => {
                                setSelectedCompanyType(value as 'SUPPLIER' | 'MANUFACTURER');
                                setSelectedCompany(null); // Reset company selection when type changes
                            }}
                        >
                            <Tabs.List>
                                <Tabs.Tab value="SUPPLIER">
                                    <Badge color="blue" variant="light">
                                        SUPPLIER
                                    </Badge>
                                </Tabs.Tab>
                                <Tabs.Tab value="MANUFACTURER">
                                    <Badge color="orange" variant="light">
                                        MANUFACTURER
                                    </Badge>
                                </Tabs.Tab>
                            </Tabs.List>
                        </Tabs>

                        <Select
                            label="Company"
                            placeholder={`Select ${selectedCompanyType.toLowerCase()}`}
                            value={selectedCompany}
                            onChange={setSelectedCompany}
                            data={companyOptions}
                            required
                            searchable
                            nothingFoundMessage="No companies found"
                        />

                        <TextInput
                            label="Warehouse Name"
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            required
                        />

                        <Select
                            label="Country"
                            placeholder="Select country"
                            value={selectedCountry}
                            onChange={setSelectedCountry}
                            data={countryOptions}
                            required
                            rightSection={isCountriesLoading ? <Loader size="xs"/> : null}
                        />

                        <Select
                            label="City"
                            placeholder={selectedCountry ? "Select city" : "Select country first"}
                            value={selectedCity}
                            onChange={setSelectedCity}
                            data={cityOptions}
                            disabled={!selectedCountry}
                            required
                            rightSection={isCitiesLoading ? <Loader size="xs"/> : null}
                        />

                        <TextInput
                            label="Street Address"
                            value={street}
                            onChange={(e) => setStreet(e.currentTarget.value)}
                            required
                        />

                        <TextInput
                            label="Postal Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.currentTarget.value)}
                            required
                        />

                        {error && (
                            <Notification color="red" onClose={() => setError(null)} mt="md">
                                {error}
                            </Notification>
                        )}
                    </Stack>
                </DashboardCrudModal>
            </Stack>
        </Paper>
    );
};

export default WarehousesDashboard;