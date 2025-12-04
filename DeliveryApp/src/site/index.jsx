/**
 * src/site/index.jsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PreCadastro from './pages/pre-cadastro.jsx';

import Menu from './pages/menu';
import Banner from './pages/banner';
import Destaques from './pages/destaques';
import Depoimentos from './pages/depoimentos';
import Planos from './pages/planos';
import Mobile from './pages/mobile';
import Footer from './pages/footer';


function Site() {
  // const location = useLocation();
  return (
    <div>
      <Menu />
      <Routes>
        <Route path="/pre-cadastro" element={<PreCadastro />} />
        <Route path="/" element={
          <>
            <Banner />
            <Destaques />
            <Depoimentos />
            <Planos />
            <Mobile />
          </>
        } />
      </Routes>
      <Footer />
    </div>
  );
}

export default Site;
