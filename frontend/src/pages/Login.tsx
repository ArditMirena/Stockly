import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  ActionIcon,
  Center
} from '@mantine/core';
import { PiGoogleLogoBold, PiFacebookLogoBold, PiArrowLineUpLeftBold  } from "react-icons/pi";
import { Link } from 'react-router-dom';
import { LoginData, login, fetchCurrentUser } from '../redux/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const schema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required')
  })

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: LoginData) => {
    setError(null);
    dispatch(login(data))
      .unwrap()
      .then(() => dispatch(fetchCurrentUser()).unwrap())
      .then(() => {
        navigate('/admin/home');
      })
      .catch((err) => {
        if (typeof err === 'string') {
          setError(err);
        } else {
          setError('Login failed. Please check your credentials and try again.');
        }
      });
  };

  return (
    <>
      <ActionIcon 
        size={40} 
        component={Link} 
        to="/"
        style={{
          position: 'fixed',
          top: '30px',
          left: '30px',
          zIndex: 1000
        }}
      >
        <PiArrowLineUpLeftBold style={{ width: '80%', height: '80%' }} />
      </ActionIcon>
      <Center style={{ minHeight: '100vh', width: '100%' }}>
        <Container size={450} style={{ width: '100%' }}>
          <Paper shadow="xl" radius="md" p="xl" withBorder>
            <Text size="lg" fw={500}>
              Welcome back to <span><Link to={"/"} style={{textDecoration: 'none', color: 'limegreen'}}>Stockly</Link></span>
            </Text>

            <Group grow mb="md" mt="md">
              <Button variant="default" radius="md" disabled>
                <PiGoogleLogoBold size={20} />
                &nbsp;
                Google
              </Button>
              <Button variant="default" radius="md" disabled>
                <PiFacebookLogoBold size={20} />
                &nbsp;
                Facebook
              </Button>
            </Group>

            <Divider label="Or continue with email" labelPosition="center" my="lg" />

            <form style={{ textAlign: 'left' }} onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <TextInput
                  label="Email"
                  placeholder="hello@stockly.com"
                  radius="md"
                  {...register("email")}
                  error={errors.email?.message}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  radius="md"
                  {...register("password")}
                  error={errors.password?.message}
                />
                {error && (
                  <Text c="red" size="sm" mt="sm">
                    {error}
                  </Text>
                )}
              </Stack>

              <Group justify="space-between" mt="xl">
                <Anchor component={Link} to="/register" c="dimmed" size="xs">
                  Don't have an account? Register
                </Anchor>
                <Button type="submit" radius="md" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Group>
            </form>
          </Paper>
        </Container>
      </Center>
    </>
  );
};

export default Login;
