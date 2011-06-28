// cc lightbox
loading_image_path = '/images/loading.gif'
cancel_image_path = '/images/cross.png'

function openBox(boxURL, boxWidth, shadow) {
	var boxMargin = boxWidth/2 + 6;
	var append = "";
	boxMargin = -boxMargin;
	var mTop = $(window).scrollTop();
	$("#dialogBox").width(boxWidth);
	$("#dialogBox").margin({left: boxMargin})
	$("#dialogBox").margin({top: mTop})
	if (shadow == 1) { 
		append = ", #blackbox";
	} else {
		append = ", #clearbox";
	}
	$("#dialogBox"+append).fadeIn(300);
	$("#dialogBox").html('<div style="text-align:center; font-size:16px; font-weight:bolder;margin-top:5px;color:#666"><img src="'+loading_image_path+'" /></a></div><div style="float:right; margin-bottom:5px"><a href="#" onClick="closeBox();" class="button"><img src="'+cancel_image_path+'" />Cancel</a></div>').fadeIn(200);
	$.ajax({
        type: "GET",
        url: boxURL,
        success: function(conf) {
               $("#dialogBox").html(conf).fadeIn(200);
        }
      });    
}

function closeBox() { 
	$("#dialogBox").fadeOut(300);
	$("#clearbox, #blackbox").fadeOut(300);
	setTimeout(function() {$("#dialogBox").html("")} , 300);
}