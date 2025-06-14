document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token); // save JWT
      alert('Login successful!');
      window.location.href = 'index.html'; // redirect to dashboard
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Error connecting to server');
  }
});
