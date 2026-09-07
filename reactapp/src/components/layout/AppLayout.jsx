import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Toast from "../common/Toast";
import { removeToast } from "../../store/slices/uiSlice";

export function AppLayout({ title, subtitle, rightAction, children }) {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.ui?.toasts || []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title={title} subtitle={subtitle} rightAction={rightAction} />
        {children}
      </main>
      <Toast toasts={toasts} onDismiss={(id) => dispatch(removeToast(id))} />
    </div>
  );
}

export default AppLayout;
