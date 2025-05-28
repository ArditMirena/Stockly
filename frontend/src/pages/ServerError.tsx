import { Button, Container, Group, Text, Title, rem } from '@mantine/core';
import { Link } from "react-router-dom";

const ServerError = () => {
  return (
    <Container 
      size="lg" 
      py={rem(80)} 
      style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'var(--mantine-color-green-filled)',
        textAlign: 'center'
      }}
    >
      <Title 
        style={{
          fontWeight: 500,
          fontSize: rem(220),
          lineHeight: 1,
          marginBottom: `calc(var(--mantine-spacing-xl) * 1.5)`,
          color: 'var(--mantine-color-green-3)',
        }}
        visibleFrom="sm"
      >
        500
      </Title>
      <Title 
        style={{
          fontWeight: 500,
          fontSize: rem(120),
          lineHeight: 1,
          marginBottom: `calc(var(--mantine-spacing-xl) * 1.5)`,
          color: 'var(--mantine-color-green-3)',
        }}
        hiddenFrom="sm"
      >
        500
      </Title>

      <Title 
        style={{
          fontFamily: 'Outfit, var(--mantine-font-family)',
          fontWeight: 500,
          fontSize: rem(38),
          color: 'var(--mantine-color-white)',
        }}
        visibleFrom="sm"
      >
        Something bad just happened...
      </Title>
      <Title 
        order={2}
        style={{
          fontFamily: 'Outfit, var(--mantine-font-family)',
          fontWeight: 500,
          fontSize: rem(32),
          color: 'var(--mantine-color-white)',
        }}
        hiddenFrom="sm"
      >
        Something bad just happened...
      </Title>

      <Text 
        size="lg" 
        style={{
          maxWidth: rem(540),
          margin: 'auto',
          marginTop: 'var(--mantine-spacing-xl)',
          marginBottom: `calc(var(--mantine-spacing-xl) * 1.5)`,
          color: 'var(--mantine-color-green-1)',
        }}
      >
        Our servers could not handle your request. Don't worry, our development team was
        already notified. Try refreshing the page.
      </Text>

      <Group justify="center">
        <Button 
          variant="white" 
          size="md"
          component={Link}
          to="/admin/home"
        >
          Return to Home
        </Button>
        <Button 
          variant="outline" 
          color="white"
          size="md"
          onClick={() => window.location.reload()}
        >
          Refresh the page
        </Button>
      </Group>
    </Container>
  );
};

export default ServerError;