// Runs before the page is painted, so a saved theme never flashes the other one first.
(function(){
  var root=document.documentElement;
  root.classList.add("js");
  try{
    var saved=localStorage.getItem("rs-theme");
    if(saved==="dark"||saved==="light"){root.setAttribute("data-theme",saved);}
  }catch(e){}
})();
