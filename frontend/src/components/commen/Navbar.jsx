import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {Menu, User, LogOut, Settings, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import avatarImg from "../../assets/avatar.jpeg";
import useGetMyProfile from "@/hooks/useGetMyProfile"
import { useDispatch, useSelector } from "react-redux"
import { getMyProfile, getUser } from "@/redux/userSlice"
import toast from "react-hot-toast"
import { USER_API_END_POINT } from "@/utils/constants"
import axios from "axios"

const Navbar = ({ toggleSidebar }) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { user, profile } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  useGetMyProfile();

  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNo: "",
    companyName: "",
    description: "", // Added description field
    profilePic: avatarImg,
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || "",
        username: profile.username || "",
        email: profile.email || "",
        phoneNo: profile.phoneNo || "",
        companyName: profile.companyName || "",
        description: profile.description || "", // Added description field
        profilePic: profile.profilePic || avatarImg,
      });
    }
  }, [profile]);

  const logoutBtn = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token"); // Get token from storage
      const res = await axios.post(
        `${USER_API_END_POINT}/logout`,
        {}, // No body needed
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
          withCredentials: true, // Include cookies if using cookie-based auth
        }
      );

      localStorage.removeItem("token"); // Remove token after logout
      navigate("/login");
      dispatch(getUser(null));
      dispatch(getMyProfile(null));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-gray-900 px-4 shadow-md">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-white hover:bg-gray-800">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        <h1 className="text-xl font-semibold text-white">
          <Link to="/dashboard" className="hover:text-gray-200 transition">
            Dashboard Overview
          </Link>
        </h1>
      </div>


      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 border border-gray-700">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileData.profilePic || "/placeholder.svg"} />
                <AvatarFallback className="bg-gray-700 text-white">{profileData.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-gray-900 text-white border-gray-800">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profileData.fullName}</p>
                <p className="text-xs text-gray-400">{profileData.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <Link to="profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <Link to="change-password">Change Password</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
              <Mail className="mr-2 h-4 w-4" />
              <Link to="change-email">Change Email</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-gray-800 cursor-pointer"
              onClick={logoutBtn}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? (
                <div className="flex items-center">
                  <Skeleton className="h-4 w-16 bg-gray-700" />
                </div>
              ) : (
                "Logout"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Navbar
