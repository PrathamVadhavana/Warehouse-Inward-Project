import './App.css';
import Navbar from './components/navbar';
import Product from './components/Products/product'; 
import Vendor from './components/Vendors/vendor'; 
import PO from './components/PO/po';
import POItems from './components/PO/POItems/poItems';

import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<h1>Home Page</h1>}></Route>
        <Route path='/products' element={<Product/>}></Route>
        <Route path='/vendor' element={<Vendor/>}></Route>
        <Route path='/POs' element={<PO/>}></Route>
        <Route path='/POItems' element={<POItems/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
