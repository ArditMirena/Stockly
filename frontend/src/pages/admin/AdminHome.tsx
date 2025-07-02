import { useSelector } from 'react-redux';
import { Container, Text, Box, Group, Badge, Divider, Card, Button, Select, Alert } from "@mantine/core";
import { StatsRing } from "../../components/StatsRing";
import { useState, useEffect } from "react";
import { PiShieldCheckBold, PiTrendUpBold, PiUserPlusBold } from "react-icons/pi";
import { useCreateRoleRequestMutation } from "../../api/RoleRequestApi";
import { ROLES } from '../../utils/Roles';
import { RootState } from '../../redux/store';
import { notifications } from '@mantine/notifications';

const AdminHome = () => {
  const welcomeText = "Welcome to your admin dashboard!";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const user = useSelector((state: RootState) => state.auth.user);
  const [createRoleRequest, { isLoading, error }] = useCreateRoleRequestMutation();

  const roleOptions = Object.entries(ROLES)
    .filter(([key, value]) => value !== ROLES.SUPER_ADMIN)
    .map(([key, value]) => ({
      value: value,
      label: key.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }));

  useEffect(() => {
    if (currentIndex < welcomeText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + welcomeText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 80);

      return () => clearTimeout(timeout);
    } else {
      // Hide cursor after typing is complete
      const timeout = setTimeout(() => setShowCursor(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  const handleRoleRequest = async () => {
    if (!selectedRole || !user?.id) {
      notifications.show({
        title: 'Error',
        message: 'Please select a role and ensure you are logged in',
        color: 'red',
      });
      return;
    }

    try {
      await createRoleRequest({
        userId: user.id,
        role: selectedRole,
        approved: false
      }).unwrap();
      
      notifications.show({
        title: 'Success',
        message: 'Role request submitted successfully!',
        color: 'green',
      });
      
      setSelectedRole('');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit role request',
        color: 'red',
      });
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
      
      <Container size="xl" py="xl">
        {/* Header Section */}
        <Box mb="xl">
          <Group mb="md" gap="sm">
            <PiShieldCheckBold size={32} color="var(--mantine-color-blue-6)" />
            <Badge 
              variant="light" 
              color="blue" 
              size="lg"
              leftSection={<PiTrendUpBold size={14} />}
            >
              Admin Panel
            </Badge>
          </Group>
          
          <Text 
            size="2rem" 
            fw={700} 
            c="dark"
            style={{ 
              textAlign: 'start', 
              minHeight: '3rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(45deg, #228be6, #15aabf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayedText}
            {showCursor && currentIndex <= welcomeText.length && (
              <span 
                style={{ 
                  animation: 'blink 1s infinite',
                  marginLeft: '2px',
                  color: '#228be6'
                }}
              >
                |
              </span>
            )}
          </Text>
          
          <Text size="md" c="dimmed" mb="lg">
            Monitor your business metrics and manage your inventory system
          </Text>
          
          <Divider mb="xl" />
        </Box>

        {/* Role Request Section */}
        <Box mb="xl">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md" gap="sm">
              <PiUserPlusBold size={24} color="var(--mantine-color-green-6)" />
              <Text size="lg" fw={600} c="dark">
                Request Role Change
              </Text>
            </Group>
            
            <Text size="sm" c="dimmed" mb="md">
              Request a new role to access additional features and permissions
            </Text>

            <Group align="end" gap="md">
              <Select
                label="Select Role"
                placeholder="Choose a role"
                data={roleOptions}
                value={selectedRole}
                onChange={(value) => setSelectedRole(value || '')}
                style={{ flex: 1 }}
                clearable
              />
              <Button
                onClick={handleRoleRequest}
                loading={isLoading}
                disabled={!selectedRole}
                leftSection={<PiUserPlusBold size={16} />}
              >
                Submit Request
              </Button>
            </Group>

            {error && (
              <Alert color="red" mt="md">
                Failed to submit role request. Please try again.
              </Alert>
            )}
          </Card>
        </Box>

        {/* Stats Section */}
        <Box>
          <Group mb="lg" justify="space-between" align="center">
            <Text size="xl" fw={600} c="dark">
              Business Overview
            </Text>
            <Badge variant="dot" color="green" size="sm">
              Live Data
            </Badge>
          </Group>
          <StatsRing />
        </Box>
      </Container>
    </>
  );
};

export default AdminHome;
