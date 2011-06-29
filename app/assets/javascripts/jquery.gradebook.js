function initTable(num_students) {
  oTable = $('.datatable').dataTable(
  {
    "iDisplayLength": num_students,
    "bDestroy": true,
    "bAutoWidth": false,
    "sScrollX": "100%",
    "aaSorting": [[1, 'asc']]
  });

  new FixedColumns(oTable, {
    "iLeftColumns": 2,
    "iLeftWidth": 220
  });

  $('td', oTable.fnGetNodes()).editable('/submit_grade', {
    "callback" : function(value, settings) {
      var aPos = oTable.fnGetPosition(this);
      //FixedCol resets indices 
      //So the 3rd column has index 0
      oTable.fnUpdate(value, aPos[0], aPos[1] + 2);
    },
    "submitdata" : function(value, settings){
      return {
        "row_id": this.parentNode.getAttribute('id'),
        "column": oTable.fnGetPosition(this)[2]
      };
    },
    "height": "14px"
  });
}


function isNumeric(value){
  if (value == null || !value.toString().match(/^[-]?\d*\.?\d*$/)) return false;
  return true;
}
