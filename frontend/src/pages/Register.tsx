import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Modal
} from '@mantine/core';
import { PiGoogleLogoBold, PiFacebookLogoBold, PiArrowLineUpLeftBold, PiXBold } from "react-icons/pi";
import { Link } from 'react-router-dom';
import { signup, SignupData, verify, VerifyUserData } from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const Register = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const dispatch: AppDispatch = useDispatch();
  const { isLoading } = useSelector((state: RootState) => state.auth);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const registerSchema = yup.object().shape({
    username: yup.string().min(8, "Username must be at least 8 characters!").required("Username is required!"),
    email: yup.string().email("Invalid email!").required("Email is required!"),
    password: yup.string().min(8, "Password must be at least 8 characters!").required("Password is required!"),
    termsAccepted: yup
      .boolean()
      .oneOf([true], "You must accept the terms and conditions!")
      .required("You must accept the terms and conditions!"),
  });

  const verificationSchema = yup.object().shape({
    verificationCode: yup.string().min(6, "Verification code must be at least 6 digits!").required("Verification code is required!"),
  });

  const {
    register: registerMain,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm<yup.InferType<typeof registerSchema>>({
    resolver: yupResolver(registerSchema)
  });

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    reset: resetVerifyForm,
  } = useForm<yup.InferType<typeof verificationSchema>>({
    resolver: yupResolver(verificationSchema)
  });

  const onSubmit = (data: yup.InferType<typeof registerSchema>) => {
    const signupData: SignupData = {
      username: data.username,
      email: data.email,
      password: data.password,
    };
  
    dispatch(signup(signupData))
      .then(() => {
        setRegisteredEmail(data.email);
        open();
      })
      .catch((error) => {
        console.error('Registration failed:', error);
      });
  };
  
  
  const handleVerify = (data: yup.InferType<typeof verificationSchema>) => {
    console.log('Verification data:', data);
    const verifyData: VerifyUserData = {
      email: registeredEmail,
      verificationCode: data.verificationCode,
    };
    console.log("verify triggered")
  
    dispatch(verify(verifyData))
      .then(() => {
        resetRegisterForm();
        resetVerifyForm();
        close();
      })
      .catch((error) => {
        console.error('Verification failed:', error);
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
      <Container size={420} my={40}>
        <Paper shadow="xl" radius="md" p="xl" withBorder>
          <Text size="lg" fw={500}>
            Welcome to <span><Link to={"/"} style={{ textDecoration: 'none', color: 'limegreen' }}>Stockly</Link></span>
          </Text>

          <Group grow mb="md" mt="md">
            <Button variant="default" radius="md" disabled>
              <PiGoogleLogoBold size={20} />
              &nbsp;
              Google
            </Button>
            <Button variant="default" radius="md" disabled>
              <PiFacebookLogoBold size={40} />
              &nbsp;
              Facebook
            </Button>
          </Group>

          <Divider label="Or register with email" labelPosition="center" my="lg" />

          <form style={{ textAlign: 'left' }} onSubmit={handleRegisterSubmit(onSubmit)}>
            <Stack>
              <TextInput
                label="Username"
                placeholder="Your username"
                radius="md"
                {...registerMain("username")}
                error={registerErrors.username?.message}
              />
              <TextInput
                label="Email"
                placeholder="hello@stockly.com"
                radius="md"
                {...registerMain("email")}
                error={registerErrors.email?.message}
              />
              <PasswordInput
                label="Password"
                placeholder="Your password"
                radius="md" 
                {...registerMain("password")}
                error={registerErrors.password?.message}
              />
              <Checkbox 
                label="I accept terms and conditions"
                {...registerMain("termsAccepted")}
                error={registerErrors.termsAccepted?.message}
              />
            </Stack>

            <Group justify="space-between" mt="xl">
              <Anchor component={Link} to="/login" c="dimmed" size="xs">
                Already have an account? Login
              </Anchor>
              <Button type="submit" radius="md" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Register"}
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
      <Modal
          opened={opened}
          onClose={close}
          title="Verify your Account"
          centered
          size="md"
          closeButtonProps={{
            icon: <PiXBold size={20} />,
          }}
          style={{
            position: 'fixed',
            top: '0',
            left: '0'
          }}
        >
        <form onSubmit={handleVerifySubmit(handleVerify)}>
          <Group justify='space-between'>
            <TextInput
              placeholder="123456"
              radius="md"
              {...registerVerify("verificationCode")}
              error={verifyErrors.verificationCode?.message}
            />
            <Button type="submit" radius="md">Verify</Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};

export default Register;
