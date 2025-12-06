import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import 'leaflet/dist/leaflet.css'; // ✅ Add this line

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/global.css';

window.CESIUM_BASE_URL = "/cesium";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
