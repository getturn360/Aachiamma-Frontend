function createContainer() {
  let container = document.getElementById("__app_toast_container");
  if (!container) {
    container = document.createElement("div");
    container.id = "__app_toast_container";
    container.style.position = "fixed";
    container.style.right = "20px";
    container.style.top = "20px";
    container.style.zIndex = 99999;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }
  return container;
}

function makeToastNode({ title, description, variant }) {
  const wrap = document.createElement("div");
  wrap.style.pointerEvents = "auto";
  wrap.style.minWidth = "220px";
  wrap.style.maxWidth = "360px";
  wrap.style.padding = "12px 14px";
  wrap.style.borderRadius = "10px";
  wrap.style.boxShadow = "0 6px 18px rgba(10,10,10,0.12)";
  wrap.style.fontFamily =
    "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
  wrap.style.color = "#0f172a";
  wrap.style.background = "#fff";
  wrap.style.position = "relative"; 

  if (variant === "success") {
    wrap.style.borderLeft = "4px solid #16a34a";
  } else if (variant === "destructive" || variant === "error") {
    wrap.style.borderLeft = "4px solid #dc2626";
  } else if (variant === "warning") {
    wrap.style.borderLeft = "4px solid #d97706";
  } else {
    wrap.style.borderLeft = "4px solid #0ea5e9";
  }

  const t = document.createElement("div");
  t.style.fontWeight = "600";
  t.style.marginBottom = description ? "6px" : "0";
  t.style.fontSize = "13px";
  t.textContent = title || "";

  const d = document.createElement("div");
  d.style.fontSize = "12px";
  d.style.opacity = "0.88";
  d.textContent = description || "";

  wrap.appendChild(t);
  if (description) wrap.appendChild(d);

  const close = document.createElement("button");
  close.setAttribute("aria-label", "close toast");
  close.textContent = "✕";
  close.style.position = "absolute";
  close.style.right = "8px";
  close.style.top = "6px";
  close.style.border = "none";
  close.style.background = "transparent";
  close.style.cursor = "pointer";
  close.style.fontSize = "12px";
  close.style.opacity = "0.6";
  close.style.padding = "2px";
  close.style.lineHeight = "1";
  close.addEventListener("click", () => {
    try {
      if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    } catch (e) {}
  });
  wrap.appendChild(close);

  return wrap;
}

export function showToast({ title = "", description = "", variant = "default", timeout = 3500 } = {}) {
  try {
    const container = createContainer();
    const node = makeToastNode({ title, description, variant });
    container.appendChild(node);

    if (typeof timeout === "number" && timeout > 0) {
      const timer = setTimeout(() => {
        try {
          if (node && node.parentNode) node.parentNode.removeChild(node);
        } catch (e) {}
      }, timeout);

      node.addEventListener("mouseenter", () => {
        clearTimeout(timer);
      });
    }

    return { success: true };
  } catch (e) {
    try {
      alert((title ? title + "\n" : "") + (description || ""));
    } catch (er) {}
    return { success: false, error: e };
  }
}


function _callableToast(options = {}) {
  return showToast(options);
}

_callableToast.success = (title = "", description = "", timeout = 3500) =>
  showToast({ title, description, variant: "success", timeout });

_callableToast.error = (title = "", description = "", timeout = 3500) =>
  showToast({ title, description, variant: "destructive", timeout });

_callableToast.info = (title = "", description = "", timeout = 3500) =>
  showToast({ title, description, variant: "default", timeout });

_callableToast.warn = (title = "", description = "", timeout = 3500) =>
  showToast({ title, description, variant: "warning", timeout });

_callableToast.raw = showToast;

export const toast = _callableToast;
export default toast;
