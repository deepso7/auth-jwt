import React from "react";
import ReactDOM from "react-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";
import App from "./App";
import { getAccessToken, setAccessToken } from "./accessToken";

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// If the token is expired, we want to refresh it
const refreshlink = new TokenRefreshLink({
  accessTokenField: "accessToken",
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();
    if (!token) return true;

    try {
      const { exp } = jwtDecode<any>(token);
      if (Date.now() >= exp * 1000) return false;
      return true;
    } catch (err) {
      return false;
    }
  },
  fetchAccessToken: (): Promise<Response> => {
    return fetch("http://localhost:4000/refresh_token", {
      credentials: "include",
    });
  },
  handleFetch: (accessToken: string) => setAccessToken(accessToken),
  // handleResponse? : (operation: Operation, accessTokenField) => {} // we can parse the response and handle it accordingly,
  handleError: (err: Error) => {
    console.error({ msg: err.message });
    console.warn("Your refresh token is invalid. Try to relogin");
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([refreshlink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
