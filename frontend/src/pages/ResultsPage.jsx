import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { LoadingScreen } from "../components/LoadingScreen.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { btnPrimary, btnSecondary, card, page } from "../lib/ui.js";

export function ResultsPage() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!electionId) return;
    api
      .get(`/results/${electionId}/`)
      .then((res) => {
        setElection(res.data.election);
        setResults(res.data.results);
        setTotal(res.data.total_votes);
      })
      .finally(() => setLoading(false));
  }, [electionId]);

  const grouped = results.reduce((acc, row) => {
    (acc[row.position_name] ??= []).push(row);
    return acc;
  }, {});

  if (loading) return <LoadingScreen message="Loading results…" />;

  const positionCount = Object.keys(grouped).length;

  return (
    <div className={page}>
      <Link
        to="/"
        className="mb-6 inline-flex text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        ← Back to dashboard
      </Link>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {election?.title ?? "Election results"}
            </h1>
            {election && (
              <StatusBadge status={election.status} isOpen={election.is_open} />
            )}
          </div>
          <p className="text-slate-600">Live tally based on submitted votes.</p>
        </div>
        {election?.is_open && (
          <Link to={`/vote/${electionId}`} className={btnPrimary}>
            Cast vote
          </Link>
        )}
      </header>

      <div className="mb-8 flex flex-wrap gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{total}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total votes
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{positionCount}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Positions
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className={`${card} py-12 text-center`}>
          <h3 className="font-bold text-slate-900">No votes yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Results will appear here once voting begins.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([position, rows]) => {
            const maxVotes = Math.max(...rows.map((r) => r.vote_count), 1);
            const sorted = [...rows].sort((a, b) => b.vote_count - a.vote_count);

            return (
              <section key={position} className={card}>
                <h2 className="mb-4 text-lg font-bold text-slate-900">{position}</h2>
                <div className="space-y-4">
                  {sorted.map((r, index) => {
                    const pct = Math.round((r.vote_count / maxVotes) * 100);
                    const isLeading = index === 0 && r.vote_count > 0;

                    return (
                      <div
                        key={r.candidate_id}
                        className={
                          isLeading
                            ? "rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-4"
                            : "p-1"
                        }
                      >
                        {isLeading && (
                          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Leading
                          </span>
                        )}
                        <div className="mb-1.5 flex justify-between text-sm">
                          <span className="font-semibold text-slate-900">
                            {r.candidate_name}
                          </span>
                          <span className="text-slate-600">
                            {r.vote_count} vote{r.vote_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
