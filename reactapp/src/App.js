import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import ComplaintForm from "./pages/ComplaintForm.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Complaints from "./pages/Complaints.jsx";
import ComplaintDetails from "./pages/ComplaintDetails";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import AssignedTasks from "./pages/AssignedTasks";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />
                <Route
    path="/complaints/create"
    element={<ComplaintForm />}
/>
                <Route path="/users" element={<Users />} />
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/assigned"
                    element={<AssignedTasks />}
                />
                <Route
                    path="/register"
                    element={<Register />}
                />


                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/complaints"
                    element={<Complaints />}
                />
                <Route
                    path="/complaints/:id"
                    element={<ComplaintDetails />}
                />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />

            </Routes>

        </BrowserRouter>
    );
}

export default App;