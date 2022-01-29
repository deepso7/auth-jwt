import { FC } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {}

const Header: FC<HeaderProps> = ({}) => {
  return (
    <>
      <header>
        <div>
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>
            <Link to="register">Register</Link>
          </div>
          <div>
            <Link to="login">Login</Link>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
