import { FC, useEffect, useState } from "react";
import { setAccessToken } from "./accessToken";
import Router from "./Router";

const App: FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/refresh_token", {
          credentials: "include",
        });
        const { accessToken } = await res.json();
        setAccessToken(accessToken);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>loading...</div>;

  return (
    <>
      <Router />
    </>
  );
};

export default App;
