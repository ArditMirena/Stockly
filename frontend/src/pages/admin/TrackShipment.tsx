import { useState } from 'react';
import { 
  TextInput, 
  Button, 
  Loader, 
  Card, 
  Text, 
  Group, 
  Container, 
  Title,
  Alert,
  Stack,
  Badge,
  Anchor,
  Paper,
  Grid,
  Timeline,
  ThemeIcon,
  Box,
  ActionIcon,
  CopyButton,
  Tooltip
} from '@mantine/core';
import {
  PiWarningCircleBold,
  PiMagnifyingGlassBold,
  PiTruckBold,
  PiPackageBold,
  PiMapPinBold,
  PiReceiptBold,
  PiDownloadBold,
  PiCopyBold,
  PiCheckBold,
  PiClockBold,
  PiCheckCircleBold,
  PiXCircleBold,
  PiCircleBold
} from 'react-icons/pi';
import { useGetShipmentByIdQuery } from '../../api/ShipmentsApi';
// import { showNotification } from '@mantine/notifications';

const statusColors: Record<string, string> = {
  DELIVERED: 'green',
  IN_TRANSIT: 'blue',
  PENDING: 'yellow',
  FAILED: 'red',
  CANCELLED: 'gray',
  SHIPPED: 'teal',
  PROCESSING: 'orange',
};

const statusIcons: Record<string, React.ReactNode> = {
  DELIVERED: <PiCheckCircleBold size={16} />,
  IN_TRANSIT: <PiTruckBold size={16} />,
  PENDING: <PiClockBold size={16} />,
  FAILED: <PiXCircleBold size={16} />,
  CANCELLED: <PiXCircleBold size={16} />,
  SHIPPED: <PiPackageBold size={16} />,
  PROCESSING: <PiCircleBold size={16} />,
};

const getStatusDescription = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 'Shipment is being prepared';
    case 'PROCESSING': return 'Shipment is being processed';
    case 'SHIPPED': return 'Shipment has been dispatched';
    case 'IN_TRANSIT': return 'Shipment is on the way';
    case 'DELIVERED': return 'Shipment has been delivered';
    case 'FAILED': return 'Shipment delivery failed';
    case 'CANCELLED': return 'Shipment has been cancelled';
    default: return 'Status unknown';
  }
};

const TrackShipment = () => {
  const [shipmentId, setShipmentId] = useState('');
  const [searchId, setSearchId] = useState('');
  
  const { 
    data: shipment, 
    error, 
    isLoading, 
    isFetching 
  } = useGetShipmentByIdQuery(searchId, {
    skip: !searchId,
  });

  const handleSearch = () => {
    if (shipmentId.trim()) {
      setSearchId(shipmentId.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // const handleCopy = (text: string, label: string) => {
  //   navigator.clipboard.writeText(text);
  //   showNotification({
  //     title: 'Copied!',
  //     message: `${label} copied to clipboard`,
  //     color: 'green',
  //     icon: <PiCheckBold size={16} />,
  //   });
  // };

  function renderError(error: unknown): React.ReactNode {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error
    ) {
      const status = (error as any).status;
      return (
        <Alert
          icon={<PiWarningCircleBold size={20} />}
          title="Shipment Not Found"
          color="red"
          variant="light"
          mb="lg"
        >
          {status === 404
            ? 'No shipment found with this ID. Please verify the shipment ID and try again.'
            : 'Unable to retrieve shipment information. Please try again later or contact support if the problem persists.'}
        </Alert>
      );
    }
    return null;
  }

  const renderTrackingTimeline = () => {
    if (!shipment) return null;

    const timelineItems = [
      {
        title: 'Order Placed',
        description: 'Shipment request created',
        icon: <PiReceiptBold size={16} />,
        color: 'blue',
        completed: true,
      },
      {
        title: 'Processing',
        description: 'Preparing shipment',
        icon: <PiCircleBold size={16} />,
        color: 'orange',
        completed: ['PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status),
      },
      {
        title: 'Shipped',
        description: 'Package dispatched',
        icon: <PiPackageBold size={16} />,
        color: 'teal',
        completed: ['SHIPPED', 'IN_TRANSIT', 'DELIVERED'].includes(shipment.status),
      },
      {
        title: 'In Transit',
        description: 'On the way to destination',
        icon: <PiTruckBold size={16} />,
        color: 'blue',
        completed: ['IN_TRANSIT', 'DELIVERED'].includes(shipment.status),
      },
      {
        title: 'Delivered',
        description: 'Package delivered successfully',
        icon: <PiCheckCircleBold size={16} />,
        color: 'green',
        completed: shipment.status === 'DELIVERED',
      },
    ];

    return (
      <Card withBorder mt="md">
        <Text fw={600} mb="md" size="lg">
          Tracking Timeline
        </Text>
        <Timeline active={timelineItems.findIndex(item => !item.completed)} bulletSize={24}>
          {timelineItems.map((item, index) => (
            <Timeline.Item
              key={index}
              bullet={
                <ThemeIcon
                  size={24}
                  variant={item.completed ? 'filled' : 'light'}
                  color={item.color}
                >
                  {item.icon}
                </ThemeIcon>
              }
              title={
                <Text fw={item.completed ? 600 : 400} c={item.completed ? 'dark' : 'dimmed'}>
                  {item.title}
                </Text>
              }
            >
              <Text size="sm" c="dimmed">
                {item.description}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    );
  };

  return (
    <Container size="md" py="xl">
      <Paper p="xl" radius="md">
        {/* Header Section */}
        <Stack gap="xl">
          <div style={{ textAlign: 'center' }}>
            <Group justify="center" mb="sm">
              <ThemeIcon size={48} variant="light" color="blue">
                <PiTruckBold size={28} />
              </ThemeIcon>
            </Group>
            <Title order={1} fw={700} mb="xs">
              Track Your Shipment
            </Title>
            <Text size="lg" c="dimmed">
              Enter your shipment ID to get real-time tracking information
            </Text>
          </div>

          {/* Search Section */}
          <Card withBorder p="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Group align="flex-end" gap="md" wrap="nowrap">
              <TextInput
                placeholder="Enter Shipment ID (e.g., SH123456)"
                label="Shipment ID"
                description="You can find this ID in your order confirmation email"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || isFetching}
                style={{ flex: 1 }}
                size="md"
                leftSection={<PiPackageBold size={18} />}
              />
              <Button
                onClick={handleSearch}
                leftSection={<PiMagnifyingGlassBold size={18} />}
                disabled={!shipmentId.trim() || isLoading || isFetching}
                loading={isLoading || isFetching}
                size="md"
                radius="md"
                style={{ minWidth: '120px' }}
              >
                Track
              </Button>
            </Group>
          </Card>

          {/* Loading State */}
          {(isLoading || isFetching) && (
            <Card withBorder p="xl" radius="md">
              <Group justify="center" gap="md">
                <Loader size="lg" />
                <div>
                  <Text size="lg" fw={500}>Tracking your shipment...</Text>
                  <Text size="sm" c="dimmed">Please wait while we fetch the latest information</Text>
                </div>
              </Group>
            </Card>
          )}

          {/* Error State */}
          {renderError(error)}

          {/* Shipment Details */}
          {shipment && (
            <Stack gap="md">
              {/* Status Card */}
              <Card withBorder p="lg" radius="md">
                <Group justify="space-between" align="center" mb="md">
                  <div>
                    <Text size="sm" c="dimmed" mb={4}>Current Status</Text>
                    <Group gap="xs">
                      <Badge
                        color={statusColors[shipment.status] || 'gray'}
                        variant="filled"
                        size="lg"
                        leftSection={statusIcons[shipment.status]}
                      >
                        {shipment.status.replace(/_/g, ' ')}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {getStatusDescription(shipment.status)}
                    </Text>
                  </div>
                  <ThemeIcon 
                    size={60} 
                    variant="light" 
                    color={statusColors[shipment.status] || 'gray'}
                  >
                    {statusIcons[shipment.status] || <PiPackageBold size={30} />}
                  </ThemeIcon>
                </Group>
              </Card>

              {/* Shipment Information */}
              <Card withBorder p="lg" radius="md">
                <Text fw={600} size="lg" mb="md">
                  Shipment Information
                </Text>
                
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs" mb="sm">
                      <Text size="sm" c="dimmed">Shipment ID:</Text>
                      <Text fw={500} size="sm">{shipment.id}</Text>
                      <CopyButton value={shipment.id.toString()}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy ID'}>
                            <ActionIcon 
                              color={copied ? 'teal' : 'gray'} 
                              variant="subtle" 
                              onClick={copy}
                              size="sm"
                            >
                              {copied ? <PiCheckBold size={14} /> : <PiCopyBold size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs" mb="sm">
                      <Text size="sm" c="dimmed">Tracking Code:</Text>
                      <Text fw={500} size="sm">{shipment.trackingCode}</Text>
                      <CopyButton value={shipment.trackingCode}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy tracking code'}>
                            <ActionIcon 
                              color={copied ? 'teal' : 'gray'} 
                              variant="subtle" 
                              onClick={copy}
                              size="sm"
                            >
                              {copied ? <PiCheckBold size={14} /> : <PiCopyBold size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs" mb="sm">
                      <PiTruckBold size={16} color="var(--mantine-color-blue-6)" />
                      <Text size="sm" c="dimmed">Carrier:</Text>
                      <Badge variant="light" color="blue" size="sm">
                        {shipment.carrier}
                      </Badge>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs" mb="sm">
                      <PiMapPinBold size={16} color="var(--mantine-color-green-6)" />
                      <Text size="sm" c="dimmed">Service:</Text>
                      <Text fw={500} size="sm">{shipment.service}</Text>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group gap="xs" mb="sm">
                      <PiReceiptBold size={16} color="var(--mantine-color-orange-6)" />
                      <Text size="sm" c="dimmed">Shipping Cost:</Text>
                      <Text fw={600} size="sm" c="green">
                        ${shipment.rate.toFixed(2)}
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>

                {shipment.labelUrl && (
                  <Box mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
                    <Anchor
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      <Button
                        variant="light"
                        leftSection={<PiDownloadBold size={16} />}
                        color="blue"
                      >
                        Download Shipping Label
                      </Button>
                    </Anchor>
                  </Box>
                )}
              </Card>

              {/* Tracking Timeline */}
              {renderTrackingTimeline()}
              
              {/* Help Section */}
              <Card withBorder p="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                <Group gap="md">
                  <ThemeIcon size={40} variant="light" color="blue">
                    <PiWarningCircleBold size={20} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text fw={600} mb="xs">Need Help?</Text>
                    <Text size="sm" c="dimmed" mb="sm">
                      If you have any questions about your shipment or need assistance, please contact our support team.
                    </Text>
                    <Group gap="sm">
                      <Button variant="light" size="sm">
                        Contact Support
                      </Button>
                      <Button variant="subtle" size="sm">
                        Track Another Package
                      </Button>
                    </Group>
                  </div>
                </Group>
              </Card>
            </Stack>
          )}

          {/* Empty State - No Search Yet */}
          {!searchId && !isLoading && !error && (
            <Card withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
              <ThemeIcon size={80} variant="light" color="gray" mx="auto" mb="md">
                <PiPackageBold size={40} />
              </ThemeIcon>
              <Title order={3} c="dimmed" mb="xs">
                Ready to Track
              </Title>
              <Text c="dimmed" mb="md">
                Enter your shipment ID above to get started with tracking your package
              </Text>
              <Text size="sm" c="dimmed">
                💡 Tip: You can find your shipment ID in your order confirmation email or receipt
              </Text>
            </Card>
          )}

          {/* No Results State */}
          {searchId && !shipment && !isLoading && !error && (
            <Card withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
              <ThemeIcon size={80} variant="light" color="orange" mx="auto" mb="md">
                <PiMagnifyingGlassBold size={40} />
              </ThemeIcon>
              <Title order={3} c="dimmed" mb="xs">
                No Results Found
              </Title>
              <Text c="dimmed" mb="md">
                We couldn't find a shipment with ID: <strong>{searchId}</strong>
              </Text>
              <Button 
                variant="light" 
                onClick={() => {
                  setSearchId('');
                  setShipmentId('');
                }}
              >
                Try Another ID
              </Button>
            </Card>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default TrackShipment;
