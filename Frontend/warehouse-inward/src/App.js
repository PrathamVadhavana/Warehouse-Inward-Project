import "./App.css";
import Navbar from "./components/navbar";
import Product from "./components/Products/product";
import Vendor from "./components/Vendors/product";
import PO from "./components/PO/po";
import POItems from "./components/PO/POItems/poItems";
import GRN from "./components/GRN/grn";
import { Route, Routes } from "react-router-dom";
import GRNItems from "./components/GRN/GRNItems/grnItems";
import PI from "./components/PI/pi";
import PIItems from "./components/PI/PIItems/piItems";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>}></Route>
        <Route path="/products" element={<Product />}></Route>
        <Route path="/vendor" element={<Vendor />}></Route>
        <Route path="/POs" element={<PO />}></Route>
        <Route path="/POItems" element={<POItems />}></Route>
        <Route path="/GRNs" element={<GRN />}></Route>
        <Route path="/GRNItems" element={<GRNItems />}></Route>
        <Route path="/PIs" element={<PI />}></Route>
        <Route path="/PIItems" element={<PIItems />}></Route>
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* <CustomToast /> */}
    </div>
  );
}

export default App;
