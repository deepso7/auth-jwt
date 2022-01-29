import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../generated/graphql";

interface RegisterProps {}

const Register: FC<RegisterProps> = ({}) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register] = useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password });
    const res = await register({
      variables: {
        email,
        password,
      },
    });

    console.log({ res });

    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="Email"
          onChange={e => {
            setEmail(e.target.value);
          }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          onChange={e => {
            setPassword(e.target.value);
          }}
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
