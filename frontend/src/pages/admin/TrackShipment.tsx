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
  Divider
} from '@mantine/core';
import {
  PiWarningCircleBold,
  PiMagnifyingGlassBold,
  PiTruckBold
} from 'react-icons/pi';
import { useGetShipmentByIdQuery } from '../../api/ShipmentsApi';

const statusColors: Record<string, string> = {
  DELIVERED: 'green',
  IN_TRANSIT: 'blue',
  PENDING: 'yellow',
  FAILED: 'red',
  CANCELLED: 'gray',
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
          title="Error"
          color="red"
          variant="filled"
          mb="lg"
          withCloseButton
        >
          {status === 404
            ? 'Shipment not found. Please check the ID and try again.'
            : 'Error fetching shipment details. Please try again later.'}
        </Alert>
      );
    }
    return null;
  }

  return (
    <Container size="sm" py="xl">
      <Paper  p="xl" radius="md">
        <Group mb="xl" align="center" gap="xs" wrap="nowrap">
          <PiTruckBold size={32} color="#228be6" />
          <Title order={2} fw={700}>
            Track Shipment
          </Title>
        </Group>

        <Group mb="xl" align="flex-end" gap="md" wrap="nowrap">
          <TextInput
            placeholder="Enter Shipment ID"
            label="Shipment ID"
            value={shipmentId}
            onChange={(e) => setShipmentId(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isFetching}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSearch}
            leftSection={<PiMagnifyingGlassBold size={18} />}
            disabled={!shipmentId.trim() || isLoading || isFetching}
            loading={isLoading || isFetching}
            size="md"
            radius="md"
          >
            Track
          </Button>
        </Group>

        {(isLoading || isFetching) && (
          <Group justify="center" gap="sm" py="xl">
            <Loader size="lg" />
            <Text size="md" c="dimmed">Fetching shipment details...</Text>
          </Group>
        )}

        {renderError(error)}

        {shipment && (
          <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
            <Stack gap="md">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Text fw={600} size="lg">
                  Shipment Details
                </Text>
                <Badge
                  color={statusColors[shipment.status] || 'gray'}
                  variant="filled"
                  size="lg"
                  style={{ textTransform: 'capitalize' }}
                >
                  {shipment.status.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              </Group>

              <Divider />

              <Group gap="xl" wrap="wrap">
                <Stack gap={2} style={{ minWidth: 140 }}>
                  <Text size="sm" c="dimmed">Shipment ID</Text>
                  <Text fw={500} size="md">{shipment.id}</Text>
                </Stack>

                <Stack gap={2} style={{ minWidth: 140 }}>
                  <Text size="sm" c="dimmed">Tracking Code</Text>
                  <Text fw={500} size="md">{shipment.trackingCode}</Text>
                </Stack>
              </Group>

              <Group gap="xl" wrap="wrap" mt="sm">
                <Stack gap={2} style={{ minWidth: 140 }}>
                  <Text size="sm" c="dimmed">Carrier</Text>
                  <Text fw={500} size="md">{shipment.carrier}</Text>
                </Stack>

                <Stack gap={2} style={{ minWidth: 140 }}>
                  <Text size="sm" c="dimmed">Service</Text>
                  <Text fw={500} size="md">{shipment.service}</Text>
                </Stack>

                <Stack gap={2} style={{ minWidth: 140 }}>
                  <Text size="sm" c="dimmed">Rate</Text>
                  <Text fw={500} size="md">${shipment.rate.toFixed(2)}</Text>
                </Stack>
              </Group>

              {shipment.labelUrl && (
                <Anchor
                  href={shipment.labelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="always"
                  size="md"
                  style={(theme: any) => ({
                    alignSelf: 'start',
                    marginTop: theme.spacing.sm,
                    color: theme.colors.blue[7],
                    fontWeight: 600,
                    '&:hover': {
                      color: theme.colors.blue[9],
                    },
                  })}
                >
                  Download Shipping Label
                </Anchor>
              )}
            </Stack>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default TrackShipment;