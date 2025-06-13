import { useState, useEffect } from 'react';
import {
  useGetUsersWithPaginationQuery,
  User,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../../api/UsersApi';
import {
  Select,
  TextInput,
  Badge,
  Text,
  Card,
  Grid,
  Alert,
  Group,
  Avatar,
  Stack,
  Button,
  Modal,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import {
  PiPencilSimpleLineBold,
  PiTrashBold,
  PiEyeBold,
  PiUsersBold,
  PiWarningBold,
  PiShieldCheckBold,
  PiEnvelopeBold,
  PiUserBold,
  PiCrownBold,
  PiShoppingCartBold,
  PiTruckBold,
} from 'react-icons/pi';
import { useForm, Controller } from 'react-hook-form';
import DashboardTable, { Column, DashboardAction } from '../../components/DashboardTable';
import DashboardCrudModal, { ModalType } from '../../components/DashboardCrudModal';

// Role configuration with icons and colors
const ROLE_CONFIG = {
  USER: { 
    label: 'User', 
    color: 'blue', 
    icon: <PiUserBold size={12} />,
    description: 'Standard user access'
  },
  ADMIN: { 
    label: 'Admin', 
    color: 'orange', 
    icon: <PiShieldCheckBold size={12} />,
    description: 'Administrative privileges'
  },
  SUPER_ADMIN: { 
    label: 'Super Admin', 
    color: 'red', 
    icon: <PiCrownBold size={12} />,
    description: 'Full system access'
  },
  BUYER: { 
    label: 'Buyer', 
    color: 'green', 
    icon: <PiShoppingCartBold size={12} />,
    description: 'Purchase and order management'
  },
  SUPPLIER: { 
    label: 'Supplier', 
    color: 'purple', 
    icon: <PiTruckBold size={12} />,
    description: 'Supply and inventory management'
  },
};

// Form validation
const validateUserForm = (username: string, email: string, role: string) => {
  const errors: string[] = [];
  
  if (!username?.trim()) errors.push('Username is required');
  if (username && username.length < 3) errors.push('Username must be at least 3 characters');
  
  if (!email?.trim()) errors.push('Email is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address');
  
  if (!role) errors.push('Role is required');
  
  return errors;
};

// Generate avatar color based on username
const getAvatarColor = (username: string) => {
  const colors = ['blue', 'green', 'red', 'orange', 'purple', 'teal', 'pink', 'indigo'];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

const UsersDashboard = () => {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const formMethods = useForm<Pick<User, 'username' | 'email' | 'role'>>({
    defaultValues: {
      username: '',
      email: '',
      role: 'USER'
    }
  });

  const {
    data: paginatedResponse,
    isLoading: isPaginatedLoading,
    refetch: refetchUsers,
    error: usersError
  } = useGetUsersWithPaginationQuery({
    offset: page,
    pageSize: 10,
    searchTerm: debouncedSearch,
  });

  // Clear form errors when form values change
  const watchedValues = formMethods.watch();
  useEffect(() => {
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  }, [watchedValues.username, watchedValues.email, watchedValues.role]);

  const handleOpenModal = (user: User | null, type: ModalType) => {
    setSelectedUser(user);
    setModalType(type);
    setModalOpen(true);

    if (user) {
      formMethods.reset({
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      formMethods.reset({
        username: '',
        email: '',
        role: 'USER'
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setModalType('create');
    setFormErrors([]);
    formMethods.reset();
  };

  const handleSubmit = async (data: Pick<User, 'username' | 'email' | 'role'>) => {
    // Validate form
    const errors = validateUserForm(data.username, data.email, data.role);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!selectedUser) return;

    try {
      await updateUser({
        id: selectedUser.id,
        user: {
          username: data.username.trim(),
          email: data.email.trim(),
          role: data.role
        }
      }).unwrap();

      showNotification({
        title: 'Success',
        message: 'User updated successfully',
        color: 'green',
      });

      handleCloseModal();
      refetchUsers();
    } catch (err: any) {
      console.error('Failed to update user:', err);
      
      const errorMessage = err?.data?.message || 'Failed to update user. Please try again.';
      showNotification({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id).unwrap();
      
      showNotification({
        title: 'Success',
        message: 'User deleted successfully',
        color: 'green',
      });

      setDeleteModalOpen(false);
      setUserToDelete(null);
      refetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      
      const errorMessage = err?.data?.message || 'Failed to delete user. Please try again.';
      showNotification({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    }
  };

  // Define table columns with enhanced styling
  const columns: Column<User>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: false,
      cell: (info) => (
        <Text fw={500} c="dimmed" size="sm">
          #{info.getValue() as string}
        </Text>
      ),
      size: 80,
    },
    {
      accessorKey: 'username',
      header: 'User',
      enableSorting: true,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Group gap="sm">
            <Avatar 
              size="sm" 
              color={getAvatarColor(user.username)}
              radius="xl"
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Text fw={500} size="sm">
                {user.username}
              </Text>
              <Text size="xs" c="dimmed">
                <PiEnvelopeBold size={10} style={{ marginRight: 4 }} />
                {user.email}
              </Text>
            </div>
          </Group>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      cell: (info) => (
        <Text size="sm" c="blue" style={{ textDecoration: 'none' }}>
          {info.getValue() as string}
        </Text>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      enableSorting: true,
      cell: (info) => {
        const role = info.getValue() as keyof typeof ROLE_CONFIG;
        const config = ROLE_CONFIG[role] || ROLE_CONFIG.USER;
        
        return (
          <Badge 
            color={config.color} 
            variant="light" 
            size="sm"
            leftSection={config.icon}
          >
            {config.label}
          </Badge>
        );
      },
      size: 150,
    },
  ];

  // Define table actions
  const actions: DashboardAction<User>[] = [
    {
      icon: <PiEyeBold size={16} />,
      color: 'green',
      title: 'View User',
      onClick: (user) => handleOpenModal(user, 'view')
    },
    {
      icon: <PiPencilSimpleLineBold size={16} />,
      color: 'blue',
      title: 'Edit User',
      onClick: (user) => handleOpenModal(user, 'edit')
    },
    {
      icon: <PiTrashBold size={16} />,
      color: 'red',
      title: 'Delete User',
      onClick: handleDeleteClick
    }
  ];

  const tableData = paginatedResponse?.content || [];
  const totalPages = paginatedResponse?.totalPages || 1;
  const isLoading = isPaginatedLoading;
  const hasError = usersError;

  return (
    <>
      {/* Enhanced Table */}
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
        searchPlaceholder="Search users by name or email..."
        title="Users Dashboard"
        subtitle="Manage user accounts and permissions"
        titleIcon={<PiUsersBold size={28} />}
        isLoading={isLoading}
        error={hasError}
        enableSort
        enableSearch
        searchWidth={350}
      />

      {/* Enhanced Modal */}
      <DashboardCrudModal
        opened={modalOpen}
        title={
          modalType === 'create' ? 'Create New User' :
          modalType === 'edit' ? `Edit User: ${selectedUser?.username}` :
          `User Details: ${selectedUser?.username}`
        }
        onClose={handleCloseModal}
        onSubmit={modalType !== 'view' ? formMethods.handleSubmit(handleSubmit) : undefined}
        modalType={modalType}
        isSubmitting={isUpdating}
        errors={formErrors}
        size="md"
      >
        <Stack gap="md">
          {/* User Avatar Section for View Mode */}
          {modalType === 'view' && selectedUser && (
            <Card withBorder p="md" bg="gray.0">
              <Group>
                <Avatar 
                  size="lg" 
                  color={getAvatarColor(selectedUser.username)}
                  radius="xl"
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={600} size="lg">
                    {selectedUser.username}
                  </Text>
                  <Text size="sm" c="dimmed">
                    <PiEnvelopeBold size={14} style={{ marginRight: 4 }} />
                    {selectedUser.email}
                  </Text>
                  <Badge 
                    color={ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.color || 'blue'} 
                    variant="light" 
                    size="sm"
                    leftSection={ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.icon}
                    mt="xs"
                  >
                    {ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.label || selectedUser.role}
                  </Badge>
                </div>
              </Group>
            </Card>
          )}

          {/* Form Fields */}
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Username"
                placeholder="Enter username"
                {...formMethods.register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                error={formMethods.formState.errors.username?.message}
                disabled={modalType === 'view'}
                leftSection={<PiUserBold size={16} />}
              />
            </Grid.Col>
            
                        <Grid.Col span={12}>
              <TextInput
                label="Email"
                placeholder="Enter email address"
                type="email"
                {...formMethods.register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                error={formMethods.formState.errors.email?.message}
                disabled={modalType === 'view'}
                leftSection={<PiEnvelopeBold size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Controller
                name="role"
                control={formMethods.control}
                rules={{ required: 'Role is required' }}
                render={({ field }) => (
                  <Select
                    label="Role"
                    placeholder="Select user role"
                    data={Object.entries(ROLE_CONFIG).map(([value, config]) => ({
                      value,
                      label: config.label,
                      description: config.description
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                    error={formMethods.formState.errors.role?.message}
                    disabled={modalType === 'view'}
                    leftSection={<PiShieldCheckBold size={16} />}
                  />
                )}
              />
            </Grid.Col>
          </Grid>

          {/* Role Description */}
          {formMethods.watch('role') && (
            <Alert 
              icon={ROLE_CONFIG[formMethods.watch('role') as keyof typeof ROLE_CONFIG]?.icon} 
              title={`${ROLE_CONFIG[formMethods.watch('role') as keyof typeof ROLE_CONFIG]?.label} Role`}
              color={ROLE_CONFIG[formMethods.watch('role') as keyof typeof ROLE_CONFIG]?.color}
              variant="light"
            >
              {ROLE_CONFIG[formMethods.watch('role') as keyof typeof ROLE_CONFIG]?.description}
            </Alert>
          )}

          {/* User Details for View Mode */}
          {modalType === 'view' && selectedUser && (
            <div>
              <Text fw={600} mb="sm">Account Information</Text>
              <Card withBorder>
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">User ID:</Text>
                    <Text fw={500}>#{selectedUser.id}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Account Status:</Text>
                    <Badge color="green" variant="light" mt="xs">
                      Active
                    </Badge>
                  </Grid.Col>
                </Grid>
              </Card>
            </div>
          )}

          {/* Permissions Info for View Mode */}
          {modalType === 'view' && selectedUser && (
            <div>
              <Text fw={600} mb="sm">Role Permissions</Text>
              <Card withBorder>
                <Group gap="xs" mb="sm">
                  {ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.icon}
                  <Text fw={500}>
                    {ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.label || selectedUser.role}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {ROLE_CONFIG[selectedUser.role as keyof typeof ROLE_CONFIG]?.description || 'Custom role with specific permissions'}
                </Text>
                
                {/* Role-specific capabilities */}
                <Stack gap="xs" mt="md">
                  {selectedUser.role === 'SUPERADMIN' && (
                    <>
                      <Text size="xs" c="green">✓ Full system administration</Text>
                      <Text size="xs" c="green">✓ User management</Text>
                      <Text size="xs" c="green">✓ System configuration</Text>
                      <Text size="xs" c="green">✓ All data access</Text>
                    </>
                  )}
                  {selectedUser.role === 'ADMIN' && (
                    <>
                      <Text size="xs" c="green">✓ User management</Text>
                      <Text size="xs" c="green">✓ Order management</Text>
                      <Text size="xs" c="green">✓ Inventory management</Text>
                      <Text size="xs" c="dimmed">✗ System configuration</Text>
                    </>
                  )}
                  {selectedUser.role === 'BUYER' && (
                    <>
                      <Text size="xs" c="green">✓ Place orders</Text>
                      <Text size="xs" c="green">✓ View order history</Text>
                      <Text size="xs" c="green">✓ Manage company profile</Text>
                      <Text size="xs" c="dimmed">✗ Inventory management</Text>
                    </>
                  )}
                  {selectedUser.role === 'SUPPLIER' && (
                    <>
                      <Text size="xs" c="green">✓ Manage inventory</Text>
                      <Text size="xs" c="green">✓ Process orders</Text>
                      <Text size="xs" c="green">✓ Manage warehouses</Text>
                      <Text size="xs" c="dimmed">✗ User management</Text>
                    </>
                  )}
                  {selectedUser.role === 'USER' && (
                    <>
                      <Text size="xs" c="green">✓ Basic system access</Text>
                      <Text size="xs" c="green">✓ View assigned data</Text>
                      <Text size="xs" c="dimmed">✗ Administrative functions</Text>
                      <Text size="xs" c="dimmed">✗ User management</Text>
                    </>
                  )}
                </Stack>
              </Card>
            </div>
          )}
        </Stack>
      </DashboardCrudModal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="Confirm User Deletion"
        centered
        size="sm"
        style={{
            position: 'fixed',
            top: '0',
            left: '0'
          }}
      >
        <Stack gap="md">
          <Alert 
            icon={<PiWarningBold size={16} />} 
            title="Warning" 
            color="red"
            variant="light"
          >
            This action cannot be undone. The user will be permanently removed from the system.
          </Alert>

          {userToDelete && (
            <Card withBorder p="md">
              <Group>
                <Avatar 
                  size="md" 
                  color={getAvatarColor(userToDelete.username)}
                  radius="xl"
                >
                  {userToDelete.username.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={500}>{userToDelete.username}</Text>
                  <Text size="sm" c="dimmed">{userToDelete.email}</Text>
                  <Badge 
                    color={ROLE_CONFIG[userToDelete.role as keyof typeof ROLE_CONFIG]?.color || 'blue'} 
                    variant="light" 
                    size="xs"
                    mt="xs"
                  >
                    {ROLE_CONFIG[userToDelete.role as keyof typeof ROLE_CONFIG]?.label || userToDelete.role}
                  </Badge>
                </div>
              </Group>
            </Card>
          )}

          <Text size="sm" c="dimmed">
            Are you sure you want to delete this user? This will remove all associated data and cannot be reversed.
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button 
              variant="default" 
              onClick={() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
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
              Delete User
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default UsersDashboard;
