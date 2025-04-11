import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      theme={{
        fontFamily: 'Inter, sans-serif',
        primaryColor: 'green',
      }}
    >
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>
);
