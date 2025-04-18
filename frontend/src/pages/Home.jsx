import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/commen/Sidebar";
import Navbar from "../components/commen/Navbar";
import { useSelector } from "react-redux";

function Home() {
  const { user } = useSelector((store) => store.user)
  const navigate = useNavigate()

  // const user = false;

  useEffect(() => {
    if (!user) {
      navigate("");
    }
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col shadow-lg">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className=" bg-white/90 backdrop-blur-md ">
          <Navbar />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Home;
