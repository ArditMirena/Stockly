import { Container } from "@mantine/core";
import { StatsRing } from "../../components/StatsRing";


const AdminHome = () => {
  return (
    <>
    <Container size='lg'>
      <h2 style={{textAlign: 'start'}}>Welcome to admin home page!</h2>
      <StatsRing />
    </Container>
    </>
  )
}

export default AdminHome;