import { useState, useEffect, useRef } from "react";

// Points at your backend server. Change this after deploying to Render
// (e.g. "https://project-connect-backend.onrender.com") — leave as
// localhost only while running the backend on your own computer.
const BACKEND_URL = "https://project-connect-59b5.onrender.com";
import { 
  Check, BookOpen, Clock, Heart, Sprout, Shield, 
  MessageCircle, ArrowRight, Play, ChevronDown, 
  Flame, Menu, X, Star, Phone, TrendingUp,
  Sparkles, Award, Users, Target, Radio, Send,
  Copy, Code2, Webhook, Database, Plus, Zap,
  Activity
} from "lucide-react";

export default function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(2);
  const [expandedZone, setExpandedZone] = useState<number | null>(0);
  const [activeDay, setActiveDay] = useState(2);
  const [checkIns, setCheckIns] = useState({ H: true, R: false, C: true });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const zonesRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // LIVE PILOT STATE
  const [liveNumber, setLiveNumber] = useState("+2348066143230");
  const [sendStage, setSendStage] = useState(0); //0 idle,1 connecting,2 queued,3 preview,4 success
  const [parents, setParents] = useState([
    { id:1, name:"You (Test)", number:"+2348066143230", status:"Active Pilot", last:"Just now", consistency:"86%" },
    { id:2, name:"Ada's Family", number:"+2348012345678", status:"Active", last:"2h ago", consistency:"83%" },
    { id:3, name:"Chidi's Family", number:"+2348098765432", status:"Active", last:"Yesterday", consistency:"91%" },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [newParentNumber, setNewParentNumber] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(()=>setShowToast(false), 3000);
  };

  const handleLiveSend = async () => {
    if(sendStage!==0 && sendStage!==4) return;
    setSendStage(1); // connecting

    try {
      setTimeout(()=> setSendStage(2), 400); // queued (visual only, request is in flight)

      const res = await fetch(`${BACKEND_URL}/api/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: liveNumber })
      });
      const data = await res.json();

      if (!data.success) {
        console.error("Send failed:", data.error);
        triggerToast("Send failed — check the backend server logs");
        setSendStage(0);
        return;
      }

      setSendStage(3); // preview
      setTimeout(()=> {
        setSendStage(4); // success — this is now a REAL success, not simulated
        setParents(p=> p.map(x=> x.number===liveNumber ? {...x, last:"Just now", status:"Active Pilot • Message Sent"} : x));
        triggerToast(`Real WhatsApp message sent — SID ${data.sid}`);
      }, 600);
    } catch (err) {
      console.error("Could not reach backend:", err);
      triggerToast("Can't reach backend — is server.js running on port 3001?");
      setSendStage(0);
    }
  };

  const handleAddParent = () => {
    if(!newParentName.trim() || !newParentNumber.trim()){
      triggerToast("Enter name and WhatsApp number");
      return;
    }
    const newP = {
      id: Date.now(),
      name: newParentName,
      number: newParentNumber,
      status: "Pending Invite",
      last: "Not yet",
      consistency: "—"
    };
    setParents(prev=> [newP, ...prev]);
    setShowAddModal(false);
    setNewParentName("");
    setNewParentNumber("");
    triggerToast(`${newP.name} added to pilot — ready to message`);
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setBroadcastDone(false);
    setTimeout(()=>{
      setIsBroadcasting(false);
      setBroadcastDone(true);
      setParents(p=> p.map(x=> ({...x, last:"Just now", status: x.status.includes("Pilot") ? x.status : "Active • Tonight sent"})));
      triggerToast(`Broadcast queued for ${parents.length} parents — simulation complete`);
      setTimeout(()=>setBroadcastDone(false), 4000);
    }, 1800);
  };

  const steps = [
    { id: 0, label: "REMIND", icon: "🔔", desc: "7:30pm daily nudge on WhatsApp", color: "bg-[#FF6B6B]" },
    { id: 1, label: "DO", icon: "✓", desc: "Small, proven parent actions", color: "bg-[#0F172A]" },
    { id: 2, label: "REPORT", icon: "💬", desc: "One-tap reply: H, R, C", color: "bg-[#10B981]" },
    { id: 3, label: "REFLECT", icon: "📊", desc: "See your consistency build", color: "bg-[#F59E0B]" },
    { id: 4, label: "IMPROVE", icon: "🌱", desc: "Coach guidance where you need it", color: "bg-[#8B5CF6]" },
  ];

  const zones = [
    { 
      title: "Academic Accountability", icon: "📚", color: "#0F172A",
      examples: ["Homework checked & signed", "Reviewed classwork for gaps", "Friday: Weekly review complete"],
      metric: "Homework checked 5/5 this week"
    },
    { 
      title: "School Readiness", icon: "⏰", color: "#FF6B6B",
      examples: ["Uniform & bag packed night before", "Left home on time", "Water + lunch packed"],
      metric: "Punctuality 4/5 • On track"
    },
    { 
      title: "Reading & Learning", icon: "📖", color: "#10B981",
      examples: ["20 min reading together", "Books reviewed & returned", "Story retold in own words"],
      metric: "Reading 🔥 12-day streak"
    },
    { 
      title: "Parent-Child Connection", icon: "❤️", color: "#EC4899",
      examples: ["One meaningful conversation", "15 min uninterrupted play", "Appreciation expressed"],
      metric: "Connection 3/5 • Focus area"
    },
    { 
      title: "Character & Values", icon: "🌱", color: "#F59E0B",
      examples: ["Trees & Pillars virtue discussed", "Gratitude practice", "Kindness challenge"],
      metric: "Integrated with T&P Academy curriculum",
      highlight: true
    },
    { 
      title: "Safety & Wellbeing", icon: "🛡️", color: "#06B6D4",
      examples: ["Screen time boundaries kept", "Bedtime routine on time", "Emotional check-in done"],
      metric: "Wellbeing 5/5 • Strongest zone"
    },
  ];

  const prompts = [
    { day: "Mon", label: "Monday • Curiosity", q: "Is there anything at school you haven't told me yet?", note: "Builds disclosure habit" },
    { day: "Tue", label: "Tuesday • Appreciation", q: "What's one thing you appreciated about today that you did yourself?", note: "Growth mindset" },
    { day: "Wed", label: "Wednesday • Play", q: "Can we do 15 minutes of *your* choice of play together tonight?", note: "Child-led connection" },
    { day: "Thu", label: "Thursday • Empathy", q: "Was there a moment today someone needed help? What happened?", note: "Character spotting" },
    { day: "Fri", label: "Friday • Review", q: "What was hardest this week, and what made it better?", note: "Reflection + resilience" },
    { day: "Sat", label: "Saturday • Dream", q: "If you could teach our family one new thing this weekend, what would it be?", note: "Agency & leadership" },
    { day: "Sun", label: "Sunday • Gratitude", q: "Who are three people you're grateful for this week and why?", note: "Values anchor" },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const completedCount = Object.values(checkIns).filter(Boolean).length;
  const consistency = Math.round((completedCount / 3) * 100);

  useEffect(()=>{
    const iv = setInterval(()=> setActiveStep(s=> (s+1)%5), 3500);
    return ()=> clearInterval(iv);
  },[]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#0F172A] antialiased overflow-x-hidden selection:bg-[#FF6B6B]/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *{font-family:'Plus Jakarta Sans',Inter,sans-serif}
        .glass{backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px)}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulse-soft{0%,100%{opacity:1}50%{opacity:.85}}
        @keyframes streak{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
        @keyframes slideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      `}</style>

      {/* TOAST */}
      <div className={`fixed top-[96px] right-4 md:right-6 z-[100] transition-all duration-300 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#0F172A] text-white px-5 py-3 rounded-full shadow-2xl text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          {toastMsg}
        </div>
      </div>

      {/* LIVE PILOT BANNER */}
      <div className="fixed top-0 w-full z-[70] h-[38px] bg-[#10B981] text-white flex items-center justify-center px-4 gap-3 text-[12px] md:text-[13px] font-semibold tracking-wide">
        <span className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          🔴 LIVE PILOT MODE
        </span>
        <span className="hidden md:inline w-px h-4 bg-white/30" />
        <span className="flex items-center gap-1.5">
          <Phone size={12} className="opacity-80"/> Test number linked: <span className="font-mono font-bold bg-white/15 px-2 py-0.5 rounded-full">{liveNumber}</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5 bg-white text-[#10B981] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest">
          <Zap size={10}/> READY TO SEND
        </span>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-[38px] w-full z-50 bg-[#FFFBF5]/90 glass border-b border-black/[0.06]">
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-extrabold text-[11px] tracking-widest">PC</div>
              <div>
                <div className="font-extrabold tracking-tight leading-none text-[15px]">PROJECT CONNECT</div>
                <div className="text-[10px] tracking-widest font-semibold text-black/50 -mt-[1px]">PARENT ACCOUNTABILITY</div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-1 text-[13.5px] font-medium">
              {[
                {l:"How it works", id:"how"},
                {l:"Zones", id:"zones"},
                {l:"Demo", id:"demo"},
                {l:"Pilot Panel", id:"pilot"},
                {l:"Setup", id:"setup"},
                {l:"Scorecard", id:"scorecard"},
                {l:"Pricing", id:"pricing"},
              ].map(i=>(
                <button key={i.id} onClick={()=>scrollTo(i.id)} className="px-3.5 py-2 rounded-full hover:bg-black/[0.06] transition">
                  {i.l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[11px] font-medium tracking-wide text-black/60 max-w-[180px] leading-tight">Live pilot linked to {liveNumber}</span>
            <button onClick={()=>scrollTo("pilot")} className="hidden md:flex items-center gap-2 bg-[#10B981] text-white px-5 h-10 rounded-full text-[13px] font-semibold hover:bg-[#0EA371] transition">
              <Radio size={14}/> Pilot Active
            </button>
            <button onClick={()=>setMobileMenu(v=>!v)} className="lg:hidden w-10 h-10 rounded-full bg-black/[0.06] flex items-center justify-center">
              {mobileMenu ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-black/10 bg-[#FFFBF5] px-6 py-6 flex flex-col gap-2">
            {["how","zones","demo","pilot","setup","scorecard","pricing"].map(id=>(
              <button key={id} onClick={()=>scrollTo(id)} className="text-left py-3 font-medium capitalize border-b border-black/5 last:border-0">{id}</button>
            ))}
            <button onClick={()=>triggerToast("Live pilot ready for "+liveNumber)} className="mt-3 bg-[#10B981] text-white h-12 rounded-full font-semibold">Pilot Active • {liveNumber}</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="pt-[142px] pb-16 md:pb-24 px-6 max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white border border-black/10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> WHATSAPP CLOUD API • LIVE PILOT READY • NO APP NEEDED
            </div>
            <h1 className="mt-6 text-[36px] md:text-[56px] font-[800] leading-[0.95] tracking-[-0.03em]">
              Most parents don't need <span className="text-[#FF6B6B]">more advice.</span> They need consistency.
            </h1>
            <p className="mt-5 text-[17px] md:text-[19px] leading-[1.5] text-black/60 max-w-[560px] font-[450]">
              A WhatsApp-based accountability system that helps you consistently do the small things that raise strong children.
            </p>

            {/* LIVE WHATSAPP TEST CARD */}
            <div className="mt-8 bg-white rounded-[24px] border border-black/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white"><MessageCircle size={14}/></div>
                  <div>
                    <div className="font-bold text-[13px] leading-none">Live WhatsApp Test</div>
                    <div className="text-[11px] text-black/50 mt-0.5 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"/> Connected to Cloud API</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">PRODUCTION READY</div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/30"/>
                  <input 
                    value={liveNumber}
                    onChange={e=>setLiveNumber(e.target.value)}
                    className="w-full h-[48px] pl-10 pr-4 rounded-full bg-[#FFFBF5] border border-black/10 text-[14px] font-mono font-medium focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition"
                    placeholder="+234..."
                  />
                </div>
                <button 
                  onClick={handleLiveSend}
                  disabled={sendStage>0 && sendStage<4}
                  className="h-[48px] px-5 md:px-6 rounded-full bg-[#0F172A] text-white font-semibold text-[13px] flex items-center gap-2 hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sendStage===0 || sendStage===4 ? <><Send size={14}/> <span className="hidden md:inline">Send Live WhatsApp Test</span><span className="md:hidden">Send Test</span> <ArrowRight size={14}/></> : <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending...</span>}
                </button>
              </div>

              {/* ANIMATION STATES */}
              {sendStage>0 && (
                <div className="mt-4 rounded-[18px] bg-[#0F172A] text-white p-4 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/10 to-transparent pointer-events-none"/>
                  <div className="relative space-y-3">
                    <div className={`flex items-center gap-2.5 text-[12px] transition-all ${sendStage>=1 ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sendStage>1 ? 'bg-[#10B981]' : 'bg-white/10'}`}>{sendStage>1 ? <Check size={12}/> : <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>}</div>
                      <span className="font-mono">Connecting to WhatsApp Cloud API...</span>
                      {sendStage>=1 && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-bold">api.whatsapp.com</span>}
                    </div>
                    <div className={`flex items-center gap-2.5 text-[12px] transition-all ${sendStage>=2 ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${sendStage>2 ? 'bg-[#10B981]' : sendStage===2 ? 'bg-[#F59E0B]' : 'bg-white/10'}`}>{sendStage>2 ? <Check size={12}/> : sendStage===2 ? <Activity size={12} className="animate-pulse"/> : <div className="w-1.5 h-1.5 bg-white/50 rounded-full"/>}</div>
                      <span className="font-mono">Message queued for {liveNumber}</span>
                      {sendStage>=2 && <span className="ml-auto text-[10px] text-[#10B981] font-bold">QUEUED • 230ms</span>}
                    </div>
                    
                    {sendStage>=3 && (
                      <div className="mt-3 bg-white rounded-[14px] p-3.5 text-[#0F172A] animate-[slideDown_0.3s_ease]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] font-bold tracking-widest text-black/40">EXACT MESSAGE PREVIEW • WILL BE SENT</div>
                          <button onClick={()=>{navigator.clipboard?.writeText(`Tonight's Parent Check-In ❤️ - Project CONNECT\nHi! Have you done these today?\n1. Homework checked? Reply H\n2. Reading 20min? Reply R\n3. Connection talk? Reply C\nJust reply with letters, e.g. 'H R'`); triggerToast("Message copied");}} className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"><Copy size={12}/></button>
                        </div>
                        <div className="font-mono text-[12.5px] leading-[1.5] bg-[#FFFBF5] rounded-[10px] p-3 border border-black/5">
                          <span className="font-bold">Tonight's Parent Check-In ❤️ - Project CONNECT</span><br/>
                          Hi! Have you done these today?<br/>
                          1. Homework checked? Reply H<br/>
                          2. Reading 20min? Reply R<br/>
                          3. Connection talk? Reply C<br/>
                          <span className="text-black/50">Just reply with letters, e.g. 'H R'</span>
                        </div>
                        <div className="mt-2 flex gap-1.5">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-[#0F172A] text-white font-bold">Template: parent_checkin_v2</span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-bold">H,R,C buttons enabled</span>
                        </div>
                      </div>
                    )}

                    {sendStage>=4 && (
                      <div className="mt-3 flex items-center gap-2 bg-[#10B981] rounded-full px-4 py-2.5 text-[12px] font-semibold animate-[slideDown_0.3s_ease]">
                        <div className="w-6 h-6 rounded-full bg-white text-[#10B981] flex items-center justify-center">✓</div>
                        <span>✅ Test sent! (Simulation) - In production this hits WhatsApp instantly</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {sendStage===0 && (
                <div className="mt-3 text-[11px] text-black/40 flex items-center gap-2">
                  <Shield size={12}/> Simulated send — hook up real Cloud API in Setup section below. Message template pre-approved.
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={()=>scrollTo("pilot")} className="h-[52px] px-7 rounded-full bg-[#0F172A] text-white font-semibold text-[15px] flex items-center gap-2 hover:bg-black transition">
                Open Pilot Control Panel <ArrowRight size={18}/>
              </button>
              <button onClick={()=>scrollTo("demo")} className="h-[52px] px-7 rounded-full bg-white border border-black/10 font-semibold text-[15px] flex items-center gap-2 hover:bg-black/[0.03] transition">
                <Play size={16} className="fill-black"/> See Live Demo
              </button>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1,2,3].map(i=>(
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#FFFBF5] bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E] flex items-center justify-center text-white text-[11px] font-bold">{["A","T","C"][i-1]}</div>
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <div className="flex items-center gap-1 font-semibold"><Star size={14} className="fill-[#F59E0B] text-[#F59E0B]"/> 4.9/5 from Lagos parents</div>
                <div className="text-black/50">Live pilot • {parents.length} parents linked</div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                <TrendingUp size={12}/> {parents.length} active • API ready
              </div>
            </div>
          </div>

          {/* PHONE MOCKUP */}
          <div className="relative lg:h-[680px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 via-transparent to-[#10B981]/10 rounded-[40px] blur-[40px]" />
            
            <div className="relative w-[300px] md:w-[340px]">
              {/* floating cards */}
              <div className="absolute -left-16 top-24 z-10 bg-white rounded-[18px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-black/5 p-4 w-[160px]" style={{animation:"float 4s ease-in-out infinite"}}>
                <div className="text-[10px] font-bold tracking-widest text-black/40">CONSISTENCY SCORE</div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[32px] font-extrabold leading-none">86%</span>
                  <span className="text-[12px] font-semibold text-[#10B981]">+4%</span>
                </div>
                <div className="mt-2 h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full w-[86%] bg-[#10B981] rounded-full" />
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-black/50"><Flame size={12} className="text-[#FF6B6B]"/> 7-day streak</div>
              </div>

              <div className="absolute -right-10 bottom-28 z-10 bg-[#0F172A] text-white rounded-[16px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] p-3.5 w-[150px]" style={{animation:"float 4s ease-in-out infinite 1s"}}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center"><Check size={14}/></div>
                  <div className="text-[11px] font-semibold leading-tight">Tonight's check-in done ✓<br/><span className="text-white/60 font-normal">{liveNumber.slice(-4)} • 2 min ago</span></div>
                </div>
              </div>

              <div className="relative mx-auto bg-black rounded-[52px] p-[10px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
                <div className="bg-[#111] rounded-[44px] overflow-hidden">
                  <div className="h-[14px] bg-black flex justify-center items-center">
                    <div className="w-[90px] h-[5px] bg-white/20 rounded-full"/>
                  </div>
                  <div className="bg-[#EFE9E1] h-[620px] relative overflow-hidden">
                    {/* WA header */}
                    <div className="h-[64px] bg-[#0F172A] px-4 flex items-center gap-3 text-white">
                      <div className="w-9 h-9 rounded-full bg-[#FF6B6B] flex items-center justify-center font-bold text-[12px]">PC</div>
                      <div className="flex-1">
                        <div className="text-[14px] font-semibold leading-none">Project Connect</div>
                        <div className="text-[11px] text-white/70 flex items-center gap-1"><div className="w-2 h-2 bg-[#10B981] rounded-full"/> online • replies in seconds</div>
                      </div>
                      <Phone size={16} className="opacity-60"/>
                    </div>
                    {/* chat */}
                    <div className="p-3 space-y-3 bg-[radial-gradient(#00000008_1px,transparent_1px)] bg-[size:20px_20px]">
                      <div className="flex justify-center"><span className="text-[10px] bg-white px-2.5 py-1 rounded-full shadow-sm text-black/50 font-medium">TODAY • 7:30 PM</span></div>
                      
                      <div className="bg-white rounded-[18px] rounded-tl-[4px] p-4 shadow-sm max-w-[92%]">
                        <div className="text-[13px] font-bold">Tonight's Parent Check-In ❤️</div>
                        <div className="mt-2 text-[12.5px] leading-[1.4] text-black/70">
                          Hi Ada! Quick 30-sec check:<br/><br/>
                          <span className="font-semibold text-black">1. Homework checked?</span> Reply <span className="inline-flex w-5 h-5 rounded-full bg-[#0F172A] text-white items-center justify-center text-[10px] font-bold">H</span><br/>
                          <span className="font-semibold text-black">2. Reading 20min?</span> Reply <span className="inline-flex w-5 h-5 rounded-full bg-[#10B981] text-white items-center justify-center text-[10px] font-bold">R</span><br/>
                          <span className="font-semibold text-black">3. Connection talk?</span> Reply <span className="inline-flex w-5 h-5 rounded-full bg-[#FF6B6B] text-white items-center justify-center text-[10px] font-bold">C</span><br/><br/>
                          <span className="text-[11px] text-black/50">Reply with any combo: e.g. "H R C" or "HR"</span>
                        </div>
                        <div className="mt-3 text-[10px] text-black/40">7:30 PM ✓✓</div>
                      </div>

                      <div className="flex justify-end">
                        <div className="bg-[#D9FDD3] rounded-[18px] rounded-tr-[4px] px-4 py-2.5 shadow-sm text-[13px] font-medium max-w-[70%]">
                          {Object.entries(checkIns).filter(([,v])=>v).map(([k])=>k).join(" ") || "Checking..."}
                          <div className="text-[10px] text-black/40 text-right mt-1">7:32 PM ✓✓ <span className="text-[#0A9B4B]">Read</span></div>
                        </div>
                      </div>

                      <div className="bg-white rounded-[18px] rounded-tl-[4px] p-3 shadow-sm max-w-[88%]">
                        <div className="text-[12px]">Amazing! 🔥 <b>{completedCount}/3 tonight</b>. Your consistency is now <b>{consistency}%</b>. See you tomorrow 7:30pm!</div>
                      </div>
                    </div>

                    {/* input mock */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#F0F0F0] h-[54px] px-3 flex items-center gap-2">
                      <div className="flex-1 h-9 bg-white rounded-full px-4 flex items-center text-[13px] text-black/40">Type H R C...</div>
                      <div className="w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center text-white"><MessageCircle size={16}/></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE INSIGHT */}
      <section id="how" className="px-6 py-20 bg-white border-y border-black/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-[11px] font-bold tracking-[0.2em] text-[#FF6B6B]">THE CORE LOOP</div>
              <h2 className="mt-2 text-[30px] md:text-[40px] font-extrabold leading-[0.95] tracking-tight">Small actions, repeated.<br/>That’s how strong children are raised.</h2>
            </div>
            <p className="max-w-[360px] text-[14px] leading-[1.6] text-black/60">Not another parenting course. A daily rhythm that makes the important things automatic. Designed for busy Lagos parents, on WhatsApp.</p>
          </div>

          <div className="relative bg-[#0F172A] rounded-[28px] p-6 md:p-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#10B981]/10" />
            <div className="relative grid md:grid-cols-5 gap-4 md:gap-0">
              {steps.map((s, idx)=>(
                <div key={s.id} className="relative">
                  {idx < 4 && <div className="hidden md:block absolute top-[28px] left-[60%] w-[80%] h-[2px] bg-white/10"><div className={`h-full bg-white/40 transition-all duration-700 ${activeStep > idx ? 'w-full' : 'w-0'}`} /></div>}
                  <button onClick={()=>setActiveStep(s.id)} className={`w-full text-left rounded-[20px] p-5 border transition-all ${activeStep===s.id ? 'bg-white text-[#0F172A] border-white shadow-xl scale-[1.02]' : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.1]'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold ${activeStep===s.id ? s.color+' text-white' : 'bg-white/10'}`}>{s.icon}</div>
                    <div className="mt-4 font-extrabold tracking-wide text-[13px]">{s.label}</div>
                    <div className={`mt-1 text-[12px] leading-[1.4] ${activeStep===s.id ? 'text-black/60' : 'text-white/60'}`}>{s.desc}</div>
                    {activeStep===s.id && <div className="mt-3 inline-flex text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F172A] text-white">ACTIVE NOW</div>}
                  </button>
                </div>
              ))}
            </div>
            <div className="relative mt-8 flex items-center gap-3 text-white/70 text-[12px]">
              <Sparkles size={14}/> Tap any step to explore • Auto-cycles every 3.5s
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DEMO */}
      <section id="demo" ref={demoRef} className="px-6 py-20 max-w-[1280px] mx-auto">
        <div className="flex flex-wrap gap-3 items-center mb-8">
          <div className="px-3 py-1 rounded-full bg-[#FF6B6B] text-white text-[11px] font-bold tracking-widest">● LIVE DEMO • INTERACTIVE</div>
          <div className="text-[13px] text-black/50 font-medium">Try it — tap H, R, C below and watch the scoreboard update in real-time.</div>
        </div>

        <div className="grid lg:grid-cols-[420px_1fr] gap-8 items-stretch">
          {/* phone */}
          <div className="bg-white rounded-[28px] border border-black/10 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.15)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white"><MessageCircle size={14}/></div>
                <div className="text-[13px] font-bold">WhatsApp Check-In</div>
              </div>
              <div className="text-[11px] px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-bold">7:30 PM • Tonight</div>
            </div>

            <div className="bg-[#FFFBF5] rounded-[20px] border border-black/5 p-5">
              <div className="text-[14px] font-bold">Tonight's Parent Check-In ❤️</div>
              <div className="mt-3 space-y-3 text-[13px]">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/5">
                  <span>1. Homework checked? Reply <b>H</b></span>
                  <button onClick={()=>setCheckIns(s=>({...s, H:!s.H}))} className={`w-9 h-9 rounded-full font-bold text-[13px] transition ${checkIns.H ? 'bg-[#0F172A] text-white' : 'bg-black/5 text-black/40'}`}>H</button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/5">
                  <span>2. Reading 20min? Reply <b>R</b></span>
                  <button onClick={()=>setCheckIns(s=>({...s, R:!s.R}))} className={`w-9 h-9 rounded-full font-bold text-[13px] transition ${checkIns.R ? 'bg-[#10B981] text-white' : 'bg-black/5 text-black/40'}`}>R</button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-black/5">
                  <span>3. Connection talk? Reply <b>C</b></span>
                  <button onClick={()=>setCheckIns(s=>({...s, C:!s.C}))} className={`w-9 h-9 rounded-full font-bold text-[13px] transition ${checkIns.C ? 'bg-[#FF6B6B] text-white' : 'bg-black/5 text-black/40'}`}>C</button>
                </div>
              </div>
              <div className="mt-4 text-[11px] text-black/40">Tip: Reply with combo e.g. "H C" if you did homework + connection.</div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                {k:"H", l:"Homework", on:checkIns.H},
                {k:"R", l:"Reading", on:checkIns.R},
                {k:"C", l:"Connect", on:checkIns.C},
              ].map(b=>(
                <div key={b.k} className={`h-[64px] rounded-2xl border flex flex-col items-center justify-center transition ${b.on ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-black/10 text-black/30'}`}>
                  <div className="font-extrabold">{b.k}</div>
                  <div className="text-[10px] font-medium">{b.on ? 'Done ✓' : b.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* tracker */}
          <div className="bg-[#0F172A] rounded-[28px] p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6B6B]/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] tracking-widest font-bold text-white/50">PARENT CONSISTENCY TRACKER • REAL-TIME</div>
                  <div className="mt-1 text-[22px] font-bold">Ada • Week 3 • Day 18</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-semibold">Tonight: {completedCount}/3</div>
                  <div className="px-3 py-1.5 rounded-full bg-[#10B981] text-white text-[11px] font-bold">{consistency}% consistency</div>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-[1.2fr_0.8fr] gap-6">
                <div className="space-y-3">
                  {[
                    {name:"Homework checked", done: checkIns.H ? 1 : 0, total:1, color:"#fff"},
                    {name:"Reading 20 min", done: checkIns.R ? 1 : 0, total:1, color:"#10B981"},
                    {name:"Connection talk", done: checkIns.C ? 1 : 0, total:1, color:"#FF6B6B"},
                    {name:"Weekly streak", done:7, total:7, color:"#F59E0B", streak:true},
                  ].map(row=>(
                    <div key={row.name} className="flex items-center gap-4 bg-white/[0.06] border border-white/10 rounded-2xl p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-[13px] font-semibold">{row.name}</div>
                          {row.streak && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B] text-white" style={{animation:"streak 1.2s infinite"}}><Flame size={10}/> 7-DAY</span>}
                        </div>
                        <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{width:`${(row.done/row.total)*100}%`, background:row.color}}/>
                        </div>
                      </div>
                      <div className="text-[13px] font-bold">{row.done}/{row.total}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[20px] p-5 text-[#0F172A]">
                  <div className="text-[11px] font-bold tracking-widest text-black/40">TONIGHT'S INSIGHT</div>
                  <div className="mt-3 text-[15px] font-semibold leading-[1.3]">
                    {completedCount===3 ? "Perfect night! 🔥 You're modelling consistency — your child notices more than you think." : completedCount===2 ? "Strong! 2/3 tonight. One more small action tomorrow and you keep the streak alive." : "Good start. Even one intentional action builds trust. Which one will you do before bedtime?"}
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FFFBF5] border border-black/10 flex items-center justify-center">📈</div>
                    <div className="text-[12px] leading-tight">
                      <div className="font-semibold">Weekly: 83% → projected {Math.min(92, 78+completedCount*3)}%</div>
                      <div className="text-black/50">Strongest: School readiness • Focus: Connection</div>
                    </div>
                  </div>
                  <button onClick={()=>triggerToast("Daily report saved — coach will see this")} className="mt-5 w-full h-11 rounded-full bg-[#0F172A] text-white font-semibold text-[13px]">Save tonight's check-in</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 ZONES */}
      <section id="zones" ref={zonesRef} className="px-6 py-20 bg-white border-y border-black/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-[720px]">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#10B981]">THE 6 RESPONSIBILITY ZONES</div>
            <h2 className="mt-3 text-[32px] md:text-[42px] font-extrabold leading-[0.95] tracking-tight">Every important parenting job, made obvious and doable.</h2>
            <p className="mt-4 text-[15px] text-black/60 leading-[1.6]">Not vague advice. Concrete, nightly check-ins across the six areas research shows matter most. Expand each to see real examples.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {zones.map((z, i)=>(
              <div key={i} className={`group rounded-[24px] border p-6 transition-all hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] ${expandedZone===i ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xl' : 'bg-[#FFFBF5] border-black/10 hover:border-black/20'} ${z.highlight ? 'ring-2 ring-[#F59E0B]/30' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[20px] ${expandedZone===i ? 'bg-white/10' : 'bg-white border border-black/10'}`}>{z.icon}</div>
                    <div>
                      <div className="font-bold leading-tight text-[14px]">{z.title}</div>
                      {z.highlight && <div className="mt-1 inline-flex text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#F59E0B] text-white">TREES & PILLARS INTEGRATED</div>}
                    </div>
                  </div>
                  <button onClick={()=>setExpandedZone(expandedZone===i ? null : i)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${expandedZone===i ? 'bg-white/10 text-white' : 'bg-black/5'}`}>
                    <ChevronDown className={`transition ${expandedZone===i ? 'rotate-180' : ''}`} size={16}/>
                  </button>
                </div>

                <div className="mt-4">
                  <div className={`text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex ${expandedZone===i ? 'bg-white/10 text-white/80' : 'bg-black/5 text-black/60'}`}>{z.metric}</div>
                </div>

                <div className={`grid transition-all duration-300 ${expandedZone===i ? 'grid-rows-[1fr] mt-5' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className={`rounded-2xl p-4 ${expandedZone===i ? 'bg-white/[0.06] border border-white/10' : 'bg-white border border-black/5'}`}>
                      <div className={`text-[11px] font-bold tracking-widest ${expandedZone===i ? 'text-white/50' : 'text-black/40'}`}>EXAMPLE CHECKS</div>
                      <ul className="mt-2 space-y-2">
                        {z.examples.map((ex, k)=>(
                          <li key={k} className="flex gap-2 text-[13px] leading-[1.4]">
                            <span className={`mt-[6px] w-1 h-1 rounded-full flex-shrink-0 ${expandedZone===i ? 'bg-white/50' : 'bg-black/30'}`}/>
                            <span className={expandedZone===i ? 'text-white/80' : 'text-black/70'}>{ex}</span>
                          </li>
                        ))}
                      </ul>
                      {z.highlight && <div className="mt-3 text-[11px] leading-[1.5] text-white/60 bg-white/5 p-2.5 rounded-xl border border-white/10">Values Academy integration: Weekly virtue from Trees & Pillars curriculum is woven into check-in. Not extra work — same habit, deeper meaning.</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAILY PROMPTS */}
      <section className="px-6 py-20 max-w-[1280px] mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#FF6B6B]">SAMPLE DAILY PROMPTS ROTATION</div>
            <h3 className="mt-3 text-[28px] md:text-[36px] font-extrabold leading-[0.95] tracking-tight">Connection questions that actually open your child up.</h3>
            <p className="mt-4 text-[14px] text-black/60 leading-[1.6]">No more "How was school?" "Fine." Our prompts are crafted by child psychologists to build disclosure, gratitude, and agency — one night at a time.</p>
            <div className="mt-6 p-4 rounded-2xl bg-white border border-black/10 flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold">✓</div>
              <div className="text-[12px] leading-[1.5]"><b>How it works:</b> Monday–Sunday rotation. Same WhatsApp check-in flow. We insert tonight's question automatically — no extra app.</div>
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-black/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex gap-1 p-2 bg-[#FFFBF5] border-b border-black/5 overflow-x-auto">
              {prompts.map((p, idx)=>(
                <button key={p.day} onClick={()=>setActiveDay(idx)} className={`flex-shrink-0 px-4 h-9 rounded-full text-[12px] font-bold tracking-wide transition ${activeDay===idx ? 'bg-[#0F172A] text-white' : 'bg-white border border-black/10 text-black/60 hover:text-black'}`}>
                  {p.day}
                </button>
              ))}
            </div>
            <div className="p-7">
              <div className="text-[11px] font-bold tracking-widest text-[#FF6B6B]">{prompts[activeDay].label}</div>
              <div className="mt-3 text-[22px] md:text-[26px] font-extrabold leading-[1.15] tracking-tight">“{prompts[activeDay].q}”</div>
              <div className="mt-4 inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 font-semibold">
                <Target size={12}/> {prompts[activeDay].note}
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#FFFBF5] border border-black/5 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-black/40">WHY IT WORKS</div>
                  <div className="mt-1 text-[11px] leading-[1.4] text-black/60">Open-ended, non-judgmental. Child feels safe to share.</div>
                </div>
                <div className="rounded-2xl bg-[#FFFBF5] border border-black/5 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-black/40">PARENT TIP</div>
                  <div className="mt-1 text-[11px] leading-[1.4] text-black/60">Listen 80%, talk 20%. Reflect their words back.</div>
                </div>
                <div className="rounded-2xl bg-[#0F172A] p-3 text-white">
                  <div className="text-[10px] font-bold tracking-widest text-white/50">TONIGHT</div>
                  <div className="mt-1 text-[11px] leading-[1.4]">Takes 4 min. No prep. Builds trust that lasts.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCORECARD */}
      <section id="scorecard" className="px-6 py-20 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,107,0.15),transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="max-w-[1280px] mx-auto relative">
          <div className="flex flex-wrap justify-between gap-6 items-end mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold tracking-widest">● THE PARENT SCORECARD • INTERACTIVE DASHBOARD</div>
              <h2 className="mt-4 text-[30px] md:text-[44px] font-extrabold leading-[0.9] tracking-tight max-w-[600px]">Finally, see your consistency — not just your intentions.</h2>
            </div>
            <div className="text-[13px] text-white/60 max-w-[360px] leading-[1.6]">This is what parents see every Sunday. No shaming. Just clear data + one focus for next week.</div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
            {/* table */}
            <div className="bg-white rounded-[28px] text-[#0F172A] overflow-hidden shadow-2xl">
              <div className="p-6 md:p-7 flex items-center justify-between border-b border-black/5">
                <div className="font-extrabold tracking-tight">Weekly Consistency Report • Ada's Family • Week 18</div>
                <div className="text-[11px] px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-bold">LIVE • Updates from WhatsApp</div>
              </div>

              <div className="p-2">
                {[
                  {area:"Homework checked", icon: BookOpen, target:5, done: checkIns.H ? 5 : 4, color:"#0F172A"},
                  {area:"Books reviewed", icon: BookOpen, target:2, done:2, color:"#0F172A"},
                  {area:"Reading", icon: BookOpen, target:5, done: checkIns.R ? 5 : 4, streak: true, color:"#10B981"},
                  {area:"Punctuality", icon: Clock, target:5, done:4, color:"#FF6B6B"},
                  {area:"Connection", icon: Heart, target:5, done: checkIns.C ? 4 : 3, color:"#EC4899", focus:true},
                  {area:"Values", icon: Sprout, target:1, done:1, color:"#F59E0B"},
                ].map(r=>{
                  const pct = Math.round((r.done/r.target)*100);
                  return (
                    <div key={r.area} className={`flex items-center gap-4 p-4 rounded-[16px] ${r.focus ? 'bg-[#FFF1F2] border border-[#FF6B6B]/20' : 'hover:bg-black/[0.02]'}`}>
                      <div className="w-10 h-10 rounded-full bg-[#FFFBF5] border border-black/10 flex items-center justify-center"><r.icon size={16}/></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-[13px] truncate">{r.area}</div>
                          {r.streak && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981] text-white"><Flame size={10}/> 7-DAY STREAK</span>}
                          {r.focus && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white">FOCUS NEXT WEEK</span>}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct}%`, background:r.color}}/>
                          </div>
                          <div className="text-[11px] font-medium text-black/50">{r.done}/{r.target}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-extrabold">{pct}%</div>
                        <div className="text-[11px] text-black/50">{pct>=100 ? "Exceeding" : pct>=80 ? "Strong" : "Focus"}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-6 bg-[#FFFBF5] border-t border-black/5 flex flex-wrap gap-3 text-[11px]">
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 font-medium">Updated: Tonight {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/10 font-medium">Source: WhatsApp replies H,R,C</span>
                <span className="px-2.5 py-1 rounded-full bg-[#0F172A] text-white font-semibold">Auto-sync • No manual entry</span>
              </div>
            </div>

            {/* circular */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-[28px] p-7">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold tracking-widest text-white/50">WEEKLY CONSISTENCY</div>
                  <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                </div>
                <div className="mt-8 flex items-center gap-8">
                  <div className="relative w-[132px] h-[132px]">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="66" cy="66" r="56" stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none"/>
                      <circle cx="66" cy="66" r="56" stroke="#10B981" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${2*Math.PI*56}`} strokeDashoffset={`${2*Math.PI*56*(1-consistency/100)}`} className="transition-all duration-1000"/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-[36px] font-extrabold leading-none">{consistency}%</div>
                      <div className="text-[11px] text-white/60 font-semibold mt-1">{completedCount===3 ? "EXCELLENT" : completedCount===2 ? "STRONG" : "BUILDING"}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-semibold leading-[1.4]">Strongest: School readiness.<br/>Focus next week: <span className="text-[#FF8E8E]">intentional connection</span>.</div>
                    <div className="mt-4 space-y-2 text-[12px] text-white/60">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"/> You showed up 5/7 nights</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/30"/> 2 nights missed — still above 60% threshold</div>
                    </div>
                  </div>
                </div>
                <button onClick={()=>triggerToast("Full PDF report sent to WhatsApp")} className="mt-7 w-full h-11 rounded-full bg-white text-[#0F172A] font-bold text-[13px] hover:bg-white/90 transition">Download Sunday Report PDF</button>
              </div>

              <div className="bg-[#FF6B6B] rounded-[28px] p-6 text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"/>
                <div className="relative">
                  <div className="text-[11px] font-bold tracking-widest text-white/70">THIS WEEK'S WIN</div>
                  <div className="mt-2 text-[16px] font-bold leading-[1.3]">Ada told you about the playground incident without being asked. That disclosure habit took 3 weeks to build — and you built it.</div>
                  <div className="mt-4 flex items-center gap-2 text-[12px] font-medium"><Award size={14}/> Consistency builds trust. Trust builds disclosure.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILOT CONTROL PANEL */}
      <section id="pilot" className="px-6 py-20 bg-white border-y border-black/5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] text-white text-[11px] font-bold tracking-widest"><Radio size={12} className="text-[#10B981]"/> PILOT CONTROL PANEL • LIVE OPERATIONS</div>
              <h2 className="mt-4 text-[32px] md:text-[44px] font-extrabold leading-[0.9] tracking-tight">Manage your live pilot.<br/>One number linked: <span className="text-[#10B981] font-mono">{liveNumber}</span></h2>
              <p className="mt-4 text-[14px] text-black/60 max-w-[520px] leading-[1.6]">Add parents, trigger nightly check-ins, watch H,R,C replies update consistency in real-time. This is the operator view — what you'd use every night at 7:30pm.</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-full bg-[#FFFBF5] border border-black/10 text-[11px] font-semibold flex items-center gap-2"><div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"/> {parents.length} parents • API: Connected</div>
            </div>
          </div>

          <div className="bg-[#0F172A] rounded-[28px] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]">
            <div className="p-6 md:p-7 flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Users size={18} className="text-white"/></div>
                <div>
                  <div className="text-white font-bold text-[15px]">Parent Roster • Lagos Pilot</div>
                  <div className="text-white/50 text-[11px] mt-0.5">WhatsApp Cloud API • Webhook: /webhook/whatsapp • Template approved</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setShowAddModal(true)} className="h-10 px-4 rounded-full bg-white text-[#0F172A] font-bold text-[12px] flex items-center gap-2 hover:bg-white/90 transition">
                  <Plus size={14}/> Add New Parent
                </button>
                <button onClick={handleBroadcast} disabled={isBroadcasting} className={`h-10 px-5 rounded-full font-bold text-[12px] flex items-center gap-2 transition ${broadcastDone ? 'bg-[#10B981] text-white' : isBroadcasting ? 'bg-white/10 text-white/50' : 'bg-[#FF6B6B] text-white hover:bg-[#E05A5A]'}`}>
                  {isBroadcasting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Broadcasting...</> : broadcastDone ? <><Check size={14}/> Broadcast Sent • {parents.length} queued</> : <><Send size={14}/> Broadcast Tonight's Check-In to All</>}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold tracking-widest text-white/40 border-b border-white/10">
                    <th className="px-6 md:px-7 py-3 font-bold">PARENT NAME</th>
                    <th className="px-6 md:px-7 py-3 font-bold">WHATSAPP NUMBER</th>
                    <th className="px-6 md:px-7 py-3 font-bold">STATUS</th>
                    <th className="px-6 md:px-7 py-3 font-bold">LAST RESPONSE</th>
                    <th className="px-6 md:px-7 py-3 font-bold">CONSISTENCY</th>
                    <th className="px-6 md:px-7 py-3 font-bold">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {parents.map(p=>(
                    <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition group">
                      <td className="px-6 md:px-7 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${p.number===liveNumber ? 'bg-[#10B981] text-white' : 'bg-white/10 text-white/70'}`}>{p.name[0]}</div>
                          <div>
                            <div className="text-white font-semibold text-[13px] flex items-center gap-2">
                              {p.name}
                              {p.number===liveNumber && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#10B981] text-white font-bold tracking-widest">YOU • TEST</span>}
                            </div>
                            <div className="text-white/40 text-[11px]">Family ID: #{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 md:px-7 py-4">
                        <div className="font-mono text-white text-[13px] flex items-center gap-2">
                          {p.number}
                          {p.number===liveNumber && <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"/>}
                        </div>
                        <div className="text-white/40 text-[10px] mt-0.5">WhatsApp • Verified</div>
                      </td>
                      <td className="px-6 md:px-7 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${p.status.includes("Pilot") ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20' : p.status.includes("Active") ? 'bg-white/10 text-white/80' : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"/> {p.status}
                        </span>
                      </td>
                      <td className="px-6 md:px-7 py-4 text-white/70 text-[12px]">{p.last}</td>
                      <td className="px-6 md:px-7 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#10B981] rounded-full" style={{width: p.consistency.includes("%") ? p.consistency : "10%"}}/>
                          </div>
                          <span className="text-white font-bold text-[12px]">{p.consistency}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-7 py-4">
                        <button onClick={()=>{setLiveNumber(p.number); triggerToast(`Test number switched to ${p.number}`); setSendStage(0);}} className="h-7 px-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-medium transition">Set as test</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-5 bg-white/[0.03] border-t border-white/10 flex flex-wrap gap-3 text-[11px]">
              <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/60 flex items-center gap-2"><Activity size={12}/> Webhook logs: 200 OK • Last: {new Date().toLocaleTimeString()}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/60">Template: parent_checkin_v2 approved • Utility</span>
              <span className="px-3 py-1.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-semibold border border-[#10B981]/20">● Live mode: Messages routed to {liveNumber} in simulation • Connect real API below</span>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNICAL SETUP CARD */}
      <section id="setup" className="px-6 py-20 max-w-[1280px] mx-auto">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F172A] text-white text-[11px] font-bold tracking-widest"><Code2 size={12}/> TECHNICAL SETUP • MAKE IT REAL IN 15 MIN</div>
            <h2 className="mt-4 text-[32px] md:text-[44px] font-extrabold leading-[0.95] tracking-tight">This demo is a simulation.<br/>Here's how to wire <span className="text-[#FF6B6B]">real WhatsApp</span> today.</h2>
            <p className="mt-4 text-[14px] text-black/60 max-w-[560px] mx-auto leading-[1.6]">You've tested with {liveNumber}. Now connect the real Cloud API — no rebuilding. Same UI, real delivery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step:"01",
                title:"Get WhatsApp Cloud API credentials from Meta",
                desc:"Create Meta app, add WhatsApp product, get permanent token. Takes 5 min.",
                icon: Database,
                color:"bg-[#0F172A]",
                code:`// .env
WHATSAPP_TOKEN=EAAxxxx
WHATSAPP_PHONE_ID=123456789
VERIFY_TOKEN=project_connect_2025

// Template must be approved:
// Name: parent_checkin_v2
// Category: Utility
// "Tonight's Parent Check-In ❤️..."`,
                cta:"Meta Developers →"
              },
              {
                step:"02",
                title:"Deploy webhook (link to code)",
                desc:"FastAPI / Express endpoint that receives H,R,C and updates Supabase. We provide starter.",
                icon: Webhook,
                color:"bg-[#FF6B6B]",
                code:`// webhook.js - handles replies
app.post('/webhook/whatsapp', (req,res)=>{
  const msg = req.body.entry[0].changes[0]
                .value.messages[0].text.body
  // Parse H,R,C
  const flags = msg.toUpperCase()
                .match(/[HRC]/g)
  // Update DB
  await supabase.from('checkins')
        .insert({ phone, flags, date: today() })
  // Reply with consistency score
  sendWhatsApp(phone, "Amazing! "+flags.length+"/3...")
})`,
                cta:"View webhook boilerplate →"
              },
              {
                step:"03",
                title:"Connect WATI / 360dialog if you need scale",
                desc:"For broadcast to 500+ parents, plug WATI or 360dialog. Same webhook, higher throughput.",
                icon: Zap,
                color:"bg-[#10B981]",
                code:`// Option A: WATI (no-code broadcast)
// - Import CSV of parents
// - Template: parent_checkin_v2
// - Trigger: Daily 7:30pm WAT
// - Webhook forward to your API

// Option B: 360dialog
// - Higher rate limits
// - $35/mo + $0.02/msg
// - Use same verify token`,
                cta:"Compare WATI vs 360dialog →"
              },
            ].map(s=>(
              <div key={s.step} className="bg-white rounded-[24px] border border-black/10 p-6 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-full ${s.color} text-white flex items-center justify-center`}><s.icon size={18}/></div>
                  <div className="text-[11px] font-extrabold tracking-widest text-black/20">STEP {s.step}</div>
                </div>
                <div className="mt-4 font-bold text-[15px] leading-tight">{s.title}</div>
                <div className="mt-2 text-[12px] text-black/60 leading-[1.5]">{s.desc}</div>
                <div className="mt-4 bg-[#0F172A] rounded-[14px] p-3.5 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] font-bold tracking-widest text-white/40">{s.step==="01" ? "ENV & TEMPLATE" : s.step==="02" ? "WEBHOOK CODE" : "SCALE OPTIONS"}</div>
                    <button onClick={()=>{triggerToast("Code snippet copied"); navigator.clipboard?.writeText(s.code)}} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition"><Copy size={11} className="text-white"/></button>
                  </div>
                  <pre className="text-[10px] leading-[1.5] text-white/80 font-mono whitespace-pre-wrap break-words">{s.code}</pre>
                </div>
                <button onClick={()=>triggerToast(s.cta+" — guide opening")} className="mt-4 h-10 rounded-full bg-[#FFFBF5] border border-black/10 font-bold text-[11px] hover:bg-black/[0.03] transition">{s.cta}</button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#0F172A] rounded-[24px] p-6 md:p-7 flex flex-wrap items-center justify-between gap-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#10B981]/10 pointer-events-none"/>
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center"><Shield size={20}/></div>
              <div>
                <div className="font-bold text-[14px]">Production checklist for {liveNumber}</div>
                <div className="text-white/60 text-[12px] mt-1">Template approved • Webhook verified • Test message delivered (sim) • Ready to add real token</div>
              </div>
            </div>
            <div className="relative flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-semibold">Meta App ID: 1029384756</div>
              <div className="px-3 py-1.5 rounded-full bg-[#10B981] text-white text-[11px] font-bold">● LIVE PILOT • {liveNumber}</div>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="px-6 py-20 max-w-[1280px] mx-auto">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="text-[11px] font-bold tracking-[0.2em] text-[#0F172A]">THE 30-DAY RESET</div>
          <h2 className="mt-3 text-[32px] md:text-[44px] font-extrabold leading-[0.95] tracking-tight">Four weeks to make consistency who you are.</h2>
          <p className="mt-4 text-[15px] text-black/60 leading-[1.6]">Not a course you watch. A rhythm you live. Each week layers one habit — until it becomes automatic.</p>
        </div>

        <div className="mt-12 relative">
          <div className="hidden md:block absolute top-[36px] left-[12%] right-[12%] h-[2px] bg-black/10"><div className="h-full w-[65%] bg-[#0F172A]"/></div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              {w:"Week 1", title:"CONNECT ❤️", desc:"Daily connection questions. Rebuild trust. Child starts talking more.", color:"bg-[#FF6B6B]", tasks:["Mon-Sun prompts", "Play 15 min", "No phone during talk"]},
              {w:"Week 2", title:"CHECK 📚", desc:"Academic accountability. Homework, reading, bag packed. No nagging, just system.", color:"bg-[#0F172A]", tasks:["Homework check", "Reading log", "Morning readiness"]},
              {w:"Week 3", title:"BUILD 🌱", desc:"Character & values via Trees & Pillars integration. Virtue of the week in action.", color:"bg-[#10B981]", tasks:["Virtue practice", "Gratitude", "Kindness challenge"]},
              {w:"Week 4", title:"LEAD 👑", desc:"You lead the system. Design your family's rhythm for next 90 days.", color:"bg-[#F59E0B]", tasks:["Family rhythm", "Final report", "90-day plan"]},
            ].map((wk, i)=>(
              <div key={wk.w} className="relative bg-white border border-black/10 rounded-[24px] p-6 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.15)]">
                <div className={`absolute -top-3 left-6 w-9 h-9 rounded-full ${wk.color} text-white flex items-center justify-center font-extrabold text-[12px] shadow-lg`}>{i+1}</div>
                <div className="mt-4 text-[11px] font-bold tracking-widest text-black/40">{wk.w}</div>
                <div className="mt-1 font-extrabold text-[16px]">{wk.title}</div>
                <div className="mt-2 text-[13px] leading-[1.5] text-black/60">{wk.desc}</div>
                <div className="mt-4 space-y-1.5">
                  {wk.tasks.map(t=>(
                    <div key={t} className="flex items-center gap-2 text-[11px] font-medium"><div className="w-4 h-4 rounded-full bg-black/5 flex items-center justify-center"><Check size={10}/></div> {t}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* report card sample */}
        <div className="mt-12 bg-[#FFFBF5] border border-black/10 rounded-[28px] p-6 md:p-8 grid md:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
          <div>
            <div className="inline-flex px-3 py-1 rounded-full bg-[#0F172A] text-white text-[10px] font-bold tracking-widest">SAMPLE FINAL REPORT CARD • DAY 30</div>
            <h4 className="mt-4 text-[24px] font-extrabold leading-[0.95]">Ada’s Family — You went from 42% to 86% consistency in 30 days.</h4>
            <p className="mt-3 text-[13px] text-black/60 leading-[1.6]">No new parenting theory. You just finally did the small things, consistently. Your child’s teacher noticed too.</p>
            <div className="mt-5 flex gap-2">
              <div className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-semibold">🔥 Longest streak: 11 days</div>
              <div className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-[11px] font-semibold">📚 Reading: 22/30 nights</div>
            </div>
          </div>
          <div className="bg-white rounded-[20px] border border-black/10 p-5 grid grid-cols-2 gap-4">
            <div className="col-span-2 flex items-center justify-between">
              <div className="font-bold text-[13px]">Before → After</div>
              <div className="text-[11px] px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-bold">+44% growth</div>
            </div>
            {[
              {l:"Homework battles", b:"5x/week", a:"1x/week"},
              {l:"Child disclosure", b:"Rare", a:"Daily"},
              {l:"Morning rush", b:"Chaotic", a:"On time 4/5"},
              {l:"Reading habit", b:"0 min", a:"20 min/night"},
            ].map(r=>(
              <div key={r.l} className="rounded-xl bg-[#FFFBF5] border border-black/5 p-3">
                <div className="text-[10px] font-bold tracking-widest text-black/40">{r.l}</div>
                <div className="mt-1 text-[12px]"><span className="text-black/40 line-through">{r.b}</span> <ArrowRight size={12} className="inline mx-1"/> <span className="font-bold">{r.a}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COACHING LAYER */}
      <section className="px-6 py-20 bg-white border-y border-black/5">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#10B981]">THE COACHING LAYER</div>
            <h3 className="mt-3 text-[30px] md:text-[38px] font-extrabold leading-[0.95] tracking-tight">Automation for consistency.<br/>Humans for when you slip.</h3>
            <p className="mt-4 text-[14px] text-black/60 leading-[1.6]">No guilt trips. Just the right nudge at the right time, based on your data — not generic advice.</p>
            <div className="mt-6 rounded-[20px] bg-[#0F172A] text-white p-5 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"><Users size={18}/></div>
              <div className="text-[12px] leading-[1.5]"><b>Coach Amaka, Lagos</b> — "I only reach out when data shows you're stuck. Most families stay in green. That's the point — system does the heavy lifting."</div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {range:"80–100%", label:"GREEN • Automated", color:"bg-[#10B981]", icon:"✅", desc:"You're in flow. System celebrates you, keeps tracking. No coach needed.", example:"'🔥 7-day streak! Ada's disclosure is up 3x since Week 1. Keep going!'"},
              {range:"60–79%", label:"AMBER • Coach Check-in", color:"bg-[#F59E0B]", icon:"⚠️", desc:"Missed 2 nights. Gentle WhatsApp from coach. Not shame — strategy.", example:"'Hey Ada's mum, noticed homework checks slipped. Is evening timing still working? Want to shift to 7pm?'"},
              {range:"<60%", label:"RED • Personal Outreach", color:"bg-[#FF6B6B]", icon:"❤️", desc:"Life happened. Coach calls. We troubleshoot: timing, workload, motivation.", example:"'No judgment — let's reset. Which ONE action can we lock for next 3 nights? H only?'"},
            ].map(c=>(
              <div key={c.range} className="rounded-[20px] border border-black/10 bg-[#FFFBF5] p-5 flex gap-4">
                <div className={`w-12 h-12 rounded-full ${c.color} text-white flex items-center justify-center text-[16px] font-bold flex-shrink-0`}>{c.range.split("")[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-[13px]">{c.label}</div>
                    <div className="text-[11px] px-2 py-0.5 rounded-full bg-black/5 font-medium">{c.range}</div>
                  </div>
                  <div className="mt-1 text-[12px] text-black/60 leading-[1.5]">{c.desc}</div>
                  <div className="mt-3 rounded-xl bg-white border border-black/5 p-3 text-[11px] leading-[1.5] text-black/70">💬 Example: <i>"{c.example}"</i></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-16 bg-[#FFFBF5]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-black/40 mb-6"><Star size={12} className="fill-black/20"/> LAGOS PILOT FAMILIES</div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {name:"Funke O., Lekki", child:"Age 8", text:"I used to shout about homework every night. Now I just reply H on WhatsApp. My daughter reminds ME. No more battles. 3 weeks and she packs her bag herself.", score:"84% consistency"},
              {name:"Chidi E., Yaba", child:"Age 10", text:"The connection question changed everything. My son told me about being left out at school — first time ever. That Tuesday prompt... I cried. We talked for 40 minutes.", score:"91% consistency • 14-day streak"},
              {name:"Aisha B., Ikeja", child:"Ages 6 & 9", text:"As a working mum, I felt guilty. This system made me realize consistency beats perfection. Even 2/3 nights is a win. Coach Amaka's voice note on my low week kept me going.", score:"78% → 88% in 30 days"},
            ].map(t=>(
              <div key={t.name} className="bg-white rounded-[20px] border border-black/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-[11px]">{t.name[0]}</div>
                  <div>
                    <div className="font-bold text-[13px]">{t.name}</div>
                    <div className="text-[11px] text-black/50">{t.child} • {t.score}</div>
                  </div>
                </div>
                <div className="mt-4 text-[13px] leading-[1.6] text-black/70">“{t.text}”</div>
                <div className="mt-4 flex gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} size={12} className="fill-[#F59E0B] text-[#F59E0B]"/>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-20 max-w-[1280px] mx-auto">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="text-[11px] font-bold tracking-[0.2em] text-[#0F172A]">PRICING • BUILT FOR LAGOS FAMILIES</div>
          <h2 className="mt-3 text-[32px] md:text-[44px] font-extrabold leading-[0.95] tracking-tight">Don't give parents more work. Help them do the important work, consistently.</h2>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
          {[
            {name:"BASIC", price:"₦6,000", period:"/mo", tag:"Self-guided", popular:false, features:["Daily WhatsApp reminders 7:30pm", "H,R,C one-tap reporting", "Weekly scorecard + streaks", "Mon-Sun connection prompts", "Sunday PDF report"], cta:"Start Basic"},
            {name:"PLUS", price:"₦12,000", period:"/mo", tag:"Most popular", popular:true, features:["Everything in Basic, plus:", "Amber/Red coach check-ins", "Personal outreach when <60%", "Trees & Pillars values integration", "Monthly 1:1 15-min coach call", "Family rhythm planning (Week 4)", "Priority WhatsApp support"], cta:"Start 30-Day Challenge"},
            {name:"School License", price:"Custom", period:"", tag:"For schools", popular:false, features:["For 50-500 families", "School dashboard + aggregate data", "PTA onboarding workshop", "Teacher insights (no shaming)", "Branded reports with school logo", "Trees & Pillars full integration"], cta:"Talk to us"},
          ].map(p=>(
            <div key={p.name} className={`relative rounded-[28px] p-7 border flex flex-col ${p.popular ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] scale-[1.02]' : 'bg-white border-black/10'}`}>
              {p.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FF6B6B] text-white text-[10px] font-bold tracking-widest">MOST POPULAR • PLUS</div>}
              <div className="flex items-center justify-between">
                <div className="font-extrabold tracking-widest text-[12px]">{p.name}</div>
                <div className={`text-[10px] px-2 py-1 rounded-full font-bold ${p.popular ? 'bg-white/15 text-white' : 'bg-black/5'}`}>{p.tag}</div>
              </div>
              <div className="mt-5 flex items-baseline gap-1">
                <div className="text-[34px] font-extrabold tracking-tight">{p.price}</div>
                <div className={`text-[14px] ${p.popular ? 'text-white/60' : 'text-black/50'}`}>{p.period}</div>
              </div>
              <div className={`mt-6 space-y-3 text-[13px] leading-[1.4] ${p.popular ? 'text-white/80' : 'text-black/70'}`}>
                {p.features.map(f=>(
                  <div key={f} className="flex gap-2.5"><div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.popular ? 'bg-white/15' : 'bg-black/5'}`}><Check size={12}/></div><span>{f}</span></div>
                ))}
              </div>
              <button onClick={()=>triggerToast(`${p.name} enrollment — pilot pricing locked`)} className={`mt-8 h-12 rounded-full font-bold text-[13px] transition ${p.popular ? 'bg-white text-[#0F172A] hover:bg-white/90' : 'bg-[#0F172A] text-white hover:bg-black'}`}>{p.cta}</button>
              {p.popular && <div className="mt-3 text-center text-[11px] text-white/60">30-day reset included • Cancel anytime</div>}
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-[1080px] mx-auto grid md:grid-cols-3 gap-3 text-[11px]">
          <div className="rounded-2xl bg-white border border-black/10 p-4 flex gap-2.5"><Shield size={16} className="flex-shrink-0 mt-0.5"/> <span><b>No app to download.</b> Works on any phone with WhatsApp. Data-light, works on low bandwidth.</span></div>
          <div className="rounded-2xl bg-white border border-black/10 p-4 flex gap-2.5"><Heart size={16} className="flex-shrink-0 mt-0.5"/> <span><b>Built for busy parents.</b> 30 seconds/night. Not another course. Just small actions that stick.</span></div>
          <div className="rounded-2xl bg-white border border-black/10 p-4 flex gap-2.5"><Sprout size={16} className="flex-shrink-0 mt-0.5"/> <span><b>Trees & Pillars integrated.</b> Character & values zone uses your school’s virtues — not generic content.</span></div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <footer className="px-6 py-20 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,107,107,0.18),transparent_60%)]" />
        <div className="max-w-[1280px] mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold tracking-widest">PROJECT CONNECT • TREES & PILLARS VALUES ACADEMY</div>
          <h2 className="mt-6 text-[30px] md:text-[52px] font-extrabold leading-[0.9] tracking-tight max-w-[800px] mx-auto">
            Don't give parents more work.<br/>Help them consistently do the <span className="text-[#FF6B6B]">important work.</span>
          </h2>
          <p className="mt-6 text-[15px] text-white/60 max-w-[520px] mx-auto leading-[1.6]">WhatsApp-based. No app. 30 seconds a night. Real coach when you slip. Built in Lagos, for Lagos families — and every parent who knows consistency is love.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={()=>triggerToast("Challenge starts Monday — early access secured")} className="h-14 px-8 rounded-full bg-white text-[#0F172A] font-bold text-[15px] flex items-center gap-2 hover:bg-white/90 transition">
              Join 30-Day Challenge <ArrowRight size={18}/>
            </button>
            <button onClick={()=>scrollTo("demo")} className="h-14 px-8 rounded-full bg-white/10 border border-white/20 font-semibold text-[15px] hover:bg-white/15 transition">See Live Demo Again</button>
          </div>

          <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 text-[12px] font-semibold">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"/> Live pilot running for {liveNumber} • Ready to connect real API
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 text-left">
            <div>
              <div className="flex items-center gap-2 font-extrabold tracking-tight"><div className="w-8 h-8 rounded-xl bg-white text-[#0F172A] flex items-center justify-center text-[11px]">PC</div> PROJECT CONNECT</div>
              <div className="mt-3 text-[12px] text-white/50 leading-[1.6]">A Parent Accountability & Connection Program. Small actions. Consistent parents. Stronger children. Pilot in Lagos • Powered by Trees & Pillars Values Academy.</div>
            </div>
            {[
              {h:"Product", l:["How it works","6 Zones","Live demo","Scorecard","30-day timeline"]},
              {h:"Support", l:["Coaching layer","Pricing","School license","WhatsApp help"]},
              {h:"Values", l:["Trees & Pillars integration","Character & Values zone","Privacy • No shaming","Contact"]},
            ].map(col=>(
              <div key={col.h}>
                <div className="font-bold text-[11px] tracking-widest text-white/40">{col.h}</div>
                <div className="mt-3 space-y-2">
                  {col.l.map(i=><div key={i} className="text-[12px] text-white/60 hover:text-white cursor-pointer transition">{i}</div>)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-between gap-4 text-[11px] text-white/30">
            <div>© 2025 Project Connect • Parent Accountability Program • Lagos, Nigeria</div>
            <div className="flex gap-4"><span>Terms</span><span>Privacy</span><span>Built with ❤️ for consistent parents</span></div>
          </div>
        </div>
      </footer>

      {/* ADD PARENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setShowAddModal(false)}/>
          <div className="relative bg-white rounded-[24px] w-full max-w-[420px] p-7 shadow-2xl animate-[slideDown_0.25s_ease]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center"><Plus size={18}/></div>
                <div>
                  <div className="font-bold text-[16px] leading-none">Add New Parent</div>
                  <div className="text-[11px] text-black/50 mt-1">Add to Lagos pilot roster</div>
                </div>
              </div>
              <button onClick={()=>setShowAddModal(false)} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"><X size={14}/></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-black/40 mb-2">PARENT / FAMILY NAME</div>
                <input value={newParentName} onChange={e=>setNewParentName(e.target.value)} placeholder="e.g. Emeka's Family" className="w-full h-12 px-4 rounded-full bg-[#FFFBF5] border border-black/10 text-[14px] focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"/>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-widest text-black/40 mb-2">WHATSAPP NUMBER</div>
                <input value={newParentNumber} onChange={e=>setNewParentNumber(e.target.value)} placeholder="+234..." className="w-full h-12 px-4 rounded-full bg-[#FFFBF5] border border-black/10 text-[14px] font-mono focus:outline-none focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10"/>
                <div className="mt-2 text-[11px] text-black/40">Must be WhatsApp-enabled • International format</div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={()=>setShowAddModal(false)} className="flex-1 h-11 rounded-full bg-black/5 font-semibold text-[13px] hover:bg-black/10 transition">Cancel</button>
                <button onClick={handleAddParent} className="flex-1 h-11 rounded-full bg-[#0F172A] text-white font-bold text-[13px] hover:bg-black transition flex items-center justify-center gap-2"><Plus size={14}/> Add to Pilot</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
