const API_URL = "http://localhost:8000";

// Pagination State
const state = {
    available: { page: 1, limit: 10 },
    booked: { page: 1, limit: 10 }
};

document.addEventListener("DOMContentLoaded", () => {
    fetchSlots();

    // Form Event Listeners (ensure elements exist)
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
        alert("End time must be after start time");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/slots/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_time: startTime, end_time: endTime }),
        });

        if (response.ok) {
            alert("Slot created successfully");
            fetchSlots();
            e.target.reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to create slot");
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
            alert("Booking confirmed successfully!");
            closeModal();
            fetchSlots();
        } else {
            const error = await response.json();
            alert(`Error: ${error.detail}`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to book slot");
    }
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

    // Update Page Number Display
    const pageNumEl = document.getElementById(`${type}-page-num`);
    if (pageNumEl) pageNumEl.textContent = `Page ${page}`;

    const url = `${API_URL}/slots/?available=${isAvailable}&skip=${skip}&limit=${limit}`;

    try {
        const response = await fetch(url);
        const slots = await response.json();
        renderSlots(slots, containerId);
    } catch (err) {
        console.error(`Failed to fetch ${type} slots`, err);
        document.getElementById(containerId).innerHTML = "<p>Error loading data.</p>";
    }
}

function changePage(type, delta) {
    const currentState = state[type];
    const newPage = currentState.page + delta;

    if (newPage < 1) return; // Prevent going below page 1

    currentState.page = newPage;
    fetchSlotData(type);
}

function renderSlots(slots, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!slots || slots.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 20px; background: white; border-radius: 8px;">No ${state[containerId.split('-')[0]].page > 1 ? 'more ' : ''}slots found.</div>`;
        return;
    }

    slots.forEach(slot => {
        const card = document.createElement("div");
        card.classList.add("slot-card");
        card.classList.add(slot.is_booked ? "booked" : "available");

        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);

        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };

        const dateStr = startDate.toLocaleDateString(undefined, dateOptions);
        const startTimeStr = startDate.toLocaleTimeString(undefined, timeOptions);
        const endTimeStr = endDate.toLocaleTimeString(undefined, timeOptions);

        card.innerHTML = `
            <h3>
                <span>${slot.is_booked ? "Reserved" : "Open Slot"}</span>
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
                `<button class="btn btn-outline" onclick="openBookingModal(${slot.id})">Book This Slot</button>` :
                ''
            }
        `;
        container.appendChild(card);
    });
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
