document.getElementById("f").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const messageEl = document.getElementById("message");

  // Clear previous messages
  messageEl.className = "message";

  const formData = new FormData(form);
  try {
    const res = await fetch("/submit", {
      method: "POST",
      body: new URLSearchParams(formData),
    });

    const text = await res.text();
    if (res.ok) {
      messageEl.textContent = text; // e.g., "✅ Form submitted securely!"
      messageEl.classList.add("success");
      form.reset(); // Clear form on success
    } else {
      messageEl.textContent = text || "Submission failed. Please try again.";
      messageEl.classList.add("error");
    }
  } catch (err) {
    messageEl.textContent = "Network error. Please check your connection.";
    messageEl.classList.add("error");
  }
});
