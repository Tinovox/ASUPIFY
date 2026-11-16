const studentForm = document.getElementById("studentForm");

const studentTable = document.getElementById("studentTable");

const searchInput = document.getElementById("searchInput");

let students = JSON.parse(localStorage.getItem("students")) || [];

function saveStudents() {

    localStorage.setItem("students", JSON.stringify(students));

}

function displayStudents(data = students) {

    studentTable.innerHTML = "";

    document.getElementById("emptyMessage").style.display =

        data.length === 0 ? "block" : "none";

    data.forEach((student) => {

        const index = students.indexOf(student);

        const row = document.createElement("tr");

        [

            student.studentId,

            student.fullName,

            student.email,

            student.department,

            student.course

        ].forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value;

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.textContent = "Edit";

        editButton.className = "action-btn";

        editButton.onclick = () => editStudent(index);

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "action-btn delete-btn";

        deleteButton.onclick = () => deleteStudent(index);

        actionCell.append(editButton, deleteButton);

        row.appendChild(actionCell);

        studentTable.appendChild(row);

    });

    updateStatistics();

}

studentForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const editIndex = document.getElementById("editIndex").value;

    const student = {

        fullName: document.getElementById("fullName").value.trim(),

        studentId: document.getElementById("studentId").value.trim(),

        email: document.getElementById("email").value.trim(),

        phone: document.getElementById("phone").value.trim(),

        department: document.getElementById("department").value.trim(),

        course: document.getElementById("course").value.trim()

    };

    const duplicate = students.some((item, index) =>

        item.studentId.toLowerCase() === student.studentId.toLowerCase()

        && index !== Number(editIndex)

    );

    if (duplicate) {

        alert("This Student ID already exists.");

        return;

    }

    if (editIndex !== "") {

        students[Number(editIndex)] = student;

        alert("Student record updated successfully.");

    } else {

        students.push(student);

        alert("Student added successfully.");

    }

    saveStudents();

    studentForm.reset();

    document.getElementById("editIndex").value = "";

    document.getElementById("submitBtn").textContent = "Add Student";

    displayStudents();

});

function editStudent(index) {

    const student = students[index];

    document.getElementById("fullName").value = student.fullName;

    document.getElementById("studentId").value = student.studentId;

    document.getElementById("email").value = student.email;

    document.getElementById("phone").value = student.phone;

    document.getElementById("department").value = student.department;

    document.getElementById("course").value = student.course;

    document.getElementById("editIndex").value = index;

    document.getElementById("submitBtn").textContent = "Update Student";

    document.getElementById("add-student").scrollIntoView({

        behavior: "smooth"

    });

}

function deleteStudent(index) {

    if (confirm("Are you sure you want to delete this student?")) {

        students.splice(index, 1);

        saveStudents();

        displayStudents();

        alert("Student record deleted successfully.");

    }

}

function updateStatistics() {

    document.getElementById("totalStudents").textContent =

        students.length;

    const departments = new Set(

        students.map(student => student.department.toLowerCase())

    );

    document.getElementById("totalDepartments").textContent =

        departments.size;

    document.getElementById("recentStudents").textContent =

        students.length;

}

searchInput.addEventListener("input", function() {

    const query = this.value.toLowerCase();

    const filteredStudents = students.filter(student =>

        Object.values(student).some(value =>

            value.toLowerCase().includes(query)

        )

    );

    displayStudents(filteredStudents);

});

displayStudents();