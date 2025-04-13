import {
  Anchor,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { PiGoogleLogoBold, PiFacebookLogoBold } from "react-icons/pi";
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <Container size={420} my={40}>
      <Paper shadow="xl" radius="md" p="xl" withBorder>
        <Text size="lg" fw={500}>
          Welcome back to <span><Link to={"/"} style={{textDecoration: 'none', color: 'limegreen'}}>Stockly</Link></span>
        </Text>

        <Group grow mb="md" mt="md">
          <Button variant="default" radius="xl" disabled>
            <PiGoogleLogoBold   size={20} />
            &nbsp;
            Google
          </Button>
          <Button variant="default" radius="xl" disabled>
            <PiFacebookLogoBold   size={40} />
            &nbsp;
            Facebook
          </Button>
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <form style={{ textAlign: 'left' }}>
          <Stack>
            <TextInput
              required
              label="Email"
              placeholder="hello@stockly.com"
              radius="md"
            />
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor component={Link} to="/register" c="dimmed" size="xs">
              Don’t have an account? Register
            </Anchor>
            <Button type="submit" radius="xl">
              Login
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
