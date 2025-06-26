import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import {
    Divider,
    Stack,
    Group,
    Box,
    Modal,
    Button,
    Text,
    TextInput,
    Badge,
    Select,
    Loader,
    Tabs,
    Checkbox,
    Card,
    Grid,
    Alert,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { 
    PiTrashBold,
    PiPencilSimpleLineBold, 
    PiEyeBold,
    PiBuildingsBold,
    PiWarningBold,
    PiFactoryBold,
    PiStorefrontBold,
    PiShoppingCartBold
} from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import {
    useGetCompaniesWithPaginationQuery,
    useDeleteCompanyMutation,
    useAddCompanyMutation,
    useUpdateCompanyMutation,
    Company,
    Country,
    City,
    AddressDTO,
    useGetCountriesQuery,
    useGetCitiesByCountryQuery,
} from '../../api/CompaniesApi';
import { useGetUsersQuery } from '../../api/UsersApi';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

// Company type color mapping
const getCompanyTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'supplier': return 'blue';
        case 'manufacturer': return 'orange';
        case 'buyer': return 'green';
        default: return 'gray';
    }
};

// Company type icon mapping
const getCompanyTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'supplier': return <PiStorefrontBold size={14} />;
        case 'manufacturer': return <PiFactoryBold size={14} />;
        case 'buyer': return <PiShoppingCartBold size={14} />;
        default: return <PiBuildingsBold size={14} />;
    }
};

// Form validation helper
const validateCompanyForm = (
    companyName: string,
    email: string,
    phoneNumber: string,
    street: string,
    postalCode: string,
    selectedCity: number | null,
    selectedManager: number | null,
    activeTab: string,
    businessType: string,
    userRole: string | undefined
) => {
    const errors: string[] = [];
    
    if (!companyName.trim()) errors.push('Company name is required');
    if (!email.trim()) errors.push('Email is required');
    if (!phoneNumber.trim()) errors.push('Phone number is required');
    if (!street.trim()) errors.push('Street address is required');
    if (!postalCode.trim()) errors.push('Postal code is required');
    if (!selectedCity) errors.push('City is required');
    
    // Only require manager selection for admin users
    if (userRole === ROLES.SUPER_ADMIN && !selectedManager) {
        errors.push('Manager is required');
    }
    
    if (activeTab === 'buyer' && !businessType.trim()) {
        errors.push('Business type is required for buyers');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
    }

    console.log('Validation Errors:', errors);
    
    return errors;
};

// Memoized Country Select Component
const CountrySelect = React.memo(({ 
    selectedCountry, 
    onCountryChange, 
    countries, 
    isCountriesLoading, 
    modalType, 
    formErrors 
}: {
    selectedCountry: string | null;
    onCountryChange: (value: string | null) => void;
    countries: Country[];
    isCountriesLoading: boolean;
    modalType: string;
    formErrors: string[];
}) => {
    const countryOptions = useMemo(() => 
        countries
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(country => ({
                value: country.id.toString(),
                label: country.name,
            })), 
        [countries]
    );

    return (
        <Select
            label="Country"
            placeholder="Select country"
            value={selectedCountry}
            onChange={onCountryChange}
            data={countryOptions}
            disabled={modalType === 'view'}
            required
            searchable
            error={formErrors.includes('Country is required') ? 'Country is required' : null}
            rightSection={isCountriesLoading ? <Loader size="xs"/> : null}
            maxDropdownHeight={200}
            limit={50}
        />
    );
});

// Memoized City Select Component
const CitySelect = React.memo(({ 
    selectedCity, 
    onCityChange, 
    cities, 
    isCitiesLoading, 
    modalType, 
    formErrors,
    selectedCountry 
}: {
    selectedCity: number | null;
    onCityChange: (value: string | null) => void;
    cities: City[];
    isCitiesLoading: boolean;
    modalType: string;
    formErrors: string[];
    selectedCountry: string | null;
}) => {
    const cityOptions = useMemo(() => 
        cities.map(city => ({
            value: city.id.toString(),
            label: city.name,
        })), 
        [cities]
    );

    return (
        <Select
            label="City"
            placeholder={selectedCountry ? "Select city" : "Select country first"}
            value={selectedCity?.toString() || null}
            onChange={onCityChange}
            data={cityOptions}
            disabled={modalType === 'view' || !selectedCountry}
            required
            searchable
            error={formErrors.includes('City is required') ? 'City is required' : null}
            rightSection={isCitiesLoading ? <Loader size="xs"/> : null}
            maxDropdownHeight={200}
            limit={50}
        />
    );
});

const CompaniesDashboard = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const navigate = useNavigate();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('create');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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
    const [sortBy, setSortBy] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Error and loading state
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const user = useSelector((state: RootState) => state.auth.user);

    // API hooks
    const [addCompany] = useAddCompanyMutation();
    const [updateCompany] = useUpdateCompanyMutation();
    const [deleteCompany] = useDeleteCompanyMutation();
    
    const { data: countries = [], isLoading: isCountriesLoading } = useGetCountriesQuery();
    const {
        data: cities = [],
        isFetching: isCitiesLoading,
    } = useGetCitiesByCountryQuery(selectedCountry ? Number(selectedCountry) : 0, {
        skip: !selectedCountry
    });

    const handleCountryChange = useCallback((value: string | null) => {
        setSelectedCountry(value);
        setSelectedCity(null); // Reset city when country changes
    }, []);

    const handleCityChange = useCallback((value: string | null) => {
        setSelectedCity(value ? Number(value) : null);
    }, []);

    const { data: users = [], isLoading: isUsersLoading } = useGetUsersQuery();

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading,
        refetch: refetchCompanies,
        error: companiesError
    } = useGetCompaniesWithPaginationQuery({
            offset: page,
            pageSize: 10,
            searchTerm: debouncedSearch,
            sortBy: sortBy,
            direction: sortDirection,
            ...((user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) && { managerId: user.id }),
        });

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    // Clear form errors when form values change
    useEffect(() => {
        if (formErrors.length > 0) {
            setFormErrors([]);
        }
    }, [companyName, email, phoneNumber, street, postalCode, selectedCity, selectedManager, businessType]);

    // Reset city when country changes
    useEffect(() => {
        if (selectedCountry) {
            setSelectedCity(null);
        }
    }, [selectedCountry]);

    const managerOptions = users.map(user => ({
        value: user.id.toString(),
        label: `${user.email} (${user.role})`,
        description: user.role
    }));

    const resetForm = () => {
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
        setFormErrors([]);
        setError(null);
    };

    const handleDelete = async () => {
        if (deleteId !== null) {
            try {
                await deleteCompany(deleteId).unwrap();
                showNotification({
                    title: 'Success',
                    message: 'Company deleted successfully',
                    color: 'green',
                });
                refetchCompanies();
            } catch (error: any) {
                showNotification({
                    title: 'Error',
                    message: error?.data?.message || 'Failed to delete company',
                    color: 'red',
                });
            }
            setConfirmOpen(false);
            setDeleteId(null);
        }
    };

    const handleSupplierClick = (companyId: number, companyName: string) => {
        navigate('/admin/warehouses', {
            state: { preselectedCompany: { id: companyId, name: companyName } }
        });
    };

    const handleOpenModal = (company: Company | null, type: ModalType) => {
        setSelectedCompany(company);
        setModalType(type);
        setModalOpen(true);

        if (company && type !== 'create') {
            // Populate form with existing company data
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
                setSelectedCountry(company.address.country?.toString() || null);
            }
        } else {
            // Reset form for new company
            resetForm();
            // Auto-set manager ID for buyer/supplier users
            if (user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) {
                setSelectedManager(user.id);
            }
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedCompany(null);
        setModalType('create');
        resetForm();
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true); // Use isSubmitting instead of separate loading state

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
            setIsSubmitting(false);
            return;
        }

        try {
            const companyData: any = {
                companyName,
                email,
                phoneNumber,
                address: {
                    street,
                    postalCode,
                    cityId: selectedCity,
                },
                manager: selectedManager,
                ...(activeTab === 'buyer' && { 
                    businessType,
                    companyType: 'BUYER' 
                }),
                ...(activeTab === 'manufacturer' && { 
                    hasProductionFacility: true,
                    companyType: 'MANUFACTURER' 
                }),
                ...(activeTab === 'supplier' && { 
                    companyType: 'SUPPLIER' 
                }),
            };

            console.log('Submitting company data:', companyData);

            if (selectedCompany && modalType === 'edit') {
                // UPDATE existing company
                await updateCompany({ id: selectedCompany.id, ...companyData }).unwrap();
                showNotification({
                    title: 'Success',
                    message: 'Company updated successfully',
                    color: 'green',
                });
            } else if (modalType === 'create') {
                // CREATE new company
                await addCompany(companyData).unwrap();
                showNotification({
                    title: 'Success',
                    message: 'Company created successfully',
                    color: 'green',
                });
            }

            handleCloseModal();
            refetchCompanies();
        } catch (err: any) {
            console.error('Failed to save company:', err);
            const errorMessage = err?.data?.message || 'Failed to save company. Please try again.';
            setError(errorMessage);
            showNotification({
                title: 'Error',
                message: errorMessage,
                color: 'red',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSort = (columnKey: string) => {
        if (sortBy === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(columnKey);
            setSortDirection('asc');
        }
            setPage(0);
    };

    // Define table columns
    const columns: Column<Company>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            enableSorting: true,
            cell: (info) => (
                <Text fw={500} c="blue">
                    #{info.getValue() as string}
                </Text>
            ),
            size: 80,
        },
        {
            accessorKey: 'companyName',
            header: 'Company Name',
            enableSorting: true,
            cell: (info) => (
                <Text fw={500} size="sm">
                    {info.getValue() as string}
                </Text>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            enableSorting: true,
            cell: (info) => (
                <Text size="sm" c="dimmed">
                    {info.getValue() as string}
                </Text>
            ),
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone',
            enableSorting: false,
            cell: (info) => (
                <Text size="sm">
                    {info.getValue() as string}
                </Text>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Location',
            enableSorting: false,
            cell: (info) => {
                const address = info.getValue() as AddressDTO;
                return address ? (
                    <div>
                        <Text size="sm">{address.street}</Text>
                        <Text size="xs" c="dimmed">{address.postalCode}</Text>
                    </div>
                ) : (
                    <Text size="sm" c="dimmed">N/A</Text>
                );
            },
        },
                {
            accessorKey: 'createdAt',
            header: 'Created',
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
            accessorKey: 'companyType',
            header: 'Type',
            enableSorting: false,
            cell: (info) => {
                const type = info.getValue() as string;
                const color = getCompanyTypeColor(type);
                const icon = getCompanyTypeIcon(type);

                return (
                    <Group gap="xs">
                        <Badge 
                            color={color} 
                            variant="light"
                            leftSection={icon}
                            size="sm"
                        >
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
    ];

    // Define table actions
    const actions: DashboardAction<Company>[] = [
        {
            icon: <PiEyeBold size={16} />,
            color: 'green',
            title: 'View Company',
            onClick: (company) => handleOpenModal(company, 'view')
        },
        {
            icon: <PiPencilSimpleLineBold size={16} />,
            color: 'blue',
            title: 'Edit Company',
            onClick: (company) => handleOpenModal(company, 'edit')
        },
        {
            icon: <PiTrashBold size={16} />,
            color: 'red',
            title: 'Delete Company',
            onClick: (company) => {
                setDeleteId(company.id);
                setConfirmOpen(true);
            }
        }
    ];

    const tableData = paginatedResponse?.content || [];
    const totalPages = paginatedResponse?.totalPages || 1;
    const isLoading = isPaginatedLoading;
    const hasError = companiesError;

    return (
        <>
            {/* Enhanced Table with all functionality built-in */}
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
                title="Companies Dashboard"
                subtitle="Manage and track all companies in your system"
                titleIcon={<PiBuildingsBold size={28} />}
                onCreateNew={() => handleOpenModal(null, 'create')}
                createButtonLabel="Add Company"
                createButtonLoading={isCountriesLoading || isUsersLoading}
                isLoading={isLoading}
                error={hasError}
                enableSort
                enableSearch
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                opened={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="Confirm Delete"
                centered
                size="sm"
                style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    zIndex: 20
                }}
                styles={{
                    overlay: {
                    zIndex: 20 // Also need to set overlay zIndex
                    }
                }}
            >
                <Stack>
                    <Alert 
                        icon={<PiWarningBold size={16} />} 
                        title="Warning" 
                        color="red"
                        variant="light"
                    >
                        Are you sure you want to delete this company? This action cannot be undone.
                    </Alert>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="red" onClick={handleDelete}>
                            Delete Company
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Enhanced Modal with improved UX */}
            <DashboardCrudModal
                opened={modalOpen}
                title={
                    modalType === 'create' ? 'Create New Company' :
                    modalType === 'edit' ? `Edit ${selectedCompany?.companyName}` :
                    `Company Details - ${selectedCompany?.companyName}`
                }
                onClose={handleCloseModal}
                onSubmit={modalType !== 'view' ? handleSubmit : undefined}
                submitLabel={modalType === 'create' ? 'Create' : 'Update'} // Add explicit submitLabel
                modalType={modalType} // ADD THIS LINE - you're missing this prop!
                isSubmitting={isSubmitting}
                errors={formErrors}
                showSubmitButton={modalType !== 'view'} // ADD THIS LINE - you're missing this prop!
                size="lg"
            >
    <Stack gap="md">
        {/* Error Display */}
        {error && (
            <Alert 
                icon={<PiWarningBold size={16} />} 
                title="Error" 
                color="red"
                variant="light"
                onClose={() => setError(null)}
                withCloseButton
            >
                {error}
            </Alert>
        )}

        {/* Company Type Selection Tabs */}
        <div>
            <Text fw={600} mb="sm">Company Type</Text>
            <Tabs 
                value={activeTab} 
                onChange={(value) => setActiveTab(value as 'supplier' | 'manufacturer' | 'buyer')}
                variant="pills"
            >
                <Tabs.List>
                    <Tabs.Tab 
                        value="supplier" 
                        disabled={modalType === 'view'}
                        leftSection={<PiStorefrontBold size={16} />}
                    >
                        Supplier
                    </Tabs.Tab>
                    <Tabs.Tab 
                        value="manufacturer" 
                        disabled={modalType === 'view'}
                        leftSection={<PiFactoryBold size={16} />}
                    >
                        Manufacturer
                    </Tabs.Tab>
                    <Tabs.Tab 
                        value="buyer" 
                        disabled={modalType === 'view'}
                        leftSection={<PiShoppingCartBold size={16} />}
                    >
                        Buyer
                    </Tabs.Tab>
                </Tabs.List>

                {/* Common form fields for all tabs */}
                <Box mt="md">
                    {/* Basic Information Section */}
                    <div>
                        <Text fw={600} mb="sm">Basic Information</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Company Name"
                                    placeholder="Enter company name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                    error={formErrors.includes('Company name is required') ? 'Company name is required' : null}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Email"
                                    placeholder="Enter email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                    error={formErrors.some(e => e.includes('email')) ? 'Valid email is required' : null}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput
                                    label="Phone Number"
                                    placeholder="Enter phone number"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                    error={formErrors.includes('Phone number is required') ? 'Phone number is required' : null}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                {user?.role === ROLES.SUPER_ADMIN ? (
                                    <Select
                                        label="Manager"
                                        placeholder="Select manager"
                                        value={selectedManager?.toString() || null}
                                        onChange={(value) => setSelectedManager(value ? Number(value) : null)}
                                        data={managerOptions}
                                        disabled={modalType === 'view'}
                                        required
                                        searchable
                                        error={formErrors.includes('Manager is required') ? 'Manager is required' : null}
                                        rightSection={isUsersLoading ? <Loader size="xs"/> : null}
                                    />
                                ) : (
                                    <TextInput
                                        label="Manager"
                                        value={user?.email || 'Current User'}
                                        disabled
                                        description="You will be assigned as the manager"
                                    />
                                )}
                            </Grid.Col>
                        </Grid>
                    </div>

                    {/* Type-specific fields */}
                    <Tabs.Panel value="buyer">
                        <div style={{ marginTop: '1rem' }}>
                            <Text fw={600} mb="sm">Buyer Information</Text>
                            <TextInput
                                label="Business Type"
                                placeholder="e.g., Retail, Wholesale, Manufacturing"
                                value={businessType}
                                onChange={(e) => setBusinessType(e.currentTarget.value)}
                                disabled={modalType === 'view'}
                                required
                                error={formErrors.includes('Business type is required for buyers') ? 'Business type is required' : null}
                                description="Specify the type of business this buyer operates"
                            />
                        </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="manufacturer">
                        <div style={{ marginTop: '1rem' }}>
                            <Text fw={600} mb="sm">Manufacturing Information</Text>
                            <Card withBorder p="md" bg="orange.0">
                                <Group>
                                    <PiFactoryBold size={20} color="orange" />
                                    <div>
                                        <Text fw={500}>Production Facility</Text>
                                        <Text size="sm" c="dimmed">
                                            This company will be marked as having production capabilities
                                        </Text>
                                    </div>
                                    <Checkbox
                                        checked={hasProductionFacility}
                                        onChange={() => setHasProductionFacility(!hasProductionFacility)}
                                        disabled={modalType === 'view'}
                                        size="md"
                                    />
                                </Group>
                            </Card>
                        </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="supplier">
                        <div style={{ marginTop: '1rem' }}>
                            <Alert 
                                icon={<PiStorefrontBold size={16} />} 
                                title="Supplier Company" 
                                color="blue"
                                variant="light"
                            >
                                This company will be set up as a supplier with basic information only.
                            </Alert>
                        </div>
                    </Tabs.Panel>

                    {/* Address Information Section */}
                    <div style={{ marginTop: '1.5rem' }}>
                        <Text fw={600} mb="sm">Address Information</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <CountrySelect
                                    selectedCountry={selectedCountry}
                                    onCountryChange={handleCountryChange}
                                    countries={countries}
                                    isCountriesLoading={isCountriesLoading}
                                    modalType={modalType}
                                    formErrors={formErrors}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <CitySelect
                                    selectedCity={selectedCity}
                                    onCityChange={handleCityChange}
                                    cities={cities}
                                    isCitiesLoading={isCitiesLoading}
                                    modalType={modalType}
                                    formErrors={formErrors}
                                    selectedCountry={selectedCountry}
                                />
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <TextInput
                                    label="Street Address"
                                    placeholder="Enter street address"
                                    value={street}
                                    onChange={(e) => setStreet(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                    error={formErrors.includes('Street address is required') ? 'Street address is required' : null}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Postal Code"
                                    placeholder="Enter postal code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                                    disabled={modalType === 'view'}
                                    required
                                    error={formErrors.includes('Postal code is required') ? 'Postal code is required' : null}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    {/* Rest of your existing content... */}
                    {/* Company Summary for View Mode */}
                    {modalType === 'view' && selectedCompany && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <Text fw={600} mb="sm">Company Summary</Text>
                            <Card withBorder>
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Company Type:</Text>
                                        <Badge
                                            color={getCompanyTypeColor(selectedCompany.companyType || '')}
                                            leftSection={getCompanyTypeIcon(selectedCompany.companyType || '')}
                                            mt="xs"
                                            size="md"
                                        >
                                            {selectedCompany.companyType}
                                        </Badge>
                                    </Grid.Col>
                                    {/* <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Created Date:</Text>
                                        <Text fw={500}>
                                            {new Date(selectedCompany.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                    </Grid.Col> */}
                                    {selectedCompany.businessType && (
                                        <Grid.Col span={6}>
                                            <Text size="sm" c="dimmed">Business Type:</Text>
                                            <Text fw={500}>{selectedCompany.businessType}</Text>
                                        </Grid.Col>
                                    )}
                                    {selectedCompany.hasProductionFacility && (
                                        <Grid.Col span={6}>
                                            <Text size="sm" c="dimmed">Production Facility:</Text>
                                            <Badge color="orange" variant="light" mt="xs">
                                                <PiFactoryBold size={12} style={{ marginRight: 4 }} />
                                                Available
                                            </Badge>
                                        </Grid.Col>
                                    )}
                                    <Grid.Col span={12}>
                                        <Text size="sm" c="dimmed">Full Address:</Text>
                                        <Text fw={500}>
                                            {selectedCompany.address ? 
                                                `${selectedCompany.address.street}, ${selectedCompany.address.postalCode}` : 
                                                'No address provided'
                                            }
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        </div>
                    )}

                    {/* Warehouse Management Section for View Mode */}
                    {modalType === 'view' && selectedCompany && 
                     (selectedCompany.companyType === 'SUPPLIER' || selectedCompany.companyType === 'MANUFACTURER') && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <Text fw={600} mb="sm">Warehouse Management</Text>
                            <Card withBorder>
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Text fw={500} mb="xs">Manage Warehouses</Text>
                                        <Text size="sm" c="dimmed">
                                            View and manage warehouses associated with this {selectedCompany.companyType.toLowerCase()}
                                        </Text>
                                    </div>
                                    <Button
                                        variant="light"
                                        leftSection={<PiBuildingsBold size={16} />}
                                        onClick={() => handleSupplierClick(selectedCompany.id, selectedCompany.companyName)}
                                    >
                                        View Warehouses
                                    </Button>
                                </Group>
                            </Card>
                        </div>
                    )}

                    {/* Form Summary for Create/Edit Mode */}
                    {modalType !== 'view' && companyName && email && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <Divider />
                            <Card withBorder p="md" bg="blue.0" mt="md">
                                <Text fw={600} mb="sm">Company Summary</Text>
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Company:</Text>
                                        <Text fw={500}>{companyName}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Type:</Text>
                                        <Badge
                                            color={getCompanyTypeColor(activeTab)}
                                            leftSection={getCompanyTypeIcon(activeTab)}
                                            size="sm"
                                            tt="capitalize"
                                        >
                                            {activeTab}
                                        </Badge>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Contact:</Text>
                                        <Text fw={500}>{email}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Manager:</Text>
                                        <Text fw={500}>
                                                        {user?.role === ROLES.ADMIN 
                                                            ? (selectedManager ? users.find(u => u.id === selectedManager)?.email || 'Selected' : 'Not selected')
                                                            : user?.email || 'Current User'
                                                        }
                                                    </Text>
                                                </Grid.Col>
                                                {activeTab === 'buyer' && businessType && (
                                                    <Grid.Col span={12}>
                                                        <Text size="sm" c="dimmed">Business Type:</Text>
                                                        <Text fw={500}>{businessType}</Text>
                                                    </Grid.Col>
                                                )}
                                                {activeTab === 'manufacturer' && (
                                                    <Grid.Col span={12}>
                                                        <Text size="sm" c="dimmed">Production Facility:</Text>
                                                        <Badge color={hasProductionFacility ? "green" : "gray"} variant="light">
                                                            {hasProductionFacility ? "Available" : "Not Available"}
                                                        </Badge>
                                                    </Grid.Col>
                                                )}
                                            </Grid>
                                        </Card>
                                    </div>
                                )}
                            </Box>
                        </Tabs>
                    </div>
                </Stack>
            </DashboardCrudModal>
        </>
    );
};

export default CompaniesDashboard;
