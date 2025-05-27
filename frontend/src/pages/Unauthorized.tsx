import { Center, Title, Text, Button } from '@mantine/core'
import { Link } from 'react-router-dom'

const Unauthorized: React.FC = () => {
  return (
    <Center
      style={{ flexDirection: 'column', height: '80vh', gap: 16 }}
    >
      <Title order={1} style={{ textAlign: 'center' }}>
        403 – Unauthorized
      </Title>

      <Text color="dimmed" style={{ textAlign: 'center', maxWidth: 360 }}>
        You do not have permission to view this page.
      </Text>

      <Button component={Link} to="/admin/home" size="md">
        Go to Home
      </Button>
    </Center>
  )
}

export default Unauthorized
