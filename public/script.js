document.addEventListener("DOMContentLoaded", function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    let classes = [];
    let bookings = [];

    const successModal = new bootstrap.Modal(document.getElementById('success-modal'), {
        backdrop: false,
        keyboard: true
    });
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.innerHTML = message;
        successModal.show();
    }

    const startDateInput = flatpickr("#start-date", {
        dateFormat: "Y-m-d",
        onChange: function (selectedDates) {
            const startDate = selectedDates[0];
            if (startDate) {
                startDate.setHours(0, 0, 0, 0); // Reset time for comparison
                if (startDate < today) {
                    showModal("Invalid Date", "Start day should be either the current day or following days, not past days.");
                    startDateInput.clear();
                }
            }
        }
    });

    const endDateInput = flatpickr("#end-date", {
        dateFormat: "Y-m-d",
        onChange: function (selectedDates) {
            const startDate = new Date(document.getElementById("start-date").value);
            const endDate = selectedDates[0];
            if (startDate && endDate) {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                if (endDate < startDate) {
                    showModal("Invalid Date", "End date must be the same as or after the start date.");
                    endDateInput.clear();
                }
            }
        }
    });

    const capacityInput = document.getElementById("capacity");
    capacityInput.addEventListener("input", function () {
        const capacityValue = parseInt(capacityInput.value);
        if (capacityValue <= 0 || isNaN(capacityValue)) {
            showModal("Invalid Capacity", "Capacity must be greater than 0.");
            capacityInput.value = ""; // Clear the invalid input
        }
    });

    const datePicker = flatpickr("#date-picker", {
        dateFormat: "Y-m-d",
        allowInput: true,
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const selectedClass = document.getElementById('class-select').value;
            const availableDates = classes
                .filter(cls => cls.name === selectedClass)
                .map(cls => cls.date);

            const formattedDate = formatDate(dayElem.dateObj);
            if (availableDates.includes(formattedDate)) {
                dayElem.classList.add("highlight-date");
            }
        }
    });

    document.getElementById('create-class-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const className = document.getElementById('class-name').value.trim();
        const startDateValue = document.getElementById('start-date').value;
        const endDateValue = document.getElementById('end-date').value;
        const capacity = parseInt(document.getElementById('capacity').value);

        const startDate = new Date(startDateValue);
        const endDate = new Date(endDateValue);

        if (!className || !startDateValue || !endDateValue || isNaN(capacity) || capacity <= 0) {
            showModal("Invalid Input", "Please fill out all fields with valid information.");
            return;
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (startDate < today) {
            showModal("Invalid Date", "Start day should be either the current day or following days, not past days.");
            return;
        }

        if (endDate < startDate) {
            showModal("Invalid Date", "End date must be the same as or after the start date.");
            return;
        }

        const newClasses = [];

        if (startDate.getTime() === endDate.getTime()) {
            // Single-day class
            newClasses.push({ name: className, date: formatDate(startDate), capacity });
        } else {
            // Multi-day class, including both start and end dates in the range
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                newClasses.push({ name: className, date: formatDate(currentDate), capacity });
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        try {
            const response = await fetch('http://localhost:3000/api/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClasses),
            });

            if (!response.ok) {
                throw new Error(`Failed to create class. Status: ${response.status}`);
            }

            const result = await response.json();
            classes = [...classes, ...result.classes];
            updateClassSelect();
            document.getElementById('create-class-form').reset();

            showModal("Class Created", `<strong>Class Name:</strong> ${className}<br><strong>Start Date:</strong> ${startDateValue}<br><strong>End Date:</strong> ${endDateValue}<br><strong>Capacity:</strong> ${capacity}`);
        } catch (error) {
            console.error("Error creating class:", error);
            alert("An error occurred while creating the class. Please check the console for details.");
        }
    });

    document.getElementById('booking-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const memberName = document.getElementById('member-name').value.trim();
        const selectedClass = document.getElementById('class-select').value;
        const selectedDate = document.getElementById('date-picker').value;

        if (!memberName || !selectedClass || !selectedDate) {
            alert("Please fill out all fields with valid information.");
            return;
        }

        const bookingData = { name: memberName, class: selectedClass, date: selectedDate };

        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                throw new Error(`Failed to book class. Status: ${response.status}`);
            }

            const result = await response.json();
            bookings.push(result.booking);

            document.getElementById('booking-form').reset();
            showModal("Class Booked", `<strong>Name:</strong> ${memberName}<br><strong>Class:</strong> ${selectedClass}<br><strong>Date:</strong> ${selectedDate}`);
        } catch (error) {
            console.error("Error booking class:", error);
            alert("An error occurred while booking the class. Please check the console for details.");
        }
    });

    function updateClassSelect() {
        const classSelect = document.getElementById('class-select');
        if (!classSelect) {
            console.error("Element with id 'class-select' not found.");
            return;
        }
        classSelect.innerHTML = '<option value="">Choose a class</option>';
        const uniqueClassNames = [...new Set(classes.map(cls => cls.name))];
        uniqueClassNames.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
    }

    document.getElementById('class-select').addEventListener('change', function () {
        const selectedClass = this.value;
        const availableDates = classes
            .filter(cls => cls.name === selectedClass)
            .map(cls => cls.date);

        datePicker.set('enable', availableDates.map(date => ({ from: date, to: date })));
        datePicker.clear();
        datePicker.open();
    });

    async function loadInitialData() {
        try {
            const classResponse = await fetch('http://localhost:3000/api/classes');
            classes = await classResponse.json();
            updateClassSelect();
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    }

    loadInitialData();

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
});
