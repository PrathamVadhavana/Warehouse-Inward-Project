import React from 'react';
import {Link} from 'react-router-dom';

const navbar = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg data-bs-theme='light'" style={{backgroundColor: "#e3f2fd"}}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">Medkart</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="/navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">Home</Link>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Masters
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/products">Product</Link></li>
                  <li><Link className="dropdown-item" to="/vendor">Vendor</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  PO
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/POs">POs</Link></li>
                  <li><Link className="dropdown-item" to="/POItems">PO Items</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  GRN
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/GRNs">GRNs</Link></li>
                  <li><Link className="dropdown-item" to="/GRNItems">GRN Items</Link></li>
                </ul>
              </li>
              <li className="nav-item dropdown">
                <Link className="nav-link dropdown-toggle" to="/" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  PI
                </Link>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/PIs">PIs</Link></li>
                  <li><Link className="dropdown-item" to="/PIItems">PI Items</Link></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default navbar;
