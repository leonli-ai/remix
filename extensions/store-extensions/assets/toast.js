function createToast(title, description, type = "success") {
  // Remove existing toast
  const existingToast = document.querySelector(".toast-container");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast-container ${type}`;

  toast.innerHTML = `
    <div class="toast-content toast-${type}">
    ${
      type === "success"
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_2932_6826)"><path d="M23.625 12C23.625 18.4203 18.4203 23.625 12 23.625C5.57967 23.625 0.375 18.4203 0.375 12C0.375 5.57967 5.57967 0.375 12 0.375C18.4203 0.375 23.625 5.57967 23.625 12ZM10.6553 18.1553L19.2803 9.53034C19.5732 9.23747 19.5732 8.76258 19.2803 8.4697L18.2197 7.40906C17.9268 7.11614 17.4519 7.11614 17.159 7.40906L10.125 14.443L6.84098 11.159C6.54811 10.8661 6.07322 10.8661 5.7803 11.159L4.71966 12.2197C4.42678 12.5125 4.42678 12.9874 4.71966 13.2803L9.59466 18.1553C9.88758 18.4482 10.3624 18.4482 10.6553 18.1553Z" fill="#1F8A70"/></g><defs><clipPath id="clip0_2932_6826"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" height="24" width="24"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 5a1 1 0 011 1v5a1 1 0 11-2 0V8a1 1 0 011-1zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>'
    }
      <div class="toast-title-container">
        <span class="toast-title">${title}</span>
        ${description ? `<div class="toast-description">${description}</div>` : ""}
      </div>
      <button class="toast-close toast-${type}">&times;</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Bind close button event
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => toast.remove());

  // Auto dismiss after 4 seconds
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
