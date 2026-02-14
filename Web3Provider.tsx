import React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base, polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, base, polygon],
  connectors: [
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};