document.addEventListener("DOMContentLoaded", function () {
    const addCommentBtns = document.querySelectorAll(".add-comment-btn");

    addCommentBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const commentForm = this.nextElementSibling;
            const commentsList = this.previousElementSibling;

            // Toggle display of comment form
            commentForm.style.display = commentForm.style.display === "none" ? "block" : "none";

            // If comment form is visible, show previous comments
            if (commentForm.style.display === "block") {
                commentsList.style.display = "block";
            }
        });
    });

    const commentForms = document.querySelectorAll(".comment-form");

    commentForms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const forumId = this.querySelector("input[name='forumId']").value;
            const commentContent = this.querySelector("textarea[name='comment']").value;

            // Append the new comment to the list of comments
            const commentsList = this.previousElementSibling.querySelector(".comments-list");
            const newComment = document.createElement("li");
            newComment.textContent = commentContent;
            commentsList.appendChild(newComment);

            // Clear the comment input field
            this.querySelector("textarea[name='comment']").value = "";

            // Hide the comment form after submission
            this.style.display = "none";
        });
    });
});
