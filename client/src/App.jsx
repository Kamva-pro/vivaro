import React, { useState, useEffect, useMemo } from "react";
import CommunityCard from "./components/CommunityCard";
import StreetViewModal from "./components/StreetViewModal";
import ChatToggle from "./components/ChatToggle";
import { fetchUnderservedData } from "./fetchdata";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'critical', 'schools', 'healthcare'
  const [sortBy, setSortBy] = useState("need"); // 'need', 'school', 'clinic', 'name'
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setLoading(true);
    fetchUnderservedData()
      .then((fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setError("Could not reach backend service. It might be waking up or offline.");
        setLoading(false);
      });
  }, []);

  const underservedList = useMemo(() => {
    return (data && data.underserved) || [];
  }, [data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = underservedList.length;
    const critical = underservedList.filter(
      (c) => c.school_dist > 10 && c.healthcare_dist > 10
    ).length;
    const schools = underservedList.filter((c) => c.school_dist > 10).length;
    const healthcare = underservedList.filter((c) => c.healthcare_dist > 10).length;

    return {
      totalAnalyzed: data?.total_cities || 2078,
      underservedTotal: total,
      critical,
      schools,
      healthcare,
    };
  }, [underservedList, data]);

  // Filtered and sorted communities
  const filteredCommunities = useMemo(() => {
    let list = underservedList;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => c.name && c.name.toLowerCase().includes(q));
    }

    // Category filter
    if (activeFilter === "critical") {
      list = list.filter((c) => c.school_dist > 10 && c.healthcare_dist > 10);
    } else if (activeFilter === "schools") {
      list = list.filter((c) => c.school_dist > 10);
    } else if (activeFilter === "healthcare") {
      list = list.filter((c) => c.healthcare_dist > 10);
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === "need") {
        const needA = (a.school_dist > 10 ? a.school_dist : 0) + (a.healthcare_dist > 10 ? a.healthcare_dist : 0);
        const needB = (b.school_dist > 10 ? b.school_dist : 0) + (b.healthcare_dist > 10 ? b.healthcare_dist : 0);
        return needB - needA;
      }
      if (sortBy === "school") {
        return b.school_dist - a.school_dist;
      }
      if (sortBy === "clinic") {
        return b.healthcare_dist - a.healthcare_dist;
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [underservedList, searchQuery, activeFilter, sortBy]);

  const displayedCommunities = filteredCommunities.slice(0, visibleCount);

  return (
    <div className="platform-container">
      {/* Dynamic Animated Ambient Background */}
      <div className="ambient-background">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Main Content Area */}
      <div className="content-wrapper">
        {/* Navigation Bar */}
        <header className="navbar">
          <div className="brand">
            <div className="logo-icon">🌍</div>
            <div>
              <h1 className="brand-title">VIVARO</h1>
              <span className="brand-badge">South Africa Social Development</span>
            </div>
          </div>

          <div className="nav-actions">
            <span className="live-status-pill">
              <span className="status-dot"></span>
              {loading ? "Connecting..." : "Live National Dataset"}
            </span>
          </div>
        </header>

        {/* Hero Impact Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <h2 className="hero-title">
              Equitable Resource Allocation & Social Development
            </h2>
            <p className="hero-description">
              Proactively analyzing the spatial distribution of schools and healthcare facilities across
              South African communities. Explore deficits, inspect ground-level environments via street
              views, and view AI-guided placement recommendations.
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Total Monitored</span>
              <span className="kpi-value">{stats.totalAnalyzed.toLocaleString()}</span>
              <span className="kpi-sub">Municipalities & Towns</span>
            </div>
            <div className="kpi-card kpi-warning">
              <span className="kpi-label">Underserved Areas</span>
              <span className="kpi-value">{stats.underservedTotal.toLocaleString()}</span>
              <span className="kpi-sub">Facing Service Gaps</span>
            </div>
            <div className="kpi-card kpi-critical">
              <span className="kpi-label">Critical Deficit</span>
              <span className="kpi-value">{stats.critical.toLocaleString()}</span>
              <span className="kpi-sub">Lack Schools & Clinics</span>
            </div>
            <div className="kpi-card kpi-school">
              <span className="kpi-label">School Gaps</span>
              <span className="kpi-value">{stats.schools.toLocaleString()}</span>
              <span className="kpi-sub">&gt; 10 km to Education</span>
            </div>
            <div className="kpi-card kpi-clinic">
              <span className="kpi-label">Healthcare Gaps</span>
              <span className="kpi-value">{stats.healthcare.toLocaleString()}</span>
              <span className="kpi-sub">&gt; 10 km to Clinic</span>
            </div>
          </div>
        </section>

        {/* Control Toolbar: Search & Filters */}
        <section className="toolbar-section">
          <div className="search-box-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by city, town, or neighborhood (e.g. Cookhouse, Soweto)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="filters-wrapper">
            <div className="filter-chips">
              <button
                className={`filter-chip ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("all");
                  setVisibleCount(24);
                }}
              >
                All Deficits ({stats.underservedTotal})
              </button>
              <button
                className={`filter-chip chip-critical ${activeFilter === "critical" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("critical");
                  setVisibleCount(24);
                }}
              >
                🚨 Critical Both ({stats.critical})
              </button>
              <button
                className={`filter-chip chip-school ${activeFilter === "schools" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("schools");
                  setVisibleCount(24);
                }}
              >
                🏫 School Deficits ({stats.schools})
              </button>
              <button
                className={`filter-chip chip-clinic ${activeFilter === "healthcare" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("healthcare");
                  setVisibleCount(24);
                }}
              >
                🏥 Healthcare Deficits ({stats.healthcare})
              </button>
            </div>

            <div className="sort-dropdown-wrapper">
              <label htmlFor="sort-select" className="sort-label">Sort:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="need">Most Urgent Need</option>
                <option value="school">Highest School Distance</option>
                <option value="clinic">Highest Clinic Distance</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Communities Section */}
        <section className="communities-section">
          <div className="section-header-bar">
            <h3 className="section-title">
              Impact Explorer: Neighborhoods &amp; Communities In Need
            </h3>
            <span className="results-count">
              Showing {displayedCommunities.length} of {filteredCommunities.length} matching communities
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="state-panel loading-state">
              <div className="loading-spinner"></div>
              <h4>Analyzing South African Communities...</h4>
              <p>Fetching geospatial facility density and AI allocation models.</p>
              <span className="cold-start-tip">
                Tip: Cloud services waking up on Render may take ~30s on first load.
              </span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="state-panel error-state">
              <span className="error-icon">⚠️</span>
              <h4>Connection Notice</h4>
              <p>{error}</p>
              <button
                className="retry-btn"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchUnderservedData()
                    .then((d) => {
                      setData(d);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError("Still unable to reach backend. Please verify your Render service.");
                      setLoading(false);
                    });
                }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Grid of Communities */}
          {!loading && !error && displayedCommunities.length > 0 && (
            <>
              <div className="communities-grid">
                {displayedCommunities.map((community, index) => (
                  <CommunityCard
                    key={`${community.name}-${index}`}
                    community={community}
                    onSelect={setSelectedCommunity}
                  />
                ))}
              </div>

              {visibleCount < filteredCommunities.length && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                  >
                    Load More Communities ({filteredCommunities.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && displayedCommunities.length === 0 && (
            <div className="state-panel empty-state">
              <span className="empty-icon">🔎</span>
              <h4>No Communities Match Your Filter</h4>
              <p>Try clearing your search query or switching to another category filter.</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Street View / Inspection Modal */}
      {selectedCommunity && (
        <StreetViewModal
          community={selectedCommunity}
          onClose={() => setSelectedCommunity(null)}
        />
      )}

      {/* AI Assistant Chat Toggle */}
      <ChatToggle />
    </div>
  );
};

export default App;
