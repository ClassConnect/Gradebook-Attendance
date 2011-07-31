var SCALE_FROM_BOX_INDEX = 0;
var SCALE_TO_BOX_INDEX = 1;
var SCALE_NAME_BOX_INDEX = 2;
var grading_scale;
var oTable;
var keys;
var COLUMN_NUMBER_INDEX = 1;
var grading_scale_type; 
student_names = [];
assignments_array = [];
assignments_hash = new Object();
visible_columns = 0;
var grading_scale_method;
jeditable_dictionary = {
      onBeforeShow: function(){
        var assignment_id = this.getTrigger().parent().attr('id');
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

function new_assignment(id, point_value){
  return {_id : id, 
  point_value : point_value};
}

function init_gradescale(scale, type){
  grading_scale = scale;
  grading_scale_method = type;
}

function init_assignments_array(json){
  assignments_array = json;
  visible_columns = assignments_array.length
}

function get_table(){
  return oTable;
}

function destroy_table(){
  oTable.fnDestroy();
}

function block_keytable(){
  keys.block = true;
}

function unblock_keytable(){
  keys.block=false;
}

//Will probably end up buggy...using keypress
//Realistcally, for performance reasons, we'll have to write our own
//Cache position? DOM access is slow
function add_new_input(){
  $.editable.addInputType('edit_grade', {
    element : function(settings, original){
      var input = $('<input type="text" style="width: 25px;" autocomplete="off">');
      var position = oTable.fnGetPosition(original);
      $(this).append(input).append("/" + assignment_point_value(position[1]));
      return(input);
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
  init_student_names();
  oTable = $('#gradebook_display').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "550px",
    "sScrollY": "400px",
    "aaSorting": [[1, 'asc']],
    "bRetrieve": true
  });

  new FixedColumns(oTable, {
    //look at sizing stuff
    "iLeftColumns": 3,
    "iLeftWidth": 300,
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
      $(this).attr('score', value);
      return percentage_format((value / assignment_point_value(position[1]) * 100));
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
    "data": function(){
      return $(this).attr('score');
    },
    
    "callback" : function(value, settings) {
      var aPos = oTable.fnGetPosition(this);
      oTable.fnUpdate(value, aPos[0], aPos[2], false);
      console.log("Wrote to " + aPos[0] + ", " + aPos[2]);
      var grade = calculateGrade($(this).parent());
      apply_grade_by_column($(this).parent(), aPos[0], grade);
    },
  });
    

  
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
        grade = (gradeMatch(grade));
      }
      else{
        grade = percentage_format(grade);
      }
      return grade;
    }
    return "";
  }
  return "MANUAL";
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
  row_count = rows.length-1;
  var min, max, current_upper, new_lower;
  var name_array = new Array();
  min = $(rows[row_count]).children('input')[SCALE_FROM_BOX_INDEX].value;
  if (min != 0) return false;
  while(row_count--){
    //Check if TO and FROM values are consecutive
    current_row = $(rows[row_count]).children('input');
    current_upper = $(rows[row_count+1]).children('input')[SCALE_TO_BOX_INDEX].value;
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
  max = $(rows[0]).children('input')[SCALE_TO_BOX_INDEX].value;
  if(max == 100)
    return true;
  return false;
}

function remove_fields(link){
  $(link).prev("input[type=hidden]").val("1");
  $(link).closest(".grade_detail_row input[type=text]").attr("disabled", true);
  $(link).closest(".grade_detail_row").hide();
}

function add_fields(link, association, content) {
  var new_id = new Date().getTime();
  var regexp = new RegExp("new_" + association, "g");
  $(link).parent().children("#range_fields").append(content.replace(regexp, new_id));
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

function scale_mode_validate(object){
  if($(object).attr('value') === "scale"){
    $("#range_fields").show();
    $("#add_range_button").show();
    $("#range_fields input").removeAttr("disabled");
    $("#range_fields").removeAttr("disabled");
  }
  else{
    $("#range_fields").hide();
    $("#add_range_button").hide();
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

function initial_grade(){
}
