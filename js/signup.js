
// Focus the name field on page load
window.onload = () => {
  const nameInput = document.getElementById("name");
  if (nameInput) nameInput.focus();
};

// Handle Sign Up button click
function handleSignUp(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm = document.getElementById("confirm-password").value.trim();

  if (!name) {
    document.getElementById("name").focus();
    Swal.fire("Enter your name");

    return false;
  }
  if (!email) {
    document.getElementById("email").focus();
    Swal.fire("Enter your email");

    return false;
  }
  if (!password) {
    document.getElementById("password").focus();
    Swal.fire("Enter your password");

    return false;
  }
  if (!confirm) {
    document.getElementById("confirm-password").focus();
    Swal.fire("Confirm your password");

    return false;
  }

  if (password !== confirm) {
    Swal.fire("Passwords do not match");
    return;
  }

  // Get existing users from localStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    Swal.fire("Email already registered!");
    return;
  }

  // Save new user
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // Set currentUser
  localStorage.setItem("currentUser", JSON.stringify({ name, email }));

  Swal.fire("Sign Up Successful!").then(() => {
    window.location.href = "dashboard.html"; // Redirect
  });
}

function playClickSound() {
  let audio = document.getElementById("audio");
  audio.currentTime = 0;
  audio.play();
}
