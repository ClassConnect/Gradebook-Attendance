// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// require jquery
//= require jquery_ujs
//= require jquery.dataTables
//= require_tree .

$(document).ready(function(){
  $("#ex_button").click(function(){
    misc_grades("EX");
  });

  $("#dr_button").click(function(){
    misc_grades("DR");
  });

  $("#in_button").click(function(){
    misc_grades("IN");
  });

  $("#submit-comment").click(function(){
    submit_comment();
  });

});

  $(document).delegate(".ui-icon-info", "mouseover", function(){
    tooltip_init(this);
  });

  $(document).delegate(".grade_field", "keyup", function(){
    if(jeditable_validator($(this).val())){
    }
    else{
      $(this).val("");
    }
  });

  $(document).delegate("#filter_text", "focus", function(){
    var text = $("#filter_text").value;
    if($("#filter_text").val() === "enter name to filter"){
      $("#filter_text").removeClass("filter_placeholder_text");
      $("#filter_text").val("");
    }

  });

  $(document).delegate("#filter_text", "blur", function(){
    if($("#filter_text").val() == ""){
      $("#filter_text").addClass("filter_placeholder_text");
      $("#filter_text").val("enter name to filter");
    }
  });