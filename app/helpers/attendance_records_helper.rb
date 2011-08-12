module AttendanceRecordsHelper
  def table_element(containing_text, options = {})
    options.reverse_merge! :id => "", :onclick => "", :data_cache => "", :class => ""
    td =  '<td ' 
    td += 'id="'+options[:id]+'" '
    td += 'class="'+options[:class]+'" '
    td += 'onclick="'+options[:onclick]+'" '
    td += 'align="center" '
    td += 'data-cache="'+options[:data_cache]+'" '
    td += 'style="padding:10px 8px;"'
    td += '>'+containing_text+'</td>'
    td.html_safe
  end
  
  def checkbox_element(onclickjs, options = {})
    options.reverse_merge! :checked => false, :id => ""
    input  = '<input '
    input += 'type="checkbox"'
    input += 'id="'+options[:id]+'" '
    input += 'onclick="'+onclickjs+'" '
    if options[:checked]
      input += 'checked '
    end
    input += '/>'
    table_element(input.html_safe).html_safe
  end
end
