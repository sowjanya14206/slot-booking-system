const API_URL = "http://localhost:8000";

// State: Fetch more items to make carousel look good
const state = {
    available: { page: 1, limit: 50 },
    booked: { page: 1, limit: 50 }
};

document.addEventListener("DOMContentLoaded", () => {
    fetchSlots();

    const createForm = document.getElementById("create-slot-form");
    if (createForm) createForm.addEventListener("submit", handleCreateSlot);

    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) bookingForm.addEventListener("submit", handleBooking);
});

async function handleCreateSlot(e) {
    e.preventDefault();
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (new Date(startTime) >= new Date(endTime)) {
        showNotification("End time must be after start time", "error");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/slots/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_time: startTime, end_time: endTime }),
        });

        if (response.ok) {
            showNotification("Slot created successfully!", "success");
            fetchSlots();
            e.target.reset();
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.detail}`, "error");
        }
    } catch (err) {
        console.error(err);
        showNotification("Failed to create slot", "error");
    }
}

async function handleBooking(e) {
    e.preventDefault();
    const slotId = document.getElementById("booking-slot-id").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    try {
        const response = await fetch(`${API_URL}/slots/${slotId}/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, email: email }),
        });

        if (response.ok) {
            showNotification("Booking confirmed successfully!", "success");
            closeModal();
            fetchSlots();
        } else {
            const error = await response.json();
            showNotification(`Error: ${error.detail}`, "error");
        }
    } catch (err) {
        console.error(err);
        showNotification("Failed to book slot", "error");
    }
}

function showNotification(message, type = "success") {
    const container = document.getElementById("notification-container");
    if (!container) return;

    const notification = document.createElement("div");
    notification.classList.add("notification", type);

    const icon = type === "success" ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';

    notification.innerHTML = `
        ${icon}
        <div class="notification-content">
            <p>${message}</p>
        </div>
    `;

    container.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease-in forwards";
        notification.addEventListener("animationend", () => {
            notification.remove();
        });
    }, 3000);
}

async function fetchSlots() {
    await fetchSlotData('available');
    await fetchSlotData('booked');
}

async function fetchSlotData(type) {
    const { page, limit } = state[type];
    const skip = (page - 1) * limit;
    const isAvailable = type === 'available';
    const containerId = `${type}-slots-container`;

    const url = `${API_URL}/slots/?available=${isAvailable}&skip=${skip}&limit=${limit}`;

    try {
        const response = await fetch(url);
        const slots = await response.json();
        renderSlots(slots, containerId);
    } catch (err) {
        console.error(`Failed to fetch ${type} slots`, err);
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "<p>Error loading data.</p>";
    }
}

function renderSlots(slots, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!slots || slots.length === 0) {
        container.innerHTML = `<div class="empty-state" style="width: 100%; text-align: center; color: var(--text-secondary); padding: 20px;">No slots found.</div>`;
        return;
    }

    slots.forEach(slot => {
        const card = document.createElement("div");
        card.classList.add("slot-card");
        card.classList.add(slot.is_booked ? "booked" : "available");

        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);

        // Force IST
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };

        const dateStr = startDate.toLocaleDateString('en-IN', dateOptions);
        const startTimeStr = startDate.toLocaleTimeString('en-IN', timeOptions);
        const endTimeStr = endDate.toLocaleTimeString('en-IN', timeOptions);

        card.innerHTML = `
            <h3>
                <span>${slot.is_booked ? "Reserved" : "Open"}</span>
                ${slot.is_booked ?
                '<span class="badge badge-booked">Booked</span>' :
                '<span class="badge badge-success">Available</span>'
            }
            </h3>
            <div class="slot-info">
                <p><i class="fa-regular fa-calendar"></i> ${dateStr}</p>
                <p><i class="fa-regular fa-clock"></i> ${startTimeStr} - ${endTimeStr}</p>
                ${slot.is_booked ?
                `<p><i class="fa-solid fa-user-check"></i> ${slot.booked_by_name}</p>` :
                ''
            }
            </div>
            ${!slot.is_booked ?
                `<button class="btn btn-outline" onclick="openBookingModal(${slot.id})">Book Now</button>` :
                ''
            }
        `;
        container.appendChild(card);
    });
}

// Carousel Scroll Logic
function scrollCarousel(type, direction) {
    const container = document.getElementById(`${type}-slots-container`);
    if (container) {
        const scrollAmount = 320; // Card width + gap
        container.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

// Modal Logic
const modal = document.getElementById("booking-modal");
const span = document.getElementsByClassName("close")[0];

function openBookingModal(slotId) {
    document.getElementById("booking-slot-id").value = slotId;
    if (modal) modal.style.display = "block";
}

function closeModal() {
    if (modal) modal.style.display = "none";
    const form = document.getElementById("booking-form");
    if (form) form.reset();
}

if (span) {
    span.onclick = function () {
        closeModal();
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}
