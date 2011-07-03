function initTable(num_students) {
  var scale = [{"from":0,"to":59,"name":"F"}, {"from":60,"to":69,"name":"D"}, {"from":70,"to":79,"name":"C"}, {"from":80,"to":89,"name":"B"},{"from":90,"to":100,"name":"A"}];
  oTable = $('.datatable').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "100%",
    "aaSorting": [[1, 'asc']]
  });

  new FixedColumns(oTable, {
    "iLeftColumns": 3,
    "iLeftWidth": 300
  });

  $('td', oTable.fnGetNodes()).editable('/submit_grade', {
    "placeholder": "",
    "width": '90px',
    "callback" : function(value, settings) {
      var aPos = oTable.fnGetPosition(this);
      //FixedCol resets indices 
      //So the 4th column has index 0
      oTable.fnUpdate(value, aPos[0], aPos[1] + 3);
      var grade = initGrade($(this).parent(), scale);
      oTable.fnUpdate(grade, aPos[0], 2);
    },
    "submitdata" : function(value, settings){
      return {
        "row_id": this.parentNode.getAttribute('id'),
        "column": oTable.fnGetPosition(this)[2]
      };
    },
    "height": "14px",
    tooltip: 'Click to edit...'
  });
}//last one


function isNumeric(value){
  if (value == null || !value.toString().match(/^[-]?\d*\.?\d*$/)) return false;
  return true;
}

function calculateGrade(dom_element){
  var node = $(dom_element).parent();
  var points_sum = 0;
  var grade = 0;
  $(node).children().each(function(){
    points_sum += parseInt($(this).html());
  });
  grade = $('tbody').attr('total_points') / points_sum;
  return grade;
}

function gradeMatch(value, scale){
  //Note: reverse while loop is faster
  length = scale.length;
  for(var i=0; i<length; i++){
    if(value <= scale[i]['to']){
      return scale[i]['name'];
    }
  }
}

function initGrade(dom_element, scale){
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
}