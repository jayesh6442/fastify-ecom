// idempotency.js
const seen = new Set();

function isDuplicate(eventId) {
    if (seen.has(eventId)) return true;
    seen.add(eventId);
    return false;
}

module.exports = { isDuplicate };
