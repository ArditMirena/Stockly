import { Container, Text, Box, Group, Badge, Divider } from "@mantine/core";
import { StatsRing } from "../../components/StatsRing";
import { useState, useEffect } from "react";
import { PiShieldCheckBold, PiTrendUpBold } from "react-icons/pi";

const AdminHome = () => {
  const welcomeText = "Welcome to your admin dashboard!";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < welcomeText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + welcomeText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 80);

      return () => clearTimeout(timeout);
    } else {
      // Hide cursor after typing is complete
      const timeout = setTimeout(() => setShowCursor(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
      
      <Container size="xl" py="xl">
        {/* Header Section */}
        <Box mb="xl">
          <Group mb="md" gap="sm">
            <PiShieldCheckBold size={32} color="var(--mantine-color-blue-6)" />
            <Badge 
              variant="light" 
              color="blue" 
              size="lg"
              leftSection={<PiTrendUpBold size={14} />}
            >
              Admin Panel
            </Badge>
          </Group>
          
          <Text 
            size="2rem" 
            fw={700} 
            c="dark"
            style={{ 
              textAlign: 'start', 
              minHeight: '3rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(45deg, #228be6, #15aabf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {displayedText}
            {showCursor && currentIndex <= welcomeText.length && (
              <span 
                style={{ 
                  animation: 'blink 1s infinite',
                  marginLeft: '2px',
                  color: '#228be6'
                }}
              >
                |
              </span>
            )}
          </Text>
          
          <Text size="md" c="dimmed" mb="lg">
            Monitor your business metrics and manage your inventory system
          </Text>
          
          <Divider mb="xl" />
        </Box>

        {/* Stats Section */}
        <Box>
          <Group mb="lg" justify="space-between" align="center">
            <Text size="xl" fw={600} c="dark">
              Business Overview
            </Text>
            <Badge variant="dot" color="green" size="sm">
              Live Data
            </Badge>
          </Group>
          <StatsRing />
        </Box>
      </Container>
    </>
  );
};

export default AdminHome;
