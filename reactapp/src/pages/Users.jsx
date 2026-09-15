import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/StatCard";
import Pagination from "../components/common/Pagination";
import Button from "../components/common/Button";
import Icon from "../components/common/Icon";
import Modal from "../components/common/Modal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import userService from "../services/userService";
import { addToast } from "../store/slices/uiSlice";
import { getErrorMessage } from "../services/api";

export function Users() {
  const dispatch = useDispatch();
  const loggedInEmail = (localStorage.getItem("email") || "").toLowerCase().trim();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CITIZEN"
  });
  const [editErrors, setEditErrors] = useState({});

  // Delete Dialog State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const totalCitizens = users.filter((u) => (u.role || "").toUpperCase() === "CITIZEN").length;
  const totalEmployees = users.filter((u) => (u.role || "").toUpperCase() === "EMPLOYEE").length;
  const totalAdmins = users.filter((u) => (u.role || "").toUpperCase() === "ADMIN").length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        roleFilter === "ALL" || (u.role || "").toUpperCase() === roleFilter.toUpperCase();

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        String(u.id || "").includes(q);

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadge = (userRole) => {
    const r = (userRole || "CITIZEN").toUpperCase();
    if (r === "ADMIN") return <span className="role-badge role-admin">ADMIN</span>;
    if (r === "EMPLOYEE") return <span className="role-badge role-employee">EMPLOYEE</span>;
    return <span className="role-badge role-citizen">CITIZEN</span>;
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "CITIZEN"
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) {
      setEditErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEdit = () => {
    const errs = {};
    if (!editFormData.name.trim()) {
      errs.name = "Name is required";
    } else if (editFormData.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!editFormData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (
      selectedUser &&
      selectedUser.email?.toLowerCase() === loggedInEmail &&
      editFormData.role !== "ADMIN"
    ) {
      errs.role = "You cannot remove your own Administrator role";
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateEdit() || !selectedUser) return;

    try {
      setActionLoading(true);
      const updated = await userService.updateUser(selectedUser.id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        role: editFormData.role
      });

      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      dispatch(addToast({ message: `User #${updated.id} updated successfully!`, type: "success" }));
      setEditModalOpen(false);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update user.");
      if (msg.toLowerCase().includes("email")) {
        setEditErrors((prev) => ({ ...prev, email: msg }));
      } else {
        dispatch(addToast({ message: msg, type: "error" }));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (user) => {
    if (user.email?.toLowerCase() === loggedInEmail) {
      dispatch(addToast({ message: "You cannot delete your own Administrator account.", type: "error" }));
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setActionLoading(true);
      await userService.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      dispatch(addToast({ message: `User ${userToDelete.name} deleted successfully!`, type: "success" }));
      setDeleteModalOpen(false);
    } catch (err) {
      dispatch(addToast({ message: getErrorMessage(err, "Failed to delete user."), type: "error" }));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppLayout
      title="User Management"
      subtitle="Administrative directory of registered citizens, employees, and administrators."
    >
      {/* STATS OVERVIEW */}
      <div className="stats-grid" style={{ marginBottom: "20px" }}>
        <StatCard
          title="Total Users"
          value={loading ? "..." : users.length}
          description="Total platform accounts"
          icon={<Icon name="users" size={20} />}
        />
        <StatCard
          title="Citizens"
          value={loading ? "..." : totalCitizens}
          description="Registered public users"
          icon={<Icon name="profile" size={20} />}
        />
        <StatCard
          title="Employees"
          value={loading ? "..." : totalEmployees}
          description="Designated resolution staff"
          icon={<Icon name="check" size={20} />}
        />
        <StatCard
          title="Administrators"
          value={loading ? "..." : totalAdmins}
          description="System administrators"
          icon={<Icon name="dashboard" size={20} />}
        />
      </div>

      <div className="content-card">
        {/* FILTER BAR */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
          >
            <option value="ALL">All Roles</option>
            <option value="CITIZEN">Citizens</option>
            <option value="EMPLOYEE">Employees</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>

        {loading && <div className="empty-state">Loading users...</div>}

        {!loading && error && (
          <div className="error-state" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No users found</h3>
            <p>No account matches your search criteria.</p>
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <>
            <div className="table-responsive">
              <div className="users-table">
                <div className="users-header">
                  <span>ID</span>
                  <span>Full Name</span>
                  <span>Email Address</span>
                  <span>Phone Number</span>
                  <span>Role</span>
                  <span>Actions</span>
                </div>

                {paginatedUsers.map((u) => {
                  const isSelf = u.email?.toLowerCase() === loggedInEmail;
                  return (
                    <div className="users-row" key={u.id}>
                      <span style={{ fontWeight: "600", color: "var(--primary-600)" }}>
                        #{u.id}
                      </span>
                      <strong style={{ color: "var(--slate-900)" }}>{u.name || "-"}</strong>
                      <span style={{ color: "var(--slate-600)" }}>{u.email || "-"}</span>
                      <span style={{ color: "var(--slate-600)" }}>{u.phone || "-"}</span>
                      <div>{getRoleBadge(u.role)}</div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          title="Edit User"
                          aria-label={`Edit ${u.name}`}
                          onClick={() => handleOpenEdit(u)}
                          style={{
                            background: "var(--slate-100)",
                            border: "1px solid var(--border-color)",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            cursor: "pointer"
                          }}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          type="button"
                          className="action-btn delete-btn"
                          title={isSelf ? "Cannot delete own account" : "Delete User"}
                          aria-label={`Delete ${u.name}`}
                          disabled={isSelf}
                          onClick={() => handleOpenDelete(u)}
                          style={{
                            background: isSelf ? "var(--slate-100)" : "#fee2e2",
                            color: isSelf ? "var(--slate-400)" : "#dc2626",
                            border: isSelf ? "1px solid var(--border-color)" : "1px solid #fca5a5",
                            borderRadius: "6px",
                            padding: "6px 8px",
                            cursor: isSelf ? "not-allowed" : "pointer"
                          }}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedUser ? `Edit User #${selectedUser.id}` : "Edit User"}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveEdit} noValidate>
          <div className="form-group">
            <label htmlFor="edit-user-name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="edit-user-name"
              name="name"
              type="text"
              className={`form-input ${editErrors.name ? "input-error" : ""}`}
              value={editFormData.name}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            />
            {editErrors.name && <span className="form-error-msg">{editErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-user-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="edit-user-email"
              name="email"
              type="email"
              className={`form-input ${editErrors.email ? "input-error" : ""}`}
              value={editFormData.email}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            />
            {editErrors.email && <span className="form-error-msg">{editErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-user-phone">Phone Number</label>
            <input
              id="edit-user-phone"
              name="phone"
              type="tel"
              className="form-input"
              value={editFormData.phone}
              onChange={handleEditChange}
              disabled={actionLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-user-role">
              System Authorization Role <span className="required-star">*</span>
            </label>
            <select
              id="edit-user-role"
              name="role"
              className={`form-select ${editErrors.role ? "input-error" : ""}`}
              value={editFormData.role}
              onChange={handleEditChange}
              disabled={actionLoading}
              required
            >
              <option value="CITIZEN">Citizen</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Administrator</option>
            </select>
            {editErrors.role && <span className="form-error-msg">{editErrors.role}</span>}
          </div>

          <div
            className="form-actions"
            style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={actionLoading}
              disabled={actionLoading}
            >
              Save User
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE USER CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm User Deletion"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})? If they are a citizen, all their complaints will be removed. If they are an employee, assigned tasks will be unassigned safely.`
            : "Are you sure you want to delete this user?"
        }
        confirmText="Yes, Delete User"
        variant="danger"
        loading={actionLoading}
      />
    </AppLayout>
  );
}

export default Users;