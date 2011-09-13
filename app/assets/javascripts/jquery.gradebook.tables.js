var SCALE_FROM_BOX_INDEX = 0;
var SCALE_TO_BOX_INDEX = 1;
var SCALE_NAME_BOX_INDEX = 2;
grading_scale = [];
var oTable;
var keys;
var COLUMN_NUMBER_INDEX = 1;
var VISIBLE_INDEX = 1;
var TOTAL_INDEX = 2;
var GRAPH_STUDENT_SCORE = 3;
var GRAPH_POINT_VALUE = 4;
var student_count;
student_names = [];
assignments_array = [];
types_array = [];
_columns_to_destroy = [];
assignments_hash = new Object();
_total_columns = 0;
var grading_scale_method;
_focused_cell = null;
_focused_cell_pos = null;
_current_tooltip = null;
_current_assignment_id = null;
_current_student_id = null;
_grade_scale_id = null;
_weight_type = null;
active = false;
_course_id = null;
_grading_bucket = new Object();
_student_grades = new Object();
var _table_width = 0;
var we_talked_about_diffs_last_night = false;
var $table = null;

jeditable_dictionary = {
      onBeforeShow: function(){
        var assignment_id = this.getTrigger().parent().parent().attr('id');
        var url_string = '/assignments/' + assignment_id; 
        $('.tooltip').html("");
          $.ajax({
            type: 'GET',
            url: url_string,
            dataType: "html",
            success: function(data){
              $('.tooltip').html(data);
            }
          });
      },
      onShow: function(){
      }
    };

comment_tooltip_dictionary = {
  onBeforeShow: function(){
    if(_current_tooltip != null){
      _current_tooltip.hide();
    }
    _current_tooltip = this;
    _current_assignment_id = assignment_id(_focused_cell_pos[1]);
    _current_student_id = $(_focused_cell).parents("tr").attr("id");
  },
  onShow: function(){
    var cached_comment = $(this.getTrigger()).parents("td").attr('comment');
    if(cached_comment)
      $('.comment-tip').children("textarea").val(cached_comment);
    $('.comment-tip').children("textarea").focus();
  },
  onHide: function(){
    var entered_text = $('.comment-tip').children("textarea").val();
    $('.comment-tip').children("textarea").val("");
    $(this.getTrigger()).parents("td").attr("comment", entered_text);
  },
  tip: ".comment-tip",
  events: {def: "click, blur"}
}

options_tooltip_dictionary = {
  onBeforeShow: function(){
    if(_current_tooltip != null){
      _current_tooltip.hide();
    }
    _current_tooltip = this;
  },
  onShow: function(){
  },
  onHide: function(){
  },
  tip: ".options-tip",
  events: {def: "click, blur"}
}

function enable_editing(){
  $(".grade").editable(function(value, settings){
     $.ajax({
       type: 'POST',
       url: update_manual_grade(this),
       data: {"_method": 'put', "student_id": $(this).parent().attr('id'), "value": value},
       dataType: "html"
     });
     var row_num = $(this).parent().attr('num');
     oTable.fnUpdate(value, parseInt(row_num), 2, false);
    return value;
  }, 
  {
  "width": "",
  "height": "",
  "placeholder": "",
  "onblur": "submit",
  "type": "manual"
  });
}

function init_assignment_types(){
  types_array = jQuery.parseJSON($("#gradebook_div").attr("types"));
  $("#gradebook_div").attr("weight");
  var length = types_array.length;
  var cache;
  while(length--){
    cache = types_array[length]._id;
    _grading_bucket[cache] = new Object();
    _grading_bucket[cache].earned_points = 0;
    _grading_bucket[cache].total_points = 0;
  }
  _weight_type = $("#gradebook_div").attr("weight");
}

function find_type_by_id(type_id){
  var length = types_array.length;
  while(length--){
    if(types_array[length] == type_id){
      //return position of object
      return length;
    }
  }
  return -1;
}

function disable_editing(){
  $('.grade').editable("disable");
}

//Global click event handler
/* TODO: BE CAREFUL */
function click_block(e){
  if(_focused_cell != null){
    if(_focused_cell != $(e.target).parents("td")[0]){
      var target_id = e.target.getAttribute("id");
      switch(target_id){
        case "in_button":
        case "ex_button":
        case "dr_button":
        case "submit-comment":
          return;
        default:
          _focused_cell && $(_focused_cell).children("form").submit();
          _current_tooltip && _current_tooltip.hide();
      }
    }
  }
}

function keyboard_block(e){
  if(e.which == 9){
  }
  if(_focused_cell != null){
    switch(e.keyCode){
      //up press
      case 38:
        var column_position = oTable.fnGetPosition(_focused_cell)[1];
        $($(_focused_cell).parent().prev().children()[column_position]).trigger("click");
        break;
      //down press
      case 13:
        e.preventDefault();
      //enter key
      case 40:
        var position = oTable.fnGetPosition(_focused_cell);
        var column_position = position[1];
        //Submit if last cell
        if(position[0]+1 === student_count){
          $(_focused_cell).children("form").submit();
        }
        //Otherwise, move down to the next one
        else{
          $($(_focused_cell).parent().next().children()[column_position]).trigger("click");
        }
        break;
      //left press
      case 37:
        $(_focused_cell).prev().trigger("click");
        break;
      //right press
      case 9:
        e.preventDefault();
      case 39:
        $(_focused_cell).next().trigger("click");
        break;
      default:
        return;
    }
  }
  else
    return;
}

function new_assignment(id, point_value, type_id){
  return {_id : id, 
  point_value : point_value,
  position: assignments_array.length+3,
  assignment_type_id: type_id};
  _total_columns++;
}

function reset_assignment_position(){
  _total_columns = assignments_array.length;
  for(i=0; i< _total_columns; i++){
    assignments_array[i].position = i+3;
  }
}

function remove_assignment(assignment_id){
  var position = find_assignment_by_id(assignment_id);
  var true_position = assignments_array[position].position;
  assignments_array.splice(position, 1);
  _columns_to_destroy.push(true_position);
  oTable.fnSetColumnVis(true_position, false);
}


/*
* This is necessary because of me having shitty datastructures. 
* DataTables won't give me the position of a TH. Fuck.
* Linear search it is.
* Returns -1 when it can't find, which it never should.
*/
function find_assignment_by_id(id){
  var assignment_count = assignments_array.length;
  while(assignment_count--){
    if(assignments_array[assignment_count]._id === id){
      return assignment_count;
    }
  }
  return -1;
}

function init_gradescale(type, id){
  var stupid = $("#gradebook_div");
  grading_scale = jQuery.parseJSON(stupid.attr("ranges"));
  grading_scale_method = type;//jQuery.parseJSON(stupid.attr("range_type"));
  student_count = $('.row_entry').length;
  _grade_scale_id = id//jQuery.parseJSON(stupid.attr("scale_id"));
}

function init_assignments_array(){
  assignments_array = jQuery.parseJSON($('#gradebook_div').attr('assignments'));
  _table_width = assignments_array.length * 150;
}

function init_course_id(course_id){
  _course_id = course_id;
}

function get_table(){
  return oTable;
}

function destroy_table(){
  $("#gradebook_div").after($("#add_assignment_button")).after($("#edit_scale_button")).after($("#edit_weight_button"));
  oTable.fnDestroy();
}

function block_keytable(){
  keys.block = true;
}

function unblock_keytable(){
  keys.block=false;
}

//JEDITABLE
//Will probably end up buggy...using keypress
//Realistcally, for performance reasons, we'll have to write our own
//Cache position? DOM access is slow
function add_manual_input(){
  $.editable.addInputType('manual', {
    element: function(settings, original){
      var input = $('<input type="text" class ="manual_field" autocomplete="off">');
      $(this).append(input);
      return(input);
    }
  });
}


function add_new_input(){
  $.editable.addInputType('edit_grade', {
    element : function(settings, original){
      var input = $('<input type="text" class="grade_field" autocomplete="off">');
      var position = oTable.fnGetPosition(original);
      var points = $('<span class="assignment-value">' + '/' + assignment_point_value(position[1]) + '</span>');
      var container_span = $('<div class="entry-container"></span>');
      container_span.append(input).append(points);
      $(this).append(container_span);
      return(input);
    },
    buttons: function(settings, original){
      var button_div = $('<div id="choice-buttons"></div>');
      var comment_button = $('<ul class="micons"><li class="ui-state-default ui-corner-all"><span class="ui-mini ui-icon-comment"></span></li></ul>');
      var option_button = $('<ul class="micons"><li class="ui-state-default ui-corner-all"><span class="ui-mini ui-icon-pencil"></span></li></ul>');
      $(comment_button).append('<br/>').append(option_button);
      $(button_div).append(comment_button).append(option_button);
      $(this).append(button_div);

      $(option_button).hover(
        function() { $(this).children().addClass('ui-state-hover'); }, 
        function() { $(this).children().removeClass('ui-state-hover'); }
      );

      $(comment_button).hover(
        function() { $(this).children().addClass('ui-state-hover'); }, 
        function() { $(this).children().removeClass('ui-state-hover'); }
      )
      
      $(comment_button).tooltip(comment_tooltip_dictionary);

      $(comment_button).click(function(event){
        event.stopPropagation();
      });

      $(option_button).tooltip(options_tooltip_dictionary);

      $(option_button).click(function(event){
        event.stopPropagation();
      });
    }

  });
}

function hide_filter_label(){
  $(".dataTables_filter label").val("");
  $("#filter_text").val("enter name to filter");
}

function gradebook_init(type, id){
  $table = $('#gradebook_display');
  add_new_input();
  add_manual_input();
  init_student_names();
  init_assignments_array();
  init_assignment_types();
  _grading_options = ["DR", "EX", "IN"];
  init_gradescale(type, id);
  _course_id = parseInt($("#gradebook_div").attr("course_id"))
}

function initTable() {
  if(_columns_to_destroy.length != 0){
    $('.datatable tr').each(function(){
      var destroy_length = _columns_to_destroy.length;
      while(destroy_length--){
        $($(this).children()[_columns_to_destroy[destroy_length]]).remove();
      }
    });
    _columns_to_destroy.length = 0;
  }
  
  oTable = $table.dataTable(
  {
    "iDisplayLength": student_count,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "555px",
    "sScrollY": "400px",
    "aaSorting": [[1, 'asc']],
    "bProcessing": true,
    "bJQueryUI": true,
    "sDom": '<"H"rf>t<"F">',
    "aoColumnDefs":[{"aTargets":['assignment_header'], "sType":'percent', "bSortable": true, "sWidth":"140px"}
    ,{"aTargets": [0, 1], "sWidth": "100px"}, {"aTargets":[2], "sWidth": "120px"}]
    ,"bScrollCollapse": true
  });

  new FixedColumns(oTable, {
    //look at sizing stuff
    "iLeftColumns": 3,
    "iLeftWidth":340,
    "sHeightMatch": "none"
  });
  
  $('td', oTable.fnGetNodes()).editable(function(value, settings){
    var position = oTable.fnGetPosition(this);
    if(value == ""){
      //if the assignment is already ungraded
      if($(this).attr('score') !== undefined){
       $.ajax({
         type: 'POST',
         url: update_grade_url(this), 
         data: {"_method": 'put', "student_id": $(this).parent().attr('id'), "value": value},
         dataType: "html"
       });
       we_talked_about_diffs_last_night = true;
      }
      else{
       we_talked_about_diffs_last_night = false;
       $(this).removeAttr('score');
      }
     return "";
    }

    else{
      if(value != $(this).attr('score')){
        $.ajax({
          type: 'POST',
          url: update_grade_url(this), 
          data: {"_method": 'put', "student_id": $(this).parent().attr('id'), "value": value},
          dataType: "html"
        });
        we_talked_about_diffs_last_night = true;
        $(this).attr('score', value);
      }
      else{
        we_talked_about_diffs_last_night = false;
      }

      if(isNaN(value)){
        return value;
      }
      else{
        return percentage_format((value / assignment_point_value(position[1]) * 100));
      }
    }
    }, {
    "type": "edit_grade",
    "height": "",
    "placeholder": "",
    "onblur": "submit" ,
    "onedit": function(e){
    },
    "data": function(){
      return $(this).attr('score');
    },
    "callback" : function(value, settings) {
      if(we_talked_about_diffs_last_night){
        var position = oTable.fnGetPosition(this);
        oTable.fnUpdate(value, position[0], position[2], false);
        if(grading_scale_method !== "manual"){
          var grade = calculateGrade($(this).parent());

          $.ajax({
            type: 'POST',
            url: course_grade_update(this),
            data: {"_method": 'put', "student_id": $(this).parent().attr('id'), "value": grade},
            dataType: "html"
          });

          apply_grade_by_column($(this).parent(), position[0], grade);
        }
      }
    },
  });
  
  if(grading_scale_method == "manual")
    enable_editing();

  hide_filter_label();

  reset_assignment_position();

}//last one

function init_keytable(){
  keys = new KeyTable( {
		"table": document.getElementById('gradebook_display'),
    "datatable": oTable
    } );
}

/*
*
*/
function gradeMatch(value){
  length = grading_scale.length;
  for(var i=0; i<length; i++){
    if(value <= grading_scale[i]['to']){
      return grading_scale[i]['name'];
    }
  }
  return grading_scale[length-1]['name'];
}

/*
* Takes in a TR and calculates the grade based on the scores entered. 
* The score is taken from attr "score", NOT the HTML of the TD. Further, only 
* assignments that have an entry are factored into the score.
*
* Returns the grade to be displayed as a string.
*/
function calculateGrade(dom_element){
  var grade=0, total_points=0, graded=false, current_assignment;
  reset_bucket();
  if(grading_scale_method !== "manual"){
    //Iterate over every cell and calculate score
    $(dom_element).children('[score]').each(function(){
      var position = oTable.fnGetPosition(this);
      graded = true;

      //We only factor in grades that have been graded
      //(Blank - "" - is "ungraded")

      //Fill up proper grading bucket
      current_assignment = get_assignment(position[1]);
      bucket = _grading_bucket[current_assignment.assignment_type_id];
      bucket.total_points += assignment_point_value(position[1]);
      bucket.earned_points += parseInt($(this).attr('score'));
    });

    if(graded){
      switch(_weight_type){
        // Earned divided by total points
        case "no_weight":
          grade = no_weight_grade(_grading_bucket);
          break;
        case "equal_weight":
          grade = equal_weight_grade(_grading_bucket);
          break;
        case "manual_weight":
          grade = manual_weight_grade(_grading_bucket);
          break;
        default:
          console.log("Unsupported weight type");
      }

      if(grading_scale_method === "scale"){
        grade = "" + percentage_format(grade) + " " +  (gradeMatch(grade));
      }
      else{
        grade = percentage_format(grade);
      }
      return grade;
    }
    return "";
  }
  return "";
}

/*
* Takes a TR and updates the grades column. THIS FUNCTION HAS SIDE-EFFECTS. 
* The grade is applied to the "Grades" column, and DataTables is updated, but
* the table is NOT redrawn for speed and positioning.
*/ 
function apply_grade(dom_element, grade){
  var row_id = "#" + $(dom_element).attr('id');
  $(row_id + "> .grade").html('<div class="calc-grade">' + grade + '</div>');
  var position = oTable.fnGetPosition(dom_element);
  oTable.fnUpdate(grade, position, 2, false);
}

function apply_grade_by_column(dom_element, column, grade){
  var row_id = "#" + $(dom_element).attr('id');
  $(row_id + "> .grade").html('<div class="calc-grade">' + grade + '</div>');
  oTable.fnUpdate(grade, column, 2, false);
}

function percentage_format(number){
  var string_number = "" + number;
  var decimal_position;
  if((decimal_position = string_number.indexOf(".")) != -1){
    string_number = number.toFixed(2);
    //next, need to check to make sure that there aren't double zeroes
    if(string_number[decimal_position+2] === "0"){
      string_number = string_number.slice(0, string_number.length - 1);
      //If there are two insignifcant zeroes, we need to remove them AND the decimal
      if(string_number[decimal_position+1] === "0"){
        string_number = string_number.slice(0, string_number.length - 2);
      }
    }
  }
  return string_number + "%";
}

function _openbox_helper(text, content_url){
  var string ='<a class="button" href="#" onclick="openBox(content_url, 350); return false;">'+ text +'</a>'
  return string;
}


//Helper to generate openbox link so I don't have to do that bullshit by hand
function link_to_openbox(text, url){
  var openbox_link = '<a class="button" href="#" onclick="openBox(';
  openbox_link += "'" + url + "'" + ', 350); return false;">'+ text +'</a>';
  return openbox_link;
}


function display_error(string){
  $('#cert_alert').html('<h2>' + string + '</h2>');
  $('#cert_alert').slideDown();
}

/*
*This function validates the user's input when editing scales. Ranges should be
*continuous, and range from 0(%) to 100(%). No grades can have the same "name." 
*/

//TODO: add support for floats?
//TODO: add 
function validate_scales_form(){
  rows = $('.grade_detail_row:visible');
  var row_count = rows.length-1;
  var min, max, current_upper, new_lower;
  var name_array = new Array();
  min = $(rows[row_count]).children("td").children('input')[SCALE_FROM_BOX_INDEX].value;
  if (min != 0){
    display_error("Ranges must start at 0 and end at 100");
    return false;
  }
  while(row_count--){
    //Check if TO and FROM values are consecutive
    current_row = $(rows[row_count]).children("td").children('input');
    current_upper = $(rows[row_count+1]).children("td").children('input')[SCALE_TO_BOX_INDEX].value;
    new_lower = current_row[SCALE_FROM_BOX_INDEX].value; 
    grade_name = current_row[SCALE_NAME_BOX_INDEX].value;

    //Check if grade name is unique
    if (name_array[grade_name] === undefined)
     name_array[grade_name] = true;
    else{
      display_error("Ranges must have unique names");
      return false;
    }
    //For now, only consecutive integers are valid
    if(new_lower - current_upper != 1){
      display_error("Ranges must be consecutive");
      return false;
    }
  }
  max = $(rows[0]).children("td").children('input')[SCALE_TO_BOX_INDEX].value;
  if(max == 100)
    return true;


  display_error("Ranges must start at 0 and end at 100");
  return false;
}

function remove_fields(link, type){
  if(type === "range"){
    $(link).parent().prev("input[type=hidden]").val("1");
    $(link).closest(".grade_detail_row input[type=text]").attr("disabled", true);
    $(link).closest(".grade_detail_row").hide();
  }
  if(type === "assignment_type"){
    $(link).parents(".assignment_type").children(".type_destroy_field").val("1");
    $(link).parents(".assignment_type").children().not(".type_destroy_field").attr("disabled", true);
    $(link).parents(".assignment_type").hide();
  }
}

function add_fields(link, association, content, situation) {
  var new_id = new Date().getTime();
  var html, regexp, test;
  regexp = new RegExp("new_" + association, "g");
  if(situation === "range"){
    html = content.replace(regexp, new_id);
    $(link).parent().parent().before(html);
  }
  if(situation === "assignment_type"){
    var field_regexp = new RegExp("attributes_", "g");
    var bracket_regexp = new RegExp("\\]\\[", "g");
    html = content.replace(field_regexp, "attributes_new_assignment_types_");
    html = html.replace(bracket_regexp, "][new_assignment_types][");
    html = html.replace(regexp, new_id);
    //$(link).parent("form").children("#assignment_types").append(html);
    $("#assignment_fields table").append(html);
    $($(".assignment_type:last .type_course_id")[0]).val(_course_id);
    assignment_type_validate($("#weight_type .selected input"));
  }
}

function assignment_id(index){
  return assignments_array[index]._id;
}

function assignment_point_value(index){
  return assignments_array[index].point_value;
}

function get_assignment(index){
  return assignments_array[index];
}

function update_grade_url(object){
  var position = oTable.fnGetPosition(object);
  return '/gradebooks/assignments/' + assignment_id(position[COLUMN_NUMBER_INDEX]) + '/update';
}

function update_manual_grade(){
  return '/gradebooks/assignments/' + _grade_scale_id + '/manual_grade';
}

function comment_url(assignment_id){
  return '/gradebooks/assignments/' + assignment_id + '/comment';
}

function scale_mode_validate(object){
  if($(object).attr('value') === "scale"){
    $("#range_fields").show();
    $("#add_range_button").show();
    if($("#cert_alert").html())
      $("#cert_alert").show();
    $("#range_fields input").removeAttr("disabled");
    $("#range_fields").removeAttr("disabled");
  }
  else{
    $("#range_fields").hide();
    $("#add_range_button").hide();
    $("#cert_alert").hide();
    $("#range_fields input").attr("disabled", true);
    $("#range_fields").attr("disabled", true);
  }
}

function assignment_type_validate(object){
  if($(object).attr('value') === "manual_weight"){
    $(".weight_percent_field").parent().show();
  }
  //either no weight or even weight
  else{
    $(".weight_percent_field").parent().hide();
    $(".weight_percent_field").parent().val("");
  }
}

//Ensures that the weights add up to 100

function assignment_weight_validation(){
  if($("#gradebook_settings_weight_type_manual_weight").attr("checked") == "checked"){
    var total = 0, current_value;
    $("td input.weight_percent_field").each(function(){
      current_value = parseInt(this.value);
      if(isNaN(current_value) || (current_value < 0)){
        display_error("Values must be positive numbers");
        return false;
      }
      total += current_value;
    });
    if(total != 100){
      display_error("Values must add up to 100");
      return false;
    }
  }
  return true;
}


function init_student_names(){
  student_names = jQuery.parseJSON($('#gradebook_display tbody ').attr('students'));
  /*
  $.each(student_names, function(student_id, name){
    var cache_id = ("" + student_id);
    _student_grades[cache_id] = new Object();
    _student_grades[cache_id].total_points = 0;
  })
  */
}

function series_comparator(a, b){
  if (a['data'] < b['data'])
    return -1;
  if (a['data'] > b['data'])
    return 1;
  if (a['data'] === b['data'])
    return 0;
}

function assignment_column_from_id(assignment_id){
  $('.dataTables_scrollHead .header_row' + " #" + assignment_id);
  oTable.fnGetPosition($('.dataTables_scrollHead .header_row' + " #" + assignment_id));
}

/*
* DataTables keeps track of positions internally. We are hiding columns to delete.

*/
function get_true_position(position){
  var true_position=-1;
  if(position >= 0){
    var grade_listing = $('.dataTables_scrollBody .row_entry');
      if(grade_listing.length > 0){
        true_position = oTable.fnGetPosition($(grade_listing[0]).children()[position])[2];
      } 
  }
  return true_position;
}

/*
* After updating an assignment's point value, all of the displays
* must be re-calculated. In addition, we need to actually store the new value
* to the array, but only if it's different.
* Due to using an internal array and DataTable's internal track of columns,
* we need to check twice. This sucks but I can't think of another way to do it 
* for now.
*/
function update_assignment(assignment_id, assignment_points, assignment_name){
  var position = find_assignment_by_id(assignment_id);
  $("#" + assignment_id + " .assignment-name").html(assignment_name);
  if(position >= 0){
    if(assignments_array[position].point_value !== assignment_points){
      assignments_array[position].point_value = assignment_points;
      $('.dataTables_scrollBody .datatable tbody tr').each(function(){
        var grade = calculateGrade(this);
        apply_grade(this, grade);
      });
      var grade_listing = $('.dataTables_scrollBody .row_entry');
      var true_position;
      if(grade_listing.length > 0){
        true_position = oTable.fnGetPosition($(grade_listing[0]).children()[position])[2];
      }
      var entry_count = grade_listing.length;
      var cache_point_value = assignments_array[position].point_value;
      while(entry_count--){
        var td = $(grade_listing[entry_count]).children()[position];
        var score = parseInt(td.getAttribute('score'));
        if(score){
          var formatted_num = percentage_format((score / cache_point_value) * 100);
          $(td).html(formatted_num);
          oTable.fnUpdate(formatted_num, entry_count, true_position, false);
        }
      }
    }
  }
  else{
    console.log("Could not find assignment");
  }
}

function misc_grades(code){
  $(".grade_field").val(code);
  if(code === "EX" || code === "DR"){
    $(_focused_cell).removeAttr('score');
  }
  else{
    $(_focused_cell).attr('score', 0);
  }
  $(_focused_cell).children("form").submit();
  _current_tooltip.hide();
}

function submit_comment(){
  var comment = $('#comment-entry').val();
  _current_tooltip.hide();
  $.ajax({
    type: 'POST',
    url: comment_url(_current_assignment_id),
    data: {"_method": 'put', "student_id": _current_student_id, "value": comment}
  });
  $($(_focused_cell).children("form").children()[0]).children()[0].focus();
}

function init_headers(){
    
    $(".ui-icon-info").removeClass("ui-icon-carat-2-n-s");
    $(".assignment-name").attr("margin-top", 0);
    $(".ui-icon-info").attr("style", "float: right; display: inline;");
    $(".DataTables_sort_icon").attr("style", "float: right;");

    $(".dataTables_scrollBody td").click(function(e){
      if(_focused_cell == this){
        $($(this).children("form").children()[0]).children()[0].focus();
        _current_tooltip && _current_tooltip.hide();
      }
      else{
        _focused_cell && $(_focused_cell).children("form").submit();
        _current_tooltip && _current_tooltip.hide();
        _focused_cell = this;
        _focused_cell_pos = oTable.fnGetPosition(_focused_cell);
        $($(this).children("form").children()[0]).children()[0].focus();
      }
    });
    
    $(".grade").click(function(e){
      _focused_cell && $(_focused_cell).children("form").submit();
      _current_tooltip && _current_tooltip.hide();
      _focused_cell = this;
      $(this).children("form").children()[0].focus();
    });

    $('#gradebook_display_filter').after($('#add_assignment_button')).after($('#edit_scale_button')).after($('#edit_weight_button'));
}

function tooltip_init(object){
  if(!$(object).data("tooltip")){
    $(object).tooltip(jeditable_dictionary);
    $(object).trigger("mouseover");
  }
}

function jeditable_validator(string){
  if(string === "")
    return true;
  var num_string = Number(string);
  if(num_string < 0 || isNaN(num_string))
    return false;
  else
    return true;
}

function is_num(string){
  var num_string = Number(string);
  if(num_string < 0 || isNaN(num_string))
    return false;
  else
    return true;
}

/*
* Could optimize this
*/
function reset_bucket(){
  var length = types_array.length;
  var cache_id;
  while(length--){
    cache_id = types_array[length]._id;
    _grading_bucket[cache_id].total_points = 0;
    _grading_bucket[cache_id].earned_points = 0;
  }
}

/*
* Calculated by dividing earned points by total points
*/
function no_weight_grade(bucket){
  var length = types_array.length;
  var cache_id, total_points=0, earned_points=0;
  while(length--){
    cache_id = types_array[length]._id;
    total_points += bucket[cache_id].total_points;
    earned_points += bucket[cache_id].earned_points;
  }
  return (earned_points / total_points) * 100;
}

/*
*
*/

function equal_weight_grade(bucket){
 var length = types_array.length;
 var weight = 1 / length;
 var points_array = [];
 var grade = 0;
 var cache_id;
 while(length--){
   cache_id = types_array[length]._id;
   var div = bucket[cache_id].earned_points / bucket[cache_id].total_points;
   if(!isNaN(div))
     points_array.push(div);
 }

 //when equal weight, it'll change depending on how many assignment types have been used
 length = points_array.length;
 weight = 1/length;
 while(length--){
  grade += (weight * points_array[length]);
 }

 if(isNaN(grade)){
   return 0;
 }
 return grade * 100;
}

function manual_weight_grade(bucket){
  var length = types_array.length;
  var grade=0, cache_id, type_weight=0, type;
  var total_weight =0;
  type_weight_array = [];
  while(length--){
    type = types_array[length];
    cache_id = type._id;
    new_array = [];
    type_weight = type.weight;
    var div = bucket[cache_id].earned_points / bucket[cache_id].total_points;
    if(!isNaN(div)){
      new_array[0] = div;
      new_array[1] = type_weight;
      type_weight_array.push(new_array);
      total_weight += type_weight;
    }
  }

  
 length = type_weight_array.length;
 while(length--){
  grade += ((type_weight_array[length][1] / total_weight) * type_weight_array[length][0]);
 }

  if(isNaN(grade)){
    return 0;
  }
  return grade * 100;
}

function course_grade_update(object){
  return '/gradebooks/' + _course_id + '/' + $(object).parents("tr").attr("id") + '/course_grade';
}

function student_grade_chart(){
  var course_name = $("#grade-chart-display").attr("course_name");
  var parsed_array;
  var grade_array = [];
  $("td.assignment-grade").each(function(){
    parsed_array = jQuery.parseJSON($(this).attr("assignment_info"));
    //because we stored the damn date as a date and not int
    grade_array.push(parsed_array);
  });

  return  new Highcharts.Chart({
      chart: {
         renderTo: 'grade-chart-display',
         type: 'scatter',
         width: 600
      },
      title: {
        //enabled: false
         text: "" 
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      xAxis: {
         type: 'datetime',
         dateTimeLabelFormats: { // don't display the dummy year
            month: '%B',
            year: '%b',
            hour: '%b',
            second: '%b'
         },
         tickInterval: (1000 * 3600 * 24 * 30)
      },
      yAxis: {
         min: 0,
         max: 100,
         title: {
           text: null
         },
         labels:{
           formatter: function(){
             return '' + this.value + '%';
           }
         }
      },
      tooltip: {
         formatter: function() {
                   return '<b>'+ this.point.name +'</b><br/>'+ this.y + '%';
         }
      },
      plotOptions:{
      },
      series: [{
         data: grade_array
      }]
   });
}

function regrade(){
  if(grading_scale_method != "manual"){
    $('.dataTables_scrollBody .datatable tbody tr').each(function(){
      var grade = calculateGrade(this);
      apply_grade(this, grade);
    });
  }
}

function _gradebook_delegates(){
  //
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

  $(document).delegate(".ui-icon-info", "mouseover", function(){
    tooltip_init(this);
  });
}

function _gradebook_buttons(){
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

  $('#add_assignment_button').click(function(){
    openBox('/gradebooks/' + _course_id + '/assignments', 300);
  });

  $('#edit_scale_button').click(function(){
    openBox('/gradebooks/grading_scale/' + _course_id, 350);
  });

  $('#edit_weight_button').click(function(){
    openBox('/gradebooks/' + _course_id + '/weight', 350);
  });
}

//Stuff in here that for some reason 
function teacher_gradebook(){
    _focused_cell = null;
    hide_filter_label();
    init_headers();
    _gradebook_delegates();
    _gradebook_buttons();
    $('.dataTables_scroll .datatable').attr('style', "");
    document.addEventListener('click', click_block, true);
    document.addEventListener('keydown', keyboard_block, true);
}

function validate_new_assignment(){
  var current_value;
  if(!$("input#assignment_name").val()){
    display_error("Please enter a name");
    return false;
  }

  if(!is_num($("input#assignment_point_value").val())){
    display_error("Point value must be a number");
    return false;
  }

  current_value = $("input#assignment_date_due").val();
  if(!isDate(current_value, "yyyy-M-d")){
    display_error("Date due must be a valid date");
    return false;
  }

  return true;
}

function find_type(type){
  var length = types_array.length;  
  while(length--){
    
  }
}

//Datatables caches the width of the scrollheader to keep things matching up
//We need to change it before 
function resize_datatable(){
  var width_string = "width: " + (_table_width + 15) + "px";
  $('.dataTables_scrollHeadInner').attr('style', width_string);
}

function new_table_width(){
  return _table_width += 150;
}
