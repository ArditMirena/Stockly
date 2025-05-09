import { Container, Text } from "@mantine/core";
import { StatsRing } from "../../components/StatsRing";
import { useState, useEffect } from "react";

const AdminHome = () => {
  const welcomeText = "Welcome to the admin home page!";
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < welcomeText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + welcomeText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <Container size="lg">
      <Text 
        size="xl" 
        fw={700} 
        style={{ 
          textAlign: 'start', 
          minHeight: '1.5em', 
          marginBottom: '1rem' 
        }}
      >
        {displayedText}
        {currentIndex < welcomeText.length && (
          <span style={{ 
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}>|</span>
        )}
      </Text>
      <StatsRing />
    </Container>
  );
};

export default AdminHome;