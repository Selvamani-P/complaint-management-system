import React, {
    useEffect,
    useMemo,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import api from "../services/api";


function Complaints() {

    const navigate = useNavigate();


    // =====================================================
    // USER
    // =====================================================

    const role =
        localStorage.getItem("role") || "CITIZEN";

    const loggedInEmail =
        localStorage.getItem("email") || "";


    // =====================================================
    // STATE
    // =====================================================

    const [complaints, setComplaints] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // FILTER
    // =====================================================

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [search, setSearch] =
        useState("");


    // =====================================================
    // SORT
    // =====================================================

    const [sortOrder, setSortOrder] =
        useState("NEWEST");


    // =====================================================
    // PAGINATION
    // =====================================================

    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 5;


    // =====================================================
    // LOAD COMPLAINTS
    // =====================================================

    useEffect(() => {

        loadComplaints();

    }, []);


    const loadComplaints = async () => {

        try {

            setLoading(true);

            setError("");


            const response =
                await api.get("/complaints");


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];


            setComplaints(data);


        } catch (err) {

            console.error(
                "Complaint loading error:",
                err
            );


            if (
                err.response?.status === 403
            ) {

                setError(
                    "You are not authorized to view complaints."
                );

            } else {

                setError(
                    "Unable to load complaints."
                );
            }


        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // ROLE BASED COMPLAINTS
    // =====================================================

    const roleComplaints = useMemo(() => {

        // -------------------------------------------------
        // ADMIN
        // -------------------------------------------------

        if (role === "ADMIN") {

            return complaints;
        }


        // -------------------------------------------------
        // CITIZEN
        // -------------------------------------------------

        if (role === "CITIZEN") {

            return complaints.filter(
                (complaint) => {

                    const complainantEmail =
                        complaint.complainant?.email ||
                        complaint.user?.email ||
                        complaint.email ||
                        "";


                    return (
                        complainantEmail
                            .toLowerCase()
                            .trim() ===
                        loggedInEmail
                            .toLowerCase()
                            .trim()
                    );
                }
            );
        }


        // -------------------------------------------------
        // EMPLOYEE
        // -------------------------------------------------

        if (role === "EMPLOYEE") {

            return complaints.filter(
                (complaint) => {

                    const employeeEmail =
                        complaint.assignedEmployee?.email ||
                        "";


                    return (
                        employeeEmail
                            .toLowerCase()
                            .trim() ===
                        loggedInEmail
                            .toLowerCase()
                            .trim()
                    );
                }
            );
        }


        return [];

    }, [
        complaints,
        role,
        loggedInEmail
    ]);


    // =====================================================
    // GET CATEGORIES
    // =====================================================

    const categories = useMemo(() => {

        const values =
            roleComplaints
                .map(
                    (complaint) =>
                        complaint.category
                )
                .filter(Boolean);


        return [
            ...new Set(values)
        ];

    }, [roleComplaints]);


    // =====================================================
    // FILTER + SEARCH + SORT
    // =====================================================

    const filteredComplaints =
        useMemo(() => {

            let result =
                [...roleComplaints];


            // -------------------------------------------------
            // STATUS FILTER
            // -------------------------------------------------

            if (
                statusFilter !== "ALL"
            ) {

                result =
                    result.filter(
                        (complaint) =>
                            complaint.status
                                ?.toUpperCase() ===
                            statusFilter
                    );
            }


            // -------------------------------------------------
            // CATEGORY FILTER
            // -------------------------------------------------

            if (
                categoryFilter !== "ALL"
            ) {

                result =
                    result.filter(
                        (complaint) =>
                            complaint.category ===
                            categoryFilter
                    );
            }


            // -------------------------------------------------
            // SEARCH
            // -------------------------------------------------

            if (
                search.trim() !== ""
            ) {

                const value =
                    search
                        .toLowerCase()
                        .trim();


                result =
                    result.filter(
                        (complaint) => {

                            const title =
                                complaint.title
                                    ?.toLowerCase() ||
                                "";


                            const description =
                                complaint.description
                                    ?.toLowerCase() ||
                                "";


                            const category =
                                complaint.category
                                    ?.toLowerCase() ||
                                "";


                            const id =
                                String(
                                    complaint.id
                                );


                            return (
                                title.includes(value) ||
                                description.includes(value) ||
                                category.includes(value) ||
                                id.includes(value)
                            );
                        }
                    );
            }


            // -------------------------------------------------
            // SORT
            // -------------------------------------------------

            result.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a.submittedAt || 0
                        ).getTime();


                    const dateB =
                        new Date(
                            b.submittedAt || 0
                        ).getTime();


                    if (
                        sortOrder === "NEWEST"
                    ) {

                        return dateB - dateA;
                    }


                    if (
                        sortOrder === "OLDEST"
                    ) {

                        return dateA - dateB;
                    }


                    if (
                        sortOrder === "TITLE_ASC"
                    ) {

                        return (
                            (a.title || "")
                                .localeCompare(
                                    b.title || ""
                                )
                        );
                    }


                    if (
                        sortOrder === "TITLE_DESC"
                    ) {

                        return (
                            (b.title || "")
                                .localeCompare(
                                    a.title || ""
                                )
                        );
                    }


                    return 0;
                }
            );


            return result;

        }, [
            roleComplaints,
            statusFilter,
            categoryFilter,
            search,
            sortOrder
        ]);


    // =====================================================
    // RESET PAGE WHEN FILTER CHANGES
    // =====================================================

    useEffect(() => {

        setCurrentPage(1);

    }, [
        statusFilter,
        categoryFilter,
        search,
        sortOrder
    ]);


    // =====================================================
    // PAGINATION
    // =====================================================

    const totalPages =
        Math.ceil(
            filteredComplaints.length /
            itemsPerPage
        );


    const startIndex =
        (currentPage - 1) *
        itemsPerPage;


    const paginatedComplaints =
        filteredComplaints.slice(
            startIndex,
            startIndex + itemsPerPage
        );


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (status) => {

        const value =
            status?.toUpperCase();


        if (
            value === "RESOLVED"
        ) {

            return "status status-resolved";
        }


        if (
            value === "IN_PROGRESS" ||
            value === "IN PROGRESS" ||
            value === "ASSIGNED"
        ) {

            return "status status-progress";
        }


        if (
            value === "CLOSED"
        ) {

            return "status status-resolved";
        }


        return "status status-pending";
    };


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {

        setSearch("");

        setStatusFilter("ALL");

        setCategoryFilter("ALL");

        setSortOrder("NEWEST");

        setCurrentPage(1);
    };


    // =====================================================
    // PAGE CHANGE
    // =====================================================

    const goToPage = (page) => {

        if (
            page < 1 ||
            page > totalPages
        ) {

            return;
        }


        setCurrentPage(page);
    };


    // =====================================================
    // PAGE NUMBERS
    // =====================================================

    const pageNumbers = [];


    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        pageNumbers.push(i);
    }


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="dashboard-layout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <Sidebar />


            <main className="main-content">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="topbar">

                    <div>

                        <h1 className="welcome-title">

                            {role === "CITIZEN"
                                ? "My Complaints"
                                : role === "EMPLOYEE"
                                    ? "Assigned Complaints"
                                    : "All Complaints"}

                        </h1>


                        <p className="welcome-text">

                            {role === "CITIZEN"
                                ? "Track your submitted complaints."
                                : role === "EMPLOYEE"
                                    ? "View complaints assigned to you."
                                    : "Manage and monitor all complaints."}

                        </p>

                    </div>


                    {/* =================================================
                        NEW COMPLAINT
                    ================================================= */}

                    {role === "CITIZEN" && (

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/complaints/create"
                                )
                            }
                        >

                            + New Complaint

                        </button>

                    )}

                </div>


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <div className="content-card">


                    {/* =================================================
                        FILTER BAR
                    ================================================= */}

                    <div className="filter-bar">


                        {/* SEARCH */}

                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            className="search-input"
                        />


                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="form-select"
                        >

                            <option value="ALL">
                                All Status
                            </option>

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


                        {/* CATEGORY */}

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value
                                )
                            }
                            className="form-select"
                        >

                            <option value="ALL">
                                All Categories
                            </option>


                            {categories.map(
                                (category) => (

                                    <option
                                        key={category}
                                        value={category}
                                    >

                                        {category}

                                    </option>

                                )
                            )}

                        </select>


                        {/* SORT */}

                        <select
                            value={sortOrder}
                            onChange={(e) =>
                                setSortOrder(
                                    e.target.value
                                )
                            }
                            className="form-select"
                        >

                            <option value="NEWEST">
                                Newest First
                            </option>

                            <option value="OLDEST">
                                Oldest First
                            </option>

                            <option value="TITLE_ASC">
                                Title A-Z
                            </option>

                            <option value="TITLE_DESC">
                                Title Z-A
                            </option>

                        </select>


                        {/* CLEAR */}

                        <button
                            className="secondary-button"
                            onClick={
                                clearFilters
                            }
                        >

                            Clear

                        </button>

                    </div>


                    {/* =================================================
                        RESULT COUNT
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredComplaints.length > 0 && (

                            <div className="results-info">

                                Showing{" "}

                                {startIndex + 1}

                                {" - "}

                                {Math.min(
                                    startIndex +
                                    itemsPerPage,
                                    filteredComplaints.length
                                )}

                                {" of "}

                                {filteredComplaints.length}

                                {" complaints"}

                            </div>

                        )}


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading && (

                        <div className="empty-state">

                            Loading complaints...

                        </div>

                    )}


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {!loading &&
                        error && (

                            <div className="error-state">

                                {error}

                            </div>

                        )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!loading &&
                        !error &&
                        filteredComplaints.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✓
                                </div>


                                <h3>

                                    No complaints found

                                </h3>


                                <p>

                                    {role === "CITIZEN"
                                        ? "You have not submitted any complaints yet."
                                        : role === "EMPLOYEE"
                                            ? "No complaints have been assigned to you."
                                            : "Try changing your filters or search."}

                                </p>

                            </div>

                        )}


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    {!loading &&
                        !error &&
                        paginatedComplaints.length > 0 && (

                            <>


                                <div className="complaints-table">


                                    {/* TABLE HEADER */}

                                    <div className="table-header">

                                        <span>
                                            ID
                                        </span>

                                        <span>
                                            Complaint
                                        </span>

                                        <span>
                                            Category
                                        </span>

                                        <span>
                                            Status
                                        </span>

                                    </div>


                                    {/* TABLE ROWS */}

                                    {paginatedComplaints.map(
                                        (complaint) => (

                                            <div
                                                className="table-row"
                                                key={
                                                    complaint.id
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/complaints/${complaint.id}`
                                                    )
                                                }
                                            >


                                                {/* ID */}

                                                <span>

                                                    #

                                                    {
                                                        complaint.id
                                                    }

                                                </span>


                                                {/* COMPLAINT */}

                                                <div>

                                                    <strong>

                                                        {
                                                            complaint.title
                                                        }

                                                    </strong>


                                                    <small>

                                                        {
                                                            complaint.description
                                                        }

                                                    </small>

                                                </div>


                                                {/* CATEGORY */}

                                                <span>

                                                    {
                                                        complaint.category ||
                                                        "-"
                                                    }

                                                </span>


                                                {/* STATUS */}

                                                <span
                                                    className={
                                                        getStatusClass(
                                                            complaint.status
                                                        )
                                                    }
                                                >

                                                    {
                                                        complaint.status ||
                                                        "PENDING"
                                                    }

                                                </span>


                                            </div>

                                        )
                                    )}

                                </div>


                                {/* =================================================
                                    PAGINATION
                                ================================================= */}

                                {totalPages > 1 && (

                                    <div className="pagination">


                                        {/* PREVIOUS */}

                                        <button
                                            className="pagination-button"
                                            disabled={
                                                currentPage === 1
                                            }
                                            onClick={() =>
                                                goToPage(
                                                    currentPage - 1
                                                )
                                            }
                                        >

                                            ← Previous

                                        </button>


                                        {/* PAGE NUMBERS */}

                                        <div className="page-numbers">

                                            {pageNumbers.map(
                                                (page) => (

                                                    <button
                                                        key={page}
                                                        className={
                                                            `pagination-number ${
                                                                currentPage === page
                                                                    ? "active"
                                                                    : ""
                                                            }`
                                                        }
                                                        onClick={() =>
                                                            goToPage(
                                                                page
                                                            )
                                                        }
                                                    >

                                                        {page}

                                                    </button>

                                                )
                                            )}

                                        </div>


                                        {/* NEXT */}

                                        <button
                                            className="pagination-button"
                                            disabled={
                                                currentPage ===
                                                totalPages
                                            }
                                            onClick={() =>
                                                goToPage(
                                                    currentPage + 1
                                                )
                                            }
                                        >

                                            Next →

                                        </button>

                                    </div>

                                )}

                            </>

                        )}

                </div>

            </main>

        </div>
    );
}


export default Complaints;