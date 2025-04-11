import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Group,
  Stack,
  rem,
} from '@mantine/core';

const Home = () => {
  return (
    <Container size="lg" py="xl">
      <Paper shadow="xl" radius="md" p="xl" withBorder>
        <Stack align="center" style={{ spacing: '40px' }} >
          <Title order={1} style={{ textAlign: 'center' }}>
            Welcome to <Text span color="limegreen" inherit>Stockly</Text>
          </Title>

          <Text size="lg" color="dimmed" style={{ textAlign: 'center' }}>
            Your intelligent inventory optimization solution
          </Text>

          <Text style={{ textAlign: 'center' }}>
            Stockly helps businesses streamline inventory management, 
            reduce waste, and optimize supply chains with powerful analytics.
          </Text>

          <Group align="center" justify="center" mt="xl">
            <Button
              component={Link}
              to="/login"
              size="md"
              radius="xl"
              variant="filled"
            >
              Get Started
            </Button>
            <Button
              component="a"
              href="#features"
              size="md"
              radius="xl"
              variant="outline"
            >
              Learn More
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* Features Section */}
      <Group mt={rem(50)} grow>
        <Paper shadow="md" p="md" radius="md" withBorder>
          <Title order={3} mb="sm">Real-time Tracking</Title>
          <Text>Monitor inventory levels across all locations in real-time</Text>
        </Paper>
        <Paper shadow="md" p="md" radius="md" withBorder>
          <Title order={3} mb="sm">Smart Alerts</Title>
          <Text>Get notified before you run out of stock</Text>
        </Paper>
        <Paper shadow="md" p="md" radius="md" withBorder>
          <Title order={3} mb="sm">Analytics</Title>
          <Text>Powerful insights to optimize your supply chain</Text>
        </Paper>
      </Group>
    </Container>
  );
};

export default Home;
