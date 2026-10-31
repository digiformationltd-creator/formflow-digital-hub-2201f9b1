const FLAG = "businessos.welcomeTour.v1.done";

export function shouldShowTourOnMount(): boolean {
  try { return localStorage.getItem(FLAG) !== "1"; } catch { return false; }
}

export function markTourDone() {
  try { localStorage.setItem(FLAG, "1"); } catch { /* ignore */ }
}

export function resetTour() {
  try { localStorage.removeItem(FLAG); } catch { /* ignore */ }
}
