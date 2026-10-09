// Runs before the page is painted, so a saved theme never flashes the other one first.
try{
  var saved=localStorage.getItem("rs-theme");
  if(saved==="dark"||saved==="light"){document.documentElement.setAttribute("data-theme",saved);}
}catch(e){}
