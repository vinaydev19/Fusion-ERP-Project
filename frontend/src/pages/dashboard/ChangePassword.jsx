import { USER_API_END_POINT } from "@/utils/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/commen/Loading";
import { Eye, EyeOff } from "lucide-react";



function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const ChangePasswordFormHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    console.table([oldPassword, password, confirmPassword])

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/change-password`,
        {
          oldPassword,
          newPassword: password,
          confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setIsLoading(false);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-5 h-screen w-full">
      <div className="flex flex-col justify-center items-center gap-2">
        <h1 className="font-bold text-3xl">Change Your Password</h1>
      </div>
      <form onSubmit={ChangePasswordFormHandle} className="flex border-2 p-5  rounded-xl flex-col gap-5 w-3/4 md:w-[35%]">
        {/* Old Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="oldPassword">Old Password</label>
          <div className="relative">
            <input
              type={showOldPassword ? "text" : "password"}
              placeholder="Enter your Old Password"
              required
              className="outline-none rounded-xl px-3 py-2 road border-2 w-full"
              id="oldPassword"
              name="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-3 cursor-pointer text-sm text-blue-700"
            >
              {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>
        {/* New Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="Password">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              required
              className="outline-none rounded-xl px-3 py-2 road border-2 w-full"
              id="Password"
              name="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-3 cursor-pointer text-sm text-blue-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>
        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your Confirm Password"
              required
              className="outline-none rounded-xl px-3 py-2 road border-2 w-full"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-3 cursor-pointer text-sm text-blue-700"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>
        {isLoading ? (
          <button
            disabled
            className="flex hover:cursor-pointer justify-center items-center gap-2 bg-blue-700 p-3 text-white rounded-xl"
          >
            <Loading color="#000" />
          </button>
        ) : (
          <button className="flex hover:cursor-pointer justify-center items-center gap-2 bg-blue-700 p-3 text-white rounded-xl">
            Change Password
          </button>
        )}
      </form>
    </div>
  );
}

export default ChangePassword;
