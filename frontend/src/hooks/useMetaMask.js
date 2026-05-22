import { BrowserProvider } from "ethers";
import { useCallback, useState } from "react";

export function useMetaMask() {
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask is not installed. Install it from metamask.io.");
      return null;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr ?? accounts[0] ?? null);
      return addr ?? accounts[0] ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to connect wallet";
      setError(message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  return { address, error, connecting, connect, disconnect };
}
