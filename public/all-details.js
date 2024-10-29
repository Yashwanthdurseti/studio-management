document.addEventListener("DOMContentLoaded", async function () {
    const classesContainer = document.getElementById('classes-container');
    const classFilter = document.getElementById('class-filter');
    const dateFilter = document.getElementById('date-filter');
    const bookingsTableBody = document.getElementById('bookings-table-body');
    
    let classes = [];
    let bookings = [];

    // Load classes and bookings data from server
    async function loadData() {
        try {
            const classResponse = await fetch('http://localhost:3000/api/classes');
            classes = await classResponse.json();
            
            const bookingResponse = await fetch('http://localhost:3000/api/bookings');
            bookings = await bookingResponse.json();

            populateClasses();
            populateClassFilter();
            updateDateFilter(); // Populate date filter based on current class selection
            populateBookingsTable(bookings); // Initially display all bookings

        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Populate the Classes section with an accordion layout
    function populateClasses() {
        classesContainer.innerHTML = '';
        const uniqueClassNames = [...new Set(classes.map(cls => cls.name))];
        
        uniqueClassNames.forEach((className, index) => {
            const bookingsForClass = bookings.filter(b => b.class === className);
            const classId = `class-${index}`;
            
            const accordionItem = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading-${classId}">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${classId}" aria-expanded="false" aria-controls="collapse-${classId}">
                            ${className}
                        </button>
                    </h2>
                    <div id="collapse-${classId}" class="accordion-collapse collapse" aria-labelledby="heading-${classId}" data-bs-parent="#classesAccordion">
                        <div class="accordion-body">
                            ${bookingsForClass.length > 0 ? '<ul>' : 'No bookings yet.'}
                            ${bookingsForClass.map(booking => `<li>${booking.name} booked for ${new Date(booking.date).toLocaleDateString()}</li>`).join('')}
                            ${bookingsForClass.length > 0 ? '</ul>' : ''}
                        </div>
                    </div>
                </div>`;
            
            classesContainer.insertAdjacentHTML('beforeend', accordionItem);
        });
    }

    // Populate the Class filter dropdown with unique class names
    function populateClassFilter() {
        classFilter.innerHTML = '<option value="">All Classes</option>';
        const uniqueClassNames = [...new Set(classes.map(cls => cls.name))];
        uniqueClassNames.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classFilter.appendChild(option);
        });
    }

    // Populate the Date filter dropdown with unique dates based on bookings
    function populateDateFilter() {
        dateFilter.innerHTML = '<option value="">All Dates</option>';
        const uniqueDates = [...new Set(bookings.map(b => b.date))];
        
        uniqueDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = new Date(date).toLocaleDateString();
            dateFilter.appendChild(option);
        });
    }

    // Update Date filter dropdown based on selected class
    function updateDateFilter() {
        const selectedClass = classFilter.value;
        const filteredDates = selectedClass 
            ? [...new Set(bookings.filter(b => b.class === selectedClass).map(b => b.date))] 
            : [...new Set(bookings.map(b => b.date))];

        dateFilter.innerHTML = '<option value="">All Dates</option>';
        filteredDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = new Date(date).toLocaleDateString();
            dateFilter.appendChild(option);
        });
        
        // Filter the bookings table after updating the date filter
        filterBookings();
    }

    // Filter and display bookings based on selected class and date
    function filterBookings() {
        const selectedClass = classFilter.value;
        const selectedDate = dateFilter.value;

        const filteredBookings = bookings.filter(b => 
            (selectedClass === '' || b.class === selectedClass) &&
            (selectedDate === '' || b.date === selectedDate)
        );
        populateBookingsTable(filteredBookings);
    }

    // Populate the bookings table with filtered or all bookings
    function populateBookingsTable(bookingsToDisplay) {
        bookingsTableBody.innerHTML = '';
        bookingsToDisplay.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.name}</td>
                <td>${booking.class}</td>
                <td>${new Date(booking.date).toLocaleDateString()}</td>
            `;
            bookingsTableBody.appendChild(row);
        });
    }

    // Event listeners for dropdown changes
    classFilter.addEventListener('change', updateDateFilter);
    dateFilter.addEventListener('change', filterBookings);

    // Load data when the page is loaded
    loadData();
});
