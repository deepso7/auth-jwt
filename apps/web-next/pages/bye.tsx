import type { NextPage } from "next";
import { useByeQuery } from "../generated/graphql";

const Bye: NextPage = () => {
  const { data, loading, error } = useByeQuery({ fetchPolicy: "network-only" });

  if (loading) return <div>Loding...</div>;

  if (error) {
    console.error(error);
    return <div>Error</div>;
  }

  if (!data) return <div>No Data</div>;

  return <div>{data.bye}</div>;
};

export default Bye;
