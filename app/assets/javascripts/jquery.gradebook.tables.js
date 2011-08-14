var SCALE_FROM_BOX_INDEX = 0;
var SCALE_TO_BOX_INDEX = 1;
var SCALE_NAME_BOX_INDEX = 2;
grading_scale = [];
var oTable;
var keys;
var COLUMN_NUMBER_INDEX = 1;
var VISIBLE_INDEX = 1;
var TOTAL_INDEX = 2;
var student_count;
student_names = [];
assignments_array = [];
_columns_to_destroy = [];
assignments_hash = new Object();
visible_columns = 0;
var grading_scale_method;
_focused_cell = null;
_focused_cell_pos = null;
_current_tooltip = null;
_current_assignment_id = null;
_current_student_id = null;
_grade_scale_id = null;

jeditable_dictionary = {
      onBeforeShow: function(){
        var assignment_id = this.getTrigger().parent().parent().attr('id');
        var url_string = '/assignments/' + assignment_id; 
        $.ajax({
          type: 'GET',
          async: false,
          url: url_string,
          dataType: "html",
          success: function(data){
            popup_content = data;
          }
        });
      },
      onShow: function(){
          $('.tooltip').html(popup_content);
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

function disable_editing(){
  $('.grade').editable("disable");
}

//Global click event handler
/* TODO: BE CAREFUL */
function click_block(e){
  if(_focused_cell != null){
    if(_focused_cell != $(e.target).parents("td")[0]){
      var target_id = e.target.getAttribute("id");
      if(target_id === "in_button" || target_id === "submit-comment"){
      }
      else{
        _focused_cell && $(_focused_cell).children("form").submit();
        _current_tooltip && _current_tooltip.hide();
      }
    }
  }
}
    
function new_assignment(id, point_value){
  return {_id : id, 
  point_value : point_value};
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

function init_gradescale(scale, type, id){
  grading_scale = scale;
  grading_scale_method = type;
  student_count = $('.row_entry').length;
  _grade_scale_id = id;
}

function init_assignments_array(json){
  assignments_array = json;
  visible_columns = assignments_array.length
}

function get_table(){
  return oTable;
}

function destroy_table(){
  $("#gradebook_div").after($("#add_assignment_button")).after($("#edit_scale_button"));
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
        console.log($(this).tooltip().isShown());
        event.stopPropagation();
        //$(this).parent().focus();
      });

      $(option_button).tooltip(options_tooltip_dictionary);

      $(option_button).click(function(event){
        console.log($(this).tooltip().isShown());
        event.stopPropagation();
        //$(this).parent().focus();
      });
    }

    /*
    plugin: function(settings, original){
      var a = keys.fnGetCurrentPosition();

      $('input', this).bind('keydown', function(event){
        switch(event.keyCode){
          //Up key
          case 38:
            if((a[1] - 1) >= 0){
              keys.fnSetPosition(a[0], a[1] - 1);
            }
            break;

          //Return key
          case 13:
          //Down key
          case 40:
            if((a[1] + 1) < oTable.fnSettings().aiDisplay.length){
              keys.fnSetPosition(a[0], a[1] + 1);
            }
            break;

          //Left key
          case 37:
            if((a[0] - 1) >= 0){
              keys.fnSetPosition(a[0]-1, a[1]);
            }
            break;

          //Right key
          case 39:
            if((a[0] + 1) < parseInt($('tbody').attr('cols')) - 3){
              keys.fnSetPosition(a[0]+1, a[1]);
            }
            break;

          //Otherwise, we don't care
          default:
            return;
        }
      });

    }*/
  });
}

function initTable(num_students) {
  if(_columns_to_destroy.length != 0){
    $('.datatable tr').each(function(){
      var destroy_length = _columns_to_destroy.length;
      while(destroy_length--){
        $($(this).children()[_columns_to_destroy[destroy_length]]).remove();
      }
    });
    _columns_to_destroy.length = 0;
  }

  
  init_student_names();
  oTable = $('#gradebook_display').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "550px",
    "sScrollY": "400px",
    "aaSorting": [[1, 'asc']],
    "bProcessing": true,
    "bJQueryUI": true,
    "sDom": '<"H"rf>t<"F">',
    "aoColumnDefs":[{"aTargets":['assignment_header'], "sType":'percent', "bSortable": true, "sWidth":"140px"}],
    "bScrollCollapse": true
  });

  new FixedColumns(oTable, {
    //look at sizing stuff
    "iLeftColumns": 3,
    "iLeftWidth":320,
    "sHeightMatch": "none"
  });

  
  //TODO: focusing when score doesn't change and blank
  //TODO: make this restful?
    
  $('td', oTable.fnGetNodes()).editable(function(value, settings){
    var position = oTable.fnGetPosition(this);
    if(value != $(this).attr('score')){
       $.ajax({
         type: 'POST',
         url: update_grade_url(this), 
         data: {"_method": 'put', "student_id": $(this).parent().attr('id'), "value": value},
         dataType: "html"
       });
     }
      if(value != ""){
        if(isNaN(value)){
          console.log(value);
          return value;
        }
        else{
          $(this).attr('score', value);
          return percentage_format((value / assignment_point_value(position[1]) * 100));
        }
      }
      else{
        $(this).removeAttr('score');
        return "";
      }
    }, {
    "type": "edit_grade",
    "height": "",
    "placeholder": "",
    "onblur": "submit" ,
    "onedit": function(e){
    },
    "data": function(){
      console.log($(this).attr('score'));
      return $(this).attr('score');
    },
    "callback" : function(value, settings) {
      var position = oTable.fnGetPosition(this);
      oTable.fnUpdate(value, position[0], position[2], false);
      console.log("Wrote to " + position[0] + ", " + position[2]);
      if(grading_scale_method !== "manual"){
        var grade = calculateGrade($(this).parent());
        apply_grade_by_column($(this).parent(), position[0], grade);
      }
    },
  });
  
  if(grading_scale_method == "manual")
    enable_editing();

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
  var grade=0, total_points=0, graded=false;
  if(grading_scale_method !== "manual"){
    //Iterate over every cell and calculate score
    $(dom_element).children('[score]').each(function(){
      var position = oTable.fnGetPosition(this);
      graded = true;
      //We only factor in grades that have been graded
      //(Blank - "" - is "ungraded")
      grade += parseInt($(this).attr('score'));
      total_points += assignment_point_value(position[1]);
    });
    if(graded){
      grade = grade / total_points;
      grade *= 100;
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
  $(row_id + "> .grade").html(grade);
  var position = oTable.fnGetPosition(dom_element);
  oTable.fnUpdate(grade, position, 2, false);
}

function apply_grade_by_column(dom_element, column, grade){
  var row_id = "#" + $(dom_element).attr('id');
  $(row_id + "> .grade").html(grade);
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
  if (min != 0) return false;
  while(row_count--){
    //Check if TO and FROM values are consecutive
    current_row = $(rows[row_count]).children("td").children('input');
    current_upper = $(rows[row_count+1]).children("td").children('input')[SCALE_TO_BOX_INDEX].value;
    new_lower = current_row[SCALE_FROM_BOX_INDEX].value; 
    grade_name = current_row[SCALE_NAME_BOX_INDEX].value;

    //Check if grade name is unique
    if (name_array[grade_name] === undefined)
     name_array[grade_name] = true;
    else
      return false;
    //For now, only consecutive integers are valid
    if(new_lower - current_upper != 1)
      return false;
  }
  max = $(rows[0]).children("td").children('input')[SCALE_TO_BOX_INDEX].value;
  if(max == 100)
    return true;
  return false;
}

function remove_fields(link){
  $(link).parent().prev("input[type=hidden]").val("1");
  $(link).closest(".grade_detail_row input[type=text]").attr("disabled", true);
  $(link).closest(".grade_detail_row").hide();
}

function add_fields(link, association, content) {
  var new_id = new Date().getTime();
  var regexp = new RegExp("new_" + association, "g");
  var html = content.replace(regexp, new_id);
  $(link).parent().parent().before(html);
}

function assignment_id(index){
  return assignments_array[index]._id;
}

function assignment_point_value(index){
  return assignments_array[index].point_value;
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

function init_student_names(){
  student_names = jQuery.parseJSON($('#gradebook_display tbody ').attr('students'));
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
  console.log($('.dataTables_scrollHead .header_row' + " #" + assignment_id));
  console.log(oTable.fnGetPosition($('.dataTables_scrollHead .header_row' + " #" + assignment_id)));
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
function update_assignment(assignment_id, assignment_points){
  var position = find_assignment_by_id(assignment_id);
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
          console.log(score);
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
  var input_field = $(_current_tooltip.getTrigger().parents("form").children()[0]).children("input");
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
  _current_tooltip.hide();
  $.ajax({
    type: 'POST',
    url: comment_url(_current_assignment_id),
    data: {"_method": 'put', "student_id": _current_student_id, "value": $('.comment-tip').children("textarea").val()}
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

    $('#gradebook_display_filter').after($('#add_assignment_button')).after($('#edit_scale_button'));
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
