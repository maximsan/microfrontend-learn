(function(){
  "use strict";

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

    document.querySelectorAll('section.module:not([data-kind="appendix"])').forEach(function(section){
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

  /* ---- copy button on every code block ---- */
  function addCopyButtons(){
    document.querySelectorAll(".codewrap").forEach(function(wrap){
      var pre=wrap.querySelector("pre"); if(!pre) return;
      var btn=document.createElement("button");
      btn.type="button"; btn.className="copy"; btn.textContent="Copy";
      btn.setAttribute("aria-label","Copy code to clipboard");
      btn.addEventListener("click",function(){
        var text=pre.innerText;
        var done=function(ok){ btn.textContent=ok?"Copied":"Press ⌘C"; setTimeout(function(){btn.textContent="Copy";},1600); };
        if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(function(){done(true);},function(){done(false);}); }
        else { var r=document.createRange(); r.selectNodeContents(pre); var sel=getSelection(); sel.removeAllRanges(); sel.addRange(r); done(false); }
      });
      var bar=wrap.querySelector(".fname");
      if(bar){ bar.appendChild(btn); } else { btn.classList.add("float"); wrap.appendChild(btn); }
    });
  }

  try { addCopyButtons(); } catch(e) {}
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
  var mainEl=document.querySelector("main");
  function setDrawer(open){
    if(!side||!scrim||!menu)return;
    var wasOpen=side.classList.contains("open");
    side.classList.toggle("open",open);
    scrim.classList.toggle("on",open);
    menu.setAttribute("aria-expanded",open?"true":"false");
    root.classList.toggle("drawer-open",open);      // no background scrolling under the drawer
    if(mainEl){ if(open){mainEl.setAttribute("inert","");} else {mainEl.removeAttribute("inert");} }
    if(open&&!wasOpen){
      var cur=side.querySelector("#toc a.on")||side.querySelector("#toc a");
      if(cur){cur.focus({preventScroll:true});cur.scrollIntoView({block:"center"});}
    } else if(!open&&wasOpen){ menu.focus({preventScroll:true}); }
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
