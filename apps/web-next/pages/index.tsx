import type { NextPage } from "next";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  MeDocument,
  MeQuery,
  useUsersQuery,
  useWeb3LoginRegisterMutation,
} from "../generated/graphql";
import useWeb3Modal from "../web3/useWeb3Modal";

const Index: NextPage = () => {
  const { data } = useUsersQuery({ fetchPolicy: "network-only" });
  const { provider, loadWeb3Modal, logoutOfWeb3Modal } = useWeb3Modal();
  const [web3Login] = useWeb3LoginRegisterMutation();

  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  const signMessage = async () => {
    if (!provider) {
      return;
    }

    try {
      const accounts = await provider.listAccounts();
      const address = accounts[0];

      const signer = provider.getSigner(accounts[0]);
      console.log({ signer });

      const resp = await fetch(
        `http://localhost:4000/sign_message?address=${address}`
      );
      const { jwt: message } = await resp.json();

      const signature = await signer.signMessage(message);

      console.log({ signature });

      const res = await web3Login({
        variables: {
          address,
          signature,
        },
        update: (store, { data }) => {
          if (!data) return null;
          store.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              __typename: "Query",
              me: data.web3LoginRegister.user,
            },
          });
          return;
        },
      });

      console.log({ res });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);
        console.log({ accounts });

        // Resolve the ENS name for the first account.
        const name = await provider.lookupAddress(accounts[0]);
        console.log({ name });

        const bal = await provider.getBalance(accounts[0]);
        console.log({ bal: ethers.utils.formatEther(bal) });

        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    };
    fetchAccount();
  }, [account, provider]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div>Users:</div>
      <ul>
        {data.users.map((user) => (
          <li key={user.id}>
            {user.email}, {user.id}
          </li>
        ))}
      </ul>

      <br />
      <br />
      <br />

      <button
        onClick={() => {
          // if (!loadWeb3Modal || !logoutOfWeb3Modal) return;
          if (!provider) {
            loadWeb3Modal!();
          } else {
            logoutOfWeb3Modal!();
          }
        }}
      >
        {rendered.length ? rendered : "Sign-In with Ethereum"}
      </button>

      <br />
      <br />
      <br />

      <button onClick={signMessage}>Sign a message</button>
    </div>
  );
};

export default Index;
