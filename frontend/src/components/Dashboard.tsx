/**
 * Display system metrics & health checks
 */
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { formatDuration } from '../utils/helpers';
import type { SystemStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiService.getSystemStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Failed to load statistics</div>
      </div>
    );
  }

  const successRate = stats.total_queries > 0
    ? Math.round((stats.successful_queries / stats.total_queries) * 100)
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100">System Analytics</h2>
        <p className="text-slate-400 mt-2">
          Runtime metrics for the current backend instance
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Queries"
          value={stats.total_queries.toString()}
          subtitle={`${stats.queries_today} today`}
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          subtitle={`${stats.successful_queries}/${stats.total_queries}`}
          color="green"
        />
        <MetricCard
          title="Avg Latency"
          value={formatDuration(stats.avg_latency)}
          subtitle="Per query"
          color="purple"
        />
        <MetricCard
          title="Failed Queries"
          value={stats.failed_queries.toString()}
          subtitle="Errors tracked"
          color="red"
        />
      </div>

      {/* System Health */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">
          System Health
        </h3>
        <div className="space-y-3">
          <HealthIndicator label="API Server" status="healthy" />
          <HealthIndicator label="Database" status="down" />
          <HealthIndicator label="LLM Service" status="healthy" />
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'purple' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color,
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h3 className="text-slate-400 text-sm mb-2">{title}</h3>
      <p
        className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}
      >
        {value}
      </p>
      <p className="text-slate-500 text-xs mt-2">{subtitle}</p>
    </div>
  );
};

interface HealthIndicatorProps {
  label: string;
  status: 'healthy' | 'degraded' | 'down';
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  label,
  status,
}) => {
  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'Operational' },
    degraded: { color: 'bg-yellow-500', text: 'Degraded' },
    down: { color: 'bg-red-500', text: 'Down' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
      <span className="text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        <span className="text-sm text-slate-400">{config.text}</span>
      </div>
    </div>
  );
};