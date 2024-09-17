document.addEventListener('DOMContentLoaded', function () {
    // Function to get the current page name
    function getCurrentPage() {
        const path = window.location.pathname;
        return path.split("/").pop();
    }
    const currentPage = getCurrentPage();
    // Function to validate email format
    function isValidEmail(email) {
        // Regex pattern to check for valid email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Function to validate first and last name
    function isValidName(name) {
        // Regex pattern to check for at least one letter
        const nameRegex = /^[a-zA-Z]+[a-zA-Z0-9 ]*$/;
        return nameRegex.test(name);
    }

    const usersListDiv = document.getElementById('userLists');
    const chatMessagesDiv = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const rightContainer = document.querySelector('.right-container');
    const leftContainer = document.querySelector('.left-container');
    let selectedUserID = null;
    // Load users, messages, and authenticated user from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const authenticatedUser = JSON.parse(localStorage.getItem('authenticatedUser'));

    // Signup Page Logic
    if (currentPage === 'signUp.html') {
        const signupForm = document.getElementById('signupForm');

        if (signupForm) {
            signupForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();

                const userExists = users.some(user => user.email === email);

                if (!isValidName(firstName)) {
                    displayMessage('signupMessage', 'First name must contain at least one letter.', 'danger');
                    firstNameInput.value = '';
                } else if (!isValidName(lastName)) {
                    displayMessage('signupMessage', 'Last name must contain at least one letter.', 'danger');
                    lastNameInput.value = '';
                } else if (!isValidEmail(email)) {
                    displayMessage('signupMessage', 'Please enter a valid email address.', 'danger');
                    emailInput.value = '';
                } else if (userExists) {
                    displayMessage('signupMessage', 'User with this email already exists.', 'danger');
                    emailInput.value = '';
                }
                else if (password === '') {
                    displayMessage('signupMessage', 'Please enter a password.', 'danger');
                    isValid = false;
                } else if (password.length < 8) {
                    displayMessage('signupMessage', 'Password must be at least 8 characters long.', 'danger');
                    isValid = false;
                } else {
                    //It returns the current timestamp which is no of miliseconds.
                    const userID = Date.now();
                    const newUser = { userID, firstName, lastName, email, password, timestamp: new Date(), lastLogin: null };
                    users.push(newUser);
                    //web api that stores data into browser
                    localStorage.setItem('users', JSON.stringify(users));

                    displayMessage('signupMessage', 'Signup successful! Redirecting to Sign In...', 'success');
                    setTimeout(() => {
                        window.location.href = 'signIn.html';
                    }, 2000);
                }
            });
        }
    }

    // Signin Page Logic
    if (currentPage === 'signIn.html') {
        const signinForm = document.getElementById('signinForm');
        if (signinForm) {
            signinForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value.trim();

                let user = users.find(user => user.email === email && user.password === password);

                if (user) {
                    user.lastLogin = new Date();
                    localStorage.setItem('users', JSON.stringify(users));
                    localStorage.setItem('authenticatedUser', JSON.stringify(user));
                    displayMessage('signinMessage', 'Signin successful! Redirecting to Dashboard...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    displayMessage('signinMessage', 'Invalid email or password.', 'danger');

                }
            });
        }
    }
    // Dashboard Page Logic
    if (currentPage === 'dashboard.html') {

        if (!authenticatedUser) {
            window.location.href = 'signIn.html';
            return;
        }
        else {
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.innerText = `Welcome, ${authenticatedUser.firstName}!`;
            }

            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function () {
                    localStorage.removeItem('authenticatedUser');
                    window.location.href = 'signIn.html';
                });
            }
        }
    }

    // Function to display error or success messages within the page
    function displayMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
        }
    }


    // Function to display user List
    function renderUserList() {
        usersListDiv.innerHTML = '';
        users.forEach(user => {
            if (user.userID === authenticatedUser.userID) return;

            const userListDiv = document.createElement('div');
            userListDiv.className = 'user-message';

            const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
            userListDiv.innerHTML = `
            <div class="d-flex align-items-center mb-2 p-2">
                <div class="user-initials rounded-circle text-white d-flex align-items-center justify-content-center me-3">
                    ${initials}
                </div>
                <div class="flex-grow-1">
                    <h5 class="mb-0">${user.firstName} ${user.lastName}</h5>
                </div>
            </div>
        `;

            userListDiv.addEventListener('click', function () {
                selectedUserID = user.userID;
                renderChatMessages();
                if (window.innerWidth < 992) {
                    leftContainer.style.display = 'none';
                    rightContainer.style.display = 'block';
                    backButton.style.display = 'block';
                    chatMessagesDiv.classList.add('active');
                }

                chatInput.focus();
            });

            usersListDiv.appendChild(userListDiv);
        });
    }

    backButton.addEventListener('click', function () {
        rightContainer.style.display = 'none';
        leftContainer.style.display = 'block'; 
        chatMessagesDiv.classList.remove('active'); // Hide chat messages
        backButton.style.display = 'none'; // Hide the back button
    });

    function renderChatMessages() {

        chatMessagesDiv.innerHTML = ''; // Clear previous messages

        messages.forEach((msg) => {
            // Check if this message is relevant to the authenticated user
            if ((msg.from === authenticatedUser.userID && msg.to === selectedUserID) ||
                (msg.from === selectedUserID && msg.to === authenticatedUser.userID)) {
                const messageElement = document.createElement('div');
                messageElement.className = 'message ' + (msg.from === authenticatedUser.userID ? 'sent' : 'received');

                // Determine the message content to display
                const displayMessage = msg.deleted && msg.deletedBy.includes(authenticatedUser.userID)
                    ? "This message is deleted"
                    : msg.message;

                const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                messageElement.innerHTML = `
            <div class="message-content">${displayMessage}</div>
            <div class="message-info" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="message-time">${time}</div>
                <div class="message-options" style="cursor: pointer;">⋮</div>
            </div>
            <div class="options-menu">
                ${msg.deleted ? '' : `
    ${msg.from === authenticatedUser.userID ? `
        <div class="option" data-action="deleteEveryone" ${msg.deleted ? 'style="display:none;"' : ''}>Delete for Everyone</div>
        <div class="option" data-action="deleteMe" ${msg.deleted ? 'style="display:none;"' : ''}>Delete for Me</div>
        <div class="option" data-action="edit" ${msg.deleted || msg.editTimeout ? 'style="display:none;"' : ''}>Edit</div>
    ` : `
        <div class="option" data-action="deleteMe">Delete for Me</div>
    `}
`}
            </div>
        `;


                // Toggle options menu on click
                messageElement.querySelector('.message-options').addEventListener('click', (event) => {
                    const menu = messageElement.querySelector('.options-menu');
                    menu.classList.toggle('show'); // Toggle the show class
                    // Close other menus
                    document.querySelectorAll('.options-menu').forEach(m => {
                        if (m !== menu) m.classList.remove('show');
                    });
                });

                // Handle option clicks
                messageElement.querySelectorAll('.option').forEach(option => {
                    option.addEventListener('click', (event) => {
                        const action = event.currentTarget.getAttribute('data-action');

                        switch (action) {
                            case 'deleteEveryone':
                                if (confirm('Are you sure you want to delete this message for everyone?')) {
                                    msg.message = "This message is deleted"; // Change message content
                                    msg.deleted = true; // Mark the message as deleted for everyone
                                    msg.deletedBy = []; // Clear the deletedBy array since it's deleted for everyone
                                    localStorage.setItem('messages', JSON.stringify(messages));
                                    renderChatMessages();
                                }
                                break;

                            case 'deleteMe':

                                if (!msg.deletedBy) {
                                    msg.deletedBy = []; // Initialize the deletedBy array if it doesn't exist
                                }
                                if (!msg.deletedBy.includes(authenticatedUser.userID)) {
                                    msg.deletedBy.push(authenticatedUser.userID); // Track who deleted it
                                }
                                msg.deleted = true;
                                localStorage.setItem('messages', JSON.stringify(messages));
                                renderChatMessages();
                                break;

                            case 'edit':
                                if (!msg.editTimeout) { // Check if editing is allowed
                                    const newMessage = prompt("Edit your message:", msg.message);
                                    if (newMessage !== null) {
                                        msg.message = newMessage;
                                        msg.timestamp = Date.now(); // Update the timestamp
                                        localStorage.setItem('messages', JSON.stringify(messages));
                                        renderChatMessages();
                                    }
                                } else {
                                    alert("Editing is no longer allowed for this message.");
                                }
                                break;
                        }
                    });
                });

                // Set a timer to disable editing after 5 seconds
                if (!msg.editTimeout) {
                    setTimeout(() => {
                        msg.editTimeout = true; // Set the flag to indicate editing is no longer allowed
                        localStorage.setItem('messages', JSON.stringify(messages)); // Save the state
                        renderChatMessages(); // Re-render to update the options
                    }, 5000);
                }

                chatMessagesDiv.appendChild(messageElement);
            }
        });

        // Scroll to the bottom for showing the latest messages
        chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
    }

    // Initial render
    renderChatMessages();

    // Handle sending messages
    document.getElementById('chatForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const chatInput = document.getElementById('chatInput');
        const messageText = chatInput.value.trim();

        if (messageText && selectedUserID) { // Ensure a message is typed and a user is selected
            const newMessage = {
                from: authenticatedUser.userID,
                to: selectedUserID, // Use the selected user's ID
                message: messageText,
                timestamp: new Date().toISOString() // Store timestamp in ISO format
            };
            messages.push(newMessage);
            localStorage.setItem('messages', JSON.stringify(messages)); // Save messages to local storage
            chatInput.value = ''; // Clear input
            renderChatMessages(selectedUserID); // Render updated messages for the selected user
        } else if (!selectedUserID) {
            alert('Please select a user to send a message.'); // Alert if no user is selected
        }
    });


    // Call the function to display messages on page load
    renderUserList();
});
