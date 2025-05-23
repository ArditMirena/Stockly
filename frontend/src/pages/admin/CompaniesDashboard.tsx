import { useState } from 'react';
import {
    Paper,
    Title,
    Divider,
    Stack,
    Group,
    ActionIcon,
    Box,
    Modal,
    Button,
    Text,
    TextInput,
    Badge,
    Menu,
    Select,
    Notification,
    Loader,
    Tabs,
    Checkbox,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { PiTrashBold, PiMagnifyingGlassBold, PiCaretDownBold, PiWarehouseBold, PiPencilSimpleLineBold, PiEyeBold, PiPlusBold } from 'react-icons/pi';
import DashboardTable, { Column } from '../../components/DashboardTable';
import {
    useGetCompaniesWithPaginationQuery,
    useGetCompaniesByTypeWithPaginationQuery,
    useSearchCompaniesQuery,
    useDeleteCompanyMutation,
    useAddCompanyMutation,
    Company,
    AddressDTO,
    useGetCountriesQuery,
    useGetCitiesByCountryQuery,
} from '../../api/CompaniesApi';
import { useGetUsersQuery } from '../../api/UsersApi';
import DashboardCrudModal from '../../components/DashboardCrudModal';

const CompaniesDashboard = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const [companyTypeFilter, setCompanyTypeFilter] = useState<string | null>(null);
    const pageSize = 10;
    const navigate = useNavigate();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'view' | 'edit' | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'supplier' | 'manufacturer' | 'buyer'>('supplier');

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [businessType, setBusinessType] = useState('');
    const [selectedManager, setSelectedManager] = useState<number | null>(null);
    const [hasProductionFacility, setHasProductionFacility] = useState(false);

    const [addCompany, { isLoading: isAddingCompany }] = useAddCompanyMutation();
    const { data: countries = [], isLoading: isCountriesLoading } = useGetCountriesQuery();
    const {
        data: cities = [],
        isFetching: isCitiesLoading,
    } = useGetCitiesByCountryQuery(selectedCountry ? Number(selectedCountry) : 0, {
        skip: !selectedCountry
    });

    const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery();

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

    const countryOptions = countries
        .slice() // Create a copy to avoid mutating the original array
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
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
            await deleteCompany(deleteId);
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleSupplierClick = (companyId: number, companyName: string) => {
        navigate('/admin/warehouses', {
            state: { preselectedCompany: { id: companyId, name: companyName } }
        });
    };

    const handleOpenModal = (company: Company | null, type: 'view' | 'edit') => {
        setSelectedCompany(company);
        setModalType(type);
        setModalOpen(true);

        if (company) {
            setCompanyName(company.companyName);
            setEmail(company.email);
            setPhoneNumber(company.phoneNumber);
            setBusinessType(company.businessType || '');
            setSelectedManager(company.manager);
            setHasProductionFacility(company.hasProductionFacility || false);

            // Set the appropriate tab based on company type
            if (company.businessType) {
                setActiveTab('buyer');
            } else if (company.hasProductionFacility) {
                setActiveTab('manufacturer');
            } else {
                setActiveTab('supplier');
            }

            if (company.address) {
                setStreet(company.address.street);
                setPostalCode(company.address.postalCode);
                setSelectedCity(company.address.cityId);
                // Initialize country based on city (this assumes you have a way to get country from city)
                // You might need to adjust this based on your actual data structure
                setSelectedCountry(company.address.countryId?.toString() || null);
            }
        } else {
            // Reset form for new company
            setCompanyName('');
            setEmail('');
            setPhoneNumber('');
            setBusinessType('');
            setSelectedManager(null);
            setHasProductionFacility(false);
            setStreet('');
            setPostalCode('');
            setSelectedCountry(null);
            setSelectedCity(null);
            setActiveTab('supplier');
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedCompany(null);
        setModalType(null);
        setError(null);
    };

    const handleSubmit = async () => {
        setError(null);

        // Common validation for all company types
        const commonErrors = [];
        if (!companyName) commonErrors.push('Company name is required');
        if (!email) commonErrors.push('Email is required');
        if (!phoneNumber) commonErrors.push('Phone number is required');
        if (!street) commonErrors.push('Street address is required');
        if (!postalCode) commonErrors.push('Postal code is required');
        if (!selectedCity) commonErrors.push('City is required');
        if (!selectedManager) commonErrors.push('Manager is required');

        // Tab-specific validation
        if (activeTab === 'buyer' && !businessType) {
            commonErrors.push('Business type is required for buyers');
        }

        if (commonErrors.length > 0) {
            setError(commonErrors.join(', '));
            return;
        }

        try {
            const companyData = {
                companyName,
                email,
                phoneNumber,
                address: {
                    street,
                    postalCode,
                    cityId: selectedCity,
                },
                manager: selectedManager,
                ...(activeTab === 'buyer' && { businessType }),
                ...(activeTab === 'manufacturer' && { hasProductionFacility: true }),
            };

            await addCompany(companyData).unwrap();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save company:', err);
            setError('Failed to save company. Please try again.');
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
            accessorKey: 'companyType',
            header: 'Type',
            enableSorting: false,
            cell: (info) => {
                const type = info.getValue() as string;
                let color = 'gray';
                if (type === 'SUPPLIER') color = 'blue';
                if (type === 'MANUFACTURER') color = 'orange';
                if (type === 'BUYER') color = 'green';

                return (
                    <Group gap="xs">
                        <Badge color={color}>
                            {type}
                        </Badge>
                        {(type === 'SUPPLIER' || type === 'MANUFACTURER') && (
                            <Button
                                variant="subtle"
                                color="blue"
                                size="compact-sm"
                                onClick={() => handleSupplierClick(info.row.original.id, info.row.original.companyName)}
                            >
                                Warehouses
                            </Button>
                        )}
                    </Group>
                );
            },
            size: 220
        },
        {
            accessorKey: 'id',
            header: 'Actions',
            enableSorting: false,
            cell: ({ row }) => {
                const company = row.original;
                return (
                    <Group justify="center">
                        <ActionIcon color="green" variant="light" onClick={() => handleOpenModal(company, 'view')}>
                            <PiEyeBold size={18} />
                        </ActionIcon>
                        <ActionIcon color="blue" variant="light" onClick={() => handleOpenModal(company, 'edit')}>
                            <PiPencilSimpleLineBold size={18} />
                        </ActionIcon>
                        <ActionIcon
                            color="red"
                            variant="light"
                            onClick={() => {
                                setDeleteId(company.id);
                                setConfirmOpen(true);
                            }}
                        >
                            <PiTrashBold size={18} />
                        </ActionIcon>
                    </Group>
                );
            },
        }
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
                                <Menu.Item onClick={() => setCompanyTypeFilter('MANUFACTURER')}>
                                    Manufacturers
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
                        <Button
                            leftSection={<PiPlusBold size={16} />}
                            onClick={() => handleOpenModal(null, 'edit')}
                        >
                            Add Company
                        </Button>
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

                <DashboardCrudModal
                    opened={modalOpen}
                    title={modalType === 'edit' ? (selectedCompany ? 'Edit Company' : 'Add Company') : 'View Company'}
                    onClose={handleCloseModal}
                    onSubmit={modalType === 'edit' ? handleSubmit : undefined}
                    submitLabel={selectedCompany ? 'Update' : 'Create'}
                    isSubmitting={isAddingCompany}
                    showSubmitButton={modalType === 'edit'}
                    size="lg"
                >
                    <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'supplier' | 'manufacturer' | 'buyer')}>
                        <Tabs.List>
                            <Tabs.Tab value="supplier" disabled={modalType === 'view'}>Supplier</Tabs.Tab>
                            <Tabs.Tab value="manufacturer" disabled={modalType === 'view'}>Manufacturer</Tabs.Tab>
                            <Tabs.Tab value="buyer" disabled={modalType === 'view'}>Buyer</Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="supplier">
                            <Stack mt="md">
                                <TextInput
                                    name="companyName"
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="email"
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="phoneNumber"
                                    label="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <Select
                                    name="manager"
                                    label="Manager"
                                    placeholder="Select manager"
                                    value={selectedManager?.toString() || null}
                                    onChange={(value) => setSelectedManager(value ? Number(value) : null)}
                                    data={users.map(user => ({
                                        value: user.id.toString(),
                                        label: user.email
                                    }))}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isUsersLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="country"
                                    label="Country"
                                    placeholder="Select country"
                                    value={selectedCountry}
                                    onChange={(value) => {
                                        setSelectedCountry(value);
                                        setSelectedCity(null); // Reset city when country changes
                                    }}
                                    data={countryOptions}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isCountriesLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="city"
                                    label="City"
                                    placeholder={selectedCountry ? "Select city" : "Select country first"}
                                    value={selectedCity?.toString() || null}
                                    onChange={(value) => setSelectedCity(value ? Number(value) : null)}
                                    data={cityOptions}
                                    disabled={modalType === 'view' || !selectedCountry}
                                    required
                                    rightSection={isCitiesLoading ? <Loader size="xs"/> : null}
                                />
                                <TextInput
                                    name="street"
                                    label="Street Address"
                                    value={street}
                                    onChange={(e) => setStreet(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="postalCode"
                                    label="Postal Code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="manufacturer">
                            <Stack mt="md">
                                <TextInput
                                    name="companyName"
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="email"
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="phoneNumber"
                                    label="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <Checkbox
                                    name="hasProductionFacility"
                                    label="Has Production Facility"
                                    checked={hasProductionFacility}
                                    onChange={() => setHasProductionFacility(!hasProductionFacility)}
                                    disabled={modalType === 'view'}
                                />
                                <Select
                                    name="manager"
                                    label="Manager"
                                    placeholder="Select manager"
                                    value={selectedManager?.toString() || null}
                                    onChange={(value) => setSelectedManager(value ? Number(value) : null)}
                                    data={users.map(user => ({
                                        value: user.id.toString(),
                                        label: user.email
                                    }))}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isUsersLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="country"
                                    label="Country"
                                    placeholder="Select country"
                                    value={selectedCountry}
                                    onChange={(value) => {
                                        setSelectedCountry(value);
                                        setSelectedCity(null); // Reset city when country changes
                                    }}
                                    data={countryOptions}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isCountriesLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="city"
                                    label="City"
                                    placeholder={selectedCountry ? "Select city" : "Select country first"}
                                    value={selectedCity?.toString() || null}
                                    onChange={(value) => setSelectedCity(value ? Number(value) : null)}
                                    data={cityOptions}
                                    disabled={modalType === 'view' || !selectedCountry}
                                    required
                                    rightSection={isCitiesLoading ? <Loader size="xs"/> : null}
                                />
                                <TextInput
                                    name="street"
                                    label="Street Address"
                                    value={street}
                                    onChange={(e) => setStreet(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="postalCode"
                                    label="Postal Code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="buyer">
                            <Stack mt="md">
                                <TextInput
                                    name="companyName"
                                    label="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="email"
                                    label="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="phoneNumber"
                                    label="Phone Number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="businessType"
                                    label="Business Type"
                                    value={businessType}
                                    onChange={(e) => setBusinessType(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required={activeTab === 'buyer'}
                                />
                                <Select
                                    name="manager"
                                    label="Manager"
                                    placeholder="Select manager"
                                    value={selectedManager?.toString() || null}
                                    onChange={(value) => setSelectedManager(value ? Number(value) : null)}
                                    data={users.map(user => ({
                                        value: user.id.toString(),
                                        label: user.email
                                    }))}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isUsersLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="country"
                                    label="Country"
                                    placeholder="Select country"
                                    value={selectedCountry}
                                    onChange={(value) => {
                                        setSelectedCountry(value);
                                        setSelectedCity(null); // Reset city when country changes
                                    }}
                                    data={countryOptions}
                                    disabled={modalType === 'view'}
                                    required
                                    rightSection={isCountriesLoading ? <Loader size="xs"/> : null}
                                />
                                <Select
                                    name="city"
                                    label="City"
                                    placeholder={selectedCountry ? "Select city" : "Select country first"}
                                    value={selectedCity?.toString() || null}
                                    onChange={(value) => setSelectedCity(value ? Number(value) : null)}
                                    data={cityOptions}
                                    disabled={modalType === 'view' || !selectedCountry}
                                    required
                                    rightSection={isCitiesLoading ? <Loader size="xs"/> : null}
                                />
                                <TextInput
                                    name="street"
                                    label="Street Address"
                                    value={street}
                                    onChange={(e) => setStreet(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                                <TextInput
                                    name="postalCode"
                                    label="Postal Code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                />
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                    {error && (
                        <Notification color="red" onClose={() => setError(null)} mt="md">
                            {error}
                        </Notification>
                    )}
                </DashboardCrudModal>
            </Stack>
        </Paper>
    );
};

export default CompaniesDashboard;