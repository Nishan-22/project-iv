import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useMetaMask } from "../hooks/useMetaMask.js";
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  card,
  cardHighlight,
  page,
} from "../lib/ui.js";
import { formatDateRange, shortenAddress } from "../utils/format.js";

export function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const { address, error, connecting, connect, disconnect } = useMetaMask();
  const [elections, setElections] = useState([]);
  const [linkMsg, setLinkMsg] = useState(null);

  useEffect(() => {
    api.get("/elections/").then((res) => setElections(res.data));
  }, []);

  async function linkWallet() {
    setLinkMsg(null);
    const wallet = address ?? (await connect());
    if (!wallet) return;
    try {
      await api.post("/auth/wallet/", { wallet_address: wallet });
      await refreshUser();
      setLinkMsg("Wallet linked successfully.");
    } catch {
      setLinkMsg("This wallet is already linked to another account.");
    }
  }

  return (
    <div className={page}>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Welcome back, {user?.first_name || user?.username}. View active elections,
          link your wallet, and cast your vote.
        </p>
      </header>

      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <section className={`${cardHighlight} space-y-4`}>
          <div>
            <span className="text-2xl" aria-hidden>
              🦊
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Wallet identity</h2>
            <p className="mt-1 text-sm text-slate-600">
              Connect MetaMask to link your wallet to your student profile for
              verified participation.
            </p>
          </div>
          {user?.wallet_address ? (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Linked wallet
              </p>
              <p className="break-all rounded-xl bg-slate-100 p-3 font-mono text-xs text-slate-800">
                {user.wallet_address}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {address ? (
                <p className="break-all rounded-xl bg-slate-100 p-3 font-mono text-xs">
                  {shortenAddress(address)}
                </p>
              ) : (
                <p className="text-sm text-slate-500">No wallet connected yet.</p>
              )}
              {error && <div className={alertError}>{error}</div>}
              <div className="flex flex-wrap gap-2">
                {!address && (
                  <button
                    type="button"
                    className={btnPrimary}
                    onClick={() => connect()}
                    disabled={connecting}
                  >
                    {connecting ? "Connecting…" : "Connect MetaMask"}
                  </button>
                )}
                {address && (
                  <>
                    <button type="button" className={btnPrimary} onClick={linkWallet}>
                      Link to profile
                    </button>
                    <button type="button" className={btnSecondary} onClick={disconnect}>
                      Disconnect
                    </button>
                  </>
                )}
              </div>
              {linkMsg && (
                <div
                  className={
                    linkMsg.includes("success") ? alertSuccess : alertError
                  }
                >
                  {linkMsg}
                </div>
              )}
            </div>
          )}
        </section>

        <section className={`${card} space-y-0`}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">Your profile</h2>
          {[
            ["Name", `${user?.first_name || ""} ${user?.last_name || ""}`.trim()],
            ["Student ID", user?.student_id || "—"],
            ["Semester", user?.semester || "—"],
            [
              "Status",
              user?.is_verified ? "Verified" : "Pending verification",
            ],
          ].map(([dt, dd]) => (
            <div
              key={dt}
              className="flex justify-between border-b border-slate-100 py-3 text-sm last:border-0"
            >
              <span className="text-slate-500">{dt}</span>
              <span className="font-semibold text-slate-900">{dd}</span>
            </div>
          ))}
        </section>
      </div>

      <h2 className="mb-4 text-xl font-bold text-slate-900">Elections</h2>
      {elections.length === 0 ? (
        <div className={`${card} py-12 text-center`}>
          <h3 className="font-bold text-slate-900">No elections available</h3>
          <p className="mt-2 text-sm text-slate-500">
            Check back when the election committee publishes a new election.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.map((e) => (
            <article
              key={e.id}
              className={`${card} flex flex-col gap-4 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between`}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{e.title}</h3>
                  <StatusBadge status={e.status} isOpen={e.is_open} />
                </div>
                {e.description && (
                  <p className="text-sm text-slate-600">{e.description}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formatDateRange(e.start_time, e.end_time)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  to={`/vote/${e.id}`}
                  className={`${btnPrimary} ${!e.is_open ? "pointer-events-none opacity-50" : ""}`}
                  onClick={(ev) => !e.is_open && ev.preventDefault()}
                >
                  Cast vote
                </Link>
                <Link to={`/results/${e.id}`} className={btnSecondary}>
                  View results
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
