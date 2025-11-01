$(document).ready(function(){
  function validateForm() {
    let valid = true;
    $(".error-msg").remove();

    if ($("#name").val().length < 3) {
      $("#name").after("<div class='error-msg error'>Name must be at least 3 characters.</div>");
      valid = false;
    }
    let emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test($("#email").val())) {
      $("#email").after("<div class='error-msg error'>Invalid email address.</div>");
      valid = false;
    }
    if ($("#psw").val().length < 6) {
      $("#psw").after("<div class='error-msg error'>Password must be at least 6 characters.</div>");
      valid = false;
    }
    return valid;
  }

  $("#registrationForm").on("submit", function(event) {
    event.preventDefault();
    $("#result").html("");

    if (!validateForm()) return;

    $.ajax({
      url: "/api/register",
      type: "POST",
      data: JSON.stringify({
        name: $("#name").val(),
        email: $("#email").val(),
        psw: $("#psw").val()
      }),
      contentType: "application/json",
      success: function(response) {
        if (response.error) {
          $("#result").html("<div class='error'>" + response.error + "</div>");
        } else {
          $("#result").html("<div class='success'><h2>✅ Registered Successfully!</h2>" +
            "<div><b>Name:</b> <span style='color:#3b3b5b;'>" + response.name + "</span></div>" +
            "<div><b>Email:</b> <span style='color:#5272f1;'>" + response.email + "</span></div>" +
            "<div><b>Registered at:</b> " + response.timestamp + "</div></div>");
          $("#registrationForm").trigger("reset");
        }
      },
      error: function(xhr){
        $("#result").html("<div class='error'>Cannot submit, server error.</div>");
      }
    });
  });
});
