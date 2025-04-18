import React, { useRef, useState } from "react";
import logo from "../assets/logo.jpg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { USER_API_END_POINT } from "../utils/constants";
import Loading from "../components/commen/Loading";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerFormHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/register`,
        {
          fullName,
          username,
          email,
          phoneNo,
          companyName,
          password,
          confirmPassword,
          profilePic,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      console.log(res);
      navigate("/register/user-verification");
      setIsLoading(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(`error on register page || ${error}`);
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
          <p className="text-gray-500">Enter your details to get started</p>
        </div>

        <form onSubmit={registerFormHandle} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john123"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9876543210"
              max={10}
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC Corp"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="outline-none rounded-xl px-3 py-2 border-2 pr-10"
              placeholder="Enter your Password"
              required
              id="password"
              name="password"
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-2 relative">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="outline-none rounded-xl px-3 py-2 border-2 pr-10"
              placeholder="Enter your Confirm Password"
              required
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Profile Picture */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="w-full p-2 border rounded-lg bg-white"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 ${isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 cursor-pointer hover:bg-blue-700"
                }`}
            >
              {isLoading ? (
                <div className="flex justify-center items-center gap-2">
                  <Loading color="#fff" />
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        <div className="text-center pt-3 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
