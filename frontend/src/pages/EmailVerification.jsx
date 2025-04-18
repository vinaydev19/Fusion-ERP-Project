import Loading from "../components/commen/Loading";
import { USER_API_END_POINT } from "../utils/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

function EmailVerification() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailVerifyFormHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/verify-email`,
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
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
    <div className="flex flex-col justify-center items-center gap-5 h-screen w-full">
      <div className="flex flex-col justify-center items-center gap-2">
        <h1 className="font-bold text-3xl">Verify Your Email</h1>
        <p className="text-[#372929]">
          It looks like you haven't verified your email yet. Please enter your
          email below, and we'll send you a new verification code.
        </p>
        <h1 className="">Didn’t receive the email?</h1>
        <p className="text-[#372929]">
          Check your spam folder or request a new one.
        </p>
      </div>
      <form
        onSubmit={emailVerifyFormHandle}
        className="flex border-2 p-5  rounded-xl flex-col gap-5 w-3/4 md:w-[35%]"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="Email">Email</label>
          <input
            type="text"
            placeholder="Enter your Email"
            required
            className="outline-none rounded-xl px-3 py-2 road border-2"
            id="Email"
            name="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Verify Email
          </button>
        )}
      </form>
      <div className="flex gap-1 pb-5">
        <p>Already have an account?</p>
        <Link to="/login" className="text-blue-700 hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
}

export default EmailVerification;
