import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function ComplaintForm() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // SUBMIT COMPLAINT
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        // Get logged-in user's email
        const email =
            localStorage.getItem("email");


        // Check login
        if (!email) {

            setError(
                "User information not found. Please login again."
            );

            return;
        }


        // Basic validation
        if (!title.trim()) {

            setError(
                "Please enter a complaint title."
            );

            return;
        }


        if (!description.trim()) {

            setError(
                "Please enter a complaint description."
            );

            return;
        }


        if (!category) {

            setError(
                "Please select a category."
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // SEND COMPLAINT TO BACKEND
            // =================================================

            const response = await api.post(
                "/complaints",
                {
                    title: title.trim(),
                    description: description.trim(),
                    category: category,
                    email: email
                }
            );


            console.log(
                "Complaint created:",
                response.data
            );


            setSuccess(
                "Complaint submitted successfully!"
            );


            // Clear form
            setTitle("");
            setDescription("");
            setCategory("");


            // Go to complaints page
            setTimeout(() => {

                navigate("/complaints");

            }, 800);


        } catch (err) {

            console.error(
                "Complaint creation error:",
                err
            );


            if (err.response) {

                if (
                    err.response.status === 403
                ) {

                    setError(
                        "You are not authorized to create a complaint."
                    );

                } else if (
                    err.response.status === 400
                ) {

                    setError(
                        err.response.data?.message ||
                        err.response.data ||
                        "Invalid complaint details."
                    );

                } else {

                    setError(
                        err.response.data?.message ||
                        err.response.data ||
                        "Unable to submit complaint."
                    );
                }

            } else {

                setError(
                    "Unable to connect to the server."
                );
            }

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {

        navigate("/complaints");

    };


    // =====================================================
    // UI
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
                            New Complaint
                        </h1>

                        <p className="welcome-text">
                            Submit a new complaint for review.
                        </p>

                    </div>

                </div>


                {/* =================================================
                    FORM CARD
                ================================================= */}

                <div className="form-card">


                    <form
                        onSubmit={handleSubmit}
                    >


                        {/* =================================================
                            TITLE
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Complaint Title
                            </label>

                            <input
                                type="text"
                                placeholder="Enter complaint title"
                                value={title}
                                onChange={(e) =>
                                    setTitle(
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                            />

                        </div>


                        {/* =================================================
                            CATEGORY
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <select
                                value={category}
                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }
                                disabled={loading}
                            >

                                <option value="">
                                    Select category
                                </option>

                                <option value="Water">
                                    Water
                                </option>

                                <option value="Electricity">
                                    Electricity
                                </option>

                                <option value="Road">
                                    Road
                                </option>

                                <option value="Sanitation">
                                    Sanitation
                                </option>

                                <option value="Garbage">
                                    Garbage
                                </option>

                                <option value="Street Light">
                                    Street Light
                                </option>

                                <option value="Public Safety">
                                    Public Safety
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Describe your complaint in detail..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows="6"
                                disabled={loading}
                            />

                        </div>


                        {/* =================================================
                            SUCCESS
                        ================================================= */}

                        {success && (

                            <div className="success-state">

                                {success}

                            </div>

                        )}


                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (

                            <div className="error-state">

                                {error}

                            </div>

                        )}


                        {/* =================================================
                            BUTTONS
                        ================================================= */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={
                                    handleCancel
                                }
                                disabled={loading}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >

                                {loading
                                    ? "Submitting..."
                                    : "Submit Complaint"}

                            </button>

                        </div>


                    </form>

                </div>

            </main>

        </div>
    );
}

export default ComplaintForm;