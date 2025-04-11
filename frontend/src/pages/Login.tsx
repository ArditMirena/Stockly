import {
    Anchor,
    Button,
    Checkbox,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
  } from '@mantine/core';
  
  import { useState } from 'react';

const Login = () => {
    const [type, setType] = useState<'login' | 'register'>('login');

    return (
      <Paper shadow="xl" radius="md" p="xl">
        <Text size="lg" fw={500}>
          Welcome to <span style={{color: 'limegreen'}}>Stockly</span>, {type === 'login' ? 'login' : 'register'} with
        </Text>
  
        <Group grow mb="md" mt="md">
          <Button variant="default" radius="xl">
            Google
          </Button>
          <Button variant="default" radius="xl">
            Twitter
          </Button>
        </Group>
  
        <Divider label="Or continue with email" labelPosition="center" my="lg" />
  
        <form>
          <Stack>
            {type === 'register' && (
              <TextInput
                label="Username"
                placeholder="Your name"
                radius="md"
                required
              />
            )}
  
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
  
            {type === 'register' && (
              <Checkbox
                label="I accept terms and conditions"
                required
              />
            )}
          </Stack>
  
          <Group justify="space-between" mt="xl">
            <Anchor component="button" type="button" c="dimmed" size="xs" onClick={() => setType(type === 'register' ? 'login' : 'register')}>
              {type === 'register'
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit" radius="xl">
              {type === 'register' ? 'Register' : 'Login'}
            </Button>
          </Group>
        </form>
      </Paper>
    );
}

export default Login;