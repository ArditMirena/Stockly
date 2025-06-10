import {PiFactoryBold, PiPackageBold, PiUsersBold, PiWarehouseBold, PiHandbagBold} from 'react-icons/pi';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text, Box, ThemeIcon, Transition, Skeleton } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useGetProductsCountQuery } from '../api/productsApi';
import { useGetCompaniesCountQuery } from '../api/companiesApi';
import { useGetOrdersCountQuery } from '../api/ordersApi';
import { useGetWarehousesCountQuery } from '../api/warehousesApi';
import { useGetUsersCountQuery } from '../api/UsersApi';

const icons = {
  us: PiUsersBold,
  cm: PiFactoryBold,
  wh: PiWarehouseBold,
  or: PiPackageBold,
  pd: PiHandbagBold
};

const colorSchemes = {
  yellow: { primary: '#fab005', light: '#fff3bf', gradient: 'linear-gradient(135deg, #fab005 0%, #fd7e14 100%)' },
  green: { primary: '#51cf66', light: '#d3f9d8', gradient: 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)' },
  blue: { primary: '#339af0', light: '#d0ebff', gradient: 'linear-gradient(135deg, #339af0 0%, #1971c2 100%)' },
  red: { primary: '#ff6b6b', light: '#ffe0e0', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #e03131 100%)' },
  orange: { primary: '#ff922b', light: '#ffe8cc', gradient: 'linear-gradient(135deg, #ff922b 0%, #fd7e14 100%)' },
};

export function StatsRing() {
  const { data: productCount = 0, isLoading: productsLoading } = useGetProductsCountQuery();
  const { data: companiesCount = 0, isLoading: companiesLoading } = useGetCompaniesCountQuery();
  const { data: ordersCount = 0, isLoading: ordersLoading } = useGetOrdersCountQuery();
  const { data: warehousesCount = 0, isLoading: warehousesLoading } = useGetWarehousesCountQuery();
  const { data: usersCount = 0, isLoading: usersLoading } = useGetUsersCountQuery();

  const isLoading = productsLoading || companiesLoading || ordersLoading || warehousesLoading || usersLoading;

  const baseData = [
    { label: 'Users', stats: usersCount, color: 'yellow', icon: 'us', description: 'Active users' },
    { label: 'Products', stats: productCount, color: 'green', icon: 'pd', description: 'Total products' },
    { label: 'Companies', stats: companiesCount, color: 'blue', icon: 'cm', description: 'Partner companies' },
    { label: 'Orders', stats: ordersCount, color: 'red', icon: 'or', description: 'Total orders' },
    { label: 'Warehouses', stats: warehousesCount, color: 'orange', icon: 'wh', description: 'Storage locations' },
  ] as const;

  const [animatedStats, setAnimatedStats] = useState<number[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const maxCount = Math.max(...baseData.map((s) => s.stats), 1);
    const duration = 2000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing function for smoother animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      const stats = baseData.map((stat) => Math.floor(stat.stats * easeOutCubic));
      const progressValues = baseData.map((stat) => {
        const percent = Math.min((stat.stats / maxCount) * 100, 100);
        return percent * easeOutCubic;
      });

      setAnimatedStats(stats);
      setAnimatedProgress(progressValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [productCount, usersCount, companiesCount, ordersCount, warehousesCount, isLoading]);

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing="lg">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={120} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  const stats = baseData.map((stat, index) => {
    const Icon = icons[stat.icon];
    const displayedStat = animatedStats[index]?.toLocaleString() ?? '0';
    const progress = animatedProgress[index] ?? 0;
    const colorScheme = colorSchemes[stat.color];

    return (
      <Transition
        key={stat.label}
        mounted={mounted}
        transition="slide-up"
        duration={400}
        timingFunction="ease"
        exitDuration={200}
      >
        {(styles) => (
          <Paper 
            withBorder 
            radius="lg" 
            p="lg" 
            style={{
              ...styles,
              background: `linear-gradient(135deg, ${colorScheme.light} 0%, white 100%)`,
              border: `1px solid ${colorScheme.primary}20`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 25px ${colorScheme.primary}25`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Background decoration */}
            <Box
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `${colorScheme.primary}10`,
                zIndex: 0
              }}
            />
            
            <Group style={{ position: 'relative', zIndex: 1 }}>
              <Box style={{ position: 'relative' }}>
                <RingProgress
                  size={90}
                  roundCaps
                  thickness={6}
                  sections={[{ 
                    value: progress, 
                    color: colorScheme.primary 
                  }]}
                  label={
                    <Center>
                      <ThemeIcon
                        size={36}
                        radius="xl"
                        variant="gradient"
                        gradient={{ from: colorScheme.primary, to: colorScheme.primary, deg: 45 }}
                      >
                        <Icon size={20} />
                      </ThemeIcon>
                    </Center>
                  }
                />
                {/* Progress indicator */}
                <Text
                  size="xs"
                  c="dimmed"
                  ta="center"
                  mt={4}
                  fw={500}
                >
                  {Math.round(progress)}%
                </Text>
              </Box>
              
              <Box flex={1}>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700} mb={2}>
                  {stat.label}
                </Text>
                <Text 
                  fw={700} 
                  size="xl" 
                  mb={2}
                  style={{ 
                    color: colorScheme.primary,
                    fontSize: '1.5rem'
                  }}
                >
                  {displayedStat}
                </Text>
                <Text size="xs" c="dimmed">
                  {stat.description}
                </Text>
              </Box>
            </Group>
          </Paper>
        )}
      </Transition>
    );
  });

  return (
    <SimpleGrid 
      cols={{ base: 1, sm: 2, md: 3, lg: 5 }} 
      spacing="lg"
      style={{
        '--mantine-spacing-lg': '1.5rem'
      }}
    >
      {stats}
    </SimpleGrid>
  );
}
