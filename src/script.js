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
      url: "/api/register.php",
      type: "POST",
      data: $(this).serialize(),
      success: function(response) {
        if (response.indexOf("error") !== -1) {
          $("#result").html("<div class='error'>" + response + "</div>");
        } else {
          $("#result").html("<div class='success'>" + response + "</div>");
          $("#registrationForm").trigger("reset");
        }
      },
      error: function(xhr){
        $("#result").html("<div class='error'>Cannot submit, server error.</div>");
      }
    });
  });
});
