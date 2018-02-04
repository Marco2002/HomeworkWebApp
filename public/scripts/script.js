// =====================
// Materialize code
// =====================

// Initialize collapse button
$(".button-collapse").sideNav();
$('.collapsible').collapsible();

// datepicker for homework/new form setup
$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false, // Close upon selecting a date,
    format: 'dd/mm/yy',
});

// subject selection setup
$(document).ready(function() {
    $('select').material_select();
});

// Form Configuration
function formConfig() {
    if(formConfigTitle() &&
    formConfigDate() &&
    formConfigAuthor() &&
    formConfigDes() &&
    formConfigSubject() == true) {
        $("#form").submit();
    } 
}

function formConfigTitle() {
    var x = $("#homeworkTitle").val();
    if (x == "") { 
        Materialize.toast('Please enter a value for the title!', 4000);
    } else if( x.length > 40 ) {
        Materialize.toast('Title cant be longer than 40 characters!', 4000);
    } else {
        return true;
    }
}

function formConfigDate() {
    var x = $("#homeworkDate").val();
    if(x == "") { 
        Materialize.toast('Please enter a value for the Deadline!', 4000);
    } else {
        return true;
    }
}

function formConfigAuthor() {
    var x = $("#homeworkAuthor").val();
    if (x == "") { 
        Materialize.toast('Please enter a value for the Author!', 4000);
    } else if( x.length > 20 ) {
        Materialize.toast('The Authors Name cant be longer than 20 characters!', 4000);
    } else {
        return true;
    }
}

function formConfigDes() {
    var x = $("#homeworkDescription").val();
    if (x == "") { 
        Materialize.toast('Please enter a value for the Description!', 4000);
    } else if( x.length > 300 ) {
        Materialize.toast('Description cant be longer than 300 characters!', 4000);
    } else {
        return true;
    }
}

function formConfigSubject() {
    var x = $("#homeworkSubject").val();
    if (x == undefined) { 
        Materialize.toast('Please enter a value for the Subject!', 4000);
    } else if( x.length > 20 ) {
        Materialize.toast('Description cant be longer than 20 characters!', 4000);
    } else {
        return true;
    }
}

console.log("script.js");