import { USER_API_END_POINT } from "@/utils/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/commen/Loading";


function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      console.log(res);
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
    <div className="flex flex-col justify-center items-center gap-5 h-screen w-full">
      <div className="flex flex-col justify-center items-center gap-2">
        <h1 className="font-bold text-3xl">Change Your Password</h1>
      </div>
      <form onSubmit={ChangePasswordFormHandle} className="flex border-2 p-5  rounded-xl flex-col gap-5 w-3/4 md:w-[35%]">
        <div className="flex flex-col gap-2">
          <label htmlFor="oldPassword">Old Password</label>
          <input
            type="password"
            placeholder="Enter your Old Password"
            required
            className="outline-none rounded-xl px-3 py-2 road border-2"
            id="oldPassword"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          ></input>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="Password">Password</label>
          <input
            type="password"
            placeholder="Enter your Password"
            required
            className="outline-none rounded-xl px-3 py-2 road border-2"
            id="Password"
            name="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            placeholder="Enter your Confirm Password"
            required
            className="outline-none rounded-xl px-3 py-2 road border-2"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          ></input>
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
