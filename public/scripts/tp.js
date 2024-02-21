const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".today-btn"),
  gotoBtn = document.querySelector(".goto-btn"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper "),
  addEventCloseBtn = document.querySelector(".close "),
  addEventTitle = document.querySelector(".event-name "),
  addEventFrom = document.querySelector(".event-time-from "),
  addEventTo = document.querySelector(".event-time-to "),
  addEventSubmit = document.querySelector(".add-event-btn ");

document.addEventListener('DOMContentLoaded', function () {
  const medicineFields = document.getElementById('medicine-fields');
  const taskFields = document.getElementById('task-fields');

  document.querySelectorAll('input[name="event-type"]').forEach((elem) => {
    elem.addEventListener('change', function () {
      if (this.value === 'medicine') {
        medicineFields.style.display = 'block';
        taskFields.style.display = 'none';
      } else if (this.value === 'task') {
        medicineFields.style.display = 'none';
        taskFields.style.display = 'block';
      }
    });
  });
});
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const eventsArr = [];
getEvents();
console.log(eventsArr);

//function to add days in days with class day and prev-date next-date on previous month and next month days and active on today
function initCalendar() {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);
  const prevDays = prevLastDay.getDate();
  const lastDate = lastDay.getDate();
  const day = firstDay.getDay();
  const nextDays = 7 - lastDay.getDay() - 1;

  date.innerHTML = months[month] + " " + year;

  let days = "";

  for (let x = day; x > 0; x--) {
    days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDate; i++) {
    //check if event is present on that day
    let event = false;
    eventsArr.forEach((eventObj) => {
      if (
        eventObj.day === i &&
        eventObj.month === month + 1 &&
        eventObj.year === year
      ) {
        event = true;
      }
    });
    if (
      i === new Date().getDate() &&
      year === new Date().getFullYear() &&
      month === new Date().getMonth()
    ) {
      activeDay = i;
      getActiveDay(i);
      updateEvents(i);
      if (event) {
        days += `<div class="day today active event">${i}</div>`;
      } else {
        days += `<div class="day today active">${i}</div>`;
      }
    } else {
      if (event) {
        days += `<div class="day event">${i}</div>`;
      } else {
        days += `<div class="day ">${i}</div>`;
      }
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="day next-date">${j}</div>`;
  }
  daysContainer.innerHTML = days;
  addListner();
}

//function to add month and year on prev and next button
function prevMonth() {
  month--;
  if (month < 0) {
    month = 11;
    year--;
  }
  initCalendar();
}

function nextMonth() {
  month++;
  if (month > 11) {
    month = 0;
    year++;
  }
  initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);

initCalendar();

//function to add active on day
function addListner() {
  const days = document.querySelectorAll(".day");
  days.forEach((day) => {
    day.addEventListener("click", (e) => {
      getActiveDay(e.target.innerHTML);
      updateEvents(Number(e.target.innerHTML));
      activeDay = Number(e.target.innerHTML);
      //remove active
      days.forEach((day) => {
        day.classList.remove("active");
      });
      //if clicked prev-date or next-date switch to that month
      if (e.target.classList.contains("prev-date")) {
        prevMonth();
        //add active to clicked day afte month is change
        setTimeout(() => {
          //add active where no prev-date or next-date
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("prev-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else if (e.target.classList.contains("next-date")) {
        nextMonth();
        //add active to clicked day afte month is changed
        setTimeout(() => {
          const days = document.querySelectorAll(".day");
          days.forEach((day) => {
            if (
              !day.classList.contains("next-date") &&
              day.innerHTML === e.target.innerHTML
            ) {
              day.classList.add("active");
            }
          });
        }, 100);
      } else {
        e.target.classList.add("active");
      }
    });
  });
}

todayBtn.addEventListener("click", () => {
  today = new Date();
  month = today.getMonth();
  year = today.getFullYear();
  initCalendar();
});

dateInput.addEventListener("input", (e) => {
  dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
  if (dateInput.value.length === 2) {
    dateInput.value += "/";
  }
  if (dateInput.value.length > 7) {
    dateInput.value = dateInput.value.slice(0, 7);
  }
  if (e.inputType === "deleteContentBackward") {
    if (dateInput.value.length === 3) {
      dateInput.value = dateInput.value.slice(0, 2);
    }
  }
});

gotoBtn.addEventListener("click", gotoDate);

function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}

//function get active day day name and date and update eventday eventdate
function getActiveDay(date) {
  const day = new Date(year, month, date);
  const dayName = day.toString().split(" ")[0];
  eventDay.innerHTML = dayName;
  eventDate.innerHTML = date + " " + months[month] + " " + year;
}

//function update events when a day is active
function updateEvents(date) {
  let events = "";
  eventsArr.forEach((event) => {
    if (
      date === event.day &&
      month + 1 === event.month &&
      year === event.year
    ) {
      event.events.forEach((event) => {
        events += `<div class="event">
            <div class="title">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi fas fa-circle bi-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          </svg>
              <h3 class="event-title">${event.title}</h3>
            </div>
            <div class="event-time">
              <span class="event-time">${event.time}</span>
            </div>
            <div class="delete-event">
            
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi fas fa-trash-alt bi-trash3" viewBox="0 0 16 16">
  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
</svg>
            </div>
        </div>`;
      });
    }
  });
  if (events === "") {
    events = `<div class="no-event">
            <h3>No Events</h3>
        </div>`;
  }
  eventsContainer.innerHTML = events;
  saveEvents();
}

//function to add event
addEventBtn.addEventListener("click", () => {
  addEventWrapper.classList.toggle("active");
});

addEventCloseBtn.addEventListener("click", () => {
  addEventWrapper.classList.remove("active");
});

document.addEventListener("click", (e) => {
  if (e.target !== addEventBtn && !addEventWrapper.contains(e.target)) {
    addEventWrapper.classList.remove("active");
  }
});

//allow 50 chars in eventtitle
addEventTitle.addEventListener("input", (e) => {
  addEventTitle.value = addEventTitle.value.slice(0, 60);
});

function defineProperty() {
  var osccred = document.createElement("div");
  osccred.style.position = "absolute";
  osccred.style.bottom = "0";
  osccred.style.right = "0";
  osccred.style.fontSize = "10px";
  osccred.style.color = "#ccc";
  osccred.style.fontFamily = "sans-serif";
  osccred.style.padding = "5px";
  osccred.style.background = "#fff";
  osccred.style.borderTopLeftRadius = "5px";
  osccred.style.borderBottomRightRadius = "5px";
  osccred.style.boxShadow = "0 0 5px #ccc";
  document.body.appendChild(osccred);
}

defineProperty();

//allow only time in eventtime from and to
// addEventFrom.addEventListener("input", (e) => {
//   addEventFrom.value = addEventFrom.value.replace(/[^0-9:]/g, "");
//   if (addEventFrom.value.length === 2) {
//     addEventFrom.value += ":";
//   }
//   if (addEventFrom.value.length > 5) {
//     addEventFrom.value = addEventFrom.value.slice(0, 5);
//   }
// });

// addEventTo.addEventListener("input", (e) => {
//   addEventTo.value = addEventTo.value.replace(/[^0-9:]/g, "");
//   if (addEventTo.value.length === 2) {
//     addEventTo.value += ":";
//   }
//   if (addEventTo.value.length > 5) {
//     addEventTo.value = addEventTo.value.slice(0, 5);
//   }
// });

// //function to add event to eventsArr
// addEventSubmit.addEventListener("click", () => {
//   const eventTitle = addEventTitle.value;
//   const eventTimeFrom = addEventFrom.value;
//   const eventTimeTo = addEventTo.value;
//   if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
//     alert("Please fill all the fields");
//     return;
//   }



//   //check correct time format 24 hour
//   const timeFromArr = eventTimeFrom.split(":");
//   const timeToArr = eventTimeTo.split(":");
//   if (
//     timeFromArr.length !== 2 ||
//     timeToArr.length !== 2 ||
//     timeFromArr[0] > 23 ||
//     timeFromArr[1] > 59 ||
//     timeToArr[0] > 23 ||
//     timeToArr[1] > 59
//   ) {
//     alert("Invalid Time Format");
//     return;
//   }

//   const timeFrom = convertTime(eventTimeFrom);
//   const timeTo = convertTime(eventTimeTo);

//   //check if event is already added
//   let eventExist = false;
//   eventsArr.forEach((event) => {
//     if (
//       event.day === activeDay &&
//       event.month === month + 1 &&
//       event.year === year
//     ) {
//       event.events.forEach((event) => {
//         if (event.title === eventTitle) {
//           eventExist = true;
//         }
//       });
//     }
//   });
//   if (eventExist) {
//     alert("Event already added");
//     return;
//   }
//   const newEvent = {
//     title: eventTitle,
//     time: timeFrom + " - " + timeTo,
//   };
//   console.log(newEvent);
//   console.log(activeDay);
//   let eventAdded = false;
//   if (eventsArr.length > 0) {
//     eventsArr.forEach((item) => {
//       if (
//         item.day === activeDay &&
//         item.month === month + 1 &&
//         item.year === year
//       ) {
//         item.events.push(newEvent);
//         eventAdded = true;
//       }
//     });
//   }

//   if (!eventAdded) {
//     eventsArr.push({
//       day: activeDay,
//       month: month + 1,
//       year: year,
//       events: [newEvent],
//     });
//   }

//   console.log(eventsArr);
//   addEventWrapper.classList.remove("active");
//   addEventTitle.value = "";
//   addEventFrom.value = "";
//   addEventTo.value = "";
//   updateEvents(activeDay);
//   //select active day and add event class if not added
//   const activeDayEl = document.querySelector(".day.active");
//   if (!activeDayEl.classList.contains("event")) {
//     activeDayEl.classList.add("event");
//   }
// });

addEventSubmit.addEventListener("click", () => {
  const eventType = document.querySelector('input[name="event-type"]:checked');
  if (!eventType) {
    alert("Please select event type (Medicine or Task)");
    return;
  }

  const eventTitle = addEventTitle.value;
  const eventTimeFrom = addEventFrom.value;
  const eventTimeTo = addEventTo.value;

  if (eventType.value === "medicine") {
    const medicineName = document.querySelector(".medicine-name").value;
    const medicineDuration = document.querySelector('input[name="medicine-duration"]:checked');
    if (!medicineName || !medicineDuration) {
      alert("Please fill all the fields for the medicine event");
      return;
    }

    // Add medicine event to eventsArr
    const newEvent = {
      title: medicineName,
      duration: medicineDuration.value
    };
    addEventToEventsArr(newEvent);
  } else if (eventType.value === "task") {
    if (eventTitle === "" || eventTimeFrom === "" || eventTimeTo === "") {
      alert("Please fill all the fields for the task event");
      return;
    }

    // Add task event to eventsArr
    const newEvent = {
      title: eventTitle,
      time: eventTimeFrom + " - " + eventTimeTo
    };
    addEventToEventsArr(newEvent);
  }

  // Clear input fields
  addEventTitle.value = "";
  addEventFrom.value = "";
  addEventTo.value = "";

  // Update events display
  updateEvents(activeDay);
  addEventWrapper.classList.remove("active");
});

function addEventToEventsArr(newEvent) {
  let eventAdded = false;
  if (eventsArr.length > 0) {
    eventsArr.forEach((item) => {
      if (item.day === activeDay && item.month === month + 1 && item.year === year) {
        item.events.push(newEvent);
        eventAdded = true;
      }
    });
  }

  if (!eventAdded) {
    eventsArr.push({
      day: activeDay,
      month: month + 1,
      year: year,
      events: [newEvent]
    });
  }
}


// Function to handle click events on the events container
eventsContainer.addEventListener("click", (e) => {
  // Check if the clicked element contains the trash icon class
  if (e.target.classList.contains("fa-trash-alt")) {
    // Show confirmation message for deleting the event
    if (confirm("Are you sure you want to delete this event?")) {
      // Proceed with deleting the event
      const eventTitle = e.target.parentNode.parentNode.querySelector(".event-title").innerHTML;
      // Find the corresponding event in the eventsArr and remove it
      eventsArr.forEach((event) => {
        if (event.day === activeDay && event.month === month + 1 && event.year === year) {
          event.events.forEach((item, index) => {
            if (item.title === eventTitle) {
              event.events.splice(index, 1);
            }
          });
          // If no events left in a day, remove that day from eventsArr
          if (event.events.length === 0) {
            eventsArr.splice(eventsArr.indexOf(event), 1);
            // Remove event class from day
            const activeDayEl = document.querySelector(".day.active");
            if (activeDayEl.classList.contains("event")) {
              activeDayEl.classList.remove("event");
            }
          }
        }
      });
      // Update the events display after deletion
      updateEvents(activeDay);
    }
  }
});


//function to save events in local storage
function saveEvents() {
  localStorage.setItem("events", JSON.stringify(eventsArr));
}

//function to get events from local storage
function getEvents() {
  //check if events are already saved in local storage then return event else nothing
  if (localStorage.getItem("events") === null) {
    return;
  }
  eventsArr.push(...JSON.parse(localStorage.getItem("events")));
}

function convertTime(time) {
  //convert time to 24 hour format
  let timeArr = time.split(":");
  let timeHour = timeArr[0];
  let timeMin = timeArr[1];
  let timeFormat = timeHour >= 12 ? "PM" : "AM";
  timeHour = timeHour % 12 || 12;
  time = timeHour + ":" + timeMin + " " + timeFormat;
  return time;
}

