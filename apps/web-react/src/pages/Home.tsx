import { ethers } from "ethers";
import { FC, useEffect, useState } from "react";
import { useUsersQuery } from "../generated/graphql";
import useWeb3Modal from "../web3/useWeb3Modal";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
  const { data } = useUsersQuery({ fetchPolicy: "network-only" });
  const { provider, loadWeb3Modal, logoutOfWeb3Modal } = useWeb3Modal();

  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

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

        const signer = provider.getSigner(accounts[0]);
        console.log({ signer });

        const signedMessage = await signer.signMessage("hello");
        console.log({ signedMessage });

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
        {data.users.map(user => (
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

      <h3>{}</h3>
    </div>
  );
};

export default Home;
