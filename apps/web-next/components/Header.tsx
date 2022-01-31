import { FC } from "react";
import Link from "next/link";
import { setAccessToken } from "../accessToken";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface HeaderProps {}

const Header: FC<HeaderProps> = ({}) => {
  const { data, loading } = useMeQuery();
  const [logout, { client }] = useLogoutMutation();

  return (
    <>
      <header>
        <div>
          <div>
            <Link href="/">Home</Link>
          </div>
          <div>
            <Link href="/register">Register</Link>
          </div>
          <div>
            <Link href="/login">Login</Link>
          </div>
          <div>
            <Link href="/bye">Bye</Link>
          </div>
          <div>
            {!loading && data?.me && (
              <button
                onClick={async () => {
                  await logout();
                  setAccessToken("");
                  await client.resetStore();
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
        {loading ? null : data?.me ? (
          <div>You are logged in as {data.me.address || data.me.email}</div>
        ) : (
          <div>not logged in</div>
        )}
      </header>
    </>
  );
};

export default Header;
