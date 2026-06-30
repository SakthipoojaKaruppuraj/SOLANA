import React, { useMemo, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { config } from "./config";
import { Header } from "./components/layout/Header";
import { Navigation } from "./components/layout/Navigation";
import { Footer } from "./components/layout/Footer";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SkeletonCard } from "./components/common/SkeletonLoaders";

// Pages (Lazy Loaded)
const SwapPage = lazy(() => import("./pages/SwapPage"));
const LiquidityPage = lazy(() => import("./pages/LiquidityPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const DevToolsPage = lazy(() => import("./pages/DevToolsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const queryClient = new QueryClient();

export const App: React.FC = () => {
  // Configured devnet / localnet endpoint
  const endpoint = config.solanaRpcUrl;

  // Wallet adapters supported
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ErrorBoundary>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <div className="min-h-screen flex flex-col bg-bg-page">
                  {/* Header */}
                  <Header />

                  {/* Body Layout */}
                  <div className="flex-1 flex flex-col lg:flex-row pb-16 lg:pb-0">
                    {/* Navigation */}
                    <Navigation />

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col overflow-y-auto">
                      <Suspense
                        fallback={
                          <div className="flex-1 flex items-center justify-center p-8 max-w-md mx-auto w-full">
                            <SkeletonCard className="w-full" />
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/" element={<SwapPage />} />
                          <Route path="/liquidity" element={<LiquidityPage />} />
                          <Route path="/analytics" element={<AnalyticsPage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/dev" element={<DevToolsPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </main>
                  </div>

                  {/* Footer */}
                  <Footer />
                </div>
              </BrowserRouter>
            </QueryClientProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
};

export default App;
