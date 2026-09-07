import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function ComplaintDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const role =
        localStorage.getItem("role") || "CITIZEN";


    // =====================================================
    // STATE
    // =====================================================

    const [complaint, setComplaint] = useState(null);

    const [employees, setEmployees] = useState([]);

    const [selectedEmployee, setSelectedEmployee] =
        useState("");

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [message, setMessage] =
        useState("");


    // =====================================================
    // LOAD COMPLAINT
    // =====================================================

    useEffect(() => {
        loadComplaint();
    }, [id]);


    const loadComplaint = async () => {

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const response =
                await api.get(`/complaints/${id}`);

            const data = response.data;

            setComplaint(data);


            // Set current status
            setSelectedStatus(
                data.status || "PENDING"
            );


            // IMPORTANT:
            // If complaint already has an employee,
            // automatically select that employee
            // in the dropdown.

            setSelectedEmployee(
                data.assignedEmployee?.id
                    ? String(data.assignedEmployee.id)
                    : ""
            );


        } catch (err) {

            console.error(
                "Complaint loading error:",
                err
            );

            if (err.response?.status === 404) {

                setError(
                    "Complaint not found."
                );

            } else {

                setError(
                    "Unable to load complaint."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // LOAD EMPLOYEES
    // ADMIN ONLY
    // =====================================================

    useEffect(() => {

        if (role === "ADMIN") {
            loadEmployees();
        }

    }, [role]);


    const loadEmployees = async () => {

        try {

            const response =
                await api.get("/users/employees");

            const employeeList =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setEmployees(employeeList);

        } catch (err) {

            console.error(
                "Employee loading error:",
                err
            );

            setMessage(
                "Unable to load employees."
            );
        }
    };


    // =====================================================
    // ASSIGN EMPLOYEE
    // =====================================================

    const handleAssign = async () => {

        if (!selectedEmployee) {

            setMessage(
                "Please select an employee."
            );

            return;
        }


        try {

            setActionLoading(true);
            setMessage("");
            setError("");


            const response =
                await api.put(
                    `/complaints/${id}/assign/${selectedEmployee}`
                );


            const updatedComplaint =
                response.data;


            setComplaint(
                updatedComplaint
            );


            // Keep dropdown showing assigned employee
            setSelectedEmployee(
                updatedComplaint.assignedEmployee?.id
                    ? String(
                        updatedComplaint.assignedEmployee.id
                    )
                    : String(selectedEmployee)
            );


            setSelectedStatus(
                updatedComplaint.status ||
                "ASSIGNED"
            );


            setMessage(
                "Complaint assigned successfully."
            );


        } catch (err) {

            console.error(
                "Assignment error:",
                err
            );


            setMessage(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to assign complaint."
            );

        } finally {

            setActionLoading(false);

        }
    };


    // =====================================================
    // UPDATE STATUS
    // =====================================================

    const handleStatusUpdate = async () => {

        if (!selectedStatus) {
            return;
        }


        try {

            setActionLoading(true);
            setMessage("");
            setError("");


            const response =
                await api.put(
                    `/complaints/${id}/status`,
                    null,
                    {
                        params: {
                            status: selectedStatus
                        }
                    }
                );


            const updatedComplaint =
                response.data;


            setComplaint(
                updatedComplaint
            );


            setSelectedStatus(
                updatedComplaint.status ||
                selectedStatus
            );


            // Keep employee selected after status update
            setSelectedEmployee(
                updatedComplaint.assignedEmployee?.id
                    ? String(
                        updatedComplaint.assignedEmployee.id
                    )
                    : selectedEmployee
            );


            setMessage(
                "Complaint status updated successfully."
            );


        } catch (err) {

            console.error(
                "Status update error:",
                err
            );


            setMessage(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to update status."
            );

        } finally {

            setActionLoading(false);

        }
    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        const value =
            status?.toUpperCase();


        if (value === "RESOLVED") {

            return "status status-resolved";
        }


        if (
            value === "IN_PROGRESS" ||
            value === "IN PROGRESS"
        ) {

            return "status status-progress";
        }


        if (value === "ASSIGNED") {

            return "status status-progress";
        }


        if (value === "CLOSED") {

            return "status status-resolved";
        }


        return "status status-pending";
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="dashboard-layout">

                <Sidebar />

                <main className="main-content">

                    <div className="content-card">

                        <div className="empty-state">

                            Loading complaint...

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !complaint) {

        return (

            <div className="dashboard-layout">

                <Sidebar />

                <main className="main-content">

                    <div className="content-card">

                        <div className="error-state">

                            {error ||
                                "Complaint not found."}

                        </div>


                        <button
                            className="secondary-button"
                            onClick={() =>
                                navigate(
                                    "/complaints"
                                )
                            }
                        >

                            ← Back to Complaints

                        </button>

                    </div>

                </main>

            </div>
        );
    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div className="dashboard-layout">

            <Sidebar />


            <main className="main-content">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="topbar">

                    <div>

                        <h1 className="welcome-title">

                            Complaint Details

                        </h1>


                        <p className="welcome-text">

                            View and manage complaint
                            information.

                        </p>

                    </div>


                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate(
                                "/complaints"
                            )
                        }
                    >

                        ← Back

                    </button>

                </div>


                {/* =================================================
                    COMPLAINT CARD
                ================================================= */}

                <div className="content-card">


                    {/* =================================================
                        TITLE + STATUS
                    ================================================= */}

                    <div className="complaint-details-header">

                        <div>

                            <span className="complaint-id">

                                Complaint #{complaint.id}

                            </span>


                            <h2>

                                {complaint.title}

                            </h2>

                        </div>


                        <span
                            className={getStatusClass(
                                complaint.status
                            )}
                        >

                            {complaint.status ||
                                "PENDING"}

                        </span>

                    </div>


                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div className="profile-details">


                        {/* CATEGORY */}

                        <div className="profile-detail">

                            <span>
                                Category
                            </span>

                            <strong>

                                {complaint.category ||
                                    "-"}

                            </strong>

                        </div>


                        {/* SUBMITTED DATE */}

                        <div className="profile-detail">

                            <span>
                                Submitted At
                            </span>

                            <strong>

                                {complaint.submittedAt
                                    ? new Date(
                                        complaint.submittedAt
                                    ).toLocaleString()
                                    : "-"}

                            </strong>

                        </div>


                        {/* COMPLAINANT */}

                        <div className="profile-detail">

                            <span>
                                Complainant
                            </span>

                            <strong>

                                {complaint.complainant?.name ||
                                    "-"}

                            </strong>

                        </div>


                        {/* COMPLAINANT EMAIL */}

                        <div className="profile-detail">

                            <span>
                                Complainant Email
                            </span>

                            <strong>

                                {complaint.complainant?.email ||
                                    "-"}

                            </strong>

                        </div>


                        {/* ASSIGNED EMPLOYEE */}

                        <div className="profile-detail">

                            <span>
                                Assigned Employee
                            </span>

                            <strong>

                                {complaint.assignedEmployee?.name ||
                                    "Not Assigned"}

                            </strong>

                        </div>


                        {/* EMPLOYEE EMAIL */}

                        <div className="profile-detail">

                            <span>
                                Employee Email
                            </span>

                            <strong>

                                {complaint.assignedEmployee?.email ||
                                    "-"}

                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <div className="complaint-description">

                        <h3>
                            Description
                        </h3>


                        <p>

                            {complaint.description}

                        </p>

                    </div>


                    {/* =================================================
                        ADMIN ASSIGNMENT
                    ================================================= */}

                    {role === "ADMIN" && (

                        <div className="action-section">

                            <h3>
                                Assign Employee
                            </h3>


                            <div className="action-row">


                                <select
                                    value={
                                        selectedEmployee
                                    }
                                    onChange={(e) =>
                                        setSelectedEmployee(
                                            e.target.value
                                        )
                                    }
                                    className="form-select"
                                    disabled={
                                        actionLoading
                                    }
                                >

                                    <option value="">

                                        Select Employee

                                    </option>


                                    {employees.map(
                                        (employee) => (

                                            <option
                                                key={
                                                    employee.id
                                                }
                                                value={
                                                    employee.id
                                                }
                                            >

                                                {employee.name}
                                                {" - "}
                                                {employee.email}

                                            </option>

                                        )
                                    )}

                                </select>


                                <button
                                    className="primary-button"
                                    onClick={
                                        handleAssign
                                    }
                                    disabled={
                                        actionLoading ||
                                        !selectedEmployee
                                    }
                                >

                                    {actionLoading
                                        ? "Assigning..."
                                        : complaint.assignedEmployee
                                            ? "Reassign Employee"
                                            : "Assign Employee"}

                                </button>

                            </div>


                            {/* Employee count */}

                            {employees.length === 0 && (

                                <p className="form-help">

                                    No employees found.

                                </p>

                            )}

                        </div>

                    )}


                    {/* =================================================
                        STATUS UPDATE
                    ================================================= */}

                    {(role === "ADMIN" ||
                        role === "EMPLOYEE") && (

                        <div className="action-section">

                            <h3>
                                Update Status
                            </h3>


                            <div className="action-row">

                                <select
                                    value={
                                        selectedStatus
                                    }
                                    onChange={(e) =>
                                        setSelectedStatus(
                                            e.target.value
                                        )
                                    }
                                    className="form-select"
                                    disabled={
                                        actionLoading
                                    }
                                >

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="ASSIGNED">
                                        Assigned
                                    </option>

                                    <option value="IN_PROGRESS">
                                        In Progress
                                    </option>

                                    <option value="RESOLVED">
                                        Resolved
                                    </option>

                                    <option value="CLOSED">
                                        Closed
                                    </option>

                                </select>


                                <button
                                    className="primary-button"
                                    onClick={
                                        handleStatusUpdate
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >

                                    {actionLoading
                                        ? "Updating..."
                                        : "Update Status"}

                                </button>

                            </div>

                        </div>

                    )}


                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    {message && (

                        <div className="success-message">

                            {message}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default ComplaintDetails;