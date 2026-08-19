"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useClient } from 'sanity';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Package,
  CreditCard,
  RefreshCw,
  Award,
  Users,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  BarChart3,
  PieChart,
} from 'lucide-react';
import styles from './AnalyticsDashboard.module.css';
import { compileDashboardAnalytics } from '../../lib/analytics';

export default function AnalyticsDashboard() {
  const sanityClient = useClient({ apiVersion: '2023-01-01' });
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productTab, setProductTab] = useState('revenue'); // 'revenue' | 'units'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (sanityClient) {
        const [orders, dealers] = await Promise.all([
          sanityClient.fetch(
            `*[_type == "order"] | order(orderDate desc) {
              _id,
              orderId,
              orderDate,
              totalAmount,
              subtotal,
              discount,
              paymentStatus,
              orderStatus,
              products[]{
                product->{ _id, name, productCode, image },
                name,
                productCode,
                size,
                quantity,
                price,
                dealer->{ _id, name, businessName, whatsapp, status },
                dealerName
              }
            }`
          ),
          sanityClient.fetch(
            `*[_type == "dealer"] {
              _id,
              name,
              businessName,
              whatsapp,
              status
            }`
          ),
        ]);

        const analyticsData = compileDashboardAnalytics({
          orders: orders || [],
          dealers: dealers || [],
          rangeKey: range,
        });

        setData(analyticsData);
      } else {
        const res = await fetch(`/api/admin/analytics?range=${range}`);
        if (!res.ok) {
          throw new Error('Failed to load analytics data');
        }
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      }
    } catch (err) {
      console.error('Fetch Analytics Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sanityClient, range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const renderTrendBadge = (growth) => {
    if (!growth) return null;
    const { formatted, status, label } = growth;

    if (status === 'positive') {
      return (
        <span className={`${styles.trendBadge} ${styles.trendPositive}`}>
          <ArrowUpRight size={13} /> {label}
        </span>
      );
    }
    if (status === 'negative') {
      return (
        <span className={`${styles.trendBadge} ${styles.trendNegative}`}>
          <ArrowDownRight size={13} /> {label}
        </span>
      );
    }
    return (
      <span className={`${styles.trendBadge} ${styles.trendNeutral}`}>
        <Minus size={13} /> {label}
      </span>
    );
  };

  const formatCurrency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  /* Render Line/Area Chart */
  const renderChart = () => {
    const buckets = data?.revenueChart || [];
    if (buckets.length === 0) {
      return <div className="text-gray-500 text-center py-12">No time-series data for this period</div>;
    }

    const width = 800;
    const height = 220;
    const paddingX = 40;
    const paddingY = 25;

    const maxRevenue = Math.max(...buckets.map((b) => b.revenue), 100);
    const stepX = (width - paddingX * 2) / Math.max(buckets.length - 1, 1);

    const points = buckets.map((b, i) => {
      const x = paddingX + i * stepX;
      const y = height - paddingY - (b.revenue / maxRevenue) * (height - paddingY * 2);
      return { x, y, ...b };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return (
      <div className={styles.chartContainer}>
        <svg viewBox={`0 0 ${width} ${height}`} className={styles.chartSvg} preserveAspectRatio="none">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#revenueGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Interactive Dots */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint?.key === p.key ? 6 : 3.5}
                fill={hoveredPoint?.key === p.key ? '#ffffff' : '#38bdf8'}
                stroke="#0b0f17"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className={styles.tooltipBox}
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className={styles.tooltipDate}>{hoveredPoint.label}</div>
            <div className={styles.tooltipVal}>{formatCurrency(hoveredPoint.revenue)}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>
              {hoveredPoint.orders} order(s) • {hoveredPoint.units} unit(s)
            </div>
          </div>
        )}

        {/* X Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0 1rem' }}>
          {buckets.length <= 12 ? (
            buckets.map((b, idx) => (
              <span key={idx} style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {b.label}
              </span>
            ))
          ) : (
            <>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{buckets[0]?.label}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {buckets[Math.floor(buckets.length / 2)]?.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                {buckets[buckets.length - 1]?.label}
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1 className={styles.mainTitle}>AXASZ STORE Analytics</h1>
            <p className={styles.subtitle}>Loading real-time store metrics...</p>
          </div>
        </div>
        <div className={styles.kpiGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${styles.kpiCard} ${styles.skeleton}`} style={{ height: 130 }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>Error loading analytics</div>
          <div className={styles.emptyDesc}>{error}</div>
          <button onClick={fetchAnalytics} className={styles.refreshBtn} style={{ marginTop: '1rem' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const weekly = data?.weeklyGrowth;
  const monthly = data?.monthlyGrowth;
  const products = data?.productAnalytics || {};
  const statusPayment = data?.statusAndPayment || {};
  const dealers = data?.dealerPerformance || [];

  return (
    <div className={styles.dashboardContainer}>
      {/* ── TOP HEADER ── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.titleRow}>
            <h1 className={styles.mainTitle}>Business Intelligence &amp; Analytics</h1>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} /> Live Store
            </span>
          </div>
          <p className={styles.subtitle}>
            Real-time revenue, order growth, product rankings, and multi-dealer performance.
          </p>
        </div>

        <div className={styles.controlsArea}>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className={styles.rangeSelect}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">This Year</option>
          </select>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className={styles.refreshBtn}
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── EMPTY STATE IF NO STORE DATA ── */}
      {!data?.hasData ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Package size={32} />
          </div>
          <div className={styles.emptyTitle}>No sales data yet</div>
          <div className={styles.emptyDesc}>
            Once customers place orders on AXASZSTORE, your revenue curves, product trajectories, and dealer metrics will populate here automatically.
          </div>
        </div>
      ) : (
        <>
          {/* ── KPI CARDS GRID ── */}
          <div className={styles.kpiGrid}>
            {/* 1. Total Sales / Orders */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Total Orders</span>
                <div className={styles.kpiIcon}><ShoppingCart size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{(kpis.totalSales?.value || 0).toLocaleString()}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.totalSales?.growth)}
                <span className={styles.trendPeriod}>vs prior period</span>
              </div>
            </div>

            {/* 2. Total Realized Revenue */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Realized Revenue</span>
                <div className={styles.kpiIcon}><DollarSign size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{formatCurrency(kpis.totalRevenue?.value)}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.totalRevenue?.growth)}
                <span className={styles.trendPeriod}>vs prior period</span>
              </div>
            </div>

            {/* 3. Paid Orders */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Paid Orders</span>
                <div className={styles.kpiIcon}><CheckCircle2 size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{(kpis.paidOrders?.value || 0).toLocaleString()}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.paidOrders?.growth)}
                <span className={styles.trendPeriod}>routed to dealers</span>
              </div>
            </div>

            {/* 4. Unpaid Orders */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Unpaid / Follow-up</span>
                <div className={styles.kpiIcon}><Clock size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{(kpis.unpaidOrders?.value || 0).toLocaleString()}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.unpaidOrders?.growth)}
                <span className={styles.trendPeriod}>direct contact</span>
              </div>
            </div>

            {/* 5. Products Sold Units */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Products Sold</span>
                <div className={styles.kpiIcon}><Package size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{(kpis.productsSold?.value || 0).toLocaleString()}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.productsSold?.growth)}
                <span className={styles.trendPeriod}>total units</span>
              </div>
            </div>

            {/* 6. Average Order Value */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiLabel}>Avg Order Value</span>
                <div className={styles.kpiIcon}><CreditCard size={16} /></div>
              </div>
              <div className={styles.kpiValue}>{formatCurrency(kpis.averageOrderValue?.value)}</div>
              <div className={styles.kpiFooter}>
                {renderTrendBadge(kpis.averageOrderValue?.growth)}
                <span className={styles.trendPeriod}>per paid order</span>
              </div>
            </div>
          </div>

          {/* ── REVENUE GROWTH TIME SERIES CHART ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <BarChart3 size={18} /> Revenue Growth &amp; Trajectory
                </h2>
                <p className={styles.sectionSubtitle}>
                  Realized revenue time-series over the selected date range.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Total: <strong style={{ color: '#ffffff' }}>{formatCurrency(kpis.totalRevenue?.value)}</strong>
                </span>
                {renderTrendBadge(kpis.totalRevenue?.growth)}
              </div>
            </div>

            {renderChart()}
          </div>

          {/* ── TWO-COLUMN: WEEKLY GROWTH & MONTHLY GROWTH ── */}
          <div className={styles.twoColGrid}>
            {/* Weekly Growth */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Weekly Growth</h3>
                  <p className={styles.sectionSubtitle}>{weekly?.periodLabel}</p>
                </div>
                {renderTrendBadge(weekly?.revenue?.growth)}
              </div>

              <div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Revenue</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{formatCurrency(weekly?.revenue?.current)}</span>
                    <span className={styles.compPrev}>prev {formatCurrency(weekly?.revenue?.previous)}</span>
                    {renderTrendBadge(weekly?.revenue?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Total Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{weekly?.orders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {weekly?.orders?.previous || 0}</span>
                    {renderTrendBadge(weekly?.orders?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Products Sold (Units)</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{weekly?.productsSold?.current || 0}</span>
                    <span className={styles.compPrev}>prev {weekly?.productsSold?.previous || 0}</span>
                    {renderTrendBadge(weekly?.productsSold?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Paid Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{weekly?.paidOrders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {weekly?.paidOrders?.previous || 0}</span>
                    {renderTrendBadge(weekly?.paidOrders?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Unpaid Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{weekly?.unpaidOrders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {weekly?.unpaidOrders?.previous || 0}</span>
                    {renderTrendBadge(weekly?.unpaidOrders?.growth)}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Growth */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Monthly Growth</h3>
                  <p className={styles.sectionSubtitle}>{monthly?.periodLabel}</p>
                </div>
                {renderTrendBadge(monthly?.revenue?.growth)}
              </div>

              <div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Total Revenue</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{formatCurrency(monthly?.revenue?.current)}</span>
                    <span className={styles.compPrev}>prev {formatCurrency(monthly?.revenue?.previous)}</span>
                    {renderTrendBadge(monthly?.revenue?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Total Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{monthly?.orders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {monthly?.orders?.previous || 0}</span>
                    {renderTrendBadge(monthly?.orders?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Paid Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{monthly?.paidOrders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {monthly?.paidOrders?.previous || 0}</span>
                    {renderTrendBadge(monthly?.paidOrders?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Unpaid Orders</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{monthly?.unpaidOrders?.current || 0}</span>
                    <span className={styles.compPrev}>prev {monthly?.unpaidOrders?.previous || 0}</span>
                    {renderTrendBadge(monthly?.unpaidOrders?.growth)}
                  </div>
                </div>
                <div className={styles.compRow}>
                  <span className={styles.compLabel}>Products Sold</span>
                  <div className={styles.compValues}>
                    <span className={styles.compCurrent}>{monthly?.productsSold?.current || 0}</span>
                    <span className={styles.compPrev}>prev {monthly?.productsSold?.previous || 0}</span>
                    {renderTrendBadge(monthly?.productsSold?.growth)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BEST-SELLING PRODUCTS & PRODUCT GROWTH ── */}
          <div className={styles.sectionBlock} style={{ marginTop: '2rem' }}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>
                  <Award size={18} /> Best-Selling Products Leaderboard
                </h2>
                <p className={styles.sectionSubtitle}>
                  Top performing sneaker models ranked by realized sales.
                </p>
              </div>

              <div className={styles.tabPillGroup}>
                <button
                  onClick={() => setProductTab('revenue')}
                  className={`${styles.tabPill} ${productTab === 'revenue' ? styles.tabPillActive : ''}`}
                >
                  Best by Revenue
                </button>
                <button
                  onClick={() => setProductTab('units')}
                  className={`${styles.tabPill} ${productTab === 'units' ? styles.tabPillActive : ''}`}
                >
                  Best by Units
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Product</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                    <th>Avg Price</th>
                    <th>Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {(productTab === 'revenue' ? products.bestByRevenue : products.bestByUnits)?.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                        No product sales recorded in this period.
                      </td>
                    </tr>
                  ) : (
                    (productTab === 'revenue' ? products.bestByRevenue : products.bestByUnits)
                      ?.slice(0, 10)
                      .map((p, idx) => (
                        <tr key={p.id || idx}>
                          <td>
                            <span
                              className={`${styles.rankBadge} ${
                                idx === 0 ? styles.rank1 : idx === 1 ? styles.rank2 : idx === 2 ? styles.rank3 : ''
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </td>
                          <td>
                            <div className={styles.productCell}>
                              <div>
                                <div className={styles.productName}>{p.name}</div>
                                {p.productCode && <div className={styles.productSku}>SKU: {p.productCode}</div>}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>{p.units}</td>
                          <td style={{ fontWeight: 800, color: '#38bdf8' }}>{formatCurrency(p.revenue)}</td>
                          <td style={{ color: '#94a3b8' }}>{formatCurrency(p.avgPrice)}</td>
                          <td>{renderTrendBadge(p.revenueGrowth)}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── TWO-COLUMN: PRODUCT GROWTH & PAID VS UNPAID ── */}
          <div className={styles.twoColGrid}>
            {/* Top Growing & Declining Products */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <TrendingUp size={18} /> Product Growth Trajectory
                  </h3>
                  <p className={styles.sectionSubtitle}>Growing vs declining items vs prior period.</p>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  🚀 Top Growing Products
                </div>
                {products.growingProducts?.length === 0 ? (
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>No growing products recorded.</div>
                ) : (
                  products.growingProducts?.map((p, idx) => (
                    <div key={idx} className={styles.compRow}>
                      <span className={styles.compLabel}>{p.name}</span>
                      <div className={styles.compValues}>
                        <span className={styles.compCurrent}>{formatCurrency(p.revenue)}</span>
                        {renderTrendBadge(p.revenueGrowth)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {products.decliningProducts?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    📉 Top Declining Products
                  </div>
                  {products.decliningProducts.map((p, idx) => (
                    <div key={idx} className={styles.compRow}>
                      <span className={styles.compLabel}>{p.name}</span>
                      <div className={styles.compValues}>
                        <span className={styles.compCurrent}>{formatCurrency(p.revenue)}</span>
                        {renderTrendBadge(p.revenueGrowth)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Paid vs Unpaid Analysis */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <PieChart size={18} /> Paid vs Unpaid Orders
                  </h3>
                  <p className={styles.sectionSubtitle}>Payment conversion &amp; direct customer contact.</p>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: 700 }}>
                    Paid ({statusPayment.paymentAnalytics?.paidPercentage || 0}%)
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 700 }}>
                    Unpaid ({statusPayment.paymentAnalytics?.unpaidPercentage || 0}%)
                  </span>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFillPaid}
                    style={{ width: `${statusPayment.paymentAnalytics?.paidPercentage || 0}%` }}
                  />
                  <div
                    className={styles.progressFillUnpaid}
                    style={{ width: `${statusPayment.paymentAnalytics?.unpaidPercentage || 0}%` }}
                  />
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className={styles.compRow}>
                    <span className={styles.compLabel}>Paid Orders (Fulfilled/Dealer)</span>
                    <span className={styles.compCurrent} style={{ color: '#4ade80' }}>
                      {statusPayment.paymentAnalytics?.paidCount || 0} orders
                    </span>
                  </div>
                  <div className={styles.compRow}>
                    <span className={styles.compLabel}>Unpaid / Pending Direct Follow-up</span>
                    <span className={styles.compCurrent} style={{ color: '#f59e0b' }}>
                      {statusPayment.paymentAnalytics?.unpaidCount || 0} orders
                    </span>
                  </div>
                  <div className={styles.compRow}>
                    <span className={styles.compLabel}>Total Attempted Orders</span>
                    <span className={styles.compCurrent}>
                      {statusPayment.paymentAnalytics?.totalOrders || 0} orders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── TWO-COLUMN: ORDER STATUS LIFECYCLE & MULTI-DEALER PERFORMANCE ── */}
          <div className={styles.twoColGrid} style={{ marginTop: '2rem' }}>
            {/* Order Status Distribution */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Order Lifecycle Status</h3>
                  <p className={styles.sectionSubtitle}>Distribution of all order statuses.</p>
                </div>
              </div>

              <div>
                {statusPayment.orderStatusDistribution?.map((item) => (
                  <div key={item.status} className={styles.compRow}>
                    <span className={styles.compLabel}>{item.status}</span>
                    <div className={styles.compValues}>
                      <span className={styles.compCurrent}>{item.count}</span>
                      <span className={styles.compPrev}>({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Dealers Performance */}
            <div className={styles.sectionBlock} style={{ marginBottom: 0 }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>
                    <Store size={18} /> Dealer &amp; Supplier Performance
                  </h3>
                  <p className={styles.sectionSubtitle}>Sales volume by assigned product dealer.</p>
                </div>
              </div>

              {dealers.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.875rem', padding: '1rem 0' }}>
                  No dealer-attributed sales in this period.
                </div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Dealer</th>
                      <th>Orders</th>
                      <th>Units</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.map((d, idx) => (
                      <tr key={d.id || idx}>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>{d.name}</td>
                        <td>{d.ordersCount}</td>
                        <td>{d.unitsSold}</td>
                        <td style={{ fontWeight: 800, color: '#38bdf8' }}>{formatCurrency(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
