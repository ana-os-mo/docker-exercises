/**
 * Team Member Roles Application
 * Manages displaying and editing team member roles
 */

// HOST must be the server IP or DNS name when the app is running on a server
// and localhost when running locally
const HOST = "localhost";

const API_BASE_URL = `http://${HOST}:8080`;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * Main initialization function
 * Fetches team member data and renders the UI
 */
async function init() {
    try {
        const response = await fetch(`${API_BASE_URL}/get-data`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched team data:', data);

        renderMemberList(data);
        renderEditForm(data);

        // Show the container once data is loaded
        const container = document.getElementById('container');
        container.classList.add('visible');

        // Attach event listeners
        attachEventListeners();

    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load team member data. Please ensure the server is running.');
    }
}

/**
 * Renders the member list in view mode
 * @param {Array} members - Array of member objects with name and role
 */
function renderMemberList(members) {
    const listElement = document.getElementById('member-roles');
    listElement.innerHTML = ''; // Clear existing content

    members.forEach(member => {
        const li = document.createElement('li');
        li.className = 'member-role';

        // Create member info container
        const memberInfo = document.createElement('div');
        memberInfo.className = 'member-info';

        // Create avatar with initials
        const avatar = document.createElement('div');
        avatar.className = 'member-avatar';
        avatar.textContent = getInitials(member.name);
        avatar.setAttribute('aria-label', `Avatar for ${member.name}`);

        // Create member details container
        const memberDetails = document.createElement('div');
        memberDetails.className = 'member-details';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = member.name;

        const roleSpan = document.createElement('span');
        roleSpan.className = 'role';
        roleSpan.id = `role-${member.name}`;
        roleSpan.textContent = member.role;

        memberDetails.appendChild(nameSpan);
        memberDetails.appendChild(roleSpan);

        memberInfo.appendChild(avatar);
        memberInfo.appendChild(memberDetails);

        li.appendChild(memberInfo);
        listElement.appendChild(li);
    });
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts.at(-1)[0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

/**
 * Renders the edit form with input fields for each member
 * @param {Array} members - Array of member objects with name and role
 */
function renderEditForm(members) {
    const editListElement = document.getElementById('member-roles-edit');
    editListElement.innerHTML = ''; // Clear existing content

    members.forEach(member => {
        const li = document.createElement('li');
        li.className = 'member-role-edit';

        // Create avatar
        const avatar = document.createElement('div');
        avatar.className = 'member-avatar';
        avatar.textContent = getInitials(member.name);
        avatar.setAttribute('aria-label', `Avatar for ${member.name}`);

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name-edit';
        nameSpan.textContent = member.name;

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';

        const label = document.createElement('label');
        label.setAttribute('for', `input-role-${member.name}`);
        label.textContent = `Role for ${member.name}`;

        const input = document.createElement('input');
        input.id = `input-role-${member.name}`;
        input.type = 'text';
        input.placeholder = 'Enter role...';
        input.setAttribute('aria-label', `Role for ${member.name}`);

        inputWrapper.appendChild(label);
        inputWrapper.appendChild(input);

        li.appendChild(avatar);
        li.appendChild(nameSpan);
        li.appendChild(inputWrapper);

        editListElement.appendChild(li);
    });
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');

    if (editButton) {
        editButton.addEventListener('click', showEditMode);
    }

    if (saveButton) {
        saveButton.addEventListener('click', handleSaveRoles);
    }

    if (cancelButton) {
        cancelButton.addEventListener('click', showViewMode);
    }
}

/**
 * Switch to edit mode
 */
function showEditMode() {
    const viewContainer = document.getElementById('container');
    const editContainer = document.getElementById('container-edit');

    // Populate edit form with current values
    const memberRoles = document.querySelectorAll('.member-role');
    memberRoles.forEach(roleElement => {
        const name = roleElement.querySelector('.name').textContent;
        const currentRole = roleElement.querySelector('.role').textContent;
        const input = document.getElementById(`input-role-${name}`);

        if (input) {
            input.value = currentRole;
        }
    });

    // Toggle visibility
    viewContainer.classList.remove('visible');
    editContainer.classList.add('visible');
}

/**
 * Handle saving updated roles
 */
async function handleSaveRoles() {
    const saveButton = document.getElementById('save-button');

    try {
        // Disable button during save
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        // Collect updated data
        const payload = [];
        const editItems = document.querySelectorAll('.member-role-edit');

        editItems.forEach(item => {
            const name = item.querySelector('.name-edit').textContent;
            const roleInput = document.getElementById(`input-role-${name}`);
            const role = roleInput ? roleInput.value.trim() : '';

            // Basic validation
            if (!role) {
                throw new Error(`Role for ${name} cannot be empty`);
            }

            payload.push({ name, role });
        });

        // Send update request
        const response = await fetch(`${API_BASE_URL}/update-roles`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedMembers = await response.json();
        console.log('Updated roles:', updatedMembers);

        // Update the view with new data
        updatedMembers.forEach(member => {
            const roleElement = document.getElementById(`role-${member.name}`);
            if (roleElement) {
                roleElement.textContent = member.role;
            }
        });

        // Switch back to view mode
        showViewMode();

    } catch (error) {
        console.error('Error saving roles:', error);
        showError(`Failed to save roles: ${error.message}`);
    } finally {
        // Re-enable button
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
    }
}

/**
 * Switch to view mode
 */
function showViewMode() {
    const viewContainer = document.getElementById('container');
    const editContainer = document.getElementById('container-edit');

    viewContainer.classList.add('visible');
    editContainer.classList.remove('visible');
}

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    // Insert at the top of the page
    const main = document.querySelector('main');
    if (main) {
        main.insertBefore(errorDiv, main.firstChild);
    }
}
