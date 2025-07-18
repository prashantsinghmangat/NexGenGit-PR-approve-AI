import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  return (
    <SessionProvider
      session={pageProps.session}
      refetchOnWindowFocus={router.pathname === '/dashboard'}
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp; 