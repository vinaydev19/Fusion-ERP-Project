import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios"; 
import { USER_API_END_POINT } from "@/utils/constants";

function OtherUser() {
  const [users, setUsers] = useState([]); // <--- you forgot this
  const [loading, setLoading] = useState(true); // optional: show loading spinner
  const [error, setError] = useState(null); // optional: show error message

  useEffect(() => {
    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/other-users`, {
          withCredentials: true,
        });
        console.log("Fetched users:", res.data);
        setUsers(res.data.data.users || []); // if backend sends { users: [...] }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUsers();
  }, []);

  if (loading) return <p className="text-center w-full col-span-3">Loading...</p>;
  if (error) return <p className="text-center w-full col-span-3">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {users.length > 0 ? (
        users.map((user) => (
          <Card key={user._id} className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.profilePic} alt={user.fullName} />
                <AvatarFallback>{user.fullName[0]}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-center mt-4">{user.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600">@{user.username}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm font-semibold mt-2">{user.companyName}</p>
              {user.isVerified && (
                <p className="text-green-500 text-xs font-semibold mt-1">Verified ✔️</p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center w-full col-span-3">No other users found.</p>
      )}
    </div>
  );
}

export default OtherUser;
