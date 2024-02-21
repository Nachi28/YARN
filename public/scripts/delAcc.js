
function deleteAccount() {
    if (confirm("Are you sure you want to delete your account?")) {
      // Make an AJAX request to the server to trigger the account deletion
      fetch('/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.success)
        if (data.success) {
          // Redirect to the login page or another appropriate page after successful deletion
          // console.log("Account Deleted ")
          window.location.href = '/login';
        } else {
          alert('Failed to delete account. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error deleting account:', error);
        // Handle error, e.g., display an alert to the user
      });
    }
  }