$(document).ready(function() {
  // Loop over elements with class "flip"
  $(".flip").each(function(index) {
    var flip = $(this);
    var panel = $(".panel" + index);

    // Hide panel on ready
    panel.hide();

    // Set up click event handler
    flip.click(function() {
      panel.slideToggle("slow");
    });
  });
});