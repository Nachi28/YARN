const user = JSON.parse(document.getElementById('userData').dataset.user);

function showContent(id) {
    // Get all content divs
    var contentDivs = document.getElementsByClassName('content');

    // Hide all content divs
    for (var i = 0; i < contentDivs.length; i++) {
        contentDivs[i].style.display = 'none';
    }

    // Show the content div corresponding to the clicked button
    var targetContent = document.getElementById(id);
    targetContent.style.display = 'block';

    // If "Track" button is clicked, create the chart
    if (id === 'content2') {
        // Assuming you have access to the user data
        // Replace 'user' with the actual user object
        createChart(user);
    }

}

function confirmJournalSubmission() {
    // Display a confirmation dialog
    const confirmed = confirm('Are you sure you want to submit this journal entry?');

    if (confirmed) {
        // If submission is confirmed, show the success alert
        alert('Journal entry submitted successfully!');
    }

    return confirmed;
}

// Function to delete a journal entry
function deleteJournalEntry(index) {
    // Get the journal entry ID from the DOM (assuming you store the ID in a hidden span element)
    const entryId = document.querySelector(`.journal-entry[data-index="${index}"] .entry-id`).textContent;
    // console.log(`Entry ID: ${entryId}`);

    // Send a DELETE request to the server
    fetch('/journal-delete', {
        method: 'POST', // Change method to POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ entryId: entryId })
    })
        .then(response => {

            if (!response.ok) {
                throw new Error('Failed to delete journal entry');
            }
            // Notify user about successful deletion
            alert('Journal entry deleted successfully');
            // Reload the page after deleting the entry
            location.reload(); // Reload the page
        })
        .catch(error => {
            // Notify user about error
            alert('Error deleting journal entry');
            console.error('Error deleting journal entry:', error);
            // Handle error
        });
}





// // Function to generate formatted date
// function getFormattedDate(timestamp) {
//     const entryDate = new Date(timestamp);
//     return `${entryDate.getDate()} ${entryDate.toLocaleString('default', { month: 'long' })} ${entryDate.getFullYear()}`;
// }

// Function to create chart
// Function to create chart
// Function to create chart
function createChart(user) {
    const moods = [];
    const timestamps = [];

    // Extract mood values and timestamps from user data
    if (user.journal && user.journal.length > 0) {
        user.journal.reverse().forEach(entry => {
            moods.push(entry.mood);
            timestamps.push(new Date(entry.timestamp)); // Convert timestamp to milliseconds
        });
    }

    // Map mood strings to numeric values
    const moodValues = moods.map(mood => {
        switch (mood) {
            case 'Angry':
                return 1;
            case 'Sad':
                return 2;
            case 'Calm':
                return 3;
            case 'Happy':
                return 4;
            case 'Excited':
                return 5;
            default:
                return 0; // Default value if mood is not recognized
        }
    });

    console.log(moodValues, timestamps);

    var ctx = document.getElementById('moodChart').getContext('2d');

    var formattedTimestamps = timestamps.map(timestamp => moment(timestamp).format('DD-MM-YYYY (H:mm:ss)'));


    // Define mood labels
    const moodLabels = ['Angry 😠', 'Sad 😢', 'Calm 😌', 'Happy 😊', 'Excited 😄'];


    var moodChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedTimestamps, // Use formatted timestamps for x-axis
            datasets: [{
                label: 'Mood',
                data: moodValues,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: '#3498db',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category', // Specify x-axis type as category for custom labels
                    labels: formattedTimestamps, // Use formatted timestamps for labels
                    title: { display: true, text: 'Date and Time' },
                    ticks: {
                        autoSkip: false, // Disable auto-skipping of labels
                        maxRotation: 45, // Rotate labels to 45 degrees
                        minRotation: 45 // Rotate labels to 45 degrees
                    }
                },
                y: {
                    title: { display: true, text: 'Mood' },
                    ticks: {
                        stepSize: 1, // Set step size to 1
                        min: 1,      // Set minimum value to 1
                        max: 5,      // Set maximum value to 5
                        callback: function(value, index, values) {
                            return moodLabels[value - 1]; // Use mood labels instead of numeric values
                        }
                    }
                }

            },
            // Adjust height and width
            maintainAspectRatio: false, // Disable aspect ratio
            responsive: true,
            height: 50, // Set height
            width: 50 // Set width
        }
    });

}
