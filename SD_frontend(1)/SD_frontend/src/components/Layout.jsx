// src/components/Layout.jsx
import Navbar from "./Navbar";

const Layout = ({ children, noPadding }) => {
  return (
    <>
      <Navbar />
      <main
        className={`font-sans bg-white text-gray-900 min-h-screen ${
          noPadding ? "" : "pt-[80px]"
        }`}
      >
        {children}
      </main>
    </>
  );
};

export default Layout;
