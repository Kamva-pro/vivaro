import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import CommunityCard from "./components/CommunityCard";
import StreetViewModal from "./components/StreetViewModal";
import ChatToggle from "./components/ChatToggle";
import {
  IconSearch,
  IconClose,
  IconAlert,
  IconSchool,
  IconHospital,
  IconTarget,
  IconLayers,
} from "./components/Icons";
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
        setError("Could not reach backend service. Verify Render cloud container.");
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

  const handleNavigate = (sectionId) => {
    if (sectionId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="platform-container">
      {/* Background Ambience */}
      <div className="ambient-background">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <div className="ambient-orb orb-3"></div>
      </div>

      {/* Modern Top Navbar */}
      <Navbar
        loading={loading}
        error={error}
        onNavigateSection={handleNavigate}
      />

      {/* Main Content Area */}
      <main className="content-wrapper">
        {/* Hero Section */}
        <section id="overview" className="hero-banner">
          <div className="hero-content">
            <span className="hero-eyebrow">National Spatial Infrastructure Assessment</span>
            <h1 className="hero-title">
              Equitable Resource Allocation & Social Development
            </h1>
            <p className="hero-description">
              Spatial intelligence analyzing educational and healthcare infrastructure gaps across
              South Africa. Inspect local community environments via ground-level street imagery and
              evaluate AI-optimized facility placement proposals.
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Monitored Settlements</span>
              <span className="kpi-value">{stats.totalAnalyzed.toLocaleString()}</span>
              <span className="kpi-sub">Total municipalities evaluated</span>
            </div>
            <div className="kpi-card kpi-warning">
              <div className="kpi-header-row">
                <span className="kpi-label">Service Gaps</span>
                <IconAlert size={14} className="kpi-icon-amber" />
              </div>
              <span className="kpi-value">{stats.underservedTotal.toLocaleString()}</span>
              <span className="kpi-sub">Communities beyond 10 km</span>
            </div>
            <div className="kpi-card kpi-critical">
              <div className="kpi-header-row">
                <span className="kpi-label">Critical Deficit</span>
                <IconAlert size={14} className="kpi-icon-red" />
              </div>
              <span className="kpi-value">{stats.critical.toLocaleString()}</span>
              <span className="kpi-sub">Lack both schools & clinics</span>
            </div>
            <div className="kpi-card kpi-school">
              <div className="kpi-header-row">
                <span className="kpi-label">School Deficits</span>
                <IconSchool size={14} className="kpi-icon-orange" />
              </div>
              <span className="kpi-value">{stats.schools.toLocaleString()}</span>
              <span className="kpi-sub">Over 10 km to education</span>
            </div>
            <div className="kpi-card kpi-clinic">
              <div className="kpi-header-row">
                <span className="kpi-label">Healthcare Deficits</span>
                <IconHospital size={14} className="kpi-icon-cyan" />
              </div>
              <span className="kpi-value">{stats.healthcare.toLocaleString()}</span>
              <span className="kpi-sub">Over 10 km to clinic</span>
            </div>
          </div>
        </section>

        {/* Control Toolbar: Search & Filters */}
        <section className="toolbar-section">
          <div className="search-box-wrapper">
            <IconSearch size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by city, town, or settlement (e.g. Cookhouse, Cradock, Soweto)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
              >
                <IconClose size={16} />
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
                <span>All Deficits</span>
                <span className="chip-count">{stats.underservedTotal}</span>
              </button>
              <button
                className={`filter-chip chip-critical ${activeFilter === "critical" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("critical");
                  setVisibleCount(24);
                }}
              >
                <IconAlert size={13} className="chip-icon" />
                <span>Critical (Both)</span>
                <span className="chip-count">{stats.critical}</span>
              </button>
              <button
                className={`filter-chip chip-school ${activeFilter === "schools" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("schools");
                  setVisibleCount(24);
                }}
              >
                <IconSchool size={13} className="chip-icon" />
                <span>School Deficits</span>
                <span className="chip-count">{stats.schools}</span>
              </button>
              <button
                className={`filter-chip chip-clinic ${activeFilter === "healthcare" ? "active" : ""}`}
                onClick={() => {
                  setActiveFilter("healthcare");
                  setVisibleCount(24);
                }}
              >
                <IconHospital size={13} className="chip-icon" />
                <span>Healthcare Deficits</span>
                <span className="chip-count">{stats.healthcare}</span>
              </button>
            </div>

            <div className="sort-dropdown-wrapper">
              <span className="sort-label">Sort:</span>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="need">Most Urgent Need</option>
                <option value="school">Furthest School Distance</option>
                <option value="clinic">Furthest Healthcare Distance</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Communities Section */}
        <section id="communities" className="communities-section">
          <div className="section-header-bar">
            <div>
              <h2 className="section-title">Settlement Infrastructure Directory</h2>
              <p className="section-sub">
                Select any community to inspect ground-level street view, terrain, and facility allocation proposals.
              </p>
            </div>
            <span className="results-count">
              Showing {displayedCommunities.length} of {filteredCommunities.length} communities
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="state-panel loading-state">
              <div className="loading-spinner"></div>
              <h4>Analyzing National Infrastructure Dataset...</h4>
              <p>Evaluating nearest neighbor distance matrices across schools and clinics.</p>
              <span className="cold-start-tip">
                Render free cloud services may take ~30s on cold-start.
              </span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="state-panel error-state">
              <IconAlert size={36} className="error-icon-svg" />
              <h4>Connection Status</h4>
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
                      setError("Unable to connect to backend service. Please check Render status.");
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
                    Load More Settlements ({filteredCommunities.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && displayedCommunities.length === 0 && (
            <div className="state-panel empty-state">
              <IconSearch size={36} className="empty-icon-svg" />
              <h4>No Communities Found</h4>
              <p>No settlements match your current search query or active filter.</p>
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Reset Search & Filters
              </button>
            </div>
          )}
        </section>

        {/* Methodology Section */}
        <section id="methodology" className="methodology-section">
          <div className="methodology-card">
            <div className="methodology-header">
              <IconLayers size={20} className="methodology-icon" />
              <h3 className="methodology-title">Spatial Allocation Methodology</h3>
            </div>
            <div className="methodology-grid">
              <div className="methodology-col">
                <h4>Spatial Distance Standard</h4>
                <p>
                  Communities located greater than 10 km from the nearest public educational institution or
                  primary healthcare facility are flagged as critical underserved regions under national planning standards.
                </p>
              </div>
              <div className="methodology-col">
                <h4>Haversine Spatial Indexing</h4>
                <p>
                  High-speed BallTree spatial data structures evaluate geodesic haversine distance matrices
                  across 8,700+ schools, 4,200+ clinics, and 2,000+ settlements simultaneously.
                </p>
              </div>
              <div className="methodology-col">
                <h4>K-Means Cluster Optimization</h4>
                <p>
                  Proposed facility placements are computed using geographic centroid clustering to identify
                  optimal locations serving the largest aggregate underserved population.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

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
