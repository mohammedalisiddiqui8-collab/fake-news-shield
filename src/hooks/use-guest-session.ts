import { useEffect, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

/**
 * Veritas is free to use — there is no login screen, no sign-up and no
 * account prompt anywhere in the product.
 *
 * The backend still needs a real Convex identity to scope stored
 * investigations (`analyses.listByUser` / `create` / `remove` all read
 * `ctx.auth.getUserIdentity()`), so this hook transparently provisions an
 * anonymous session the first time the app loads. The user never sees it,
 * never approves it and can never be blocked by it: the interface renders
 * immediately, and the queries simply resolve once the session exists.
 */
export function useGuestSession() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const attempted = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (isLoading || isAuthenticated || attempted.current) return;
    attempted.current = true;
    signIn("anonymous").catch(() => {
      // A failure here must never trap the user on a wall — Veritas stays
      // usable read-only, analyses simply are not filed to the archive.
      attempted.current = false;
      setFailed(true);
    });
  }, [isLoading, isAuthenticated, signIn]);

  return {
    /** True once an identity exists and the archive queries can resolve. */
    isReady: isAuthenticated,
    /** True only if the anonymous session could not be provisioned. */
    unavailable: failed,
  };
}
