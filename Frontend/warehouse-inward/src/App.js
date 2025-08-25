import './App.css';
import Navbar from './components/navbar';
import Product from './components/Products/product'; 
import Vendor from './components/Vendors/vendor'; 
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<h1>Home Page</h1>}></Route>
        <Route path='/products' element={<Product/>}></Route>
        <Route path='/vendor' element={<Vendor/>}></Route>
        <Route path='/POs' element={<h1>Purchase Orders</h1>}></Route>
        <Route path='/POItems' element={<h1>Purchase Order Items</h1>}></Route>
      </Routes>
    </div>
  );
}

export default App;
