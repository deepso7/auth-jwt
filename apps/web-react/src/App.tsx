import { useHelloQuery } from "./generated/graphql";

const App = () => {
  const { data, loading } = useHelloQuery();

  if (loading || !data) return <div>Loading...</div>;

  return <div>{data.hello}</div>;
};

export default App;
