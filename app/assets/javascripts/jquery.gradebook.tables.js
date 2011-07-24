var SCALE_FROM_BOX_INDEX = 0;
var SCALE_TO_BOX_INDEX = 1;
var SCALE_NAME_BOX_INDEX = 2;
var oTable;
var keys;

var assignments_array;

function init_assignments_array(json){
  assignments_array = json;
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
  $.editable.addInputType('example', {
    element : function(settings, original){
      var input = $('<input type="text" style="width: 25px;" autocomplete="off">');
      var position = oTable.fnGetPosition(original);
      $(this).append(input);
      $(this).append("/" + assignment_point_value(position[1]));
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
  oTable = $('#gradebook_display').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "100%",
    "aaSorting": [[1, 'asc']],
    "bRetrieve": true
  });

  new FixedColumns(oTable, {
    //look at sizing stuff
    "iLeftColumns": 3,
    "iLeftWidth": 300
  });

  
  //TODO: focusing when score doesn't change and blank
  //TODO: make this restful?
  $('td', oTable.fnGetNodes()).editable(function(value, settings){
    /*
    if(value != $(this).attr('score')){
       $.ajax({
         type: 'POST',
         url: '/submit_grade',
         data: {"id": $(this).parent().getAttribute('id'), "value": value},
         dataType: "html"
       });
     }
     */
     return value;
    }, {
    "type": "example",
    "placeholder": "",
    "onblur": "submit"
    /*,
    "callback" : function(value, settings) {
      var aPos = oTable.fnGetPosition(this);
      //FixedCol resets indices 
      //So the 4th column has index 0
      oTable.fnUpdate(value, aPos[0], aPos[1] + 3);
      var grade = calculateGrade($(this).parent(), scale);
      oTable.fnUpdate(grade, aPos[0], 2);
      $(this).attr('score', value);
    },
    */
  });
    

  
}//last one


function init_keytable(){
  keys = new KeyTable( {
		"table": document.getElementById('gradebook_display'),
    "datatable": oTable
    } );
}

function gradeMatch(value, scale){
  //Note: reverse while loop is faster
  length = scale.length;
  for(var i=0; i<length; i++){
    if(value <= scale[i]['to']){
      return scale[i]['name'];
    }
  }
  return scale[length-1]['name'];
}

//TODO: Use JSON parse function for scale. I dunno what the hell it's called
function calculateGrade(dom_element, scale){
  var grade=0, total_points=0, graded=false;
  id = "#" + $(dom_element).attr('id');
  id = id + " > .grade"
  $(dom_element).children().each(function(){
    var points_value = $(this).attr('points');
    if(points_value != undefined){
      var contents = $(this).html();
      if(contents != ""){
        graded = true;
        grade += parseInt(contents);
        total_points += parseInt(points_value);
      }
    }
  });
  if(graded){
    grade = grade / total_points;
    grade *= 100;
    grade = (gradeMatch(grade, scale));
    $(id).html(grade);
    return grade;
  }
  return "";
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
*continuous. Checks should also be made to ensure that no ranges have the same name.
*/

//TODO: add name checks
function validate_scales_form(){
  rows = $('.grade_detail_row');
  row_count = rows.length-1;

  while(row_count--){
    var current_upper = $(rows[row_count+1]).children('input')[SCALE_TO_BOX_INDEX].value;
    var new_lower = $(rows[row_count]).children('input')[SCALE_FROM_BOX_INDEX].value;
    if(new_lower - current_upper != 1)
      return false;
  }
  return true;
}

function assignment_id(index){
  return assignments_array[index]._id;
}

function assignment_point_value(index){
  return assignments_array[index].point_value;
}
