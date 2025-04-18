import { getUser } from "../redux/userSlice";
import Loading from "../components/commen/Loading";
import { USER_API_END_POINT } from "../utils/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";



function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const loginFormHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(res);
      navigate("/dashboard");
      setIsLoading(false);
      dispatch(getUser(res.data.data));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(`error on register page || ${error}`);
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Sign in to your account to continue
        </p>
        <form onSubmit={loginFormHandle} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              className="px-4 py-2 border-2 rounded-xl focus:outline-none focus:border-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-gray-700 font-medium">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter your password"
              required
              className="px-4 py-2 pr-12 border-2 rounded-xl focus:outline-none focus:border-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Links */}
          <div className="flex justify-between text-sm text-blue-700">
            <Link to="/email-verification" className="hover:underline">
              Email Verify?
            </Link>
            <Link to="/reset-password-verification" className="hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          {isLoading ? (
            <button
              type="button"
              disabled
              className="flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded-xl"
            >
              <Loading color="#fff" />
            </button>
          ) : (
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition-all"
            >
              Login
            </button>
          )}
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-700 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
