import { USER_API_END_POINT } from "@/utils/constants";
import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/commen/Loading";


function ChangeEmail() {
  const [email, setEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const changeEmailVerifyFormHandle = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/update-email-address-verification`,
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
      navigate("/dashboard/change-email/change-email-verification");
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
        <h1 className="font-bold text-3xl">Change Your Email Address</h1>
        <p className="text-[#372929]">
          Enter your new email address below to update your account. We'll send
          a verification code to your new email to confirm the change.
        </p>
        <h1 className="">Important Notes:</h1>

        <ul className="list-disc text-[#372929]">
          <li>Make sure you enter a valid and accessible email.</li>
          <li>Check your spam or junk folder if you don’t receive the code.</li>
          <li>
            You’ll need to verify your new email before the update is complete.
          </li>
        </ul>
      </div>
      <form
        onSubmit={changeEmailVerifyFormHandle}
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
            Change Email
          </button>
        )}
      </form>
    </div>
  );
}

export default ChangeEmail;
