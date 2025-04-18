"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { USER_API_END_POINT } from "@/utils/constants"
import useGetMyProfile from "@/hooks/useGetMyProfile"
import avatarImg from "../../assets/avatar.jpeg"
import Loading from "../../components/commen/Loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const { user, profile } = useSelector((store) => store.user)
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [profilePic, setProfilePic] = useState("")

  useGetMyProfile()

  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNo: "",
    companyName: "",
    description: "",
    profilePic: avatarImg,
  })

  useEffect(() => {
    if (profile) {
      setProfileData({
        fullName: profile.fullName || "",
        username: profile.username || "",
        email: profile.email || "",
        phoneNo: profile.phoneNo || "",
        companyName: profile.companyName || "",
        description: profile.description || "",
        profilePic: profile.profilePic || avatarImg,
      })
    }
  }, [profile])

  // Handle Input Change
  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const updateUserAccountDetailsFormHandle = async () => {
    setIsLoading(true)

    try {
      const res = await axios.patch(
        `${USER_API_END_POINT}/update-account-details`,
        {
          fullName: profileData.fullName,
          username: profileData.username,
          phoneNo: profileData.phoneNo,
          companyName: profileData.companyName,
          description: profileData.description,
        },
        { withCredentials: true },
      )
      console.log(res)
      toast.success(res.data.message)
      setIsEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfilePicHandle = async (e) => {
    e.preventDefault()

    if (!profilePic) {
      toast.error("Please select an image")
      return
    }

    setIsLoading(true)

    try {
      const res = await axios.patch(
        `${USER_API_END_POINT}/update-profilepic`,
        { profilePic },
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      )

      toast.success(res.data.message)
      console.log(res)

      // Update UI with new profile pic
      setProfileData((prevData) => ({
        ...prevData,
        profilePic: URL.createObjectURL(profilePic),
      }))
      setOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile picture")
      console.error("Error updating profile picture:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle Edit Mode
  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-slate-50 py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-slate-800">My Profile</h1>

      <Card className="w-full max-w-3xl shadow-xl">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative mb-6 group">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary shadow-md">
                <img
                  className="w-full h-full object-cover"
                  src={profileData.profilePic || "/placeholder.svg"}
                  alt="Profile"
                  onClick={handleClickOpen}
                />
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                onClick={handleClickOpen}
              >
                <span className="text-white text-sm font-medium">Change</span>
              </div>
            </div>

            {/* Profile Picture Update Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4 py-4">
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Choose File
                  </Label>
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files[0])}
                  />
                  {profilePic && <span className="text-sm text-muted-foreground">{profilePic.name}</span>}
                </div>
                <DialogFooter className="sm:justify-between">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={updateUserProfilePicHandle} disabled={isLoading}>
                    {isLoading ? <Loading color="#fff" /> : "Update"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Profile Info */}
            <form className="w-full space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={isEditing ? "border-primary" : "bg-slate-100"}
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={isEditing ? "border-primary" : "bg-slate-100"}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    readOnly={true}
                    className="bg-slate-100"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNo" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNo"
                    type="tel"
                    name="phoneNo"
                    value={profileData.phoneNo}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={isEditing ? "border-primary" : "bg-slate-100"}
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={profileData.companyName}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={isEditing ? "border-primary" : "bg-slate-100"}
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={profileData.description}
                    onChange={handleChange}
                    readOnly={!isEditing}
                    className={`min-h-[100px] ${isEditing ? "border-primary" : "bg-slate-100"}`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center sm:justify-end gap-4 mt-8">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setIsEditing(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={updateUserAccountDetailsFormHandle}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? <Loading color="#fff" /> : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={toggleEdit} className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
