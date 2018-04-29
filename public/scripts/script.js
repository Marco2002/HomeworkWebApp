// =====================
// Materialize code
// =====================

$(function() {
    
    // get homework or exam page
    var url = window.location.pathname;
    
    $('ul.tabs').tabs(
        "select_tab", url.substring(url.lastIndexOf("/") + 1), {
        swipeable : true,
        }
    );
    
    // Initialize collapse button
    $('.button-collapse').sideNav({
          menuWidth: 300, // Default is 300
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true, // Choose whether you can drag to open on touch screens,
          onOpen: function(el) { /* Do Stuff */ }, // A function to be called when sideNav is opened
          onClose: function(el) { /* Do Stuff */ }, // A function to be called when sideNav is closed
        }
    );
    
    // datepicker for homework/new form setup
    $('.datepicker').pickadate({
        selectMonths: true, // Creates a dropdown to control month
        selectYears: 15, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false, // Close upon selecting a date,
        format: 'dd.mm.yyyy',
        min: new Date(),
    });
    
    // subject selection setup
    $(document).ready(function() {
        $('select').material_select();
    });
    
    // check which subject
    $("#homeworkSubject").change(function() {
        var subject = $("#homeworkSubject")[0].value
        
        if ((subject == "Other") || (subject == "Foreign Language 1") || (subject == "Foreign Language 2") || (subject == "Foreign Language 3")) {
            $("#subjectName").prop("disabled", false);
            $("#subjectName").val("");
        } else {
            $("#subjectName").val(subject);
            $("#subjectName").prop("disabled", true);
        }
    });
    
    // Form Configuration
    this.formConfig = function() {
        
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
                Materialize.toast('Please enter a value for the deadline!', 4000);
            } else {
                return true;
            }
        }
        
        function formConfigDes() {
            if(!document.getElementById("homeworkDescription")) {
                return true;
            }
            
            var x = $("#homeworkDescription").val();
            if (x == "") { 
                Materialize.toast('Please enter a value for the description!', 4000);
            } else if( x.length > 500) {
                Materialize.toast('Description cant be longer than 300 characters!', 4000);
            } else {
                return true;
            }
        }
        
        function formConfigSubject() {
            var x = $("#homeworkSubject").val();
            if (x == undefined) { 
                Materialize.toast('Please enter a value for the subject!', 4000);
            } else {
                return true;
            }
        }
    
        function formConfigSubjectName() {
            var x = $("#subjectName").val();
            if (x == undefined || x == "") { 
                Materialize.toast('Please enter a value for the subject name!', 4000);
            } else if( x.length > 20 ) {
                Materialize.toast('Subject name cant be longer than 20 characters!', 4000);
            } else {
                return true;
            }
        }
    
        if(formConfigTitle() && formConfigDate() && formConfigDes() && formConfigSubjectName() && formConfigSubject() == true) {
            $("#subjectName").prop("disabled", false);
            $("#form").submit();
        }
    }

    // Add Topic
    var htmlCode = $("#topicContainer").html();
    
    this.addTopic = function() {
        
        $("#topicForm").append('<div id="topicContainer">' + htmlCode + "</div>");
    }
    
    // Remove Topic
    this.removeTopic = function() {
        $('#topicContainer').last().remove();
    }
    
    // Close Alert
    $(".alert").on("click", "#alert-close", function() {
        console.log('oeuoeu');
        $(".alert").fadeOut("slow", function() {});
    });
    
    // Warning before delete. the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
    });
    
    // language submit button
    $("#lang_submit").click(function() {
        var lang = $("input[name='lang']:checked").attr("id");
        
        window.location = "http://hmwk.me/?clang=" + lang;
    });
    
    console.log("script.js file active");
    
    return this;
});
