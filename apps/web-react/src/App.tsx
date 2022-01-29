import { FC } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App: FC = () => {
  return (
    <BrowserRouter>
      <div>
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

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
