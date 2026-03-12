// Global modal state — module-level so it works across the entire app
let _showSubscribeModal: ((mode?: "user" | "agent") => void) | null = null;

export const registerSubscribeModal = (fn: (mode?: "user" | "agent") => void) => {
  _showSubscribeModal = fn;
};

export const showSubscribeModal = (mode: "user" | "agent" = "user") => {
  if (_showSubscribeModal) {
    _showSubscribeModal(mode);
  }
};
