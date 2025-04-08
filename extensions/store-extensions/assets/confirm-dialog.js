function createConfirmDialog({
  title = "Confirm",
  description = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
} = {}) {
  return new Promise((resolve) => {
    // Check if the dialog already exists
    const existingDialog = document.getElementById("confirm-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create dialog HTML
    const dialog = document.createElement("div");
    dialog.id = "confirm-dialog";
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
      <div class="confirm-dialog-content">
        <div class="confirm-dialog-header">
          <h2>${title}</h2>
          <button class="confirm-dialog-close">&times;</button>
        </div>
        ${description ? `<div class="confirm-dialog-body">${description}</div>` : ""}
        <div class="confirm-dialog-footer">
          <button class="confirm-dialog-btn confirm-dialog-confirm">${confirmText}</button>
          <button class="confirm-dialog-btn confirm-dialog-cancel">${cancelText}</button>
        </div>
      </div>
    `;

    // Add to document
    document.body.appendChild(dialog);

    // Bind events
    const closeBtn = dialog.querySelector(".confirm-dialog-close");
    const confirmBtn = dialog.querySelector(".confirm-dialog-confirm");
    const cancelBtn = dialog.querySelector(".confirm-dialog-cancel");

    function close(result) {
      dialog.remove();
      resolve(result);
    }

    closeBtn.addEventListener("click", () => close(false));
    confirmBtn.addEventListener("click", () => close(true));
    cancelBtn.addEventListener("click", () => close(false));

    // Click background to close
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        close(false);
      }
    });

    // ESC key to close
    document.addEventListener("keydown", function escListener(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", escListener);
        close(false);
      }
    });
  });
}

// Export function
window.confirmDialog = createConfirmDialog;
