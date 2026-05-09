/**
 * Displays historical research queries with filtering and search.
 */
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { formatDate, formatDuration, truncateText } from '../utils/helpers';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { QueryHistory } from '../types';

interface ExtendedQueryHistory extends QueryHistory {
  report?: string;
}

export const ResearchHistory: React.FC = () => {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('recent');
  const [selectedReport, setSelectedReport] = useState<ExtendedQueryHistory | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await apiService.getQueryHistory(50);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch = item.query
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortOrder === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortOrder === 'fastest') {
        return (a.execution_time || 0) - (b.execution_time || 0);
      }
      if (sortOrder === 'slowest') {
        return (b.execution_time || 0) - (a.execution_time || 0);
      }
      return 0;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getIntentBadge = (intent?: string) => {
    if (!intent) return null;
    const colors = {
      RESEARCH: 'bg-blue-500/20 text-blue-400',
      CHAT: 'bg-purple-500/20 text-purple-400',
      LITERATURE_REVIEW: 'bg-cyan-500/20 text-cyan-400',
    };
    return colors[intent as keyof typeof colors] || colors.RESEARCH;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Research History</h2>
        <p className="text-slate-400 mt-2">
          Browse recent queries stored in the current backend session
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              title="Status Filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              title="Sort Order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="fastest">Fastest</option>
              <option value="slowest">Slowest</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadHistory}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-slate-400 text-sm">
        Showing {filteredHistory.length} of {history.length} queries
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-400">
              {searchTerm || filterStatus !== 'all'
                ? 'No queries match your filters'
                : 'No research history yet. Start a conversation!'}
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-200 mb-2">
                    {truncateText(item.query, 150)}
                  </h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    {/* Intent Badge */}
                    {item.intent && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getIntentBadge(
                          item.intent
                        )}`}
                      >
                        {item.intent.replace('_', ' ')}
                      </span>
                    )}

                    {/* Execution Time */}
                    {item.execution_time && (
                      <span className="text-xs text-slate-500">
                        ⏱️ {formatDuration(item.execution_time)}
                      </span>
                    )}

                    {/* Thread ID */}
                    <span className="text-xs text-slate-600">
                      ID: {item.thread_id.substring(0, 12)}...
                    </span>
                  </div>
                </div>

                {/* View Button */}
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const result = await apiService.getResearchResult(item.thread_id);
                      setSelectedReport({
                        ...item,
                        report: result.report
                      });
                    } catch (err) {
                      console.error("Failed to load report", err);
                      alert("Failed to load report content");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm transition-colors"
                >
                  View Report
                </button>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-slate-500">
                Created: {formatDate(item.created_at)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More (if needed) */}
      {filteredHistory.length >= 20 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            Load More
          </button>
        </div>
      )}
      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Research Report</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedReport.query}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <MarkdownRenderer content={selectedReport.report || "No content found for this report."} />
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (selectedReport.report) {
                    navigator.clipboard.writeText(selectedReport.report);
                    alert("Copied to clipboard");
                  }
                }}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm"
              >
                Copy Content
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};