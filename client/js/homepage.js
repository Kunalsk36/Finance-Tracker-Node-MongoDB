document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();
  
  const name = this[0].value.trim();
  const email = this[1].value.trim();
  const message = this[2].value.trim();

  if (!name || !email || !message) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Submission failed");

    alert("Thank you! Your message has been sent.");
    this.reset();
  } catch (err) {
    alert("Error: " + err.message);
  }
});
