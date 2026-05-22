import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { LoadingScreen } from "../components/LoadingScreen.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  card,
  page,
} from "../lib/ui.js";
import { formatDateRange } from "../utils/format.js";

export function VotePage() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [myVotes, setMyVotes] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!electionId) return;
    Promise.all([
      api.get(`/elections/${electionId}/`),
      api.get(`/candidates/?election=${electionId}`),
      api.get(`/votes/mine/?election=${electionId}`),
    ])
      .then(([e, c, v]) => {
        setElection(e.data);
        setCandidates(c.data);
        setMyVotes(v.data);
      })
      .finally(() => setLoading(false));
  }, [electionId]);

  const byPosition = useMemo(() => {
    const map = new Map();
    for (const c of candidates) {
      const list = map.get(c.position) ?? [];
      list.push(c);
      map.set(c.position, list);
    }
    return map;
  }, [candidates]);

  const votedPositions = new Set(myVotes.map((v) => v.position_id));
  const voteByPosition = Object.fromEntries(
    myVotes.map((v) => [v.position_id, v.candidate_name])
  );

  async function castVote(candidateId) {
    if (!electionId) return;
    setMessage(null);
    try {
      await api.post("/votes/", {
        election_id: Number(electionId),
        candidate_id: candidateId,
      });
      const { data } = await api.get(`/votes/mine/?election=${electionId}`);
      setMyVotes(data);
      setMessage("Your vote has been recorded.");
    } catch (err) {
      const detail = err?.response?.data?.detail ?? "Could not submit vote.";
      setMessage(detail);
    }
  }

  if (loading) return <LoadingScreen message="Loading ballot…" />;

  if (!election) {
    return (
      <div className={page}>
        <div className={`${card} py-12 text-center`}>
          <h3 className="font-bold text-slate-900">Election not found</h3>
          <Link to="/" className={`${btnPrimary} mt-4 inline-flex`}>
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-slate-900">{election.title}</h1>
            <StatusBadge status={election.status} isOpen={election.is_open} />
          </div>
          <p className="max-w-2xl text-slate-600">
            {election.is_open
              ? "Select one candidate per position. You cannot change your vote after submitting."
              : "This election is not accepting votes right now."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateRange(election.start_time, election.end_time)}
          </p>
        </div>
        <Link to={`/results/${electionId}`} className={btnSecondary}>
          View results
        </Link>
      </header>

      {message && (
        <div
          className={`mb-6 ${message.includes("recorded") ? alertSuccess : alertError}`}
        >
          {message}
        </div>
      )}

      <div className="space-y-6">
        {election.positions.map((pos) => (
          <section key={pos.id} className={card}>
            <h2 className="mb-4 border-b-2 border-indigo-100 pb-2 text-lg font-bold text-slate-900">
              {pos.name}
            </h2>
            {votedPositions.has(pos.id) ? (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">
                  ✓
                </span>
                You voted for <strong>{voteByPosition[pos.id]}</strong>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {(byPosition.get(pos.id) ?? []).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="font-semibold text-slate-900">
                      {c.student_name}
                    </span>
                    <button
                      type="button"
                      className={btnPrimary}
                      disabled={!election.is_open}
                      onClick={() => castVote(c.id)}
                    >
                      Vote
                    </button>
                  </li>
                ))}
                {(byPosition.get(pos.id) ?? []).length === 0 && (
                  <li className="py-2 text-sm text-slate-500">
                    No candidates listed for this position.
                  </li>
                )}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
