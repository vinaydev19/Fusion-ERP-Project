import "./App.css";
import Sidebar from "./components/commen/Sidebar";
import Body from "./pages/Body";
import toast, { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Body />
        <Toaster />
      </div>
    </>
  );
}

export default App;
