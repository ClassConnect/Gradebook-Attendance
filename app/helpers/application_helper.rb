module ApplicationHelper
  def link_to_openBox(text , content_url, options = { })
    options.reverse_merge! :width => 350, :button => true, :shadow => false
    shadow = (options[:shadow] ? "1" : "0")
    s = ('<a '+(options[:button] ? 'class="button"' : "")+' href="#" onclick="openBox(\''+content_url+'\','+options[:width].to_s+','+shadow+'); return false;">'+text+'</a>')
    s.html_safe
  end
  
  def close_openBox_button
    s = '<a href="#" onclick="closeBox();" class="button"><img src="/images/cross.png" />Cancel</a>'
    s.html_safe
  end
  
  def close_openBox_input
    s = '<input type="button" onclick="closeBox();" class="button" value="Cancel" />'
    s.html_safe
  end
end
