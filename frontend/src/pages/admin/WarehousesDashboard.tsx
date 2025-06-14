import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Stack,
    Group,
    Text,
    TextInput,
    Select,
    Tabs,
    Badge,
    Card,
    Grid,
    Alert,
    Button,
    Modal,
    Avatar,
    Loader
} from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {
    PiTrashBold,
    PiPencilSimpleLineBold,
    PiEyeBold,
    PiWarehouseBold,
    PiWarningBold,
    PiBuildingsBold,
    PiMapPinBold,
    PiFactoryBold
} from 'react-icons/pi';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import {
    useGetAllWarehousesWithPaginationQuery,
    useSearchWarehousesQuery,
    useDeleteWarehouseMutation,
    useAddWarehouseMutation,
    WarehouseDTO
} from '../../api/WarehousesApi';
import { useGetCompaniesQuery, useGetCountriesQuery, useGetCitiesByCountryQuery, useGetCompaniesByManagerIdQuery } from '../../api/CompaniesApi';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';

// Helper function to get company type badge color
const getCompanyTypeBadgeColor = (company: any) => {
    if (!company.businessType && company.hasProductionFacility) return 'orange'; // Manufacturer
    if (!company.businessType && !company.hasProductionFacility) return 'blue'; // Supplier
    return 'gray'; // Other
};

// Helper function to get company type label
const getCompanyTypeLabel = (company: any) => {
    if (!company.businessType && company.hasProductionFacility) return 'Manufacturer';
    if (!company.businessType && !company.hasProductionFacility) return 'Supplier';
    return 'Other';
};

// Form validation helper
const validateWarehouseForm = (
    name: string,
    street: string,
    postalCode: string,
    selectedCity: string | null,
    selectedCompany: string | null
) => {
    const errors: string[] = [];
    
    if (!name.trim()) errors.push('Warehouse name is required');
    if (!street.trim()) errors.push('Street address is required');
    if (!postalCode.trim()) errors.push('Postal code is required');
    if (!selectedCity) errors.push('City is required');
    if (!selectedCompany) errors.push('Company is required');
    
    return errors;
};

const WarehousesDashboard = () => {
    // Pagination and search state
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
    const location = useLocation();
    const [companyFilter, setCompanyFilter] = useState<number | null>(
        location.state?.preselectedCompany?.id || null
    );

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<ModalType>('create');
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDTO | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [street, setStreet] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedCompanyType, setSelectedCompanyType] = useState<'SUPPLIER' | 'MANUFACTURER'>('SUPPLIER');
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [warehouseToDelete, setWarehouseToDelete] = useState<WarehouseDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Error and loading state
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Delete confirmation state

    const user = useSelector((state: RootState) => state.auth.user);

    // API hooks
    const { data: companies = [], isLoading: isLoadingCompanies } = 
        (user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) 
          ? useGetCompaniesByManagerIdQuery(user.id)
          : useGetCompaniesQuery();


    const { data: countries = [], isLoading: isCountriesLoading } = useGetCountriesQuery();
    const {
        data: cities = [],
        isFetching: isCitiesLoading
    } = useGetCitiesByCountryQuery(selectedCountry ? Number(selectedCountry) : 0, {
        skip: !selectedCountry
    });

    const {
        data: paginatedResponse,
        isLoading: isPaginatedLoading,
        refetch: refetchWarehouses,
        error: warehousesError
    } = useGetAllWarehousesWithPaginationQuery({
        offset: page,
        pageSize: 10,
        sortBy: 'id',
        companyId: companyFilter || undefined,
        ...((user?.role === ROLES.BUYER || user?.role === ROLES.SUPPLIER) && { managerId: user.id }),
    });

    const {
        data: searchedWarehouses = [],
        isFetching: isSearchLoading,
        error: searchError
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
    const [addWarehouse] = useAddWarehouseMutation();

    // Filter companies based on type
    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            if (selectedCompanyType === 'SUPPLIER') {
                return !company.businessType && !company.hasProductionFacility;
            } else { // MANUFACTURER
                return !company.businessType && company.hasProductionFacility;
            }
        });
    }, [companies, selectedCompanyType]);

    // Options for selects
    const companyOptions = filteredCompanies.map(company => ({
        value: company.id.toString(),
        label: company.companyName,
        description: `${company.email} • ${getCompanyTypeLabel(company)}`
    }));

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

    const companyFilterOptions = [
        { value: '', label: 'All Companies' },
        ...companies.map(company => ({
            value: company.id.toString(),
            label: company.companyName
        }))
    ];

    // Reset form when modal type or warehouse changes
    useEffect(() => {
        if (modalType === 'create') {
            resetForm();
        }
    }, [modalType]);

    // Clear form errors when form values change
    useEffect(() => {
        if (formErrors.length > 0) {
            setFormErrors([]);
        }
    }, [name, street, postalCode, selectedCity, selectedCompany]);

    // Reset city when country changes
    useEffect(() => {
        if (selectedCountry) {
            setSelectedCity(null);
        }
    }, [selectedCountry]);

    const resetForm = () => {
        setName('');
        setStreet('');
        setPostalCode('');
        setSelectedCountry(null);
        setSelectedCity(null);
        setSelectedCompany(null);
        setSelectedCompanyType('SUPPLIER');
        setFormErrors([]);
        setError(null);
    };

    const handleOpenModal = (warehouse: WarehouseDTO | null, type: ModalType) => {
        setSelectedWarehouse(warehouse);
        setModalType(type);
        setModalOpen(true);

        if (warehouse && type !== 'create') {
            // Populate form with existing warehouse data
            setName(warehouse.name);
            setStreet(warehouse.address?.street || '');
            setPostalCode(warehouse.address?.postalCode || '');
            
            // Find the country for this warehouse's city
            const warehouseCity = cities.find(city => city.id.toString() === warehouse.address?.cityId?.toString());
            if (warehouseCity) {
                setSelectedCountry(warehouseCity.country?.toString() || null);
                setSelectedCity(warehouse.address?.cityId?.toString() || null);
            }
            
            // Set company
            const company = companies.find(c => c.id === warehouse.companyId);
            if (company) {
                setSelectedCompany(warehouse.companyId.toString());
                setSelectedCompanyType(
                    company.hasProductionFacility ? 'MANUFACTURER' : 'SUPPLIER'
                );
            }
        } else {
            resetForm();
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedWarehouse(null);
        setModalType('create');
        resetForm();
        setIsSubmitting(false);
    };

    const handleSubmit = async () => {
        setError(null);
        setIsSubmitting(true);

        // Validate form
        const errors = validateWarehouseForm(name, street, postalCode, selectedCity, selectedCompany);
        if (errors.length > 0) {
            setFormErrors(errors);
            setIsSubmitting(false);
            return;
        }

        try {
            const warehouseData: any = {
                name: name.trim(),
                address: {
                    street: street.trim(),
                    postalCode: postalCode.trim(),
                    cityId: Number(selectedCity),
                },
                companyId: Number(selectedCompany),
            };

            // if (modalType === 'edit' && selectedWarehouse) {
            //     await updateWarehouse({
            //         id: selectedWarehouse.id,
            //         ...warehouseData
            //     }).unwrap();
            // } else {
            //     await addWarehouse(warehouseData).unwrap();
            // }

            await addWarehouse(warehouseData).unwrap();

            showNotification({
                title: 'Success',
                message: `Warehouse ${modalType === 'edit' ? 'updated' : 'created'} successfully`,
                color: 'green',
            });

            handleCloseModal();
            refetchWarehouses();
        } catch (err: any) {
            console.error('Failed to save warehouse:', err);
            
            const errorMessage = err?.data?.message || `Failed to ${modalType === 'edit' ? 'update' : 'create'} warehouse. Please try again.`;
            showNotification({
                title: 'Error',
                message: errorMessage,
                color: 'red',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (warehouse: WarehouseDTO) => {
        setWarehouseToDelete(warehouse);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!warehouseToDelete) return;
        
        setIsDeleting(true);
        try {
            await deleteWarehouse(warehouseToDelete.id).unwrap();
            showNotification({
                title: 'Success',
                message: `${warehouseToDelete.name} deleted successfully`,
                color: 'green',
            });
            refetchWarehouses();
            setDeleteModalOpen(false);
            setWarehouseToDelete(null);
        } catch (err: any) {
            console.error('Failed to delete warehouse:', err);
            showNotification({
                title: 'Error',
                message: err?.data?.message || 'Failed to delete warehouse. Please try again.',
                color: 'red',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Get selected company details for display
    const selectedCompanyDetails = selectedCompany ? 
        companies.find(c => c.id.toString() === selectedCompany) : null;

    // Define table columns
    const columns: Column<WarehouseDTO>[] = [
        {
            accessorKey: 'id',
            header: 'Warehouse ID',
            enableSorting: true,
            cell: (info) => (
                <Text fw={500} c="blue">
                    WH-{info.getValue() as string}
                </Text>
            ),
            size: 120,
        },
        {
            accessorKey: 'name',
            header: 'Warehouse Name',
            enableSorting: true,
            cell: (info) => (
                <Text fw={500}>
                    {info.getValue() as string}
                </Text>
            ),
        },
        {
            accessorKey: 'companyId',
            header: 'Company',
            enableSorting: true,
            cell: (info) => {
                const company = companies.find(c => c.id === info.getValue());
                return company ? (
                    <div>
                        <Text size="sm" fw={500}>
                            {company.companyName}
                        </Text>
                        <Badge 
                            size="xs" 
                            color={getCompanyTypeBadgeColor(company)}
                            variant="light"
                        >
                            {getCompanyTypeLabel(company)}
                        </Badge>
                    </div>
                ) : (
                    <Text size="sm" c="dimmed">Unknown Company</Text>
                );
            },
        },
        {
            accessorKey: 'address',
            header: 'Location',
            enableSorting: false,
            cell: (info) => {
                const address = info.getValue() as any;
                if (!address) return <Text c="dimmed">No address</Text>;
                
                return (
                    <div>
                        <Text size="sm">{address.street}</Text>
                        <Text size="xs" c="dimmed">
                            {address.postalCode} • {address.cityId}
                        </Text>
                    </div>
                );
            },
        },
    ];

    // Define table actions
    const actions: DashboardAction<WarehouseDTO>[] = [
        {
            icon: <PiEyeBold size={16} />,
            color: 'green',
            title: 'View Warehouse',
            onClick: (warehouse) => handleOpenModal(warehouse, 'view')
        },
        {
            icon: <PiPencilSimpleLineBold size={16} />,
            color: 'blue',
            title: 'Edit Warehouse',
            onClick: (warehouse) => handleOpenModal(warehouse, 'edit')
        },
        {
            icon: <PiTrashBold size={16} />,
            color: 'red',
            title: 'Delete Warehouse',
            onClick: (warehouse) => handleDelete(warehouse)
        }
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

    const isLoading = isPaginatedLoading || isSearchLoading;
    const hasError = warehousesError || searchError;

    return (
        <>
            {/* Company Filter Section */}
            <Card withBorder mb="md" p="md">
                <Group justify="space-between" align="center">
                    <Text fw={600} size="sm">Filter Options</Text>
                    <Group gap="md">
                        <Select
                            placeholder="Filter by company"
                            data={companyFilterOptions}
                            value={companyFilter?.toString() || ''}
                            onChange={(value) => {
                                setCompanyFilter(value ? Number(value) : null);
                                setPage(0);
                            }}
                            clearable
                            w={250}
                            leftSection={<PiBuildingsBold size={16} />}
                        />
                        {companyFilter && (
                            <Badge 
                                color="blue" 
                                variant="light"
                                rightSection={
                                    <Text 
                                        size="xs" 
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setCompanyFilter(null);
                                            setPage(0);
                                        }}
                                    >
                                        ×
                                    </Text>
                                }
                            >
                                {companies.find(c => c.id === companyFilter)?.companyName || `Company ${companyFilter}`}
                            </Badge>
                        )}
                    </Group>
                </Group>
            </Card>

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
                searchPlaceholder="Search warehouses..."
                title={
                    location.state?.preselectedCompany
                        ? `${location.state.preselectedCompany.name}'s Warehouses`
                        : 'Warehouses Dashboard'
                }
                subtitle="Manage warehouse locations and inventory storage facilities"
                titleIcon={<PiWarehouseBold size={28} />}
                onCreateNew={() => handleOpenModal(null, 'create')}
                createButtonLabel="Add Warehouse"
                createButtonLoading={isLoadingCompanies || isCountriesLoading}
                isLoading={isLoading}
                error={hasError}
                enableSort
                enableSearch
            />

            {/* Enhanced Modal with comprehensive form */}
            <DashboardCrudModal
                opened={modalOpen}
                title={
                    modalType === 'create' ? 'Add New Warehouse' :
                    modalType === 'edit' ? `Edit Warehouse: ${selectedWarehouse?.name}` :
                    `Warehouse Details: ${selectedWarehouse?.name}`
                }
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                modalType={modalType}
                isSubmitting={isSubmitting}
                errors={formErrors}
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

                    {/* Company Selection Section */}
                    <div>
                        <Text fw={600} mb="sm">Company Information</Text>
                        
                        {modalType !== 'view' && (
                            <Tabs
                                value={selectedCompanyType}
                                onChange={(value) => {
                                    setSelectedCompanyType(value as 'SUPPLIER' | 'MANUFACTURER');
                                    setSelectedCompany(null);
                                }}
                                mb="md"
                            >
                                <Tabs.List>
                                    <Tabs.Tab 
                                        value="SUPPLIER"
                                        leftSection={<PiBuildingsBold size={16} />}
                                    >
                                        <Badge color="blue" variant="light">
                                            SUPPLIER
                                        </Badge>
                                    </Tabs.Tab>
                                    <Tabs.Tab 
                                        value="MANUFACTURER"
                                        leftSection={<PiFactoryBold size={16} />}
                                    >
                                        <Badge color="orange" variant="light">
                                            MANUFACTURER
                                        </Badge>
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs>
                        )}

                        <Select
                            label="Company"
                            placeholder={`Select ${selectedCompanyType.toLowerCase()}`}
                            value={selectedCompany}
                            onChange={setSelectedCompany}
                            data={companyOptions}
                            required
                            searchable
                            disabled={modalType === 'view'}
                            error={formErrors.includes('Company is required') ? 'Company is required' : null}
                            nothingFoundMessage={`No ${selectedCompanyType.toLowerCase()}s found`}
                        />

                        {/* Company Details Display */}
                        {selectedCompanyDetails && (
                            <Card withBorder mt="sm" p="sm" bg="gray.0">
                                <Text size="sm" fw={600} mb="xs">Company Details</Text>
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Text size="xs" c="dimmed">Email</Text>
                                        <Text size="sm">{selectedCompanyDetails.email}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="xs" c="dimmed">Type</Text>
                                        <Badge 
                                            size="sm" 
                                            color={getCompanyTypeBadgeColor(selectedCompanyDetails)}
                                            variant="light"
                                        >
                                            {getCompanyTypeLabel(selectedCompanyDetails)}
                                        </Badge>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        )}
                    </div>

                    {/* Warehouse Information Section */}
                    <div>
                        <Text fw={600} mb="sm">Warehouse Information</Text>
                        <TextInput
                            label="Warehouse Name"
                            placeholder="Enter warehouse name"
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            required
                            disabled={modalType === 'view'}
                            error={formErrors.includes('Warehouse name is required') ? 'Warehouse name is required' : null}
                        />
                    </div>

                    {/* Location Information Section */}
                    <div>
                        <Text fw={600} mb="sm">Location Information</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <Select
                                    label="Country"
                                    placeholder="Select country"
                                    value={selectedCountry}
                                    onChange={setSelectedCountry}
                                    data={countryOptions}
                                    required
                                    searchable
                                    disabled={modalType === 'view'}
                                    rightSection={isCountriesLoading ? <Loader size="xs" /> : null}
                                    leftSection={<PiMapPinBold size={16} />}
                                />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Select
                                    label="City"
                                    placeholder={selectedCountry ? "Select city" : "Select country first"}
                                    value={selectedCity}
                                    onChange={setSelectedCity}
                                    data={cityOptions}
                                    disabled={modalType === 'view' || !selectedCountry}
                                    required
                                    searchable
                                    rightSection={isCitiesLoading ? <Loader size="xs" /> : null}
                                    error={formErrors.includes('City is required') ? 'City is required' : null}
                                />
                            </Grid.Col>
                        </Grid>

                        <Grid mt="sm">
                            <Grid.Col span={8}>
                                <TextInput
                                    label="Street Address"
                                    placeholder="Enter street address"
                                    value={street}
                                    onChange={(e) => setStreet(e.currentTarget.value)}
                                    required
                                    disabled={modalType === 'view'}
                                    error={formErrors.includes('Street address is required') ? 'Street address is required' : null}
                                />
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <TextInput
                                    label="Postal Code"
                                    placeholder="Enter postal code"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.currentTarget.value)}
                                    required
                                    disabled={modalType === 'view'}
                                    error={formErrors.includes('Postal code is required') ? 'Postal code is required' : null}
                                />
                            </Grid.Col>
                        </Grid>
                    </div>

                    {/* Address Preview */}
                    {(street || postalCode || selectedCity) && (
                        <div>
                            <Text fw={600} mb="sm">Address Preview</Text>
                            <Card withBorder p="sm" bg="blue.0">
                                <Group gap="xs" align="center">
                                    <PiMapPinBold size={16} color="blue" />
                                    <div>
                                        <Text size="sm" fw={500}>
                                            {name || 'Warehouse Name'}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {[
                                                street,
                                                postalCode,
                                                cities.find(c => c.id.toString() === selectedCity)?.name,
                                                countries.find(c => c.id.toString() === selectedCountry)?.name
                                            ].filter(Boolean).join(', ') || 'Complete address information'}
                                        </Text>
                                    </div>
                                </Group>
                            </Card>
                        </div>
                    )}

                    {/* Warehouse Summary for View Mode */}
                    {modalType === 'view' && selectedWarehouse && (
                        <div>
                            <Text fw={600} mb="sm">Warehouse Summary</Text>
                            <Card withBorder>
                                <Grid>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Warehouse ID:</Text>
                                        <Text fw={500}>WH-{selectedWarehouse.id}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Company:</Text>
                                        <Text fw={500}>
                                            {companies.find(c => c.id === selectedWarehouse.companyId)?.companyName || 'Unknown'}
                                        </Text>
                                    </Grid.Col>
                                    <Grid.Col span={6}>
                                        <Text size="sm" c="dimmed">Status:</Text>
                                        <Badge color="green" variant="light">
                                            Active
                                        </Badge>
                                    </Grid.Col>
                                </Grid>
                            </Card>
                        </div>
                    )}
                </Stack>
            </DashboardCrudModal>
            <Modal
                opened={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setWarehouseToDelete(null);
                }}
                title="Confirm Warehouse Deletion"
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
                <Stack gap="md">
                    <Alert
                        icon={<PiWarningBold size={16} />}
                        title="Warning"
                        color="red"
                        variant="light"
                    >
                        This action cannot be undone. The warehouse will be permanently removed from the system.
                    </Alert>
                    {warehouseToDelete && (
                        <Card withBorder p="md">
                            <Group>
                                <Avatar
                                    size="md"
                                    color="blue"
                                    radius="xl"
                                >
                                    <PiWarehouseBold size={20} />
                                </Avatar>
                                <div>
                                    <Text fw={500}>{warehouseToDelete.name}</Text>
                                    <Text size="sm" c="dimmed">
                                        ID: WH-{warehouseToDelete.id}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {warehouseToDelete.address?.street}, {warehouseToDelete.address?.postalCode}
                                    </Text>
                                    <Badge
                                        color={getCompanyTypeBadgeColor(
                                            companies.find(c => c.id === warehouseToDelete.companyId)
                                        )}
                                        variant="light"
                                        size="xs"
                                        mt="xs"
                                    >
                                        {companies.find(c => c.id === warehouseToDelete.companyId)?.companyName || 'Unknown Company'}
                                    </Badge>
                                </div>
                            </Group>
                        </Card>
                    )}
                    <Text size="sm" c="dimmed">
                        Are you sure you want to delete this warehouse? This will remove all associated data and cannot be reversed.
                    </Text>
                    <Group justify="flex-end" gap="sm">
                        <Button
                            variant="default"
                            onClick={() => {
                                setDeleteModalOpen(false);
                                setWarehouseToDelete(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            loading={isDeleting}
                            onClick={handleDeleteConfirm}
                            leftSection={<PiTrashBold size={16} />}
                        >
                            Delete Warehouse
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
};

export default WarehousesDashboard;
