import { FC } from "react";
import { useByeQuery } from "../generated/graphql";

interface ByeProps {}

const Bye: FC<ByeProps> = ({}) => {
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
