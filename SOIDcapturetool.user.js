// ==UserScript==
// @name         🕵️‍♀️ Inbound Investigator (v1.17: quick copy SOID)
// @namespace    https://usepepper.com
// @version      1.17
// @description  Draggable SOID reporter; Shift+U to open, Enter to COPY all, Ctrl+C/Cmd+C to COPY SOID only; Esc to exit; Ctrl+H to reset
// @match        https://troiafoods.pepr.app/*
// @match        https://majestic.pepr.app/*
// @match        https://gofreshpremierproduce.pepr.app/*
// @match        https://kohlwholesale.pepr.app/*
// @match        https://aceendico.pepr.app/*
// @grant        none
// ==/UserScript==

(function(){
  let latestUUID = null;
  let popup = null;
  let dragOffsetX = 0, dragOffsetY = 0;
  let isDragging = false;

  function showPopup(uuid, reportedAt){
    if(popup) popup.remove();
    const c = document.createElement("div");
    popup = c;
    c.innerHTML = `
      <div id="soid-title" style="cursor:move; margin-bottom:12px; text-align:center;">
        <h2 style="margin:0; color:#155724; font-family:Arial, sans-serif;">🕵️‍♀️ Inbound Investigator</h2>
      </div>
      <div style="margin-bottom:12px; line-height:1.4;">
        <div><strong>SOID:</strong> ${uuid}</div>
        <div><strong>Reported At:</strong> ${reportedAt}</div>
      </div>
      <div style="margin-bottom:4px;"><strong>Inbound Time:</strong></div>
      <input id="inbound-time" type="text" placeholder="e.g. May 2nd 6:18 AM"
             style="width:100%; box-sizing:border-box; padding:8px; margin-bottom:12px; font-family:monospace; border:1px solid #92c88a; border-radius:4px;">
      <div style="margin-bottom:4px;"><strong>Inbound Type:</strong></div>
      <label><input type="checkbox" class="inbound-type" value="free form"> free form</label><br>
      <label><input type="checkbox" class="inbound-type" value="csv,xlsx"> csv,xlsx</label><br>
      <label><input type="checkbox" class="inbound-type" value="worksheet"> worksheet</label><br>
      <label style="margin-bottom:12px;"><input type="checkbox" class="inbound-type" value="pdf"> pdf</label>
      <div style="margin-bottom:4px;"><strong>Urgency:</strong></div>
      <label><input type="radio" name="urgency" value="Urgent"> Urgent</label><br>
      <label style="margin-bottom:12px;"><input type="radio" name="urgency" value="Not urgent" checked> Not urgent</label>
      <div style="margin-bottom:4px;"><strong>Note:</strong></div>
      <input id="issue-note" type="text" placeholder="Describe the issue..."
             style="width:100%; box-sizing:border-box; padding:8px; margin-bottom:12px; font-family:monospace; border:1px solid #92c88a; border-radius:4px;">
      <div id="instructions" style="font-size:13px; color:#555; text-align:right;">
        Press Enter to COPY all, Ctrl/Cmd+C to COPY SOID, Esc to EXIT
      </div>
    `;
    Object.assign(c.style,{position:"fixed", top:"20px", left:"20px", backgroundColor:"#EBF7EC", color:"#1B3F12", padding:"16px", borderRadius:"12px", border:"1px solid #92C88A", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontFamily:"Arial, sans-serif", zIndex:10000, maxWidth:"360px", opacity:"0", transition:"opacity 0.3s"});
    document.body.appendChild(c);
    requestAnimationFrame(()=>c.style.opacity="1");
    const title = c.querySelector("#soid-title"); title.addEventListener("mousedown", onMouseDown);
    c.querySelector("#inbound-time").focus();
  }

  function onMouseDown(e){ if(e.button!==0) return; isDragging=true; const rect=popup.getBoundingClientRect(); dragOffsetX=e.clientX-rect.left; dragOffsetY=e.clientY-rect.top; document.addEventListener("mousemove", onMouseMove); document.addEventListener("mouseup", onMouseUp); e.preventDefault(); }
  function onMouseMove(e){ if(!isDragging) return; popup.style.left=(e.clientX-dragOffsetX)+"px"; popup.style.top=(e.clientY-dragOffsetY)+"px"; }
  function onMouseUp(){ if(!isDragging) return; isDragging=false; document.removeEventListener("mousemove", onMouseMove); document.removeEventListener("mouseup", onMouseUp); }

  function closePopup(){ if(popup){ popup.style.opacity="0"; setTimeout(()=>{ if(popup) popup.remove(); popup=null; },300); } }
  function closeConfirm(){ const f=document.getElementById('soid-confirm'); if(f) f.remove(); }

  document.addEventListener("keydown", e=>{
    const mod = navigator.platform.toUpperCase().includes("MAC") ? e.metaKey : e.ctrlKey;
    if(mod && e.shiftKey && e.key.toLowerCase()==="u"){ if(latestUUID) showPopup(latestUUID, new Date().toISOString()); else alert("⚠️ No SOID captured yet."); e.preventDefault(); return; }
    if(mod && !e.shiftKey && e.key.toLowerCase()==="h" && popup){ popup.style.left="20px"; popup.style.top="20px"; e.preventDefault(); return; }
    if(e.key==="Escape"){ closePopup(); closeConfirm(); e.preventDefault(); return; }
    if(popup){
      // quick copy SOID
      if(mod && !e.shiftKey && e.key.toLowerCase()==="c"){ navigator.clipboard.writeText(latestUUID); closePopup(); closeConfirm(); e.preventDefault(); return; }
      // full copy
      if(e.key==="Enter"){ const c=popup; const inboundTime=c.querySelector("#inbound-time").value.trim()||"(not specified)";
        const types=Array.from(c.querySelectorAll(".inbound-type:checked")).map(i=>i.value).join(", ")||"(none)";
        const urgency=c.querySelector("input[name=urgency]:checked").value;
        const note=c.querySelector("#issue-note").value.trim()||"(no note)";
        const text=[`SOID: ${latestUUID}`, `Reported At: ${new Date().toISOString()}`, `Inbound Time: ${inboundTime}`, `Inbound Type: ${types}`, `Urgency: ${urgency}`, `Note: ${note}`].join("\n");
        navigator.clipboard.writeText(text);
        const msg=document.createElement("div"); msg.id='soid-confirm'; msg.innerHTML=`📋 <strong>Copied to clipboard</strong><br><em>Press ESC to exit and take screenshot!📷</em>`;
        Object.assign(msg.style,{position:"fixed", top:"20px", left:"20px", backgroundColor:"#D4F7D4", color:"#1B3F12", padding:"10px 14px", borderRadius:"8px", border:"1px solid #92C88A", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontFamily:"Arial, sans-serif", zIndex:10001});
        document.body.appendChild(msg);
        closePopup(); e.preventDefault(); }
    }
  });

  const realFetch = window.fetch;
  window.fetch = async function(...args){ const res = await realFetch.apply(this,args);
    if(typeof args[0]==="string" && args[0].includes("/graphql") && args[1]?.body){ try{ const b=JSON.parse(args[1].body); if(b.operationName==="OrderInbounds_Detail"){ latestUUID=b.variables.smartOrderUUID; console.log("✅ SOID captured:",latestUUID); } }catch{} }
    return res;
  };
})(); 