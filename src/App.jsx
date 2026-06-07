import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Storage ───────────────────────────────────────────────────────────────────
const KEYS = { ev:"alq_ev", ta:"alq_ta", fi:"alq_fi", me:"alq_me", no:"alq_no", qu:"alq_qu", inv:"alq_inv", ins:"alq_ins" };
const loadDB = async k => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
const saveDB = async (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ── Theme ─────────────────────────────────────────────────────────────────────
const G = { gold:"#C9A84C", burg:"#8B1A2E", dark:"#080808", card:"#101010", border:"#1c1c1c", text:"#ede5d5", muted:"#52483a", dim:"#2a2218" };
const uid = () => Math.random().toString(36).slice(2,9);
const fmtCLP = n => "$"+Number(n||0).toLocaleString("es-CL");
const fmtDate = d => d ? new Date(d+"T12:00:00").toLocaleDateString("es-CL",{day:"2-digit",month:"short"}) : "—";
const todayStr = () => new Date().toISOString().split("T")[0];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WDAYS = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

// ── Data constants ────────────────────────────────────────────────────────────
const SERVICIOS = {
  cocteleria: { id:"cocteleria", icon:"🍸", label:"Coctelería", sublabel:"Barra de autor a domicilio", color:"#C9A84C", desc:"Cócteles de autor, bartenders especializados, barra temática" },
  banqueteria:{ id:"banqueteria",icon:"🍽️",label:"Banquetería",sublabel:"Estaciones de autor · Auto servicio",color:"#8B1A2E",desc:"Piezas individuales en mesón, estilo coctel, auto servicio" },
  sushi:      { id:"sushi",      icon:"🍱", label:"Sushi de Autor",sublabel:"Omakase a domicilio",color:"#7a6030",desc:"Piezas de autor, itamae especializado, montaje en vivo" },
  cenas:      { id:"cenas",      icon:"🕯",label:"Cenas Clandestinas",sublabel:"Experiencias privadas",color:"#6a4a8a",desc:"Pedidas de matrimonio, aniversarios, experiencias íntimas" },
};

const CAT_ALQ = ["Ingreso evento","Abono cliente","Saldo cliente","Insumos","Personal/Equipo","Marketing","Arriendo/Equipos","Fondo ☿","Otro ingreso","Otro gasto"];
const CAT_PER = ["Sueldo","Pago freelance","Arriendo","Luz/Agua/Gas","Alimentación","Mantención hija","Deuda/Crédito","Transporte","Salud","Entretenimiento","Ahorro","Otro"];
const CALQ = {"Ingreso evento":"#4a8a4a","Abono cliente":"#4a8a4a","Saldo cliente":"#4a8a4a","Otro ingreso":"#4a8a4a","Insumos":"#8B1A2E","Personal/Equipo":"#7a4a8a","Marketing":"#4a5a7a","Arriendo/Equipos":"#7a5a3a","Fondo ☿":"#C9A84C","Otro gasto":"#8B1A2E"};
const CPER  = {"Sueldo":"#4a8a4a","Pago freelance":"#4a8a4a","Arriendo":"#8B1A2E","Luz/Agua/Gas":"#8B1A2E","Alimentación":"#7a5a3a","Mantención hija":"#8a4a6a","Deuda/Crédito":"#8B1A2E","Transporte":"#4a5a7a","Salud":"#5a7a4a","Entretenimiento":"#5a4a7a","Ahorro":"#4a7a7a","Otro":"#3a3a3a"};
const INGSET = new Set(["Ingreso evento","Abono cliente","Saldo cliente","Otro ingreso","Sueldo","Pago freelance"]);
const AHOSET = new Set(["Fondo ☿","Ahorro"]);
const isIng = c => INGSET.has(c);
const isAho = c => AHOSET.has(c);

const PHASES = ["Pre-venta","Pre-producción","Producción","Post-producción","Completado"];
const PHASEC = {"Pre-venta":"#C9A84C","Pre-producción":"#7a6030","Producción":"#8B1A2E","Post-producción":"#4a6a4a","Completado":"#2a4a2a"};
const TCATS  = ["Alquimia","Personal","Urgente"];
const TCATC  = {"Alquimia":"#C9A84C","Personal":"#4a6a8a","Urgente":"#8B1A2E"};
const NCATS  = ["Idea","Receta","Reflexión","Inspiración","Otro"];
const NCATC  = {"Idea":"#C9A84C","Receta":"#8B1A2E","Reflexión":"#4a6a8a","Inspiración":"#6a4a8a","Otro":"#52483a"};
const MTYPES = ["Cliente","Proveedor","Equipo","Otro"];
const QSC    = {pendiente:"#C9A84C",aceptada:"#4a8a4a",revision:"#7a6030"};
const QSL    = {pendiente:"Pendiente",aceptada:"Aceptada",revision:"En revisión"};

const EQCATS = ["Cristalería","Equipos","Mobiliario","Herramientas","Vajilla","Decoración","Transporte","Otro"];
const EQCATC = {"Cristalería":"#4a6a8a","Equipos":"#7a6030","Mobiliario":"#52483a","Herramientas":"#6a4a4a","Vajilla":"#4a8a4a","Decoración":"#6a4a8a","Transporte":"#4a5a7a","Otro":"#3a3a3a"};
const INSCATS = ["Destilados","Vinos","Cervezas","Sin alcohol","Jarabes/Syrup","Frutas","Lácteos","Secos","Utensilios","Otro"];
const INSCATC = {"Destilados":"#C9A84C","Vinos":"#8B1A2E","Cervezas":"#7a6030","Sin alcohol":"#4a6a8a","Jarabes/Syrup":"#6a4a8a","Frutas":"#4a8a4a","Lácteos":"#5a7a4a","Secos":"#7a5a3a","Utensilios":"#52483a","Otro":"#3a3a3a"};

const EXTRAS_DEF = [
  {id:"dj",label:"DJ / Música en vivo",icon:"♫",price:250000},
  {id:"lug",label:"Arriendo de lugar",icon:"◈",price:400000},
  {id:"amb",label:"Ambientación",icon:"✦",price:180000},
  {id:"foto",label:"Fotografía",icon:"◎",price:200000},
  {id:"flo",label:"Diseño floral",icon:"❋",price:150000},
  {id:"tra",label:"Transporte/Logística",icon:"◇",price:120000},
];

// ── UI primitives ─────────────────────────────────────────────────────────────
const Card = ({children,style={}}) => <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:2,...style}}>{children}</div>;
const Label = ({children}) => <div style={{fontSize:9,letterSpacing:3,color:G.muted,textTransform:"uppercase",marginBottom:6}}>{children}</div>;
const Pill = ({color,children}) => <span style={{background:color+"22",border:`1px solid ${color}44`,color,fontSize:8,letterSpacing:2,padding:"2px 7px",textTransform:"uppercase",borderRadius:1,whiteSpace:"nowrap"}}>{children}</span>;

const Input = ({value,onChange,placeholder,type="text",style={},rows}) => {
  const base = {background:"#0c0c0c",border:`1px solid ${G.border}`,color:G.text,padding:"10px 13px",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box",borderRadius:2,...style};
  if(rows) { return (<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...base,resize:"vertical"}}/>); }
  return (<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>);
};
const Dropdown = ({value,onChange,options}) => (
  <select value={value||""} onChange={e=>onChange(e.target.value)} style={{background:"#0c0c0c",border:`1px solid ${G.border}`,color:G.text,padding:"10px 13px",fontSize:13,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box",borderRadius:2}}>
    {options.map(o=><option key={o} value={o}>{o}</option>)}
  </select>
);
const BtnGold = ({onClick,children,disabled=false}) => (
  <button onClick={onClick} disabled={disabled} style={{background:disabled?"#1a1a1a":G.gold,color:disabled?"#333":G.dark,border:"none",padding:"11px 20px",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",borderRadius:2,width:"100%"}}>{children}</button>
);
const BtnLine = ({onClick,children,color=G.gold,style={}}) => (
  <button onClick={onClick} style={{background:"transparent",border:`1px solid ${color}`,color,padding:"9px 16px",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",borderRadius:2,...style}}>{children}</button>
);

function Modal({title,onClose,children,accent=G.gold}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f0f0f",borderTop:`2px solid ${accent}`,width:"100%",maxWidth:480,maxHeight:"92vh",overflowY:"auto",padding:"22px 18px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:11,letterSpacing:3,color:accent,textTransform:"uppercase"}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:G.muted,fontSize:22,cursor:"pointer",padding:0,lineHeight:1}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function Clock() {
  const [t,setT] = useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i);},[]);
  const h=String(t.getHours()).padStart(2,"0"), m=String(t.getMinutes()).padStart(2,"0"), s=String(t.getSeconds()).padStart(2,"0");
  return (
    <div style={{textAlign:"center",padding:"8px 20px 18px"}}>
      <div style={{fontSize:52,letterSpacing:4,color:G.text,fontWeight:300,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
        {h}<span style={{color:G.gold}}>:</span>{m}<span style={{fontSize:22,color:G.muted,marginLeft:4}}>{s}</span>
      </div>
      <div style={{fontSize:10,letterSpacing:4,color:G.muted,marginTop:8,textTransform:"uppercase"}}>{WDAYS[t.getDay()]} {t.getDate()} {MONTHS[t.getMonth()]} {t.getFullYear()}</div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({events,tasks,finances,meetings,notes,insumos}) {
  const td = todayStr();
  const alqF = finances.filter(f=>f.scope==="alquimia");
  const perF  = finances.filter(f=>f.scope==="personal");
  const alqI  = alqF.filter(f=>isIng(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const alqG  = alqF.filter(f=>!isIng(f.cat)&&!isAho(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const fondo = alqF.filter(f=>isAho(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const perI  = perF.filter(f=>isIng(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const perG  = perF.filter(f=>!isIng(f.cat)&&!isAho(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const proxEv = [...events].filter(e=>e.date>=td).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const proxRe = [...meetings].filter(m=>m.date>=td).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2);
  const urgentes = tasks.filter(t=>t.cat==="Urgente"&&!t.done);
  const pendientes = tasks.filter(t=>!t.done&&t.cat!=="Urgente").slice(0,3);
  const recentNotes = [...notes].sort((a,b)=>b.id.localeCompare(a.id)).slice(0,2);
  const lowStock = insumos.filter(i=>i.stockMin>0&&Number(i.cantidad)<=Number(i.stockMin));

  return (
    <div style={{paddingBottom:24}}>
      <div style={{textAlign:"center",paddingTop:24,paddingBottom:4}}>
        <div style={{fontSize:36,color:G.gold,lineHeight:1}}>☿</div>
        <div style={{fontSize:11,letterSpacing:6,color:G.gold,textTransform:"uppercase",marginTop:4}}>Alquimia</div>
        <div style={{fontSize:8,letterSpacing:3,color:G.muted,marginTop:2,textTransform:"uppercase"}}>Productora Gastronómica</div>
      </div>
      <Clock/>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <Label>Finanzas</Label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Card style={{padding:"12px 14px",borderTop:`2px solid ${G.gold}`}}><Label>Alquimia · neto</Label><div style={{fontSize:15,color:alqI>=alqG?"#4a8a4a":G.burg}}>{fmtCLP(alqI-alqG)}</div></Card>
            <Card style={{padding:"12px 14px",borderTop:"2px solid #4a6a8a"}}><Label>Personal · neto</Label><div style={{fontSize:15,color:perI>=perG?"#4a8a4a":G.burg}}>{fmtCLP(perI-perG)}</div></Card>
            <Card style={{padding:"12px 14px"}}><Label>Fondo ☿</Label><div style={{fontSize:15,color:G.gold}}>{fmtCLP(fondo)}</div></Card>
            <Card style={{padding:"12px 14px"}}><Label>Eventos activos</Label><div style={{fontSize:22,color:G.gold}}>{events.filter(e=>e.phase!=="Completado").length}</div></Card>
          </div>
        </div>
        {lowStock.length>0&&<div>
          <Label>⚠ Stock bajo ({lowStock.length})</Label>
          {lowStock.slice(0,4).map(i=><Card key={i.id} style={{padding:"10px 13px",marginBottom:4,borderLeft:`3px solid ${G.burg}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,color:G.text}}>{i.nombre}</div><div style={{fontSize:10,color:G.muted}}>{i.cat} · queda: {i.cantidad} {i.unidad}</div></div>
              <span style={{fontSize:10,color:G.burg,fontWeight:"bold"}}>↓{i.cantidad}</span>
            </div>
          </Card>)}
        </div>}
        {urgentes.length>0&&<div><Label>Urgente ({urgentes.length})</Label>{urgentes.map(t=><Card key={t.id} style={{padding:"10px 13px",marginBottom:4,borderLeft:`3px solid ${G.burg}`}}><div style={{fontSize:12,color:G.text}}>{t.title}</div></Card>)}</div>}
        {proxEv.length>0&&<div><Label>Próximos eventos</Label>{proxEv.map(e=><Card key={e.id} style={{padding:"11px 13px",marginBottom:4,borderLeft:`3px solid ${PHASEC[e.phase]||G.gold}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:12,color:G.text}}>{e.client}</div><div style={{fontSize:10,color:G.muted}}>{(e.servicios||[]).map(s=>SERVICIOS[s]?.label).join(" + ")||"Evento"} · {fmtDate(e.date)}</div></div><Pill color={PHASEC[e.phase]||G.gold}>{e.phase}</Pill></div></Card>)}</div>}
        {proxRe.length>0&&<div><Label>Reuniones</Label>{proxRe.map(m=><Card key={m.id} style={{padding:"11px 13px",marginBottom:4,borderLeft:`3px solid ${G.gold}`}}><div style={{fontSize:12,color:G.text}}>{m.title}</div><div style={{fontSize:10,color:G.muted}}>{fmtDate(m.date)}{m.time?` · ${m.time}`:""}</div></Card>)}</div>}
        {pendientes.length>0&&<div><Label>Tareas pendientes ({tasks.filter(t=>!t.done).length})</Label>{pendientes.map(t=><Card key={t.id} style={{padding:"10px 13px",marginBottom:4,borderLeft:`3px solid ${TCATC[t.cat]||G.muted}`}}><div style={{display:"flex",justifyContent:"space-between"}}><div style={{fontSize:12,color:G.text}}>{t.title}</div>{t.date&&<span style={{fontSize:9,color:t.date<td?G.burg:G.dim}}>{fmtDate(t.date)}</span>}</div></Card>)}</div>}
        {recentNotes.length>0&&<div><Label>Notas recientes</Label>{recentNotes.map(n=><Card key={n.id} style={{padding:"10px 13px",marginBottom:4,borderLeft:`3px solid ${NCATC[n.cat]||G.muted}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><div style={{fontSize:12,color:G.text,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title}</div><Pill color={NCATC[n.cat]||G.muted}>{n.cat}</Pill></div></Card>)}</div>}
        {proxEv.length===0&&urgentes.length===0&&tasks.filter(t=>!t.done).length===0&&lowStock.length===0&&<div style={{textAlign:"center",padding:"20px 0",color:G.muted,fontSize:11,letterSpacing:2}}>Todo en orden ☿</div>}
      </div>
    </div>
  );
}

// ── Inventario Equipamiento ───────────────────────────────────────────────────
function Inventario({items,setItems}) {
  const [modal,setModal] = useState(false);
  const [detail,setDetail] = useState(null);
  const [filterCat,setFilterCat] = useState("Todo");
  const [form,setForm] = useState({nombre:"",cat:"Cristalería",cantidad:"",descripcion:"",estado:"Bueno"});
  const ESTADOS = ["Bueno","Regular","Necesita revisión","Dado de baja"];
  const ESTADOC = {"Bueno":"#4a8a4a","Regular":G.gold,"Necesita revisión":G.burg,"Dado de baja":"#3a3a3a"};

  const save = () => {
    if(!form.nombre) return;
    const u = detail
      ? items.map(i=>i.id===detail.id?{...i,...form}:i)
      : [...items,{...form,id:uid()}];
    setItems(u); saveDB(KEYS.inv,u); setModal(false); setDetail(null);
    setForm({nombre:"",cat:"Cristalería",cantidad:"",descripcion:"",estado:"Bueno"});
  };
  const del = id => { const u=items.filter(i=>i.id!==id); setItems(u); saveDB(KEYS.inv,u); setDetail(null); setModal(false); };
  const openEdit = item => { setForm({nombre:item.nombre,cat:item.cat,cantidad:item.cantidad||"",descripcion:item.descripcion||"",estado:item.estado||"Bueno"}); setDetail(item); setModal(true); };

  const cats = ["Todo",...EQCATS];
  const filtered = filterCat==="Todo"?items:items.filter(i=>i.cat===filterCat);
  const grouped = EQCATS.reduce((acc,c)=>{ const g=filtered.filter(i=>i.cat===c); if(g.length) acc[c]=g; return acc; },{});

  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:15,letterSpacing:2,color:G.text}}>◈ Equipamiento</div>
        <BtnLine onClick={()=>{setDetail(null);setForm({nombre:"",cat:"Cristalería",cantidad:"",descripcion:"",estado:"Bueno"});setModal(true);}}>+ Item</BtnLine>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{background:filterCat===c?(EQCATC[c]||G.gold):"transparent",border:`1px solid ${filterCat===c?(EQCATC[c]||G.gold):G.border}`,color:filterCat===c?G.dark:G.muted,fontSize:8,letterSpacing:2,padding:"5px 10px",cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{c}</button>)}
      </div>
      {items.length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>Sin items aún</div></Card>}
      {Object.entries(grouped).map(([cat,catItems])=>(
        <div key={cat} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{fontSize:9,letterSpacing:3,color:EQCATC[cat]||G.muted,textTransform:"uppercase"}}>{cat}</div>
            <div style={{fontSize:9,color:G.dim}}>({catItems.length})</div>
          </div>
          {catItems.map(i=>(
            <Card key={i.id} style={{padding:"12px 14px",marginBottom:4,borderLeft:`3px solid ${ESTADOC[i.estado||"Bueno"]||G.muted}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>openEdit(i)}>
                  <div style={{fontSize:13,color:G.text}}>{i.nombre}</div>
                  {i.descripcion&&<div style={{fontSize:10,color:G.muted,marginTop:2}}>{i.descripcion}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:10}}>
                  <div style={{textAlign:"right",cursor:"pointer"}} onClick={()=>openEdit(i)}>
                    {i.cantidad&&<div style={{fontSize:13,color:G.gold}}>{i.cantidad}</div>}
                    <Pill color={ESTADOC[i.estado||"Bueno"]}>{i.estado||"Bueno"}</Pill>
                  </div>
                  <button onClick={e=>{e.stopPropagation();del(i.id);}} style={{background:"none",border:"none",color:G.burg,cursor:"pointer",fontSize:16,opacity:0.7,flexShrink:0,padding:0}}>&#x2715;</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
      {modal&&<Modal title={detail?"Editar item":"Nuevo item"} onClose={()=>{setModal(false);setDetail(null);}}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Label>Nombre</Label><Input value={form.nombre} onChange={v=>setForm(f=>({...f,nombre:v}))} placeholder="Ej: Copa de vino tinto"/></div>
          <div><Label>Categoría</Label><Dropdown value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))} options={EQCATS}/></div>
          <div><Label>Cantidad</Label><Input value={form.cantidad} onChange={v=>setForm(f=>({...f,cantidad:v}))} placeholder="Ej: 24 unidades"/></div>
          <div><Label>Estado</Label><Dropdown value={form.estado} onChange={v=>setForm(f=>({...f,estado:v}))} options={ESTADOS}/></div>
          <div><Label>Descripción / Notas</Label><Input value={form.descripcion} onChange={v=>setForm(f=>({...f,descripcion:v}))} placeholder="Detalles, marca, ubicación..." rows={2}/></div>
          <BtnGold onClick={save} disabled={!form.nombre}>{detail?"Guardar cambios":"Agregar"}</BtnGold>
          {detail&&<BtnLine onClick={()=>del(detail.id)} color={G.burg}>Eliminar item</BtnLine>}
        </div>
      </Modal>}
    </div>
  );
}

// ── Inventario Insumos ────────────────────────────────────────────────────────
function Insumos({items,setItems}) {
  const [modal,setModal] = useState(false);
  const [detail,setDetail] = useState(null);
  const [filterCat,setFilterCat] = useState("Todo");
  const [form,setForm] = useState({nombre:"",cat:"Destilados",cantidad:"",unidad:"botellas",stockMin:"",descripcion:""});
  const UNIDADES = ["botellas","litros","kg","g","unidades","cajas","bolsas","sobres"];

  const save = () => {
    if(!form.nombre) return;
    const u = detail
      ? items.map(i=>i.id===detail.id?{...i,...form}:i)
      : [...items,{...form,id:uid()}];
    setItems(u); saveDB(KEYS.ins,u); setModal(false); setDetail(null);
    setForm({nombre:"",cat:"Destilados",cantidad:"",unidad:"botellas",stockMin:"",descripcion:""});
  };
  const del = id => { const u=items.filter(i=>i.id!==id); setItems(u); saveDB(KEYS.ins,u); setDetail(null); setModal(false); };
  const openEdit = item => { setForm({nombre:item.nombre,cat:item.cat,cantidad:item.cantidad||"",unidad:item.unidad||"botellas",stockMin:item.stockMin||"",descripcion:item.descripcion||""}); setDetail(item); setModal(true); };
  const adjustStock = (id,delta) => {
    const u = items.map(i=>i.id===id?{...i,cantidad:Math.max(0,Number(i.cantidad)+delta)}:i);
    setItems(u); saveDB(KEYS.ins,u);
  };

  const cats = ["Todo",...INSCATS];
  const filtered = filterCat==="Todo"?items:items.filter(i=>i.cat===filterCat);
  const grouped = INSCATS.reduce((acc,c)=>{ const g=filtered.filter(i=>i.cat===c); if(g.length) acc[c]=g; return acc; },{});
  const lowCount = items.filter(i=>i.stockMin>0&&Number(i.cantidad)<=Number(i.stockMin)).length;

  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:15,letterSpacing:2,color:G.text}}>🧪 Insumos</div>
        <BtnLine onClick={()=>{setDetail(null);setForm({nombre:"",cat:"Destilados",cantidad:"",unidad:"botellas",stockMin:"",descripcion:""});setModal(true);}}>+ Insumo</BtnLine>
      </div>
      {lowCount>0&&<div style={{padding:"10px 13px",background:"rgba(139,26,46,0.08)",border:`1px solid rgba(139,26,46,0.3)`,borderRadius:2,fontSize:11,color:G.burg,marginBottom:14}}>⚠ {lowCount} {lowCount===1?"insumo":"insumos"} con stock bajo</div>}
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>
        {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{background:filterCat===c?(INSCATC[c]||G.gold):"transparent",border:`1px solid ${filterCat===c?(INSCATC[c]||G.gold):G.border}`,color:filterCat===c?G.dark:G.muted,fontSize:8,letterSpacing:2,padding:"5px 10px",cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{c}</button>)}
      </div>
      {items.length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>Sin insumos aún</div></Card>}
      {Object.entries(grouped).map(([cat,catItems])=>(
        <div key={cat} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{fontSize:9,letterSpacing:3,color:INSCATC[cat]||G.muted,textTransform:"uppercase"}}>{cat}</div>
            <div style={{fontSize:9,color:G.dim}}>({catItems.length})</div>
          </div>
          {catItems.map(i=>{
            const bajo = i.stockMin>0&&Number(i.cantidad)<=Number(i.stockMin);
            return <Card key={i.id} style={{padding:"12px 14px",marginBottom:4,borderLeft:`3px solid ${bajo?G.burg:INSCATC[i.cat]||G.muted}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>openEdit(i)}>
                  <div style={{fontSize:13,color:bajo?G.burg:G.text}}>{i.nombre}{bajo&&" ⚠"}</div>
                  {i.descripcion&&<div style={{fontSize:10,color:G.muted,marginTop:1}}>{i.descripcion}</div>}
                  {i.stockMin>0&&<div style={{fontSize:9,color:G.dim,marginTop:1}}>Mínimo: {i.stockMin} {i.unidad}</div>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:10}}>
                  <button onClick={()=>adjustStock(i.id,-1)} style={{width:24,height:24,background:"#1a1a1a",border:`1px solid ${G.border}`,borderRadius:2,color:G.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                  <div style={{textAlign:"center",minWidth:36}}>
                    <div style={{fontSize:14,color:bajo?G.burg:G.gold,fontWeight:"bold"}}>{i.cantidad||0}</div>
                    <div style={{fontSize:8,color:G.dim}}>{i.unidad}</div>
                  </div>
                  <button onClick={()=>adjustStock(i.id,1)} style={{width:24,height:24,background:"#1a1a1a",border:`1px solid ${G.border}`,borderRadius:2,color:G.muted,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  <button onClick={()=>del(i.id)} style={{width:22,height:22,background:"none",border:`1px solid rgba(139,26,46,0.4)`,borderRadius:2,color:G.burg,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>&#x2715;</button>
                </div>
              </div>
            </Card>;
          })}
        </div>
      ))}
      {modal&&<Modal title={detail?"Editar insumo":"Nuevo insumo"} onClose={()=>{setModal(false);setDetail(null);}}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Label>Nombre</Label><Input value={form.nombre} onChange={v=>setForm(f=>({...f,nombre:v}))} placeholder="Ej: Gin Hendricks"/></div>
          <div><Label>Categoría</Label><Dropdown value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))} options={INSCATS}/></div>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8}}>
            <div><Label>Cantidad actual</Label><Input value={form.cantidad} onChange={v=>setForm(f=>({...f,cantidad:v}))} placeholder="0" type="number"/></div>
            <div><Label>Unidad</Label><Dropdown value={form.unidad} onChange={v=>setForm(f=>({...f,unidad:v}))} options={UNIDADES}/></div>
          </div>
          <div><Label>Stock mínimo (alerta)</Label><Input value={form.stockMin} onChange={v=>setForm(f=>({...f,stockMin:v}))} placeholder="Ej: 2" type="number"/><div style={{fontSize:9,color:G.muted,marginTop:4}}>Se mostrará alerta cuando quede igual o menos</div></div>
          <div><Label>Descripción / Notas</Label><Input value={form.descripcion} onChange={v=>setForm(f=>({...f,descripcion:v}))} placeholder="Marca, proveedor, notas..." rows={2}/></div>
          <BtnGold onClick={save} disabled={!form.nombre}>{detail?"Guardar cambios":"Agregar"}</BtnGold>
          {detail&&<BtnLine onClick={()=>del(detail.id)} color={G.burg}>Eliminar insumo</BtnLine>}
        </div>
      </Modal>}
    </div>
  );
}

// ── Inventario screen ─────────────────────────────────────────────────────────
function InventarioScreen({inventario,setInventario,insumos,setInsumos}) {
  const [tab,setTab] = useState("equipamiento");
  return (
    <div>
      <div style={{padding:"18px 16px 0"}}>
        <div style={{display:"flex",gap:4,marginBottom:4}}>
          {[{id:"equipamiento",l:"◈ Equipamiento"},{id:"insumos",l:"🧪 Insumos"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 0",background:tab===t.id?G.gold:"transparent",border:`1px solid ${tab===t.id?G.gold:G.border}`,color:tab===t.id?G.dark:G.muted,fontSize:9,letterSpacing:2,cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{t.l}</button>
          ))}
        </div>
      </div>
      {tab==="equipamiento"&&<Inventario items={inventario} setItems={setInventario}/>}
      {tab==="insumos"&&<Insumos items={insumos} setItems={setInsumos}/>}
    </div>
  );
}

// ── QuoteCard ─────────────────────────────────────────────────────────────────
function QuoteCard({q}) {
  return (
    <div style={{background:"#080808",border:"1px solid #141414",borderRadius:2,padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:18,paddingBottom:14,borderBottom:"1px solid #141414"}}>
        <div style={{fontSize:18,color:G.gold}}>☿</div>
        <div style={{fontSize:10,letterSpacing:6,color:G.gold,textTransform:"uppercase"}}>Alquimia</div>
        <div style={{fontSize:8,letterSpacing:3,color:G.dim,textTransform:"uppercase",marginTop:2}}>Propuesta Gastronómica</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14,paddingBottom:14,borderBottom:"1px solid #141414"}}>
        {q.client&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>Cliente</span><span style={{fontSize:12,color:G.text}}>{q.client}</span></div>}
        {q.date&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>Fecha</span><span style={{fontSize:12,color:G.text}}>{new Date(q.date+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"})}</span></div>}
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>Invitados</span><span style={{fontSize:12,color:G.text}}>{q.guests} personas</span></div>
      </div>
      <div style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #141414"}}>
        <div style={{fontSize:9,letterSpacing:3,color:G.muted,textTransform:"uppercase",marginBottom:8}}>Gastronomía</div>
        <div style={{paddingLeft:10,borderLeft:"1px solid #1e1e1e",display:"flex",flexDirection:"column",gap:5}}>
          {(q.servicios||[]).map(s=><div key={s} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11}}>{SERVICIOS[s]?.icon}</span><span style={{fontSize:11,color:"#8a7a60"}}>{SERVICIOS[s]?.label}</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>Precio/persona</span><span style={{fontSize:12,color:G.gold}}>{fmtCLP(q.precioPP)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>Subtotal</span><span style={{fontSize:12,color:G.text}}>{fmtCLP(q.subtotalGastro)}</span></div>
        </div>
      </div>
      {q.extras?.length>0&&<div style={{marginBottom:14,paddingBottom:14,borderBottom:"1px solid #141414"}}>
        <div style={{fontSize:9,letterSpacing:3,color:G.muted,textTransform:"uppercase",marginBottom:8}}>Extras</div>
        <div style={{paddingLeft:10,borderLeft:"1px solid #1e1e1e",display:"flex",flexDirection:"column",gap:4}}>
          {q.extras.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#6a5a48"}}>{e.icon} {e.label}</span><span style={{fontSize:10,color:G.text}}>{fmtCLP(e.price)}</span></div>)}
        </div>
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:9,letterSpacing:3,color:G.muted,textTransform:"uppercase"}}>Total</span><span style={{fontSize:26,color:G.gold}}>{fmtCLP(q.total)}</span></div>
      <div style={{background:"#0d0d0d",border:"1px solid #141414",borderRadius:2,padding:"12px 14px"}}>
        <div style={{fontSize:9,letterSpacing:3,color:G.muted,textTransform:"uppercase",marginBottom:8}}>Forma de pago</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:10,color:"#6a5a48"}}>50% al reservar</span><span style={{fontSize:12,color:"#4a8a4a"}}>{fmtCLP(q.abono)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:"#6a5a48"}}>50% antes del evento</span><span style={{fontSize:12,color:G.text}}>{fmtCLP(q.saldo)}</span></div>
      </div>
      {q.note&&<div style={{fontSize:10,color:"#4a4030",marginTop:10,lineHeight:1.6}}>{q.note}</div>}
    </div>
  );
}

// ── Cotizador ─────────────────────────────────────────────────────────────────
function Cotizador({onSave}) {
  const [step,setStep] = useState(1);
  const [sel,setSel] = useState([]);
  const [guests,setGuests] = useState("");
  const [precioPP,setPrecioPP] = useState("");
  const [client,setClient] = useState("");
  const [date,setDate] = useState("");
  const [note,setNote] = useState("");
  const [extras,setExtras] = useState(EXTRAS_DEF.map(e=>({...e,on:false})));
  const [saved,setSaved] = useState(false);
  const [copied,setCopied] = useState(false);

  const toggleSrv = id => {
    if(id==="cenas"){setSel(p=>p.includes("cenas")?[]:[id]);setGuests("");}
    else setSel(p=>{const s=p.filter(x=>x!=="cenas");return s.includes(id)?s.filter(x=>x!==id):[...s,id];});
  };

  const gn = parseInt(guests)||0;
  const pp = parseInt(precioPP)||0;
  const gok = gn>=1&&pp>0&&sel.length>0;
  const subG = sel.length*pp*gn;
  const xOn = extras.filter(e=>e.on);
  const subX = xOn.reduce((s,e)=>s+e.price,0);
  const total = subG+subX;
  const abono = Math.round(total*0.5);
  const saldo = total-abono;

  const qText = [
    "☿ ALQUIMIA — COTIZACIÓN","─".repeat(34),
    client?`Cliente:    ${client}`:"",
    date?`Fecha:      ${new Date(date+"T12:00:00").toLocaleDateString("es-CL",{day:"numeric",month:"long",year:"numeric"})}`:"",
    `Servicio:   ${sel.map(s=>SERVICIOS[s]?.label).join(" + ")}`,`Invitados:  ${gn} personas`,
    "─".repeat(34),"GASTRONOMÍA",
    ...sel.map(s=>`  · ${SERVICIOS[s]?.label}`),
    `  Precio/persona: ${fmtCLP(pp)}`,`  Subtotal:       ${fmtCLP(subG)}`,
    xOn.length>0?"EXTRAS":"",
    ...xOn.map(e=>`  · ${e.label}: ${fmtCLP(e.price)}`),
    "═".repeat(34),`TOTAL                 ${fmtCLP(total)}`,"","FORMA DE PAGO",
    `  50% al reservar:    ${fmtCLP(abono)}`,`  50% antes evento:   ${fmtCLP(saldo)}`,
    "─".repeat(34),"Alquimia · Productora Gastronómica",
    note?`\nNotas: ${note}`:"",
  ].filter(Boolean).join("\n");

  const doSave = () => {
    if(!gok||!client) return;
    onSave({id:uid(),client,date,servicios:sel,nombresServicios:sel.map(s=>SERVICIOS[s]?.label).join(" + "),guests:gn,precioPP:pp,subtotalGastro:subG,extras:xOn,extrasTotal:subX,total,abono,saldo,note,quoteText:qText,createdAt:todayStr(),status:"pendiente"});
    setSaved(true);
  };
  const reset = () => {setStep(1);setSel([]);setGuests("");setPrecioPP("");setClient("");setDate("");setNote("");setExtras(EXTRAS_DEF.map(e=>({...e,on:false})));setSaved(false);setCopied(false);};

  if(step===1) return (
    <div>
      <Label>Selecciona servicios</Label>
      {Object.values(SERVICIOS).map(sv=>{
        const s=sel.includes(sv.id);
        const dis=sv.id==="cenas"?(sel.length>0&&!sel.includes("cenas")):sel.includes("cenas");
        return <button key={sv.id} onClick={()=>!dis&&toggleSrv(sv.id)} style={{display:"block",width:"100%",textAlign:"left",background:s?"rgba(201,168,76,0.06)":"transparent",border:`1px solid ${s?sv.color:dis?"#0e0e0e":"#1e1e1e"}`,borderRadius:2,padding:"14px 16px",cursor:dis?"not-allowed":"pointer",marginBottom:6,opacity:dis?0.25:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>{sv.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,color:s?sv.color:G.text}}>{sv.label}</div><div style={{fontSize:10,color:G.muted}}>{sv.sublabel}</div><div style={{fontSize:9,color:"#3a3020"}}>{sv.desc}</div></div>
          </div>
        </button>;
      })}
      {sel.length>=2&&<div style={{padding:"10px 13px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.2)",borderRadius:2,fontSize:11,color:G.gold,margin:"8px 0"}}>✦ Combo de {sel.length} servicios</div>}
      <BtnGold onClick={()=>setStep(2)} disabled={sel.length===0}>Continuar →</BtnGold>
    </div>
  );

  if(step===2) return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Label>Detalles del evento</Label>
      <Card style={{padding:"10px 13px"}}>{sel.map(s=><div key={s} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span>{SERVICIOS[s]?.icon}</span><span style={{fontSize:11,color:G.text}}>{SERVICIOS[s]?.label}</span></div>)}</Card>
      <div>
        <Label>N° personas</Label>
        <Input value={guests} onChange={setGuests} placeholder="ej. 80" type="number" style={{fontSize:18,borderColor:gn>=1?G.gold:guests?"#5a2020":G.border}}/>
      </div>
      <div>
        <Label>Precio por persona (CLP)</Label>
        <Input value={precioPP} onChange={setPrecioPP} placeholder="ej. 60000" type="number" style={{fontSize:18,borderColor:pp>0?G.gold:precioPP?"#5a2020":G.border}}/>
        <div style={{fontSize:9,color:"#6a5a48",marginTop:4}}>Sugerido: $60.000/pp · Cenas clandestinas: $120.000/pp</div>
      </div>
      {gok&&<Card style={{padding:"12px 14px",border:"1px solid rgba(201,168,76,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Precio/persona</span><span style={{fontSize:15,color:G.gold}}>{fmtCLP(pp)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Personas</span><span style={{fontSize:13,color:G.text}}>{gn}</span></div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Subtotal gastronomía</span><span style={{fontSize:13,color:G.text}}>{fmtCLP(subG)}</span></div>
      </Card>}
      <div><Label>Cliente</Label><Input value={client} onChange={setClient} placeholder="Nombre del cliente"/></div>
      <div><Label>Fecha tentativa</Label><Input value={date} onChange={setDate} type="date" style={{colorScheme:"dark"}}/></div>
      <div><Label>Notas</Label><Input value={note} onChange={setNote} placeholder="Tipo de evento, detalles..." rows={2}/></div>
      <div style={{display:"flex",gap:8}}><BtnLine onClick={()=>setStep(1)} style={{flexShrink:0}}>← Atrás</BtnLine><BtnGold onClick={()=>setStep(3)} disabled={!gok}>Extras →</BtnGold></div>
    </div>
  );

  if(step===3) return (
    <div>
      <Label>Servicios adicionales</Label>
      {extras.map(e=>(
        <div key={e.id} style={{border:`1px solid ${e.on?"rgba(201,168,76,0.3)":"#141414"}`,borderRadius:2,background:e.on?"rgba(201,168,76,0.04)":"transparent",marginBottom:6,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",padding:"12px 14px",gap:10,cursor:"pointer"}} onClick={()=>setExtras(p=>p.map(x=>x.id===e.id?{...x,on:!x.on}:x))}>
            <div style={{width:30,height:17,borderRadius:9,background:e.on?G.gold:"#1a1a1a",position:"relative",flexShrink:0}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:e.on?G.dark:"#3a3a3a",position:"absolute",top:3,left:e.on?16:3,transition:"left 0.2s"}}/>
            </div>
            <span style={{fontSize:12,color:e.on?G.gold:"#6a5a48",flex:1}}>{e.icon} {e.label}</span>
            <span style={{fontSize:11,color:e.on?G.gold:"#2a2a2a"}}>{fmtCLP(e.price)}</span>
          </div>
          {e.on&&<div style={{padding:"0 14px 12px",display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2,whiteSpace:"nowrap"}}>Ajustar</span>
            <input type="text" value={e.price.toLocaleString("es-CL")} onChange={ev=>{ev.stopPropagation();const n=parseInt(ev.target.value.replace(/\D/g,""))||0;setExtras(p=>p.map(x=>x.id===e.id?{...x,price:n}:x));}} onClick={ev=>ev.stopPropagation()} style={{background:"#0a0a0a",border:`1px solid ${G.border}`,color:G.text,padding:"6px 10px",fontSize:12,fontFamily:"inherit",outline:"none",flex:1,borderRadius:2}}/>
          </div>}
        </div>
      ))}
      <Card style={{padding:14,margin:"14px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Gastronomía</span><span style={{fontSize:12,color:"#8a7a60"}}>{fmtCLP(subG)}</span></div>
        {subX>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Extras</span><span style={{fontSize:12,color:"#8a7a60"}}>{fmtCLP(subX)}</span></div>}
        <div style={{borderTop:`1px solid ${G.border}`,paddingTop:10,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:2}}>Total</span><span style={{fontSize:20,color:G.gold}}>{fmtCLP(total)}</span></div>
      </Card>
      <div style={{display:"flex",gap:8}}><BtnLine onClick={()=>setStep(2)} style={{flexShrink:0}}>← Atrás</BtnLine><BtnGold onClick={()=>setStep(4)}>Ver cotización →</BtnGold></div>
    </div>
  );

  return (
    <div>
      <QuoteCard q={{client,date,guests:gn,servicios:sel,precioPP:pp,subtotalGastro:subG,extras:xOn,extrasTotal:subX,total,abono,saldo,note}}/>
      <div style={{display:"flex",gap:8,margin:"14px 0 8px"}}>
        <button onClick={()=>{navigator.clipboard.writeText(qText);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{flex:1,padding:11,background:copied?"rgba(201,168,76,0.15)":G.gold,color:copied?G.gold:G.dark,border:copied?`1px solid ${G.gold}`:"none",borderRadius:2,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>{copied?"✓ Copiado":"Copiar texto"}</button>
        <button onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(qText)}`,"_blank")} style={{padding:"11px 14px",background:"transparent",border:"1px solid #2a4a2a",color:"#4a8a4a",borderRadius:2,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>WA</button>
      </div>
      {!saved?<BtnGold onClick={doSave} disabled={!client}>☿ Guardar cotización</BtnGold>:<div style={{textAlign:"center",padding:12,color:G.gold,fontSize:11,letterSpacing:2}}>✓ Guardada</div>}
      <button onClick={reset} style={{width:"100%",padding:10,background:"transparent",border:"none",color:G.muted,fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit",marginTop:6}}>← Nueva cotización</button>
    </div>
  );
}

// ── QuoteDetail ───────────────────────────────────────────────────────────────
function QuoteDetail({qId,quotes,setQuotes,finances,setFinances,onClose}) {
  const [vista,setVista] = useState("acciones");
  const [confirm,setConfirm] = useState(null);
  const q = quotes.find(x=>x.id===qId);
  if(!q) return null;
  const sc = QSC[q.status||"pendiente"];

  const setStatus = status => { const u=quotes.map(x=>x.id===qId?{...x,status}:x); setQuotes(u); saveDB(KEYS.qu,u); setConfirm(null); };
  const aceptar = () => {
    const u = quotes.map(x=>x.id===qId?{...x,status:"aceptada",aceptadaEl:todayStr()}:x);
    setQuotes(u); saveDB(KEYS.qu,u);
    const nuevos = [
      {id:uid(),scope:"alquimia",cat:"Abono cliente",amount:q.abono,concept:`Abono 50% · ${q.client}`,date:todayStr()},
      {id:uid(),scope:"alquimia",cat:"Saldo cliente",amount:q.saldo,concept:`Saldo pendiente · ${q.client}`,date:q.date||todayStr()},
      {id:uid(),scope:"alquimia",cat:"Fondo ☿",amount:Math.round(q.abono*0.15),concept:`Fondo ☿ 15% · ${q.client}`,date:todayStr()},
    ];
    const uf=[...finances,...nuevos]; setFinances(uf); saveDB(KEYS.fi,uf); setConfirm(null);
  };
  const eliminar = () => { const u=quotes.filter(x=>x.id!==qId); setQuotes(u); saveDB(KEYS.qu,u); onClose(); };

  return (
    <Modal title={q.client||"Cotización"} onClose={onClose} accent={sc}>
      {vista==="ver"?(
        <div>
          <button onClick={()=>setVista("acciones")} style={{background:"transparent",border:"none",color:G.muted,fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase",padding:"0 0 16px",display:"block"}}>← Volver</button>
          <QuoteCard q={q}/>
          <div style={{marginTop:14}}><button onClick={()=>navigator.clipboard.writeText(q.quoteText||"")} style={{width:"100%",padding:11,background:G.gold,color:G.dark,border:"none",borderRadius:2,fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>Copiar texto</button></div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"center"}}><Pill color={sc}>{QSL[q.status||"pendiente"]}</Pill></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            <Card style={{padding:"10px 12px"}}><Label>Servicio(s)</Label><div style={{fontSize:10,color:G.text,lineHeight:1.4}}>{q.nombresServicios}</div></Card>
            <Card style={{padding:"10px 12px"}}><Label>Personas</Label><div style={{fontSize:12,color:G.text}}>{q.guests}</div></Card>
            <Card style={{padding:"10px 12px"}}><Label>Fecha evento</Label><div style={{fontSize:12,color:G.text}}>{fmtDate(q.date)}</div></Card>
            <Card style={{padding:"10px 12px"}}><Label>Cotizado el</Label><div style={{fontSize:12,color:G.text}}>{fmtDate(q.createdAt)}</div></Card>
          </div>
          <Card style={{padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:9,color:G.muted,letterSpacing:3,textTransform:"uppercase"}}>Total</span><span style={{fontSize:22,color:G.gold}}>{fmtCLP(q.total)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:G.muted}}>50% abono</span><span style={{fontSize:12,color:"#4a8a4a"}}>{fmtCLP(q.abono)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:G.muted}}>50% saldo</span><span style={{fontSize:12,color:G.text}}>{fmtCLP(q.saldo)}</span></div>
          </Card>
          <button onClick={()=>setVista("ver")} style={{width:"100%",padding:"10px",background:"rgba(201,168,76,0.06)",border:"1px solid rgba(201,168,76,0.3)",borderRadius:2,color:G.gold,fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>◈ Ver cotización completa</button>
          {q.status!=="aceptada"?(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <Label>Cambiar estado</Label>
              {confirm==="aceptar"?(
                <div style={{background:"rgba(74,138,74,0.08)",border:"1px solid rgba(74,138,74,0.3)",borderRadius:2,padding:12}}>
                  <div style={{fontSize:11,color:"#4a8a4a",marginBottom:10,lineHeight:1.6}}>Se registrará en Finanzas Alquimia:<br/><b>+ {fmtCLP(q.abono)}</b> abono · <b>+ {fmtCLP(Math.round(q.abono*0.15))}</b> fondo ☿<br/><span style={{color:"#4a5a4a"}}>Saldo pendiente: {fmtCLP(q.saldo)}</span></div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${G.border}`,borderRadius:2,color:G.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>Cancelar</button>
                    <button onClick={aceptar} style={{flex:2,padding:"8px",background:"#4a8a4a",border:"none",borderRadius:2,color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>✓ Confirmar</button>
                  </div>
                </div>
              ):(
                <button onClick={()=>setConfirm("aceptar")} style={{width:"100%",padding:"11px",background:"rgba(74,138,74,0.08)",border:"1px solid rgba(74,138,74,0.4)",borderRadius:2,color:"#4a8a4a",fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>✓ Cotización aceptada</button>
              )}
              <button onClick={()=>setStatus(q.status==="revision"?"pendiente":"revision")} style={{width:"100%",padding:"10px",background:q.status==="revision"?"rgba(122,96,48,0.15)":"transparent",border:`1px solid ${q.status==="revision"?"#c8a050":"#2a2a2a"}`,borderRadius:2,color:q.status==="revision"?"#c8a050":"#5a5040",fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>
                {q.status==="revision"?"◉ En revisión · toca para volver":"✎ Marcar en revisión"}
              </button>
            </div>
          ):(
            <div style={{padding:"12px 14px",background:"rgba(74,138,74,0.06)",border:"1px solid rgba(74,138,74,0.2)",borderRadius:2}}>
              <div style={{fontSize:10,color:"#4a8a4a"}}>✓ Aceptada · abono registrado el {fmtDate(q.aceptadaEl)}</div>
              <div style={{fontSize:10,color:G.muted,marginTop:4}}>Saldo pendiente: {fmtCLP(q.saldo)}</div>
            </div>
          )}
          <button onClick={()=>navigator.clipboard.writeText(q.quoteText||"")} style={{width:"100%",padding:11,background:G.gold,color:G.dark,border:"none",borderRadius:2,fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>Copiar cotización</button>
          {confirm==="eliminar"?(
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"9px",background:"transparent",border:`1px solid ${G.border}`,borderRadius:2,color:G.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>Cancelar</button>
              <button onClick={eliminar} style={{flex:1,padding:"9px",background:G.burg,border:"none",borderRadius:2,color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>Eliminar</button>
            </div>
          ):(
            <button onClick={()=>setConfirm("eliminar")} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(139,26,46,0.4)",borderRadius:2,color:G.burg,fontSize:10,letterSpacing:3,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>✕ Eliminar cotización</button>
          )}
        </div>
      )}
    </Modal>
  );
}

// ── Historial ─────────────────────────────────────────────────────────────────
function Historial({quotes,setQuotes,finances,setFinances}) {
  const [search,setSearch] = useState("");
  const [selId,setSelId] = useState(null);
  const filtered = [...quotes].filter(q=>(q.client||"").toLowerCase().includes(search.toLowerCase())||(q.nombresServicios||"").toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:12,color:G.muted}}>◎</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente o servicio..." style={{background:"#0c0c0c",border:`1px solid ${G.border}`,color:G.text,padding:"10px 13px 10px 32px",fontSize:12,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box",borderRadius:2}}/>
      </div>
      {filtered.length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>{search?"Sin resultados":"Sin cotizaciones aún"}</div></Card>}
      {filtered.map(q=>{
        const c=QSC[q.status||"pendiente"];
        return <div key={q.id} onClick={()=>setSelId(q.id)} style={{marginBottom:6,cursor:"pointer"}}>
          <Card style={{padding:"13px 14px",borderLeft:`3px solid ${c}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}><div style={{fontSize:13,color:G.text}}>{q.client||"Sin nombre"}</div><div style={{fontSize:10,color:G.muted,marginTop:2}}>{q.nombresServicios} · {q.guests} pers. · {fmtDate(q.date)}</div></div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}><div style={{fontSize:14,color:c}}>{fmtCLP(q.total)}</div><Pill color={c}>{QSL[q.status||"pendiente"]}</Pill></div>
            </div>
          </Card>
        </div>;
      })}
      {selId&&<QuoteDetail qId={selId} quotes={quotes} setQuotes={setQuotes} finances={finances} setFinances={setFinances} onClose={()=>setSelId(null)}/>}
    </div>
  );
}

// ── AlquimiaScreen ────────────────────────────────────────────────────────────
function AlquimiaScreen({events,setEvents,quotes,setQuotes,finances,setFinances}) {
  const [tab,setTab]         = useState('eventos');
  const [showForm,setShowForm] = useState(false);
  const [cotizModal,setCotizModal] = useState(false);
  const [detail,setDetail]   = useState(null);

  const emptyForm = {client:'',date:'',servicios:[],guests:'',phase:PHASES[0],income:'',note:''};
  const [form,setForm] = useState(emptyForm);

  const setF = (key, val) => setForm(f => ({...f, [key]: val}));

  const togSrv = id => {
    const s = form.servicios || [];
    setF('servicios', s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const saveEv = () => {
    if (!form.client) return;
    const u = [...events, {...form, id: uid()}];
    setEvents(u); saveDB(KEYS.ev, u);
    setForm(emptyForm); setShowForm(false);
  };

  const updPhase = (id, phase) => {
    const u = events.map(e => e.id === id ? {...e, phase} : e);
    setEvents(u); saveDB(KEYS.ev, u); setDetail(u.find(e => e.id === id));
  };

  const delEv = id => {
    const u = events.filter(e => e.id !== id);
    setEvents(u); saveDB(KEYS.ev, u); setDetail(null);
  };

  const saveQ = q => {
    const u = [...quotes, q]; setQuotes(u); saveDB(KEYS.qu, u);
  };

  return (
    <div style={{ padding:'18px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ fontSize:15, letterSpacing:2, color:G.text }}>☷ Alquimia</div>
        <div style={{ display:'flex', gap:6 }}>
          <BtnLine onClick={() => setCotizModal(true)}>Cotizar</BtnLine>
          <BtnLine onClick={() => { setForm(emptyForm); setShowForm(true); setTab('eventos'); }}>+ Evento</BtnLine>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[{id:'eventos',l:'Eventos'},{id:'historial',l:'Cotizaciones (' + quotes.length + ')'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab===t.id ? G.gold : 'transparent', border:'1px solid ' + (tab===t.id ? G.gold : G.border), color: tab===t.id ? G.dark : G.muted, fontSize:8, letterSpacing:2, padding:'5px 12px', cursor:'pointer', textTransform:'uppercase', fontFamily:'inherit', borderRadius:2 }}>{t.l}</button>
        ))}
      </div>

      {tab === 'historial' && (
        <Historial quotes={quotes} setQuotes={setQuotes} finances={finances} setFinances={setFinances}/>
      )}

      {tab === 'eventos' && !showForm && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:14 }}>
            {['Pre-venta','Producción','Completado'].map(p => (
              <Card key={p} style={{ padding:'10px 8px', textAlign:'center' }}>
                <div style={{ fontSize:18, color:PHASEC[p] }}>{events.filter(e => e.phase === p).length}</div>
                <div style={{ fontSize:8, letterSpacing:1, color:G.muted, textTransform:'uppercase', marginTop:2 }}>{p}</div>
              </Card>
            ))}
          </div>
          {events.length === 0 && (
            <Card><div style={{ textAlign:'center', color:G.muted, fontSize:12, padding:20 }}>Sin eventos aún</div></Card>
          )}
          {[...events].sort((a,b) => (a.date||'').localeCompare(b.date||'')).map(e => (
            <Card key={e.id} onClick={() => setDetail(e)} style={{ padding:'13px 14px', marginBottom:4, cursor:'pointer', borderLeft:'3px solid ' + (PHASEC[e.phase] || G.gold) }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:13, color:G.text }}>{e.client}</div>
                  <div style={{ fontSize:10, color:G.muted, marginTop:2 }}>{(e.servicios||[]).map(s => (SERVICIOS[s] ? SERVICIOS[s].icon + ' ' + SERVICIOS[s].label : '')).join(' · ') || 'Evento'} · {fmtDate(e.date)}</div>
                  {e.income && <div style={{ fontSize:11, color:G.gold, marginTop:1 }}>{fmtCLP(e.income)}</div>}
                </div>
                <Pill color={PHASEC[e.phase] || G.gold}>{e.phase}</Pill>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'eventos' && showForm && (
        <div style={{ background:'#0a0a0a', border:'1px solid ' + G.gold + '55', borderRadius:2, padding:'16px 14px' }}>
          <div style={{ fontSize:9, letterSpacing:3, color:G.gold, textTransform:'uppercase', marginBottom:14 }}>Nuevo evento</div>

          <div style={{ marginBottom:10 }}>
            <Label>Cliente</Label>
            <input value={form.client} onChange={e => setF('client', e.target.value)} placeholder="Nombre del cliente" style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}/>
          </div>

          <div style={{ marginBottom:10 }}>
            <Label>Fecha</Label>
            <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2, colorScheme:'dark' }}/>
          </div>

          <div style={{ marginBottom:10 }}>
            <Label>Servicios</Label>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {Object.values(SERVICIOS).map(sv => {
                const sel = (form.servicios||[]).includes(sv.id);
                return (
                  <button key={sv.id} onClick={() => togSrv(sv.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', background: sel ? 'rgba(201,168,76,0.06)' : 'transparent', border:'1px solid ' + (sel ? sv.color : '#1a1a1a'), borderRadius:2, cursor:'pointer', color: sel ? sv.color : G.muted, fontFamily:'inherit', fontSize:11, textAlign:'left' }}>
                    <span>{sv.icon}</span>{sv.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
            <div>
              <Label>Personas</Label>
              <input type="number" value={form.guests} onChange={e => setF('guests', e.target.value)} placeholder="Ej: 80" style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}/>
            </div>
            <div>
              <Label>Ingreso (CLP)</Label>
              <input type="number" value={form.income} onChange={e => setF('income', e.target.value)} placeholder="Ej: 4800000" style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}/>
            </div>
          </div>

          <div style={{ marginBottom:10 }}>
            <Label>Fase</Label>
            <select value={form.phase} onChange={e => setF('phase', e.target.value)} style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}>
              {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ marginBottom:14 }}>
            <Label>Nota</Label>
            <textarea value={form.note} onChange={e => setF('note', e.target.value)} placeholder="Detalles..." rows={2} style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2, resize:'vertical' }}/>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setShowForm(false)} style={{ flex:1, padding:'10px', background:'transparent', border:'1px solid ' + G.border, borderRadius:2, color:G.muted, fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit' }}>
              Cancelar
            </button>
            <button onClick={saveEv} disabled={!form.client} style={{ flex:2, padding:'10px', background: form.client ? G.gold : '#1a1a1a', color: form.client ? G.dark : '#333', border:'none', borderRadius:2, fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor: form.client ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
              Guardar evento
            </button>
          </div>
        </div>
      )}

      {detail && (
        <Modal title={detail.client} onClose={() => setDetail(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{l:'Personas',v:detail.guests||'--'},{l:'Fecha',v:fmtDate(detail.date)},{l:'Ingreso',v:detail.income?fmtCLP(detail.income):'--'},{l:'Fase',v:detail.phase}].map(i => (
                <Card key={i.l} style={{ padding:'10px 12px' }}><Label>{i.l}</Label><div style={{ fontSize:12, color:G.text }}>{i.v}</div></Card>
              ))}
            </div>
            {detail.servicios && detail.servicios.length > 0 && (
              <Card style={{ padding:'10px 13px' }}>
                <Label>Servicios</Label>
                {detail.servicios.map(s => (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span>{SERVICIOS[s] ? SERVICIOS[s].icon : ''}</span>
                    <span style={{ fontSize:12, color:G.text }}>{SERVICIOS[s] ? SERVICIOS[s].label : s}</span>
                  </div>
                ))}
              </Card>
            )}
            <button onClick={() => { setCotizModal(true); setDetail(null); }} style={{ width:'100%', padding:'11px', background:'rgba(201,168,76,0.08)', border:'1px solid ' + G.gold, borderRadius:2, color:G.gold, fontSize:10, letterSpacing:3, textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit' }}>
              ☷ Generar cotización
            </button>
            <div>
              <Label>Cambiar fase</Label>
              {PHASES.map(p => (
                <button key={p} onClick={() => updPhase(detail.id, p)} style={{ width:'100%', background: detail.phase===p ? PHASEC[p]+'33' : 'transparent', border:'1px solid ' + (detail.phase===p ? PHASEC[p] : G.border), color: detail.phase===p ? PHASEC[p] : G.muted, padding:'8px 13px', fontSize:10, letterSpacing:2, cursor:'pointer', textAlign:'left', fontFamily:'inherit', textTransform:'uppercase', marginBottom:3, borderRadius:2 }}>
                  {detail.phase===p ? '◉ ' : '○ '}{p}
                </button>
              ))}
            </div>
            <BtnLine onClick={() => delEv(detail.id)} color={G.burg}>Eliminar evento</BtnLine>
          </div>
        </Modal>
      )}

      {cotizModal && (
        <Modal title="☷ Cotizador Alquimia" onClose={() => setCotizModal(false)}>
          <Cotizador onSave={saveQ}/>
        </Modal>
      )}
    </div>
  );
}

function Agenda({tasks,setTasks}) {
  const [modal,setModal] = useState(false);
  const [filter,setFilter] = useState("Todo");
  const [form,setForm] = useState({title:"",date:todayStr(),cat:"Alquimia",note:""});
  const saveT=()=>{if(!form.title)return;const u=[...tasks,{...form,id:uid(),done:false}];setTasks(u);saveDB(KEYS.ta,u);setModal(false);setForm({title:"",date:todayStr(),cat:"Alquimia",note:""});};
  const toggle=id=>{const u=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);setTasks(u);saveDB(KEYS.ta,u);};
  const del=id=>{const u=tasks.filter(t=>t.id!==id);setTasks(u);saveDB(KEYS.ta,u);};
  const td=todayStr();
  const filtered=filter==="Todo"?tasks:filter==="Pendientes"?tasks.filter(t=>!t.done):tasks.filter(t=>t.cat===filter);
  const sorted=[...filtered].sort((a,b)=>{if(a.done!==b.done)return a.done?1:-1;return(a.date||"").localeCompare(b.date||"");});
  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:15,letterSpacing:2,color:G.text}}>Agenda</div><BtnLine onClick={()=>setModal(true)}>+ Tarea</BtnLine></div>
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>{["Todo","Pendientes",...TCATS].map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?(TCATC[f]||G.gold):"transparent",border:`1px solid ${filter===f?(TCATC[f]||G.gold):G.border}`,color:filter===f?G.dark:G.muted,fontSize:8,letterSpacing:2,padding:"5px 10px",cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{f}</button>)}</div>
      {sorted.length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>Sin tareas</div></Card>}
      {sorted.map(t=>(
        <Card key={t.id} style={{padding:"12px 13px",display:"flex",alignItems:"flex-start",gap:10,marginBottom:4,opacity:t.done?0.5:1,borderLeft:`3px solid ${t.done?"#2a2a2a":TCATC[t.cat]||G.muted}`}}>
          <button onClick={()=>toggle(t.id)} style={{width:18,height:18,border:`1px solid ${t.done?G.gold:G.muted}`,background:t.done?G.gold:"transparent",cursor:"pointer",flexShrink:0,marginTop:1,borderRadius:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{t.done&&<span style={{fontSize:9,color:G.dark}}>✓</span>}</button>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:G.text,textDecoration:t.done?"line-through":"none"}}>{t.title}</div>
            {t.note&&<div style={{fontSize:10,color:G.muted,marginTop:2}}>{t.note}</div>}
            <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}><Pill color={TCATC[t.cat]||G.muted}>{t.cat}</Pill>{t.date&&<span style={{fontSize:9,color:t.date<td&&!t.done?G.burg:G.dim}}>{fmtDate(t.date)}</span>}</div>
          </div>
          <button onClick={()=>del(t.id)} style={{background:"none",border:"none",color:G.burg,cursor:"pointer",fontSize:16,flexShrink:0,opacity:0.6,lineHeight:1,paddingTop:1}}>✕</button>
        </Card>
      ))}
      {modal&&<Modal title="Nueva tarea" onClose={()=>setModal(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Label>Título</Label><Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿Qué hay que hacer?"/></div>
          <div><Label>Fecha</Label><Input value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/></div>
          <div><Label>Categoría</Label><Dropdown value={form.cat} onChange={v=>setForm(f=>({...f,cat:v}))} options={TCATS}/></div>
          <div><Label>Nota</Label><Input value={form.note} onChange={v=>setForm(f=>({...f,note:v}))} placeholder="Detalle..."/></div>
          <BtnGold onClick={saveT} disabled={!form.title}>Guardar</BtnGold>
        </div>
      </Modal>}
    </div>
  );
}

// ── Reuniones ─────────────────────────────────────────────────────────────────
function Reuniones({meetings,setMeetings}) {
  const [modal,setModal] = useState(false);
  const [detail,setDetail] = useState(null);
  const [newQ,setNewQ] = useState("");
  const [form,setForm] = useState({title:"",date:todayStr(),time:"",type:"Cliente",place:"",goal:"",questions:[],notes:""});
  const saveM=()=>{if(!form.title)return;const u=[...meetings,{...form,id:uid()}];setMeetings(u);saveDB(KEYS.me,u);setModal(false);setForm({title:"",date:todayStr(),time:"",type:"Cliente",place:"",goal:"",questions:[],notes:""});};
  const addQ=()=>{if(!newQ)return;const u=meetings.map(m=>m.id===detail.id?{...m,questions:[...(m.questions||[]),{id:uid(),text:newQ,answered:false}]}:m);setMeetings(u);saveDB(KEYS.me,u);setDetail(u.find(m=>m.id===detail.id));setNewQ("");};
  const togQ=(mid,qid)=>{const u=meetings.map(m=>m.id===mid?{...m,questions:m.questions.map(q=>q.id===qid?{...q,answered:!q.answered}:q)}:m);setMeetings(u);saveDB(KEYS.me,u);setDetail(u.find(m=>m.id===mid));};
  const delQ=(mid,qid)=>{const u=meetings.map(m=>m.id===mid?{...m,questions:m.questions.filter(q=>q.id!==qid)}:m);setMeetings(u);saveDB(KEYS.me,u);setDetail(u.find(m=>m.id===mid));};
  const updN=(mid,text)=>{const u=meetings.map(m=>m.id===mid?{...m,notes:text}:m);setMeetings(u);saveDB(KEYS.me,u);setDetail(u.find(m=>m.id===mid));};
  const del=id=>{const u=meetings.filter(m=>m.id!==id);setMeetings(u);saveDB(KEYS.me,u);setDetail(null);};
  const td=todayStr();
  const upcoming=[...meetings].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).filter(m=>m.date>=td);
  const past=[...meetings].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).filter(m=>m.date<td);
  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:15,letterSpacing:2,color:G.text}}>Reuniones</div><BtnLine onClick={()=>setModal(true)}>+ Reunión</BtnLine></div>
      {upcoming.length===0&&past.length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>Sin reuniones aún</div></Card>}
      {upcoming.length>0&&<div style={{marginBottom:20}}><Label>Próximas</Label>{upcoming.map(m=><Card key={m.id} onClick={()=>setDetail(m)} style={{padding:"13px 14px",marginBottom:4,cursor:"pointer",borderLeft:`3px solid ${G.gold}`}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,color:G.text}}>{m.title}</div><div style={{fontSize:10,color:G.muted}}>{fmtDate(m.date)}{m.time?` · ${m.time}`:""}{m.place?` · ${m.place}`:""}</div></div><Pill color={G.gold}>{m.type}</Pill></div></Card>)}</div>}
      {past.length>0&&<div><Label>Pasadas</Label>{past.slice(0,5).map(m=><Card key={m.id} onClick={()=>setDetail(m)} style={{padding:"13px 14px",marginBottom:4,cursor:"pointer",opacity:0.6}}><div style={{fontSize:13,color:G.text}}>{m.title}</div><div style={{fontSize:10,color:G.muted}}>{fmtDate(m.date)}</div></Card>)}</div>}
      {detail&&<Modal title={detail.title} onClose={()=>setDetail(null)}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[{l:"Fecha",v:fmtDate(detail.date)},{l:"Hora",v:detail.time||"—"},{l:"Tipo",v:detail.type},{l:"Lugar",v:detail.place||"—"}].map(i=><Card key={i.l} style={{padding:"10px 12px"}}><Label>{i.l}</Label><div style={{fontSize:12,color:G.text}}>{i.v}</div></Card>)}</div>
          {detail.goal&&<Card style={{padding:"10px 14px",borderLeft:`2px solid ${G.gold}`}}><Label>Objetivo</Label><div style={{fontSize:12,color:G.text}}>{detail.goal}</div></Card>}
          <div><Label>Puntos a tratar</Label>
            {(detail.questions||[]).map(q=><div key={q.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${G.border}`}}>
              <button onClick={()=>togQ(detail.id,q.id)} style={{width:16,height:16,border:`1px solid ${G.muted}`,background:q.answered?G.gold:"transparent",cursor:"pointer",flexShrink:0,borderRadius:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{q.answered&&<span style={{fontSize:8,color:G.dark}}>✓</span>}</button>
              <span style={{flex:1,fontSize:12,color:q.answered?"#52483a":G.text,textDecoration:q.answered?"line-through":"none"}}>{q.text}</span>
              <button onClick={()=>delQ(detail.id,q.id)} style={{background:"none",border:"none",color:"#2a1a1a",cursor:"pointer",fontSize:12}}>✕</button>
            </div>)}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <input value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="Agregar punto..." style={{background:"#0c0c0c",border:`1px solid ${G.border}`,color:G.text,padding:"10px 13px",fontSize:13,fontFamily:"inherit",outline:"none",flex:1,borderRadius:2}}/>
              <button onClick={addQ} style={{background:G.gold,border:"none",color:G.dark,padding:"0 14px",fontSize:16,cursor:"pointer",borderRadius:2}}>+</button>
            </div>
          </div>
          <div><Label>Notas</Label><Input value={detail.notes||""} onChange={v=>updN(detail.id,v)} placeholder="Resultados..." rows={3}/></div>
          <BtnLine onClick={()=>del(detail.id)} color={G.burg}>Eliminar</BtnLine>
        </div>
      </Modal>}
      {modal&&<Modal title="Nueva reunión" onClose={()=>setModal(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Label>Con quién / título</Label><Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="Ej: Cliente Martínez"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><div><Label>Fecha</Label><Input value={form.date} onChange={v=>setForm(f=>({...f,date:v}))} type="date"/></div><div><Label>Hora</Label><Input value={form.time} onChange={v=>setForm(f=>({...f,time:v}))} type="time"/></div></div>
          <div><Label>Tipo</Label><Dropdown value={form.type} onChange={v=>setForm(f=>({...f,type:v}))} options={MTYPES}/></div>
          <div><Label>Lugar</Label><Input value={form.place} onChange={v=>setForm(f=>({...f,place:v}))} placeholder="Café, Zoom..."/></div>
          <div><Label>Objetivo</Label><Input value={form.goal} onChange={v=>setForm(f=>({...f,goal:v}))} placeholder="¿Qué quiero lograr?"/></div>
          <BtnGold onClick={saveM} disabled={!form.title}>Guardar</BtnGold>
        </div>
      </Modal>}
    </div>
  );
}

// ── Notas ─────────────────────────────────────────────────────────────────────
function Notas({notes,setNotes}) {
  const [modal,setModal] = useState(false);
  const [detail,setDetail] = useState(null);
  const [filter,setFilter] = useState("Todo");
  const [form,setForm] = useState({title:"",body:"",cat:"Idea"});
  const saveN=()=>{if(!form.title)return;const u=[...notes,{...form,id:uid(),created:todayStr()}];setNotes(u);saveDB(KEYS.no,u);setModal(false);setForm({title:"",body:"",cat:"Idea"});};
  const del=id=>{const u=notes.filter(n=>n.id!==id);setNotes(u);saveDB(KEYS.no,u);setDetail(null);};
  const upd=(id,body)=>{const u=notes.map(n=>n.id===id?{...n,body}:n);setNotes(u);saveDB(KEYS.no,u);setDetail(u.find(n=>n.id===id));};
  const filtered=filter==="Todo"?notes:notes.filter(n=>n.cat===filter);
  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><div style={{fontSize:15,letterSpacing:2,color:G.text}}>Notas & Ideas</div><BtnLine onClick={()=>setModal(true)}>+ Nota</BtnLine></div>
      <div style={{display:"flex",gap:4,marginBottom:16,flexWrap:"wrap"}}>{["Todo",...NCATS].map(f=><button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?(NCATC[f]||G.gold):"transparent",border:`1px solid ${filter===f?(NCATC[f]||G.gold):G.border}`,color:filter===f?G.dark:G.muted,fontSize:8,letterSpacing:2,padding:"5px 10px",cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{f}</button>)}</div>
      {[...filtered].sort((a,b)=>b.id.localeCompare(a.id)).length===0&&<Card><div style={{textAlign:"center",color:G.muted,fontSize:12,padding:24}}>Tu espacio de ideas</div></Card>}
      {[...filtered].sort((a,b)=>b.id.localeCompare(a.id)).map(n=>(
        <Card key={n.id} onClick={()=>setDetail(n)} style={{padding:14,cursor:"pointer",borderLeft:`3px solid ${NCATC[n.cat]||G.muted}`,marginBottom:6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:n.body?8:0}}><div style={{fontSize:13,color:G.text,flex:1}}>{n.title}</div><Pill color={NCATC[n.cat]||G.muted}>{n.cat}</Pill></div>
          {n.body&&<div style={{fontSize:11,color:G.muted,lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{n.body}</div>}
        </Card>
      ))}
      {detail&&<Modal title={detail.title} onClose={()=>setDetail(null)} accent={NCATC[detail.cat]||G.gold}>
        <div style={{display:"flex",flexDirection:"column",gap:14}}><Pill color={NCATC[detail.cat]||G.muted}>{detail.cat}</Pill><Input value={detail.body||""} onChange={v=>upd(detail.id,v)} placeholder="Escribe aquí..." rows={8}/><BtnLine onClick={()=>del(detail.id)} color={G.burg}>Eliminar</BtnLine></div>
      </Modal>}
      {modal&&<Modal title="Nueva nota" onClose={()=>setModal(false)}>
        <div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div><Label>Título</Label><Input value={form.title} onChange={v=>setForm(f=>({...f,title:v}))} placeholder="¿De qué trata?"/></div>
          <div><Label>Categoría</Label><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{NCATS.map(c=><button key={c} onClick={()=>setForm(f=>({...f,cat:c}))} style={{background:form.cat===c?NCATC[c]+"33":"transparent",border:`1px solid ${form.cat===c?NCATC[c]:G.border}`,color:form.cat===c?NCATC[c]:G.muted,padding:"6px 12px",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"inherit",textTransform:"uppercase",borderRadius:2}}>{c}</button>)}</div></div>
          <div><Label>Contenido</Label><Input value={form.body} onChange={v=>setForm(f=>({...f,body:v}))} placeholder="Tu idea..." rows={4}/></div>
          <BtnGold onClick={saveN} disabled={!form.title}>Guardar</BtnGold>
        </div>
      </Modal>}
    </div>
  );
}

// ── Finanzas ──────────────────────────────────────────────────────────────────
function FinanzasTab({scope, finances, setFinances}) {
  const [showForm, setShowForm] = useState(false);
  const [cat,  setCat]  = useState(scope === 'alquimia' ? 'Ingreso evento' : 'Sueldo');
  const [amt,  setAmt]  = useState('');
  const [conc, setConc] = useState('');
  const [date, setDate] = useState(todayStr());

  const cats = scope === 'alquimia' ? CAT_ALQ : CAT_PER;
  const cmap = scope === 'alquimia' ? CALQ : CPER;
  const records = finances.filter(f => f.scope === scope);

  const reset = () => { setCat(scope === 'alquimia' ? 'Ingreso evento' : 'Sueldo'); setAmt(''); setConc(''); setDate(todayStr()); setShowForm(false); };

  const guardar = () => {
    const n = Number(amt);
    if (!n) return;
    const entry = { id: uid(), scope, cat, amount: n, concept: conc, date };
    let next = [...finances, entry];
    if (scope === 'alquimia' && isIng(cat) && n > 0) {
      next = [...next, { id: uid(), scope: 'alquimia', cat: 'Fondo ☷', amount: Math.round(n * 0.15), concept: 'Fondo ☷ 15% · ' + (conc || cat), date }];
    }
    setFinances(next);
    saveDB(KEYS.fi, next);
    reset();
  };

  const eliminar = (id) => {
    const next = finances.filter(f => f.id !== id);
    setFinances(next);
    saveDB(KEYS.fi, next);
  };

  const ing = records.filter(r => isIng(r.cat)).reduce((s, r) => s + Number(r.amount), 0);
  const gas = records.filter(r => !isIng(r.cat) && !isAho(r.cat)).reduce((s, r) => s + Number(r.amount), 0);
  const aho = records.filter(r => isAho(r.cat)).reduce((s, r) => s + Number(r.amount), 0);
  const net = ing - gas - aho;

  const accentColor = scope === 'alquimia' ? G.gold : '#4a6a8a';
  const fondoLabel  = scope === 'alquimia' ? 'Fondo ☷' : 'Ahorro';

  const resumen = [
    { l: 'Ingresos', v: fmtCLP(ing), c: '#4a8a4a' },
    { l: 'Gastos',   v: fmtCLP(gas), c: G.burg },
    { l: 'Neto',     v: fmtCLP(net), c: net >= 0 ? '#4a8a4a' : G.burg },
    { l: fondoLabel, v: fmtCLP(aho), c: G.gold },
  ];

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14 }}>
        {resumen.map(s => (
          <Card key={s.l} style={{ padding:'12px 14px' }}>
            <Label>{s.l}</Label>
            <div style={{ fontSize:15, color:s.c }}>{s.v}</div>
          </Card>
        ))}
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width:'100%', padding:'10px', background:'transparent', border:'1px solid ' + accentColor, borderRadius:2, color:accentColor, fontSize:10, letterSpacing:3, textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit', marginBottom:14 }}>
          + Nuevo registro
        </button>
      )}

      {showForm && (
        <div style={{ background:'#0a0a0a', border:'1px solid ' + accentColor + '55', borderRadius:2, padding:'16px 14px', marginBottom:14 }}>
          <div style={{ fontSize:9, letterSpacing:3, color:accentColor, textTransform:'uppercase', marginBottom:12 }}>Nuevo registro</div>

          <div style={{ marginBottom:10 }}>
            <Label>Categoría</Label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
              {cats.map(c => {
                const col = cmap[c] || (isIng(c) ? '#4a8a4a' : G.muted);
                const sel = cat === c;
                return (
                  <button key={c} onClick={() => setCat(c)} style={{ padding:'5px 10px', fontSize:9, letterSpacing:1, cursor:'pointer', fontFamily:'inherit', textTransform:'uppercase', borderRadius:2, background: sel ? col + '22' : 'transparent', border:'1px solid ' + (sel ? col : '#1a1a1a'), color: sel ? col : G.muted }}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom:10 }}>
            <Label>Monto (CLP)</Label>
            <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="Ej: 1200000" style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:18, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}/>
          </div>

          <div style={{ marginBottom:10 }}>
            <Label>Concepto</Label>
            <input type="text" value={conc} onChange={e => setConc(e.target.value)} placeholder="Descripción" style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2 }}/>
          </div>

          <div style={{ marginBottom:14 }}>
            <Label>Fecha</Label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ background:'#0c0c0c', border:'1px solid ' + G.border, color:G.text, padding:'10px 13px', fontSize:13, fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', borderRadius:2, colorScheme:'dark' }}/>
          </div>

          {scope === 'alquimia' && isIng(cat) && Number(amt) > 0 && (
            <div style={{ padding:'9px 13px', background: G.gold + '11', border:'1px solid ' + G.gold + '33', fontSize:11, color:G.gold, borderRadius:2, marginBottom:12 }}>
              {'☷'} Se separarán {fmtCLP(Math.round(Number(amt) * 0.15))} al fondo
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={reset} style={{ flex:1, padding:'10px', background:'transparent', border:'1px solid ' + G.border, borderRadius:2, color:G.muted, fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', fontFamily:'inherit' }}>
              Cancelar
            </button>
            <button onClick={guardar} disabled={!amt} style={{ flex:2, padding:'10px', background: amt ? G.gold : '#1a1a1a', color: amt ? G.dark : '#333', border:'none', borderRadius:2, fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor: amt ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
              Guardar
            </button>
          </div>
        </div>
      )}

      {records.length === 0 && (
        <Card><div style={{ textAlign:'center', color:G.muted, fontSize:12, padding:16 }}>Sin registros aún</div></Card>
      )}

      {[...records].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(r => {
        const c = cmap[r.cat] || (isIng(r.cat) ? '#4a8a4a' : G.muted);
        const signo = isIng(r.cat) ? '+' : isAho(r.cat) ? '☷' : '-';
        return (
          <Card key={r.id} style={{ padding:'11px 13px', display:'flex', alignItems:'center', gap:10, marginBottom:3, borderLeft:'3px solid ' + c }}>
            <span style={{ color:c, fontSize:13, fontWeight:'bold', flexShrink:0 }}>{signo}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, color:G.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.concept || r.cat}</div>
              <div style={{ display:'flex', gap:6, marginTop:2, alignItems:'center' }}>
                <Pill color={c}>{r.cat}</Pill>
                <span style={{ fontSize:9, color:G.dim }}>{fmtDate(r.date)}</span>
              </div>
            </div>
            <div style={{ fontSize:13, color:c, flexShrink:0 }}>{fmtCLP(r.amount)}</div>
            <button onClick={() => eliminar(r.id)} style={{ background:'none', border:'none', color:G.burg, cursor:'pointer', fontSize:16, flexShrink:0, opacity:0.6, padding:0 }}>&#x2715;</button>
          </Card>
        );
      })}
    </div>
  );
}

function Finanzas({finances,setFinances}) {
  const [tab,setTab] = useState("alquimia");
  const [confirmReset,setConfirmReset] = useState(null);
  const alqI=finances.filter(f=>f.scope==="alquimia"&&isIng(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const alqG=finances.filter(f=>f.scope==="alquimia"&&!isIng(f.cat)&&!isAho(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const perI=finances.filter(f=>f.scope==="personal"&&isIng(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const perG=finances.filter(f=>f.scope==="personal"&&!isIng(f.cat)&&!isAho(f.cat)).reduce((s,f)=>s+Number(f.amount),0);
  const doReset=scope=>{const next=scope==="todo"?[]:finances.filter(f=>f.scope!==scope);setFinances(next);saveDB(KEYS.fi,next);setConfirmReset(null);};
  return (
    <div style={{padding:"18px 16px"}}>
      <div style={{fontSize:15,letterSpacing:2,color:G.text,marginBottom:14}}>◆ Finanzas</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
        <Card style={{padding:"12px 14px",borderTop:`2px solid ${G.gold}`}}><Label>Alquimia · neto</Label><div style={{fontSize:14,color:alqI>=alqG?"#4a8a4a":G.burg}}>{fmtCLP(alqI-alqG)}</div></Card>
        <Card style={{padding:"12px 14px",borderTop:"2px solid #4a6a8a"}}><Label>Personal · neto</Label><div style={{fontSize:14,color:perI>=perG?"#4a8a4a":G.burg}}>{fmtCLP(perI-perG)}</div></Card>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {[{id:"alquimia",l:"☿ Alquimia"},{id:"personal",l:"◎ Personal"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"9px 0",background:tab===t.id?(t.id==="alquimia"?G.gold:"#4a6a8a"):"transparent",border:`1px solid ${tab===t.id?(t.id==="alquimia"?G.gold:"#4a6a8a"):G.border}`,color:tab===t.id?G.dark:G.muted,fontSize:9,letterSpacing:2,cursor:"pointer",textTransform:"uppercase",fontFamily:"inherit",borderRadius:2}}>{t.l}</button>
        ))}
      </div>
      <FinanzasTab key={tab} scope={tab} finances={finances} setFinances={setFinances}/>
      <div style={{marginTop:24,paddingTop:16,borderTop:`1px solid ${G.border}`}}>
        <Label>Zona de reinicio</Label>
        {confirmReset?(
          <div style={{background:"rgba(139,26,46,0.08)",border:"1px solid rgba(139,26,46,0.3)",borderRadius:2,padding:14}}>
            <div style={{fontSize:11,color:G.burg,marginBottom:12}}>{confirmReset==="todo"?"¿Borrar TODOS los registros?":confirmReset==="alquimia"?"¿Borrar registros de Alquimia?":"¿Borrar registros personales?"}</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setConfirmReset(null)} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${G.border}`,borderRadius:2,color:G.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>Cancelar</button>
              <button onClick={()=>doReset(confirmReset)} style={{flex:1,padding:"8px",background:G.burg,border:"none",borderRadius:2,color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit",textTransform:"uppercase"}}>Confirmar</button>
            </div>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <button onClick={()=>setConfirmReset("alquimia")} style={{width:"100%",padding:"9px",background:"transparent",border:"1px solid rgba(139,26,46,0.3)",borderRadius:2,color:"#7a3030",fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>Borrar registros Alquimia</button>
            <button onClick={()=>setConfirmReset("personal")} style={{width:"100%",padding:"9px",background:"transparent",border:"1px solid rgba(139,26,46,0.3)",borderRadius:2,color:"#7a3030",fontSize:9,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>Borrar registros personales</button>
            <button onClick={()=>setConfirmReset("todo")} style={{width:"100%",padding:"9px",background:"transparent",border:`1px solid ${G.burg}`,borderRadius:2,color:G.burg,fontSize:10,letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontFamily:"inherit"}}>✕ Borrar todo y empezar de cero</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mic ───────────────────────────────────────────────────────────────────────
const parseVoice = text => {
  const t=text.toLowerCase(), titulo=text.replace(/^(agregar?|crear?|nueva?|anotar?|recordar?|agendar?)\s*/i,"").trim();
  if(/reuni[oó]n|juntarme|llamada|meet|zoom/i.test(t)) return {type:"reunion",data:{title:titulo,date:todayStr(),time:"",type:"Cliente",place:"",goal:"",questions:[],notes:""},msg:`Reunión: ${titulo}`};
  if(/nota|idea|receta|anotar|apuntar/i.test(t)) return {type:"nota",data:{title:titulo,body:"",cat:/receta/i.test(t)?"Receta":"Idea"},msg:`Nota: ${titulo}`};
  if(/evento|cliente|matrimonio|cumplea|corporativo|graduaci|coctel|banquet|sushi|cena/i.test(t)) return {type:"evento",data:{client:titulo,date:todayStr(),servicios:[],guests:"",phase:"Pre-venta",income:"",note:""},msg:`Evento: ${titulo}`};
  return {type:"tarea",data:{title:titulo,cat:"Alquimia",date:todayStr(),note:"",done:false},msg:`Tarea: ${titulo}`};
};

function Mic({onAction}) {
  const [on,setOn]=useState(false); const [txt,setTxt]=useState(""); const [err,setErr]=useState("");
  const ref=useRef(null);
  const start=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setErr("Sin soporte");return;}
    const r=new SR();r.lang="es-CL";r.continuous=false;r.interimResults=false;ref.current=r;
    r.onstart=()=>{setOn(true);setErr("");setTxt("");};
    r.onresult=e=>{const t=e.results[0][0].transcript;setTxt(t);setOn(false);onAction(parseVoice(t));};
    r.onerror=e=>{setOn(false);setErr(e.error==="not-allowed"?"Permiso denegado":"Error micrófono");};
    r.onend=()=>setOn(false);r.start();
  },[onAction]);
  return (
    <div style={{position:"fixed",bottom:64,right:16,zIndex:100,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
      {txt&&<div style={{background:"#0f0f0f",border:`1px solid ${G.border}`,padding:"8px 12px",borderRadius:2,fontSize:10,color:G.muted,maxWidth:200,textAlign:"right"}}>"{txt}"</div>}
      {err&&<div style={{background:"#1a0808",border:`1px solid ${G.burg}`,padding:"6px 10px",borderRadius:2,fontSize:9,color:G.burg}}>{err}</div>}
      <button onClick={on?()=>ref.current?.stop():start} style={{width:48,height:48,borderRadius:"50%",background:on?"rgba(139,26,46,0.3)":"rgba(201,168,76,0.1)",border:`2px solid ${on?G.burg:G.gold}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{on?"⏹":"🎙"}</button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const NAV=[{id:"dashboard",icon:"◈",label:"Inicio"},{id:"agenda",icon:"◷",label:"Agenda"},{id:"reuniones",icon:"◇",label:"Reuniones"},{id:"notas",icon:"✦",label:"Notas"},{id:"alquimia",icon:"☿",label:"Alquimia"},{id:"finanzas",icon:"◆",label:"Finanzas"},{id:"inventario",icon:"⊞",label:"Inventario"}];

export default function App() {
  const [screen,setScreen]=useState("dashboard");
  const [events,setEvents]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [finances,setFinances]=useState([]);
  const [meetings,setMeetings]=useState([]);
  const [notes,setNotes]=useState([]);
  const [quotes,setQuotes]=useState([]);
  const [inventario,setInventario]=useState([]);
  const [insumos,setInsumos]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [toast,setToast]=useState(null);

  useEffect(()=>{
    (async()=>{
      const [e,t,f,m,n,q,inv,ins]=await Promise.all([loadDB(KEYS.ev),loadDB(KEYS.ta),loadDB(KEYS.fi),loadDB(KEYS.me),loadDB(KEYS.no),loadDB(KEYS.qu),loadDB(KEYS.inv),loadDB(KEYS.ins)]);
      if(e)setEvents(e);if(t)setTasks(t);if(f)setFinances(f);if(m)setMeetings(m);if(n)setNotes(n);if(q)setQuotes(q);if(inv)setInventario(inv);if(ins)setInsumos(ins);
      setLoaded(true);
    })();
  },[]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),3000);};
  const handleVoice=r=>{
    const {type,data}=r;
    if(type==="tarea"){setTasks(p=>{const u=[...p,{...data,id:uid()}];saveDB(KEYS.ta,u);return u;});setScreen("agenda");}
    else if(type==="nota"){setNotes(p=>{const u=[...p,{...data,id:uid(),created:todayStr()}];saveDB(KEYS.no,u);return u;});setScreen("notas");}
    else if(type==="reunion"){setMeetings(p=>{const u=[...p,{...data,id:uid()}];saveDB(KEYS.me,u);return u;});setScreen("reuniones");}
    else if(type==="evento"){setEvents(p=>{const u=[...p,{...data,id:uid()}];saveDB(KEYS.ev,u);return u;});setScreen("alquimia");}
    showToast(r.msg||"Guardado ✓");
  };

  if(!loaded) return (
    <div style={{minHeight:"100vh",background:G.dark,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:32,color:G.gold}}>☿</div>
      <div style={{fontSize:9,letterSpacing:4,color:G.muted,textTransform:"uppercase"}}>cargando</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",maxWidth:480,margin:"0 auto",background:G.dark,fontFamily:"'Georgia','Times New Roman',serif",color:G.text,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"13px 18px 10px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:G.dark,zIndex:10}}>
        <div style={{fontSize:10,letterSpacing:4,color:G.gold}}>☿ Bastian</div>
        <div style={{fontSize:10,letterSpacing:3,color:G.dim,textTransform:"uppercase"}}>{NAV.find(n=>n.id===screen)?.label}</div>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
        {screen==="dashboard"  && <Dashboard events={events} tasks={tasks} finances={finances} meetings={meetings} notes={notes} insumos={insumos}/>}
        {screen==="agenda"     && <Agenda tasks={tasks} setTasks={setTasks}/>}
        {screen==="reuniones"  && <Reuniones meetings={meetings} setMeetings={setMeetings}/>}
        {screen==="notas"      && <Notas notes={notes} setNotes={setNotes}/>}
        {screen==="alquimia"   && <AlquimiaScreen events={events} setEvents={setEvents} quotes={quotes} setQuotes={setQuotes} finances={finances} setFinances={setFinances}/>}
        {screen==="finanzas"   && <Finanzas finances={finances} setFinances={setFinances}/>}
        {screen==="inventario" && <InventarioScreen inventario={inventario} setInventario={setInventario} insumos={insumos} setInsumos={setInsumos}/>}
      </div>
      {toast&&<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:"#1a1a0a",border:`1px solid ${G.gold}`,color:G.gold,padding:"10px 20px",fontSize:11,letterSpacing:2,zIndex:300,whiteSpace:"nowrap",borderRadius:2}}>✓ {toast}</div>}
      <Mic onAction={handleVoice}/>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#0a0a0a",borderTop:`1px solid ${G.border}`,display:"flex",zIndex:50}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"9px 0 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,flex:1,borderTop:screen===n.id?`2px solid ${G.gold}`:"2px solid transparent"}}>
            <span style={{fontSize:12,color:screen===n.id?G.gold:"#2a2a2a"}}>{n.icon}</span>
            <span style={{fontSize:6,letterSpacing:1,textTransform:"uppercase",color:screen===n.id?G.gold:"#2a2a2a",whiteSpace:"nowrap"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
