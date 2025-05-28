import { Container, Title, Text, Button, Stack, Center, rem } from '@mantine/core';
import { PiWarningCircleLight, PiHouseBold } from 'react-icons/pi';
import { Link } from 'react-router-dom';

const NotFound = () => {  
  return (
    <Container size="md" py={rem(80)}>
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap={rem(24)}>

          <PiWarningCircleLight size={rem(48)} color="var(--mantine-color-yellow-6)" />

          <Title order={1} ta="center">
            404 – Page Not Found
          </Title>

          <Text size="lg" c="dimmed" ta="center" maw={rem(480)}>
            Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to another URL. If you think this is an error contact support.
          </Text>

          <Button
            component={Link}
            to="/admin/home"
            size="md"
            leftSection={<PiHouseBold size={20} />}
          >
            Go to Homepage
          </Button>

        </Stack>
      </Center>
    </Container>
  );
}

export default NotFound;
