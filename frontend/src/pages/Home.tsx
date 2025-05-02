import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  List,
  Paper,
  ThemeIcon,
  Badge,
  Image,
  rem
} from '@mantine/core';
import { PiCheckBold, PiChartLineBold, PiBellRingingBold, PiArrowsClockwiseBold, PiPackageBold } from "react-icons/pi";
import classes from '../style/Home.module.css';
import ContactSection from "../components/ContactSection";
import { Footer } from "../components/Footer.tsx";

const Home = () => {
  return (
    <>
    <Container size="lg" py="xl">
      <div className={classes.inner}>
        <div className={classes.content}>
          <Badge variant="filled" size="lg" className={classes.badge}>
            Inventory Intelligence
          </Badge>

          <Title className={classes.title}>
            Transform your <span className={classes.highlight}>supply chain</span> with
            <br />AI-powered optimization
          </Title>

          <Text
            c="dimmed"
            mt="md"
            size="lg"
            style={{ alignItems: 'flex-start', textAlign: 'left' }}>
            Stockly helps businesses reduce inventory costs by up to 30% while improving
            availability through predictive analytics and smart automation.
          </Text>

          <List
            mt={30}
            spacing="sm"
            size="lg"
            style={{ alignItems: 'flex-start', textAlign: 'left' }}
            icon={
              <ThemeIcon size={24} radius="xl" color="#fcc419">
                <PiCheckBold size={16} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Real-time visibility</b> – Track inventory across all locations and channels
            </List.Item>
            <List.Item>
              <b>Predictive analytics</b> – Forecast demand with 95% accuracy
            </List.Item>
            <List.Item>
              <b>Automated replenishment</b> – Never miss a sale due to stockouts
            </List.Item>
          </List>

          <Group mt={40}>
            <Button
              component={Link}
              to="/login"
              size="md"
              radius="md"
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/admin/orders"
              variant="outline"
              size="md"
              radius="md"
              leftSection={<PiPackageBold />}
            >
              View Orders
            </Button>
          </Group>
        </div>
        <Image className={classes.image} />
      </div>

      {/* Features Section */}
      <Title order={2} ta="center" mt={rem(80)} mb="lg">
        Powerful Features for <Text span c="limegreen" inherit>Smart Inventory</Text>
      </Title>

      <Group mt={rem(40)} grow>
        <Paper shadow="md" p="xl" radius="md" withBorder className={classes.featureCard}>
          <ThemeIcon size={60} radius="md" mb="md" color="#fcc419">
            <PiChartLineBold size={30} />
          </ThemeIcon>
          <Title order={3} mb="sm">Demand Forecasting</Title>
          <Text>AI-powered predictions to optimize stock levels and reduce waste</Text>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder className={classes.featureCard}>
          <ThemeIcon size={60} radius="md" mb="md" color="#fcc419">
            <PiBellRingingBold size={30} />
          </ThemeIcon>
          <Title order={3} mb="sm">Smart Alerts</Title>
          <Text>Automated notifications for low stock, excess inventory, and anomalies</Text>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder className={classes.featureCard}>
          <ThemeIcon size={60} radius="md" mb="md" color="#fcc419">
            <PiArrowsClockwiseBold size={30} />
          </ThemeIcon>
          <Title order={3} mb="sm">Automated Replenishment</Title>
          <Text>Set rules for automatic purchase orders when stock reaches threshold</Text>
        </Paper>
      </Group>
      <ContactSection />
    </Container>
      <Footer />
    </>
  );
};

export default Home;