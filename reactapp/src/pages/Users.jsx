import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/layout/AppLayout";
import StatCard from "../components/StatCard";
import Pagination from "../components/common/Pagination";
import Icon from "../components/common/Icon";
import userService from "../services/userService";
import { getErrorMessage } from "../services/api";

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await userService.getAllUsers();
        if (isMounted) {
          setUsers(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err, "Unable to load users."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
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
                </div>

                {paginatedUsers.map((u) => (
                  <div className="users-row" key={u.id}>
                    <span style={{ fontWeight: "600", color: "var(--primary-600)" }}>
                      #{u.id}
                    </span>
                    <strong style={{ color: "var(--slate-900)" }}>{u.name || "-"}</strong>
                    <span style={{ color: "var(--slate-600)" }}>{u.email || "-"}</span>
                    <span style={{ color: "var(--slate-600)" }}>{u.phone || "-"}</span>
                    <div>{getRoleBadge(u.role)}</div>
                  </div>
                ))}
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
    </AppLayout>
  );
}

export default Users;