module ApplicationHelper
  def link_to_openBox(text , content_url, options = { })
    options.reverse_merge! :width => 350, :button => true, :shadow => false
    shadow = (options[:shadow] ? "1" : "0")
    s = ('<a '+(options[:button] ? 'class="button"' : "")+' href="#" onclick="openBox(\''+content_url+'\','+options[:width].to_s+','+shadow+'); return false;">'+text+'</a>')
    s.html_safe
  end

  def button_to_openBox(text, content_url)
    options.reverse_merge! :width => 350, :button => true, :shadow => false
    shadow = (options[:shadow] ? "1" : "0")
    s = ('<button onclick="openBox(\''+content_url+'\','+options[:width].to_s+','+shadow+'); return false;">'+text+'</button>')
    s.html_safe
  end
  
  def close_openBox_button
    s = '<a href="#" onclick="closeBox();" class="button"><img src="/rapps/images/cross.png" />Cancel</a>'
    s.html_safe
  end
  
  def close_openBox_input
    s = '<input type="button" onclick="closeBox();" class="button" value="Cancel" />'
    s.html_safe
  end

  #Thanks Ryan Bates!
  def link_to_add_fields(name, f, association)
    new_object = f.object.class.reflect_on_association(association).klass.new
    fields = f.fields_for(association, new_object, :child_index => "new_#{association}") do |builder|
      render(association.to_s.singularize + "_fields", :f => builder)
    end
    button_to_function(name, "add_fields(this, '#{association}', '#{escape_javascript(fields)}')", :id => "add_range_button")
    #content_tag(:div,name,:id => "add_range_button", :onclick => "add_fields(this, '#{association}', '#{escape_javascript(fields)}')")
  end

end
