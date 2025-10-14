// Initialize variables to store booking data
let bookingData = {
    service: 'Wedding Videography',
    price: 5000,
    addons: [],
    date: '',
    time: '',
    customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        eventType: '',
        requests: ''
    }
};

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather Icons
    feather.replace();
    
    // Step navigation functions
    function showStep(stepId) {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the selected step
        document.getElementById(stepId).classList.add('active');
        
        // Update step indicator
        if (stepId === 'service-selection') updateStepIndicator(1);
        else if (stepId === 'date-time') updateStepIndicator(2);
        else if (stepId === 'customer-details') updateStepIndicator(3);
        else if (stepId === 'confirmation') {
            updateStepIndicator(4);
            updateConfirmationDetails();
        }
    }
    
    function updateStepIndicator(stepNumber) {
        // Reset all steps
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step-${i}`);
            const text = step.nextElementSibling;
            
            step.classList.remove('active');
            text.classList.remove('text-white');
            text.classList.add('text-gray-500');
        }
        
        // Activate current step
        for (let i = 1; i <= stepNumber; i++) {
            const step = document.getElementById(`step-${i}`);
            const text = step.nextElementSibling;
            
            step.classList.add('active');
            text.classList.remove('text-gray-500');
            text.classList.add('text-white');
        }
    }
    
    // Service selection
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove border from all cards
            serviceCards.forEach(c => c.classList.remove('border-blue-500'));
            serviceCards.forEach(c => c.classList.add('border-gray-700'));
            
            // Add border to selected card
            card.classList.remove('border-gray-700');
            card.classList.add('border-blue-500');
            
            // Update service details
            const serviceName = card.querySelector('h3').textContent;
            const servicePrice = card.getAttribute('data-price');
            const serviceType = card.getAttribute('data-service');
            
            // Update booking data
            bookingData.service = serviceName;
            bookingData.price = parseInt(servicePrice);
            
            // Update UI
            document.getElementById('selected-service').textContent = serviceName;
            document.getElementById('service-name').textContent = serviceName + ' Package';
            document.getElementById('service-price').textContent = 'R' + servicePrice;
            
            document.getElementById('summary-service').textContent = serviceName;
            document.getElementById('summary-service-2').textContent = serviceName;
            document.getElementById('summary-service-3').textContent = serviceName;
            document.getElementById('summary-base-price').textContent = 'R' + servicePrice;
            document.getElementById('summary-base-price-2').textContent = 'R' + servicePrice;
            document.getElementById('summary-base-price-3').textContent = 'R' + servicePrice;
            
            // Update service description and features based on service type
            let description = '';
            let duration = '';
            let features = '';
            
            switch(serviceType) {
                case 'wedding':
                    description = 'Full day coverage + edited highlight reel';
                    duration = 'Full Day (8 hours)';
                    features = `
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Pre-wedding consultation</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Full day coverage</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>4K resolution footage</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>3-5 minute highlight reel</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Full ceremony and speeches</span>
                        </li>
                    `;
                    break;
                case 'event':
                    description = 'Professional coverage of your event';
                    duration = '6 hours';
                    features = `
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Pre-event planning</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>6 hours of coverage</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Multiple camera angles</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Edited highlights video</span>
                        </li>
                    `;
                    break;
                case 'music':
                    description = 'Professional music video production';
                    duration = '1 day shoot + editing';
                    features = `
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Concept development</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>1 full day shoot</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Professional editing</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Color grading</span>
                        </li>
                    `;
                    break;
                case 'commercial':
                    description = 'Promotional content for your business';
                    duration = '4 hours';
                    features = `
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Script development</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>4 hours of shooting</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Professional editing</span>
                        </li>
                        <li class="flex items-start">
                            <i data-feather="check" class="w-5 h-5 text-green-500 mr-2"></i>
                            <span>Multiple format delivery</span>
                        </li>
                    `;
                    break;
            }
            
            document.getElementById('service-description').textContent = description;
            document.getElementById('summary-duration').textContent = duration;
            document.getElementById('summary-duration-2').textContent = duration;
            document.getElementById('summary-duration-3').textContent = duration;
            document.getElementById('included-features').innerHTML = features;
            
            // Update total price
            updateTotalPrice();
            
            // Refresh feather icons
            feather.replace();
        });
    });
    
    // Add-ons selection
    document.querySelectorAll('.addon').forEach(addon => {
        addon.addEventListener('change', () => {
            const addonName = addon.getAttribute('data-addon');
            const addonPrice = parseInt(addon.getAttribute('data-price'));
            
            if (addon.checked) {
                // Add to booking data
                bookingData.addons.push({
                    name: addonName,
                    price: addonPrice
                });
            } else {
                // Remove from booking data
                bookingData.addons = bookingData.addons.filter(item => item.name !== addonName);
            }
            
            updateTotalPrice();
        });
    });
    
    // Update total price function
    function updateTotalPrice() {
        let addonsPrice = 0;
        
        bookingData.addons.forEach(addon => {
            addonsPrice += addon.price;
        });
        
        const totalPrice = bookingData.price + addonsPrice;
        
        document.getElementById('summary-addons').textContent = 'R' + addonsPrice;
        document.getElementById('summary-addons-2').textContent = 'R' + addonsPrice;
        document.getElementById('summary-addons-3').textContent = 'R' + addonsPrice;
        document.getElementById('summary-total').textContent = 'R' + totalPrice;
        document.getElementById('summary-total-2').textContent = 'R' + totalPrice;
        document.getElementById('summary-total-3').textContent = 'R' + totalPrice;
        
        // Update confirmation total as well
        document.getElementById('confirm-total').textContent = 'R' + totalPrice;
    }
    
    // Calendar functionality
    function generateCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('text-center', 'text-gray-400', 'font-bold');
            dayElement.textContent = day;
            calendar.appendChild(dayElement);
        });
        
        // Get current date
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Get first day of month
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        
        // Get days in month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Add empty days for first week
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'disabled');
            calendar.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.textContent = i;
            
            // Only enable future dates
            const dayDate = new Date(currentYear, currentMonth, i);
            if (dayDate < new Date().setHours(0, 0, 0, 0)) {
                dayElement.classList.add('disabled');
            } else {
                // Add click event
                dayElement.addEventListener('click', function() {
                    document.querySelectorAll('.calendar-day').forEach(day => {
                        day.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    
                    // Update booking data
                    const selectedDate = new Date(currentYear, currentMonth, i);
                    const options = { weekday: 'long', month: 'long', day: 'numeric' };
                    bookingData.date = selectedDate.toLocaleDateString('en-US', options);
                    
                    // Update UI
                    document.getElementById('summary-date').textContent = bookingData.date;
                    document.getElementById('summary-date-2').textContent = bookingData.date;
                });
            }
            
            calendar.appendChild(dayElement);
        }
    }
    
    // Time slots functionality
    function generateTimeSlots() {
        const timeSlots = document.getElementById('time-slots');
        timeSlots.innerHTML = '';
        
        const times = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
            '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
            '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
        ];
        
        times.forEach(time => {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = time;
            
            timeSlot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Update booking data
                bookingData.time = time;
                
                // Update UI
                document.getElementById('summary-time').textContent = time;
                document.getElementById('summary-time-2').textContent = time;
            });
            
            timeSlots.appendChild(timeSlot);
        });
    }
    
    // Update confirmation details
    function updateConfirmationDetails() {
        document.getElementById('confirm-service').textContent = bookingData.service;
        document.getElementById('confirm-datetime').textContent = bookingData.date && bookingData.time 
            ? `${bookingData.date} at ${bookingData.time}` 
            : 'Not selected';
        document.getElementById('confirm-location').textContent = bookingData.customer.address || 'Not specified';
        document.getElementById('confirm-client').textContent = bookingData.customer.firstName && bookingData.customer.lastName 
            ? `${bookingData.customer.firstName} ${bookingData.customer.lastName}` 
            : 'Not specified';
        
        // Generate random booking reference
        const ref = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('booking-ref').textContent = ref;
    }
    
    // Step navigation buttons
    document.getElementById('next-to-date').addEventListener('click', () => {
        showStep('date-time');
    });
    
    document.getElementById('back-to-service').addEventListener('click', () => {
        showStep('service-selection');
    });
    
    document.getElementById('next-to-details').addEventListener('click', () => {
        if (!bookingData.date || !bookingData.time) {
            alert('Please select both a date and time before continuing.');
            return;
        }
        showStep('customer-details');
    });
    
    document.getElementById('back-to-date').addEventListener('click', () => {
        showStep('date-time');
    });
    
    document.getElementById('next-to-confirmation').addEventListener('click', () => {
        // Validate form
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('event-address').value;
        
        if (!firstName || !lastName || !email || !phone || !address) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        
        // Update booking data
        bookingData.customer = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            address: address,
            eventType: document.getElementById('event-type').value,
            requests: document.getElementById('special-requests').value
        };
        
        showStep('confirmation');
    });
    
    // Initialize calendar and time slots
    generateCalendar();
    generateTimeSlots();
    
    // Initialize page
    showStep('service-selection');
});

// script.js

document.addEventListener("DOMContentLoaded", () => {
    // === HTML ELEMENTS ===
    const calendarContainer = document.getElementById("calendar");
    const currentMonthLabel = document.getElementById("current-month");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const timeSlotsContainer = document.getElementById("time-slots");
    const summaryDate = document.getElementById("summary-date");
    const summaryTime = document.getElementById("summary-time");

    // === CURRENT STATE ===
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    // === MOCK DATABASE OF BOOKED DATES AND TIMES ===
    // (In real projects, you’d load this from your backend or Firebase)
    const bookedSlots = {
        // Format: "YYYY-MM-DD": ["10:30 AM", "03:00 PM"]
        "2025-10-09": ["09:00 AM", "01:30 PM"],
        "2025-10-11": ["12:00 PM", "06:00 PM"],
        "2025-10-15": ["10:30 AM"],
        "2025-10-16": ["09:00 AM", "12:00 PM", "03:00 PM"],
    };

    // === RENDER CALENDAR ===
    function renderCalendar() {
        calendarContainer.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthLabel.textContent = currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        });

        const calendarGrid = document.createElement("div");
        calendarGrid.classList.add("grid", "grid-cols-7", "gap-2");

        // Blank spaces before 1st
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            calendarGrid.appendChild(empty);
        }

        // Create each day cell
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement("div");
            cell.textContent = day;
            cell.classList.add(
                "p-3",
                "rounded-lg",
                "text-center",
                "cursor-pointer",
                "text-white"
            );

            const thisDate = new Date(year, month, day);
            const dateKey = thisDate.toISOString().split("T")[0];

            // Past date = disabled
            if (thisDate < new Date().setHours(0, 0, 0, 0)) {
                cell.classList.add("bg-gray-700", "opacity-30", "cursor-not-allowed");
            } else {
                // Check if all times are booked for this date
                const isFullyBooked =
                    bookedSlots[dateKey] && bookedSlots[dateKey].length >= 7;

                if (isFullyBooked) {
                    cell.classList.add(
                        "bg-red-600",
                        "cursor-not-allowed",
                        "opacity-80"
                    );
                    cell.title = "Fully booked";
                } else {
                    cell.classList.add("bg-gray-700", "hover:bg-blue-600");

                    cell.addEventListener("click", () => {
                        selectedDate = thisDate;
                        selectedTime = null;
                        summaryDate.textContent = thisDate.toDateString();
                        summaryTime.textContent = "Not selected";
                        renderCalendar();
                        renderTimeSlots();
                    });
                }
            }

            // Highlight selected date
            if (
                selectedDate &&
                thisDate.toDateString() === selectedDate.toDateString()
            ) {
                cell.classList.add("bg-blue-600");
            }

            calendarGrid.appendChild(cell);
        }

        calendarContainer.appendChild(calendarGrid);
    }

    // === RENDER TIME SLOTS ===
    function renderTimeSlots() {
        timeSlotsContainer.innerHTML = "";

        if (!selectedDate) {
            timeSlotsContainer.innerHTML =
                '<p class="text-gray-400 col-span-4 text-center">Select a date first.</p>';
            return;
        }

        const dateKey = selectedDate.toISOString().split("T")[0];
        const bookedForDate = bookedSlots[dateKey] || [];

        const slots = [
            "09:00 AM",
            "10:30 AM",
            "12:00 PM",
            "01:30 PM",
            "03:00 PM",
            "04:30 PM",
            "06:00 PM",
        ];

        slots.forEach((time) => {
            const btn = document.createElement("button");
            btn.textContent = time;
            btn.classList.add(
                "p-2",
                "rounded-lg",
                "text-white",
                "transition",
                "font-medium"
            );

            if (bookedForDate.includes(time)) {
                btn.classList.add("bg-red-600", "opacity-60", "cursor-not-allowed");
                btn.title = "Booked";
            } else {
                btn.classList.add("bg-gray-700", "hover:bg-blue-600");
                btn.addEventListener("click", () => {
                    selectedTime = time;
                    summaryTime.textContent = time;
                    renderTimeSlots();
                });
            }

            // Highlight selected
            if (selectedTime === time) {
                btn.classList.add("bg-blue-600");
            }

            timeSlotsContainer.appendChild(btn);
        });
    }

    // === EVENT LISTENERS FOR MONTH NAVIGATION ===
    prevMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // === INIT ===
    renderCalendar();
    renderTimeSlots();
});
