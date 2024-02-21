// Add JavaScript for live password confirmation check
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordMatchMessage = document.getElementById('passwordMatchMessage');

function updatePasswordMatchMessage() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password === "" || confirmPassword=== ""){
    // wait till user types something
    }
    else if (password === confirmPassword) {
        passwordMatchMessage.textContent = 'Passwords match';
        passwordMatchMessage.style.color = 'green';
    } else {
        passwordMatchMessage.textContent = 'Passwords do not match';
        passwordMatchMessage.style.color = 'red';
    }
}

passwordInput.addEventListener('input', updatePasswordMatchMessage);
confirmPasswordInput.addEventListener('input', updatePasswordMatchMessage);

