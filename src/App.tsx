import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./components/layout/Homepage";
import Navbar from "./components/layout/Navbar";
import Profile from "./features/profile/Profile";
import Auth from "./features/auth/pages/Auth";
import { ToastProvider } from "./components/toast/ToastProvider";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/*
          min-h-screen + flex-col here, and flex-1 on <main>, means main always
          gets exactly "viewport height minus whatever space Navbar occupies in
          flow" — no matter the device height. This is what a page like Auth,
          which needs to vertically fill and center, relies on (via h-full)
          instead of guessing a vh fraction.
        */}
        <div className="min-h-screen flex flex-col bg-slate-100">
          <Navbar />

          {/*
            MobileHeader (h-16) and BottomNavbar are `fixed`, so they're pulled
            out of normal flow and would otherwise sit on top of page content
            below the `lg` breakpoint — hence the padding. DesktopNavbar is
            `sticky`, so it already reserves its own space in flow at `lg+`.
          */}
          <main className="flex-1 pt-16 pb-20 lg:pt-0 lg:pb-0">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Auth />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;