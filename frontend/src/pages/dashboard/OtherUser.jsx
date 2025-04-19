"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, AlertCircle, UserIcon, ChevronDown, ChevronUp } from "lucide-react"
import axios from "axios"
import { USER_API_END_POINT } from "@/utils/constants"

function OtherUser() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedDescriptions, setExpandedDescriptions] = useState({})

  useEffect(() => {
    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${USER_API_END_POINT}/other-users`, {
          withCredentials: true,
        })
        console.log("Fetched users:", res.data)
        const fetchedUsers = res.data.data.users || []
        setUsers(fetchedUsers)
        setFilteredUsers(fetchedUsers)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch users")
      } finally {
        setLoading(false)
      }
    }

    fetchOtherUsers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = users.filter(
      (user) =>
        (user.fullName && user.fullName.toLowerCase().includes(term)) ||
        (user.username && user.username.toLowerCase().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.companyName && user.companyName.toLowerCase().includes(term)) ||
        (user.description && user.description.toLowerCase().includes(term)),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const toggleDescription = (userId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // Function to check if description is long enough to need expansion
  const isLongDescription = (description) => {
    return description && description.length > 120
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by name, username, email, or company..."
            className="pl-10 pr-4 py-2 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                <div className="absolute -bottom-12 left-6">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                    <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.fullName} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xl font-semibold">
                      {user.fullName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <CardContent className="pt-16 pb-6 px-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold truncate group-hover:text-emerald-600 transition-colors">
                      {user.fullName || "Anonymous User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                      <span className="font-medium text-muted-foreground">Email</span>
                      <span className="truncate max-w-[180px]">{user.email}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-border/30 pb-2">
                      <span className="font-medium text-muted-foreground">Phone No</span>
                      <span className="truncate max-w-[180px]">{user.phoneNo}</span>
                    </div>

                    {user.companyName && (
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="font-medium text-muted-foreground">Company</span>
                        <span className="truncate max-w-[180px] text-emerald-600 font-medium">{user.companyName}</span>
                      </div>
                    )}
                  </div>

                  {user.description && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                          About
                        </h4>
                        {isLongDescription(user.description) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                            onClick={() => toggleDescription(user._id)}
                          >
                            {expandedDescriptions[user._id] ? (
                              <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Read more
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <div
                        className={`text-sm text-muted-foreground ${expandedDescriptions[user._id] ? "" : "line-clamp-3"}`}
                      >
                        {user.description}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg text-center">
          <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}

export default OtherUser
