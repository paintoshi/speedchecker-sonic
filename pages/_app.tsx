import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import theme from '../config/theme'
import createEmotionCache from '../config/createEmotionCache'
import ReactGA from "react-ga4"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, WagmiProvider } from 'wagmi'
import { sonic } from 'viem/chains'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { AppKitNetwork } from '@reown/appkit/networks'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

// 1. Get projectId
const env = process.env
const projectId = env?.NEXT_PUBLIC_WC_ID || ''
const gaID = env?.NEXT_PUBLIC_GA_ID || ''

// 2. Create wagmiConfig
const metadata = {
  name: 'Sonic Speed Checker',
  description: 'Test and track transaction speeds on Sonic Network',
  url: 'https://speedchecker.paintswap.io',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [sonic]

const wagmiAdapter = new WagmiAdapter({
  transports: {
    [sonic.id]: http(),
  },
  // connectors,
  projectId,
  networks,
  ssr: true,
  pollingInterval: 250,
})

export const { wagmiConfig } = wagmiAdapter

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: undefined,
    onramp: true,
    swaps: true,
  },
  defaultNetwork: sonic,
  allowUnsupportedChain: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-z-index': 9999,
  },
  chainImages: {
    146: '/images/sonic.png',
  },
})

ReactGA.initialize(gaID)
const queryClient = new QueryClient()

export default function App(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
