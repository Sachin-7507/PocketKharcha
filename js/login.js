function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("inputEmail").value.trim();
  const password = document.getElementById("inputPassword").value.trim();

  if (!email || !password) {
    Swal.fire("Enter both email and password");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    // Set currentUser
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ name: user.name, email: user.email })
    );

    Swal.fire("Login Successful!").then(() => {
      window.location.href = "dashboard.html";
    });
  } else {
    document.getElementById("inputEmail").focus();
    Swal.fire("Invalid email or password");
  }
}

function playClickSound() {
  const audio = document.getElementById("audio");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn("Audio play blocked:", err);
    });
  }
}
