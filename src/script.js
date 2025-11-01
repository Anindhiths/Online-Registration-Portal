$(document).ready(function(){
  function validateForm() {
    let valid = true;
    $(".error-msg").remove();

    if ($("#name").val().length < 3) {
      $("#name").after("<div class='error-msg error' style='display:none;'>Name must be at least 3 characters.</div>");
      $("#name").next(".error-msg").fadeIn(200);
      valid = false;
    }
    let emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test($("#email").val())) {
      $("#email").after("<div class='error-msg error' style='display:none;'>Invalid email address.</div>");
      $("#email").next(".error-msg").fadeIn(200);
      valid = false;
    }
    if ($("#psw").val().length < 6) {
      $("#psw").after("<div class='error-msg error' style='display:none;'>Password must be at least 6 characters.</div>");
      $("#psw").next(".error-msg").fadeIn(200);
      valid = false;
    }
    return valid;
  }

  $("#registrationForm").on("submit", function(event) {
    event.preventDefault();
    $("#result").html("");
    $("#registrationsTable").html("");
    
    if (!validateForm()) {
      $("html, body").animate({ scrollTop: $("#registrationForm").offset().top - 20 }, 400);
      return;
    }

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
          $("#result").html(
            `<div class='success'>
              <h2>✅ Registered Successfully!</h2>
              <div><b>Name:</b> <span style='color:#3b3b5b;'>${response.name}</span></div>
              <div><b>Email:</b> <span style='color:#5272f1;'>${response.email}</span></div>
              <div><b>Registered at:</b> ${response.timestamp}</div>
            </div>`
          );
          $("#registrationForm").trigger("reset");
          $("html, body").animate({ scrollTop: $("#result").offset().top - 20 }, 400);
        }
      },
      error: function() {
        $("#result").html("<div class='error'>Cannot submit, server error.</div>");
      }
    });
  });

  $("#viewRegistrations").click(function(){
    $("#result").html(""); // clear result feedback
    $.ajax({
      url: "/api/registrations",
      type: "GET",
      success: function(data) {
        if(Array.isArray(data) && data.length) {
          let table = `
          <table>
            <tr><th>Name</th><th>Email</th><th>Registered At</th></tr>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.email}</td>
                <td>${row.created_at ? new Date(row.created_at).toLocaleString() : ""}</td>
              </tr>
            `).join('')}
          </table>`;
          $("#registrationsTable").html(table);
          $("html, body").animate({ scrollTop: $("#registrationsTable").offset().top - 20 }, 400);
        } else {
          $("#registrationsTable").html("<div class='error'>No registrations found.</div>");
        }
      },
      error: function() {
        $("#registrationsTable").html("<div class='error'>Could not fetch registrations.</div>");
      }
    });
  });
});
