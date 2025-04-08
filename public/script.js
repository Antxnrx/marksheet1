
document.addEventListener('DOMContentLoaded', () => {
    
    const addStudentSection = document.getElementById('add-student-section');
    const viewStudentSection = document.getElementById('view-student-section');
    const showAddBtn = document.getElementById('show-add-btn');
    const showViewBtn = document.getElementById('show-view-btn');

    const addForm = document.getElementById('add-form');
    const viewForm = document.getElementById('view-form');
    const studentDetailsDiv = document.getElementById('student-details');
    const addMessageDiv = document.getElementById('add-message');
    const viewMessageDiv = document.getElementById('view-message');

    
    const API_URL = 'http://localhost:3000/api/students'; 

    

    
    showAddBtn.addEventListener('click', () => {
        addStudentSection.style.display = 'block';
        viewStudentSection.style.display = 'none';
        showAddBtn.classList.add('active');
        showViewBtn.classList.remove('active');
        clearMessages(); 
        clearResults();
    });

    showViewBtn.addEventListener('click', () => {
        addStudentSection.style.display = 'none';
        viewStudentSection.style.display = 'block';
        showAddBtn.classList.remove('active');
        showViewBtn.classList.add('active');
        clearMessages();
        clearResults();
    });

    
    addForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        clearMessages();

        const formData = new FormData(addForm);
        const studentData = {
            name: formData.get('name'),
            uniqueId: formData.get('uniqueId'),
            subject1: formData.get('subject1'),
            subject2: formData.get('subject2'),
            subject3: formData.get('subject3'),
            subject4: formData.get('subject4'),
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData),
            });

            const result = await response.json(); 

            if (response.ok && response.status === 201) { 
                displayMessage(addMessageDiv, `Success: ${result.message}`, 'success');
                addForm.reset(); 
            } else {
                
                displayMessage(addMessageDiv, `Error: ${result.message || 'Failed to add student.'}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            displayMessage(addMessageDiv, 'Error: Could not connect to the server.', 'error');
        }
    });

    
    viewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearMessages();
        clearResults();

        const uniqueId = document.getElementById('uniqueIdView').value.trim();
        if (!uniqueId) {
            displayMessage(viewMessageDiv, 'Error: Please enter a Unique ID.', 'error');
            return;
        }

        try {
            const response = await fetch(`<span class="math-inline">\{API\_URL\}/</span>{uniqueId}`); 
            const result = await response.json();

            if (response.ok) { 
                displayStudentDetails(result);
            } else if (response.status === 404) {
                 displayMessage(viewMessageDiv, `Error: ${result.message || 'Student not found.'}`, 'error');
            }
             else {
                 displayMessage(viewMessageDiv, `Error: ${result.message || 'Failed to fetch student details.'}`, 'error');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            displayMessage(viewMessageDiv, 'Error: Could not connect to the server.', 'error');
        }
    });

    

    function displayStudentDetails(student) {
        studentDetailsDiv.innerHTML = `
            <h3>Student Details</h3>
            <p><strong>Name:</strong> ${escapeHTML(student.name)}</p>
            <p><strong>Unique ID:</strong> ${escapeHTML(student.uniqueId)}</p>
            <p><strong>Subject 1 Marks:</strong> ${escapeHTML(student.subject1)}</p>
            <p><strong>Subject 2 Marks:</strong> ${escapeHTML(student.subject2)}</p>
            <p><strong>Subject 3 Marks:</strong> ${escapeHTML(student.subject3)}</p>
            <p><strong>Subject 4 Marks:</strong> ${escapeHTML(student.subject4)}</p>
        `;
        studentDetailsDiv.style.display = 'block';
    }

    function displayMessage(element, message, type) {
         element.className = `message ${type}`; 
         element.textContent = message;
         element.style.display = 'block'; 
    }

    function clearMessages() {
        addMessageDiv.style.display = 'none';
        addMessageDiv.textContent = '';
        viewMessageDiv.style.display = 'none';
        viewMessageDiv.textContent = '';
    }

     function clearResults() {
         studentDetailsDiv.style.display = 'none';
         studentDetailsDiv.innerHTML = '';
     }

    
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;' 
            }[match];
        });
    }

});