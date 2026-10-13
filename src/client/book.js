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

  /* ---- "Check yourself": one question at a time, every option explained, a score at the end ---- */
  function setUpQuizzes(){
    document.querySelectorAll(".check").forEach(function(check){
      var questions=Array.prototype.slice.call(check.querySelectorAll(".quiz-q"));
      if(!questions.length) return;
      var progress=document.createElement("p"); progress.className="quiz-progress";
      var status=document.createElement("p"); status.className="quiz-status"; status.tabIndex=-1;
      var next=document.createElement("button"); next.type="button"; next.className="quiz-next";
      questions[0].parentNode.insertBefore(progress,questions[0]);
      check.appendChild(status); check.appendChild(next);
      var current=0, right=0;
      questions.forEach(function(q){
        q.setAttribute("role","group"); q.tabIndex=-1;
        q.querySelectorAll(".quiz-opt").forEach(function(li){
          li.querySelector(".quiz-why").tabIndex=-1;
          li.querySelector("button").addEventListener("click",function(){ answer(q,li); });
        });
      });
      // Explanations stay visible until this point, so the test still teaches if the script fails.
      check.classList.add("quiz-ready");

      function show(i){
        current=i;
        questions.forEach(function(q,qi){ q.hidden=qi!==i; });
        progress.hidden=false;
        progress.textContent="Question "+(i+1)+" of "+questions.length;
        questions[i].setAttribute("aria-label",progress.textContent);
        status.textContent=""; next.hidden=true;
      }
      function start(){
        right=0;
        questions.forEach(function(q){
          q.classList.remove("answered");
          var list=q.querySelector(".quiz-opts");
          var opts=Array.prototype.slice.call(list.children);
          // Shuffled on every start, so the answer's position gives nothing away.
          for(var i=opts.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=opts[i]; opts[i]=opts[j]; opts[j]=t; }
          opts.forEach(function(li){ li.classList.remove("picked"); li.querySelector("button").disabled=false; list.appendChild(li); });
        });
        show(0);
      }
      function answer(q,li){
        q.classList.add("answered"); li.classList.add("picked");
        q.querySelectorAll(".quiz-opt button").forEach(function(b){ b.disabled=true; });
        var ok=li.hasAttribute("data-correct");
        if(ok) right++;
        status.textContent=ok?"Right.":"Not quite. The right answer is marked \u2713.";
        next.textContent=current<questions.length-1?"Next question":"See your score";
        next.hidden=false;
        li.querySelector(".quiz-why").focus();   // read the verdict first; Tab then reaches Next
      }
      next.addEventListener("click",function(){
        if(current<questions.length-1){
          show(current+1);
          questions[current].focus();
        } else if(!questions[current].hidden){
          questions[current].hidden=true; progress.hidden=true;
          status.textContent="You got "+right+" of "+questions.length+" right.";
          next.textContent="Try again";
          status.focus();
        } else {
          start();
          questions[0].focus();
        }
      });
      start();
    });
  }

  try { addCopyButtons(); } catch(e) {}
  try { setUpQuizzes(); } catch(e) {}
  try { linkAcronyms(); } catch(e) {}

  var root=document.documentElement;   // a saved theme was already applied by theme.js
  var themeBtns=document.querySelectorAll("[data-theme-toggle]");
  function currentTheme(){
    var cur=root.getAttribute("data-theme");
    if(cur) return cur;
    return window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  }
  function labelThemeButtons(){
    var text="Switch to "+(currentTheme()==="dark"?"light":"dark")+" theme";
    // data-theme-toggle="text" says the action on the button; the short "Theme" button says it in its label
    themeBtns.forEach(function(b){
      if(b.getAttribute("data-theme-toggle")==="text"){b.textContent=text;}
      else{b.setAttribute("aria-label",text);}
    });
  }
  function toggle(){
    var next=currentTheme()==="dark"?"light":"dark";
    root.setAttribute("data-theme",next);
    try{localStorage.setItem("rs-theme",next);}catch(e){}
    labelThemeButtons();
  }
  themeBtns.forEach(function(b){b.addEventListener("click",toggle);});
  labelThemeButtons();
  if(window.matchMedia){window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",labelThemeButtons);}

  /* ---- a link to a chapter lands on it even though web fonts arrive after the first jump ---- */
  // Swapping in the fonts makes the text above the target taller, so the first jump falls short.
  // Wait for "load" first: by then the font files have been requested, so fonts.ready waits for them.
  // A reload or Back/Forward restores the reader's own position, which must win.
  var nav=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];
  if(location.hash&&document.fonts&&!(nav&&(nav.type==="reload"||nav.type==="back_forward"))){
    var readerMoved=false;
    ["wheel","touchstart","keydown","mousedown"].forEach(function(t){
      window.addEventListener(t,function(){readerMoved=true;},{once:true,passive:true});
    });
    window.addEventListener("load",function(){
      document.fonts.ready.then(function(){
        var target;
        try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch(e){return;}   // malformed %-escape
        if(target&&!readerMoved){target.scrollIntoView();}
      });
    });
  }

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
  /* ---- the chapter being read: highlighted in the contents, named in the phone bar ---- */
  var sections=Array.prototype.slice.call(document.querySelectorAll("section[id]"));
  var barTitle=document.querySelector("#bar strong");
  var bookTitle=barTitle?barTitle.textContent:"";
  var activeId=null;
  function markActive(){
    // The last section whose top has passed 30% of the viewport height.
    var line=window.innerHeight*0.3, id=null;
    for(var i=0;i<sections.length;i++){
      if(sections[i].getBoundingClientRect().top>line) break;
      id=sections[i].id;
    }
    if(id===activeId) return;
    activeId=id;
    links.forEach(function(a){a.classList.remove("on");a.removeAttribute("aria-current");});
    var a=map[id];
    if(a){
      a.classList.add("on");
      a.setAttribute("aria-current","location");
      // keep the highlighted entry visible in the sidebar's own scroll area, without moving the page
      var top=a.offsetTop, view=side.clientHeight;
      if(top<side.scrollTop+40||top>side.scrollTop+view-80){side.scrollTop=top-view/2;}
    }
    if(barTitle){barTitle.textContent=a?a.lastElementChild.textContent:bookTitle;}
  }
  var ticking=false;
  function onScroll(){
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(function(){ticking=false;markActive();});
  }
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("resize",onScroll);
  markActive();
})();
