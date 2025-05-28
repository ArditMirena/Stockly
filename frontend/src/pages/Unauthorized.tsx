import {
  Center,
  Title,
  Text,
  Button,
  Group,
  Container,
  ThemeIcon,
  rem,
  Stack,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { PiLockKeyBold, PiArrowLeftBold, PiHouseBold } from 'react-icons/pi';

const Unauthorized = () => {
  return (
    <Container size="sm" py={rem(80)}>
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap={rem(24)}>
          <ThemeIcon color="red" size={rem(60)} radius="xl" variant="light">
            <PiLockKeyBold size={40} />
          </ThemeIcon>

          <Title order={2} ta="center">
            Access Denied
          </Title>

          <Text size="md" color="dimmed" ta="center" maw={rem(400)}>
            You don&apos;t have permission to view this page. If you believe this is an error,
            please contact your administrator.
          </Text>

          <Group mt={rem(12)}>
            <Button
              component={Link}
              to="/admin/home"
              size="md"
              leftSection={<PiHouseBold size={20} />}
            >
              Home Page
            </Button>
            <Button
              component={Link}
              to="/login"
              size="md"
              variant="outline"
              leftSection={<PiArrowLeftBold size={20} />}
            >
              Return to Login
            </Button>
          </Group>

          <Text size="sm" color="dimmed" mt={rem(24)}>
            Error code: <strong>403 Forbidden</strong>
          </Text>
        </Stack>
      </Center>
    </Container>
  );
};

export default Unauthorized;
