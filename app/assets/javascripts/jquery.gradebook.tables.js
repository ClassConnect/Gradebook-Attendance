function add_new_input(){
  $.editable.addInputType('example', {
    element : function(settings, original){
      var input = $('<input type="text" style="width: 25px;">');
      $(this).append(input);
      $(this).append("/" + original.getAttribute('points'));
      return(input);
    }
  });
}

function initTable(num_students) {
  scale = [{"from":0,"to":59,"name":"F"}, {"from":60,"to":69,"name":"D"}, {"from":70,"to":79,"name":"C"}, {"from":80,"to":89,"name":"B"},{"from":90,"to":100,"name":"A"}];
  oTable = $('.datatable').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "100%",
    "aaSorting": [[1, 'asc']],
    "bRetrieve": true
  });

  new FixedColumns(oTable, {
    "iLeftColumns": 3,
    "iLeftWidth": 300
  });

  
  keys = new KeyTable({
    "table": document.getElementById('gradebook_display'),
    "datatable": oTable
  });
  

  
  $('td', oTable.fnGetNodes()).editable('/submit_grade', {
    "type": "example",
    "width": "50px",
    "placeholder": "",
    "cssclass": "test",
    "style": "align='center'",
    "callback" : function(value, settings) {
      var aPos = oTable.fnGetPosition(this);
      //FixedCol resets indices 
      //So the 4th column has index 0
      oTable.fnUpdate(value, aPos[0], aPos[1] + 3);
      var grade = calculateGrade($(this).parent(), scale);
      oTable.fnUpdate(grade, aPos[0], 2);
    },
    "submitdata" : function(value, settings){
      return {
        "row_id": this.parentNode.getAttribute('id'),
        "column": oTable.fnGetPosition(this)[2]
      };
    },
    "height": "14px"
  });
}//last one


function isNumeric(value){
  if (value == null || !value.toString().match(/^[-]?\d*\.?\d*$/)) return false;
  return true;
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

//TODO: Use JSON parse function. I dunno what the hell it's called
function calculateGrade(dom_element, scale){
  var grade=0, total_points=0, graded=false;
  //var test_scale = $('tbody').attr('grading_scale');
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


