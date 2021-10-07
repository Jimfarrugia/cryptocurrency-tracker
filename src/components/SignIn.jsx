import { useRef, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SignIn = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/");
    } catch (e) {
      e.code === "auth/wrong-password"
        ? setError("Password is incorrect.")
        : e.code === "auth/user-not-found"
        ? setError("Could not find a user with that email address.")
        : setError("Sign in failed. Please try again.");
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleLoginWithGoogle = async () => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      history.push("/");
    } catch {
      setError("Sign in failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <h2>Sign In</h2>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <p>
          <label htmlFor="email">Email</label>
          <br />
          <input type="email" id="email" ref={emailRef} required />
        </p>
        <p>
          <label htmlFor="password">Password</label>
          <br />
          <input type="password" id="password" ref={passwordRef} required />
        </p>
        <p>
          <button type="submit" disabled={isLoading}>
            Sign In
          </button>
        </p>
      </form>
      <p>
        <button
          type="button"
          disabled={isLoading}
          onClick={handleLoginWithGoogle}
        >
          Sign In with Google
        </button>
      </p>
      <p>
        <Link to="/reset-password">Forgot Password</Link>
      </p>
      <p>
        Need an account? <Link to="/sign-up">Sign Up</Link>
      </p>
    </>
  );
};

export default SignIn;
