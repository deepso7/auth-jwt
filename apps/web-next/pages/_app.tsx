import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "../ApolloClient";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Header />
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp;
