(function(){
  "use strict";


  /* ---- document stats, counted from the DOM instead of hand-maintained ---- */
  var VERIFIED = "September 2026";   // the single place this date is written
  var WPM = 200;

  function setStats(){
    var main = document.querySelector("main");
    var mods = document.querySelectorAll('section.module[id^="m"]').length;
    var apps = document.querySelectorAll('section.module[data-kind="appendix"]').length;
    var put = function(key, val){
      document.querySelectorAll('[data-count="' + key + '"]').forEach(function(el){ el.textContent = val; });
    };
    if(mods) put("modules", mods + (mods === 1 ? " module" : " modules"));
    if(apps) put("appendices", apps + (apps === 1 ? " appendix" : " appendices"));
    if(main){
      var clone = main.cloneNode(true);
      clone.querySelectorAll("pre").forEach(function(el){ el.remove(); });
      var n = (clone.textContent || "").trim().split(/\s+/).length;
      var mins = Math.max(1, Math.round(n / WPM / 5) * 5);
      var h = Math.floor(mins / 60), m = mins % 60;
      put("readtime", mins < 60 ? "~" + mins + " min" : "~" + h + "h" + (m ? " " + m + "m" : ""));
    }
    document.querySelectorAll(".verified-date").forEach(function(el){ el.textContent = VERIFIED; });
  }

  /* ---- first use of each acronym in each module links to its glossary row ---- */
  function linkAcronyms(){
    var rows = document.querySelectorAll('.acro .row2[id]');
    if(!rows.length) return;
    var map = {};
    rows.forEach(function(row){
      var dt = row.querySelector("dt"), dd = row.querySelector("dd");
      if(!dt) return;
      var term = dt.textContent.trim();
      if(!/^[A-Z]{2,7}$/.test(term)) return;
      map[term] = { id: row.id, title: dd ? dd.textContent.trim().replace(/\s+/g, " ") : "" };
    });
    var terms = Object.keys(map).sort(function(a, b){ return b.length - a.length; });
    if(!terms.length) return;
    var re = new RegExp("\\b(" + terms.join("|") + ")\\b");
    var SKIP = /^(A|CODE|PRE|DT|DD|H1|H2|H3|H4|SCRIPT|STYLE|CITE|SUMMARY|BUTTON)$/;
    var MARK = String.fromCharCode(8599);   // north-east arrow, kept out of the source

    document.querySelectorAll('section.module[id^="m"]').forEach(function(section){
      var used = {}, nodes = [], n;
      var walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {
        acceptNode: function(node){
          for(var el = node.parentElement; el && el !== section; el = el.parentElement){
            if(SKIP.test(el.tagName)) return NodeFilter.FILTER_REJECT;
            if(el.classList && (el.classList.contains("acro") || el.classList.contains("gloss"))) return NodeFilter.FILTER_REJECT;
          }
          return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      while((n = walker.nextNode())) nodes.push(n);

      nodes.forEach(function(node){
        var m = node.nodeValue.match(re);
        if(!m) return;
        var term = m[1];
        if(used[term]) return;
        used[term] = true;
        var rest = node.splitText(m.index);
        rest.nodeValue = rest.nodeValue.slice(term.length);
        var a = document.createElement("a");
        a.className = "acro-ref";
        a.href = "#" + map[term].id;
        a.textContent = term;
        if(map[term].title) a.title = map[term].title + "  (jump to glossary)";
        var sup = document.createElement("sup");
        sup.textContent = MARK;
        a.appendChild(sup);
        rest.parentNode.insertBefore(a, rest);
      });
    });
  }

  try { setStats(); } catch(e) {}
  try { linkAcronyms(); } catch(e) {}

  var root=document.documentElement;
  try{
    var saved=localStorage.getItem("rs-theme");
    if(saved==="dark"||saved==="light"){root.setAttribute("data-theme",saved);}
  }catch(e){}

  function toggle(){
    var cur=root.getAttribute("data-theme");
    if(!cur){
      var sysDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;
      cur=sysDark?"dark":"light";
    }
    var next=cur==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("rs-theme",next);}catch(e){}
  }
  var t2=document.getElementById("theme2");
  if(t2){t2.addEventListener("click",toggle);}

  var bar=document.querySelector("#prog i");
  function progress(){
    if(!bar)return;
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    var pct=max>0?(h.scrollTop/max)*100:0;
    bar.style.width=pct.toFixed(2)+"%";
  }
  window.addEventListener("scroll",progress,{passive:true});
  window.addEventListener("resize",progress);
  progress();

  var side=document.getElementById("side");
  var scrim=document.getElementById("scrim");
  var menu=document.getElementById("menu");
  function setDrawer(open){
    if(!side||!scrim||!menu)return;
    side.classList.toggle("open",open);
    scrim.classList.toggle("on",open);
    menu.setAttribute("aria-expanded",open?"true":"false");
  }
  if(menu){menu.addEventListener("click",function(){setDrawer(!side.classList.contains("open"));});}
  if(scrim){scrim.addEventListener("click",function(){setDrawer(false);});}
  document.addEventListener("keydown",function(e){if(e.key==="Escape"){setDrawer(false);}});

  var links=Array.prototype.slice.call(document.querySelectorAll("#toc a"));
  var map={};
  links.forEach(function(a){
    var id=a.getAttribute("href").slice(1);
    map[id]=a;
    a.addEventListener("click",function(){setDrawer(false);});
  });
  var sections=Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  function markActive(id){
    links.forEach(function(a){a.classList.remove("on");});
    if(map[id]){map[id].classList.add("on");}
  }
  if("IntersectionObserver" in window){
    var visible={};
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        visible[en.target.id]=en.isIntersecting?en.intersectionRatio:0;
      });
      var best=null,bestV=0;
      sections.forEach(function(s){
        var v=visible[s.id]||0;
        if(v>bestV){bestV=v;best=s.id;}
      });
      if(best){markActive(best);}
    },{rootMargin:"-15% 0px -60% 0px",threshold:[0,.1,.25,.5,1]});
    sections.forEach(function(s){io.observe(s);});
  }
})();
