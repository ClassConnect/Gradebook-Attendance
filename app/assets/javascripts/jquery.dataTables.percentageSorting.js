jQuery.fn.dataTableExt.oSort['percent-asc']  = function(a,b) {
    var x = (a == "-") ? 0 : a.replace( /%/, "" );
    var y = (b == "-") ? 0 : b.replace( /%/, "" );
    x = parseFloat( x );
    y = parseFloat( y );
    if(isNaN(x)){
      if(isNaN(y)){
        return 0;
      }
      else{
        return 1;
      }
    }
    else if (isNaN(y)){
      return -1;
    }
    return ((x < y) ? -1 : ((x > y) ?  1 : 0));
  };

  jQuery.fn.dataTableExt.oSort['percent-desc'] = function(a,b) {
    var x = (a == "-") ? 0 : a.replace( /%/, "" );
    var y = (b == "-") ? 0 : b.replace( /%/, "" );
    x = parseFloat( x );
    y = parseFloat( y );
    if(isNaN(x)){
      if(isNaN(y))
        return 0;
      else
        return 1;
    }
    else if (isNaN(y))
      return -1;

    return ((x < y) ?  1 : ((x > y) ? -1 : 0));
  };