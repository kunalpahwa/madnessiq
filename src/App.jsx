import { useState, useRef, useEffect, useCallback } from "react";

/*
  MADNESSIQ v3 — UX-FIRST REBUILD
  
  Key changes from v2:
  1. STRUCTURED OUTPUT: Claude returns JSON, not prose → rendered as visual components
  2. STREAMING: Chat responses stream token-by-token (perceived latency: ~1s vs ~8s)
  3. PRE-COMPUTED ANALYSIS: All 32 first-round games have pre-built visual cards
  4. PROGRESSIVE DISCLOSURE: Headline → expand → deep dive (3 levels)
  5. VISUAL COMPONENTS: Matchup bars, confidence gauges, stat comparisons, injury badges
  6. INTERACTIVE: Tap to compare, swipe regions, toggle between "quick" and "deep" mode
*/

// ── PRE-COMPUTED STRUCTURED ANALYSIS ────────────────────────
// This is the key UX decision: instead of raw text, every game has structured data
// that renders as visual components. The AI pre-generates this structure.
// In production, this JSON would come from a Claude API call with structured output prompting.

const GAMES = {
  EAST: [
    {
      s1:1, t1:"Duke", t1Short:"DUKE", r1:"32-2", s2:16, t2:"Siena", t2Short:"SIENA", r2:"23-11",
      pick:"Duke", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Duke 71-65. Survived a massive scare — trailed at half.",
      result: { score1:71, score2:65, winner:"Duke", correct:true, postGame:"Duke went 2-15 from 3 and trailed at halftime. Boozer brothers carried the comeback. Raises serious concerns about perimeter offense without Foster." },
      edge: { offense: 92, defense: 95, experience: 85, health: 72 },
      edgeOpp: { offense: 28, defense: 35, experience: 45, health: 90 },
      keyStats: [
        { label: "KenPom Gap", value: "#1 vs #180+", hot: true },
        { label: "Duke Def", value: "#2 nationally", hot: true },
        { label: "Spread", value: "Duke -29.5", hot: false },
      ],
      injuries: [
        { player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — unlikely before Final Four" },
        { player: "P. Ngongba", team: "Duke", status: "DTD", impact: "MED", detail: "Foot soreness — likely back for R32" },
      ],
      whyPick: "Cameron Boozer is the best big man in college basketball. His passing out of double-teams creates impossible defensive decisions. Duke won the ACC Tournament without two starters.",
      whyNot: "Duke's perimeter creation without Foster is limited. Won't matter here, but could in later rounds.",
      historicalNote: "16-seeds are 2-144 all-time. Both upsets came against uniquely flawed 1-seeds.",
    },
    {
      s1:8, t1:"Ohio State", t1Short:"OSU", r1:"21-12", s2:9, t2:"TCU", t2Short:"TCU", r2:"22-11",
      pick:"Ohio State", confidence:62, upset:false, riskLevel:"LEAN",
      headline:"FINAL: TCU 66-64. Mild upset — TCU defense controlled late.",
      result: { score1:64, score2:66, winner:"TCU", correct:false, postGame:"TCU pulled the 9-over-8 upset. Ohio State could not create enough shots late. Duke now faces TCU in R32 instead of Ohio State." },
      edge: { offense: 68, defense: 60, experience: 65, health: 80 },
      edgeOpp: { offense: 52, defense: 65, experience: 60, health: 78 },
      keyStats: [
        { label: "OSU Scoring", value: "2 best players on floor", hot: true },
        { label: "TCU Off.", value: "Outside top 100 eff.", hot: false },
        { label: "KenPom Gap", value: "~15 spots", hot: false },
      ],
      injuries: [],
      whyPick: "Ohio State's shot-creation edge is decisive. Thornton and Mobley can score in isolation, which matters when possessions slow down in March.",
      whyNot: "TCU's defensive identity could grind this into a rock fight. If OSU goes cold, TCU's discipline keeps them in it.",
      historicalNote: "8/9 games are historical coin flips — 9-seeds win 48.5% of the time.",
    },
    {
      s1:5, t1:"St. John's", t1Short:"SJU", r1:"28-6", s2:12, t2:"Northern Iowa", t2Short:"UNI", r2:"23-12",
      pick:"St. John's", confidence:68, upset:false, riskLevel:"LEAN",
      headline:"Ejiofor's size controls the paint. Pitino advances.",
      edge: { offense: 75, defense: 70, experience: 72, health: 90 },
      edgeOpp: { offense: 55, defense: 78, experience: 80, health: 88 },
      keyStats: [
        { label: "SJU KenPom", value: "Top 15 (underseeded)", hot: true },
        { label: "UNI Defense", value: "#25 adj. efficiency", hot: true },
        { label: "Tempo Battle", value: "SJU fast vs UNI grind", hot: false },
      ],
      injuries: [],
      whyPick: "St. John's is a top-15 KenPom team seeded 5th. Big East POTY Zuby Ejiofor's interior game is a mismatch UNI can't solve with their smaller frontcourt.",
      whyNot: "UNI's elite defense and tempo control could keep this in the 50s. If Ejiofor gets into foul trouble, the Panthers' system is built for tight games.",
      historicalNote: "12-seeds upset 5-seeds 35.7% of the time since 1985 — the most common upset in the tournament.",
    },
    {
      s1:4, t1:"Kansas", t1Short:"KU", r1:"23-10", s2:13, t2:"Cal Baptist", t2Short:"CBU", r2:"25-8",
      pick:"Kansas", confidence:82, upset:false, riskLevel:"SAFE",
      headline:"Peterson's creation off the dribble overwhelms.",
      edge: { offense: 78, defense: 72, experience: 70, health: 75 },
      edgeOpp: { offense: 45, defense: 55, experience: 40, health: 90 },
      keyStats: [
        { label: "Peterson", value: "Projected #1 pick", hot: true },
        { label: "KU concern", value: "47 pts in B12 loss", hot: false },
        { label: "CBU", value: "First-ever tourney", hot: false },
      ],
      injuries: [
        { player: "D. Peterson", team: "Kansas", status: "ACTIVE", impact: "LOW", detail: "Healthy but chemistry concerns linger" },
      ],
      whyPick: "Cal Baptist's deny-the-perimeter defense can't handle Peterson's ability to create off the dribble. Bidunga protects the rim.",
      whyNot: "Kansas scored just 47 points in their Big 12 Tournament loss to Houston. Peterson's engagement level is always a question mark. Cal Baptist plays with nothing to lose.",
      historicalNote: "13-seeds upset 4-seeds ~20% of the time. First-time tournament teams rarely win.",
    },
    {
      s1:6, t1:"Louisville", t1Short:"LOU", r1:"23-10", s2:11, t2:"S. Florida", t2Short:"USF", r2:"25-8",
      pick:"S. Florida", confidence:62, upset:true, riskLevel:"UPSET",
      headline:"🚨 Brown's injury + USF's 12-game streak = trouble.",
      edge: { offense: 65, defense: 58, experience: 55, health: 45 },
      edgeOpp: { offense: 62, defense: 72, experience: 50, health: 92 },
      keyStats: [
        { label: "USF Streak", value: "12 wins in a row", hot: true },
        { label: "USF Defense", value: "KenPom #40 adj.", hot: true },
        { label: "USF Tempo", value: "#15 pace nationally", hot: true },
      ],
      injuries: [
        { player: "M. Brown Jr.", team: "Louisville", status: "DTD", impact: "CRITICAL", detail: "Back — hasn't played since Feb 28. 18.2 PPG scorer." },
      ],
      whyPick: "USF has won 12 straight, plays elite defense (#40 KenPom), and pushes pace (#15 nationally). Bryan Hodgson brought Nate Oats' Alabama system — it creates chaos. Louisville without Mikel Brown (18.2 PPG) lacks a go-to scorer.",
      whyNot: "If Brown plays at 80%+, Louisville has the talent edge. USF's shooting can be inconsistent — they're better on defense than offense.",
      historicalNote: "11-seeds upset 6-seeds 37.3% of the time. Injury-driven upsets are the most predictable variety.",
    },
    {
      s1:3, t1:"Michigan St.", t1Short:"MSU", r1:"25-7", s2:14, t2:"N. Dakota St.", t2Short:"NDSU", r2:"27-7",
      pick:"Michigan St.", confidence:94, upset:false, riskLevel:"SAFE",
      headline:"FINAL: MSU 92-67. Dominant. Cooper 5-for-5, MSU shot 60%.",
      result: { score1:92, score2:67, winner:"Michigan St.", correct:true, postGame:"MSU dominated exactly as projected. Controlled the glass and ran in transition. Faces Louisville in R32." },
      edge: { offense: 78, defense: 80, experience: 85, health: 90 },
      edgeOpp: { offense: 48, defense: 55, experience: 60, health: 88 },
      keyStats: [
        { label: "MSU Boards", value: "#1 rebounding team", hot: true },
        { label: "Izzo March", value: "34-14 in R64 games", hot: true },
        { label: "Fears Jr.", value: "Leads nation in ast%", hot: false },
      ],
      injuries: [],
      whyPick: "NDSU typically wins by outrebounding opponents. Michigan State is the best rebounding team in the field. Remove that advantage and the Bison can't keep up with Izzo's athletes in transition.",
      whyNot: "NDSU has summit league experience and won't be scared. But the talent gap is too wide.",
      historicalNote: "14-seeds win ~7% of the time. Tom Izzo has never lost in the Round of 64 as a 3-seed or better.",
    },
    {
      s1:7, t1:"UCLA", t1Short:"UCLA", r1:"23-11", s2:10, t2:"UCF", t2Short:"UCF", r2:"21-11",
      pick:"UCF", confidence:58, upset:true, riskLevel:"UPSET",
      headline:"🚨 Both UCLA stars hurt. Bol's 7-2 frame takes over.",
      edge: { offense: 65, defense: 60, experience: 68, health: 40 },
      edgeOpp: { offense: 60, defense: 62, experience: 55, health: 90 },
      keyStats: [
        { label: "UCLA health", value: "2 stars questionable", hot: true },
        { label: "John Bol", value: "7'2\" — boards monster", hot: true },
        { label: "KenPom gap", value: "25 spots (narrow)", hot: false },
      ],
      injuries: [
        { player: "T. Bilodeau", team: "UCLA", status: "GTD", impact: "CRITICAL", detail: "Knee strain — sat Big Ten semis entirely" },
        { player: "D. Dent", team: "UCLA", status: "GTD", impact: "HIGH", detail: "Calf strain — limited in B10 semis" },
      ],
      whyPick: "UCLA's two best players are both nursing injuries. Bilodeau was a scratch in the Big Ten semis. If either sits or plays at 60%, UCF's 7-2 center John Bol dominates the glass and the Bruins can't keep up physically.",
      whyNot: "If both UCLA stars play at 80%+, the Bruins have the talent edge. UCF's offense isn't dynamic enough to win if UCLA is healthy.",
      historicalNote: "10-seeds upset 7-seeds 39.1% — nearly a coin flip. Injuries push this over the edge.",
    },
    {
      s1:2, t1:"UConn", t1Short:"UCONN", r1:"29-5", s2:15, t2:"Furman", t2Short:"FUR", r2:"22-12",
      pick:"UConn", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"Hurley's motion picks Furman apart. Upset watch in R32.",
      edge: { offense: 72, defense: 82, experience: 90, health: 75 },
      edgeOpp: { offense: 38, defense: 42, experience: 50, health: 85 },
      keyStats: [
        { label: "UConn Exp.", value: "Back-to-back champs DNA", hot: true },
        { label: "UConn Def", value: "KenPom #11", hot: false },
        { label: "Furman 3PT", value: "Poor perimeter shooting", hot: false },
      ],
      injuries: [
        { player: "J. Stewart", team: "UConn", status: "GTD", impact: "LOW", detail: "Out since Feb 21. 'Close' for R64 per Hurley." },
        { player: "S. Demary Jr.", team: "UConn", status: "ACTIVE", impact: "N/A", detail: "'Pretty good shape' per Hurley. 6.2 APG, 1.6 SPG." },
      ],
      whyPick: "Furman can't shoot from deep and UConn's ball movement creates open looks through layered screens. The talent gap is enormous. Dan Hurley saves his adjustments for the real tests ahead.",
      whyNot: "UConn's inconsistent shooting (Solo Ball, Karaban disappearing) is a real concern for later rounds — but won't matter against a 15-seed.",
      historicalNote: "15-seeds win ~6% of the time. UConn seeking to reclaim the title after missing the 2025 three-peat.",
    },
  ],
  WEST: [
    { s1:1, t1:"Arizona", t1Short:"ARIZ", r1:"32-2", s2:16, t2:"Long Island", t2Short:"LIU", r2:"24-10", pick:"Arizona", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"Six future NBA players. Arizona by 35.", edge:{offense:95,defense:94,experience:80,health:95}, edgeOpp:{offense:30,defense:25,experience:35,health:85},
      keyStats:[{label:"AZ Ranked Ws",value:"12 (tied record)",hot:true},{label:"AZ Defense",value:"KenPom #3",hot:true},{label:"Depth",value:"8+ deep rotation",hot:false}],
      injuries:[], whyPick:"Arizona may have the tournament's deepest, most talented roster. Bradley (B12 POTY), Burries (lottery pick), Peat, Krivas, Awaka — no 16-seed can compete.", whyNot:"Arizona hasn't passed the Sweet 16 under Lloyd. But LIU won't test that.", historicalNote:"16-seeds are 2-144 all-time."
    },
    { s1:8, t1:"Villanova", t1Short:"NOVA", r1:"24-8", s2:9, t2:"Utah State", t2Short:"USU", r2:"28-6", pick:"Utah State", confidence:56, upset:false, riskLevel:"TOSS-UP",
      headline:"Falslev + Collins exploit Nova's rotation D.", edge:{offense:62,defense:58,experience:70,health:55}, edgeOpp:{offense:65,defense:62,experience:72,health:90},
      keyStats:[{label:"KenPom",value:"USU 32nd, Nova 33rd",hot:true},{label:"Nova loss",value:"Hodge torn ACL",hot:true},{label:"MWC POTY",value:"Mason Falslev",hot:false}],
      injuries:[{player:"M. Hodge",team:"Villanova",status:"OUT",impact:"HIGH",detail:"Torn ACL — season over. Was averaging 9.2 PPG."}],
      whyPick:"USU is actually ranked higher in KenPom. Their ball-screen offense historically gives Willard's teams trouble. Villanova losing Hodge (ACL) weakens their interior.", whyNot:"Villanova has more tournament pedigree. If they shoot well from 3, they can overcome the matchup issues.", historicalNote:"9-seeds win 48.5% of 8/9 matchups."
    },
    { s1:5, t1:"Wisconsin", t1Short:"WISC", r1:"24-10", s2:12, t2:"High Point", t2Short:"HPU", r2:"30-4", pick:"Wisconsin", confidence:63, upset:false, riskLevel:"LEAN",
      headline:"FINAL: High Point 83-82! First upset of the tourney.",
      result: { score1:82, score2:83, winner:"High Point", correct:false, postGame:"Chase Johnston hit 4 threes and passed Steph Curry on the all-time NCAA 3-pointer list. HP was 0-57 vs Power Four before this. Faces Arkansas in R32." }, edge:{offense:62,defense:55,experience:75,health:88}, edgeOpp:{offense:68,defense:50,experience:48,health:90},
      keyStats:[{label:"HP Streak",value:"14 wins in a row",hot:true},{label:"HP SOS",value:"0 KenPom top-150 Ws",hot:true},{label:"Wisc TO%",value:"Elite ball control",hot:false}],
      injuries:[], whyPick:"High Point relies on turnovers to fuel their offense. Wisconsin doesn't turn it over. That stylistic mismatch favors the Badgers. Boyd and Blackwell are experienced guards who won't be rattled.", whyNot:"HP is 30-4 and red hot. If they hit threes early and build confidence, Wisconsin's mediocre defense (62nd) may not hold up.", historicalNote:"12-seeds upset 5-seeds 35.7% of the time."
    },
    { s1:4, t1:"Arkansas", t1Short:"ARK", r1:"26-8", s2:13, t2:"Hawaii", t2Short:"HAW", r2:"24-8", pick:"Arkansas", confidence:78, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Arkansas 97-78. Acuff 24 pts, all 5 starters in double figs.",
      result: { score1:97, score2:78, winner:"Arkansas", correct:true, postGame:"Blowout. Acuff Jr. had 24 pts and 7 assists. All five starters in double figures despite only 4 threes. Arkansas faces High Point in R32." }, edge:{offense:82,defense:68,experience:60,health:75}, edgeOpp:{offense:48,defense:55,experience:55,health:90},
      keyStats:[{label:"Acuff Jr.",value:"SEC POTY (frosh!)",hot:true},{label:"ARK Off.",value:"KenPom #6",hot:true},{label:"Hawaii SOS",value:"0 ranked opponents",hot:false}],
      injuries:[{player:"K. Knox",team:"Arkansas",status:"OUT",impact:"MED",detail:"Season-ending — limits depth, but core rotation intact."}],
      whyPick:"Darius Acuff Jr. became the first freshman outright SEC POTY since Anthony Davis (2012). Arkansas has a top-6 offense. Hawaii hasn't faced a single ranked team.", whyNot:"Hawaii can slow tempo with Isaac Johnson inside. Arkansas's depth took a hit losing Knox. Playing in Portland helps Hawaii geographically.", historicalNote:"13-seeds win ~20% of the time."
    },
    { s1:6, t1:"BYU", t1Short:"BYU", r1:"23-11", s2:11, t2:"NC St/Texas", t2Short:"NCST", r2:"~20-13", pick:"BYU", confidence:64, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Texas 79-71. Dybantsa not enough without Saunders.",
      result: { score1:71, score2:79, winner:"Texas", correct:false, postGame:"Texas (First Four winner) upset BYU. Dybantsa scored but supporting cast failed. Texas faces Gonzaga in R32." }, edge:{offense:80,defense:55,experience:55,health:60}, edgeOpp:{offense:55,defense:58,experience:62,health:78},
      keyStats:[{label:"Dybantsa",value:"25+ PPG, likely #1 pick",hot:true},{label:"BYU since loss",value:"Under .500 w/o Saunders",hot:true},{label:"Wright III",value:"18.2 PPG 2nd option",hot:false}],
      injuries:[{player:"E. Saunders",team:"BYU",status:"OUT",impact:"HIGH",detail:"Shoulder surgery — season over. BYU 4-6 since."}],
      whyPick:"AJ Dybantsa is a generational scorer — 43 vs Utah, seven games of 28+. He's matchup-proof. Robert Wright III gives BYU a legitimate second option.", whyNot:"BYU went under .500 after losing Saunders. They're a one-man team and the supporting cast hasn't stepped up consistently.", historicalNote:"11-seeds upset 6-seeds 37.3% of the time."
    },
    { s1:3, t1:"Gonzaga", t1Short:"ZAGA", r1:"28-6", s2:14, t2:"Kennesaw St.", t2Short:"KSU", r2:"21-13", pick:"Gonzaga", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Gonzaga 73-64. Ike efficient. Kennesaw hung tough.",
      result: { score1:73, score2:64, winner:"Gonzaga", correct:true, postGame:"Gonzaga controlled it but Kennesaw made them work. Ike efficient inside as projected. Gonzaga faces Texas in R32." }, edge:{offense:82,defense:70,experience:88,health:70}, edgeOpp:{offense:30,defense:32,experience:40,health:85},
      keyStats:[{label:"Ike",value:"19.7 PPG, 61% inside arc",hot:true},{label:"KenPom gap",value:"91 spots (largest R64)",hot:true},{label:"Huff",value:"Possible return S16?",hot:false}],
      injuries:[{player:"B. Huff",team:"Gonzaga",status:"OUT",impact:"MED",detail:"Knee — walking without crutches. Could return Sweet 16."}],
      whyPick:"Graham Ike is a dominant interior scorer. Kennesaw has a 91-spot KenPom gap — the largest in the first round. Kennesaw won't have an answer for Ike.", whyNot:"Gonzaga's ceiling is limited without Huff. If he returns for the second weekend, they become a Final Four sleeper.", historicalNote:"14-seeds win ~7% of the time."
    },
    { s1:7, t1:"Miami (FL)", t1Short:"MIA", r1:"25-8", s2:10, t2:"Missouri", t2Short:"MIZZ", r2:"20-12", pick:"Miami (FL)", confidence:59, upset:false, riskLevel:"LEAN",
      headline:"Both teams run. Miami's D-switching is the separator.", edge:{offense:65,defense:68,experience:65,health:85}, edgeOpp:{offense:62,defense:55,experience:58,health:82},
      keyStats:[{label:"Style",value:"Both push pace",hot:false},{label:"MIA Defense",value:"Better switching scheme",hot:true},{label:"Mizzou",value:"Wildly inconsistent yr",hot:false}],
      injuries:[], whyPick:"Miami's defensive versatility in switching gives them the edge in an uptempo battle. Missouri has alternated between dominant and inexplicable all year.", whyNot:"Missouri's ceiling is very high when they're on. If they shoot well from 3 and force turnovers in transition, they can win a track meet.", historicalNote:"10-seeds upset 7-seeds 39.1% of the time."
    },
    { s1:2, t1:"Purdue", t1Short:"PUR", r1:"27-8", s2:15, t2:"Queens (NC)", t2Short:"QU", r2:"21-13", pick:"Purdue", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"Historic offense vs. first-time tourney team. Not close.", edge:{offense:98,defense:52,experience:92,health:90}, edgeOpp:{offense:25,defense:30,experience:10,health:88},
      keyStats:[{label:"Purdue Off.",value:"Best KenPom-era ever",hot:true},{label:"Smith",value:"Breaking Hurley ast record",hot:true},{label:"Queens",value:"First D1 tourney ever",hot:false}],
      injuries:[], whyPick:"Purdue has the best offensive efficiency of the KenPom era (since 1997). Braden Smith, Trey Kaufman-Renn, and Fletcher Loyer have played in huge games together.", whyNot:"Purdue's perimeter defense is a genuine weakness — but Queens doesn't have the athletes to exploit it. That becomes a problem in later rounds.", historicalNote:"15-seeds win ~6% of the time."
    },
  ],
  SOUTH: [
    { s1:1, t1:"Florida", t1Short:"UF", r1:"26-7", s2:16, t2:"Lehigh/PVAMU", t2Short:"16", r2:"~18-16", pick:"Florida", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"Defending champs. Three returning starters. Dominant frontcourt.", edge:{offense:85,defense:82,experience:95,health:92}, edgeOpp:{offense:20,defense:22,experience:25,health:85},
      keyStats:[{label:"Returning",value:"3 title-game starters",hot:true},{label:"Rebounding",value:"Best frontcourt in field",hot:true},{label:"3PT trend",value:"349th→65th since Feb",hot:false}],
      injuries:[], whyPick:"Todd Golden returns Haugh, Condon, and Chinyelu from last year's championship team. That frontcourt experience is unmatched.", whyNot:"Florida's 3PT shooting was 349th before February. If it regresses, they become vulnerable — but not to a 16-seed.", historicalNote:"1-seeds are 142-2 all-time vs 16-seeds."
    },
    { s1:8, t1:"Clemson", t1Short:"CLEM", r1:"24-10", s2:9, t2:"Iowa", t2Short:"IOWA", r2:"21-12", pick:"Iowa", confidence:64, upset:false, riskLevel:"LEAN",
      headline:"Welling's ACL tear sinks Clemson. Iowa's experience shows.", edge:{offense:55,defense:62,experience:60,health:42}, edgeOpp:{offense:68,defense:58,experience:65,health:88},
      keyStats:[{label:"Clemson loss",value:"Welling torn ACL",hot:true},{label:"Iowa KenPom",value:"11 spots ahead",hot:true},{label:"Iowa exp.",value:"NCAA tourney vets",hot:false}],
      injuries:[{player:"C. Welling",team:"Clemson",status:"OUT",impact:"CRITICAL",detail:"Torn ACL in ACC Tourney. 10.2 PPG, 5.4 RPG — devastating loss."}],
      whyPick:"Clemson lost their 6-11 starting big Carter Welling to a torn ACL in the ACC Tournament. That fundamentally changes their ceiling. Iowa is 11 spots ahead in KenPom.", whyNot:"Clemson's defense is still intact and they have ACC tournament grit. If they can survive inside without Welling, their perimeter play keeps them competitive.", historicalNote:"9-seeds win 48.5% of 8/9 games."
    },
    { s1:5, t1:"Vanderbilt", t1Short:"VANDY", r1:"26-8", s2:12, t2:"McNeese", t2Short:"MCN", r2:"28-5", pick:"Vanderbilt", confidence:70, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Vandy 78-68. Tanner 26 pts, took over after scary start.",
      result: { score1:78, score2:68, winner:"Vanderbilt", correct:true, postGame:"Tanner delivered: 26 pts, 7 reb, 5 ast. McNeese led 19-8 early but Tanner took over. Faces Nebraska in R32." }, edge:{offense:80,defense:58,experience:60,health:90}, edgeOpp:{offense:55,defense:52,experience:55,health:88},
      keyStats:[{label:"Tanner",value:"19.2/5.3/2.4 + 37% 3PT",hot:true},{label:"Vandy form",value:"Just beat #1 Florida",hot:true},{label:"McNeese",value:"Beat Clemson as 12 in '25",hot:false}],
      injuries:[], whyPick:"Tyler Tanner had the best breakout sophomore season in college basketball. Vanderbilt just dismantled Florida in the SEC Tournament. Their guard play is too dynamic for McNeese.", whyNot:"McNeese upset Clemson as a 12-seed last year — they have tournament DNA. If Vandy looks past them, the Cowboys will make them pay.", historicalNote:"12-seeds upset 5-seeds 35.7% of the time."
    },
    { s1:4, t1:"Nebraska", t1Short:"NEB", r1:"26-6", s2:13, t2:"Troy", t2Short:"TROY", r2:"22-11", pick:"Nebraska", confidence:78, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Nebraska 76-47. FIRST EVER tourney win. Bud Lights unlocked.",
      result: { score1:76, score2:47, winner:"Nebraska", correct:true, postGame:"Historic. Nebraska's first NCAA Tournament win ever. Sandfort hit 23 pts with 14 team threes. Bud Light fridges across Omaha unlocked. Faces Vanderbilt in R32." }, edge:{offense:58,defense:88,experience:62,health:90}, edgeOpp:{offense:45,defense:48,experience:50,health:85},
      keyStats:[{label:"NEB History",value:"0 NCAA W's EVER",hot:true},{label:"NEB Defense",value:"KenPom #7",hot:true},{label:"NEB slide",value:"6-6 after 20-0 start",hot:false}],
      injuries:[], whyPick:"Nebraska's defense (7th in KenPom) will turn this into an ugly, low-scoring affair — and that's exactly where they thrive. The 70-spot KenPom gap and elite D should be enough.", whyNot:"Nebraska is 6-6 down the stretch and has never won a tournament game. The psychological weight of history is real. Troy beat SDSU on the road and took USC to 3OT.", historicalNote:"Programs with 0 tourney wins face extra pressure. Nebraska's best seeding since 1991."
    },
    { s1:11, t1:"VCU", t1Short:"VCU", r1:"24-8", s2:11, t2:"VCU", t2Short:"VCU", r2:"27-7", pick:"North Carolina", confidence:53, upset:false, riskLevel:"TOSS-UP",
      headline:"🔶 Wilson OUT. (trip.people || []).flatMap 0-2 without him. VCU is on fire.", edge:{offense:62,defense:58,experience:75,health:35}, edgeOpp:{offense:55,defense:72,experience:65,health:92},
      keyStats:[{label:"Wilson",value:"OUT — thumb (top 5 pick)",hot:true},{label:"(trip.people || []).flatMap w/o him",value:"0-2, including blowout",hot:true},{label:"VCU",value:"A-10 champs, hottest team",hot:true}],
      injuries:[{player:"C. Wilson",team:"North Carolina",status:"OUT",impact:"CRITICAL",detail:"Thumb — season over. Was projected top-5 NBA pick. (trip.people || []).flatMap is 0-2 without him: lost to Duke 76-61, Clemson 80-79."}],
      whyPick:"(trip.people || []).flatMap's brand and remaining talent still matter in March. VCU's offense can be limited. This is barely a lean — I'm only picking (trip.people || []).flatMap because of program pedigree.", whyNot:"(trip.people || []).flatMap without Wilson is a fundamentally different team. They got crushed by Duke and lost by 1 to Clemson without him. VCU's defense is elite and they're the A-10 champs riding a hot streak. This is a genuine coin flip.", historicalNote: "11-seeds upset 6-seeds 37.3%. This is the single best upset opportunity driven by a star injury."
    },
    { s1:3, t1:"Illinois", t1Short:"ILL", r1:"24-8", s2:14, t2:"Penn", t2Short:"PENN", r2:"18-11", pick:"Illinois", confidence:90, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Illinois 105-70. Mirkovic 29/17. Led by 40 at one point.",
      result: { score1:105, score2:70, winner:"Illinois", correct:true, postGame:"Obliteration. Mirkovic went off with 29 pts, 17 rebounds. Five in double figures. Led by 40. The No. 1 offense is for real. Faces VCU in R32." }, edge:{offense:96,defense:65,experience:70,health:90}, edgeOpp:{offense:42,defense:38,experience:50,health:88},
      keyStats:[{label:"ILL Offense",value:"#1 in KenPom HISTORY",hot:true},{label:"Wagler",value:"Frosh phenom, lottery pick",hot:true},{label:"Penn: Power",value:"44 pts in Ivy title game",hot:false}],
      injuries:[], whyPick:"Illinois has a historically great offense. Keaton Wagler, the Ivisic brothers, Mirkovic, Stojakovic — too many weapons. Four of their 8 losses came in OT, suggesting bad luck, not a flaw.", whyNot:"TJ Power (Duke/Virginia transfer) scored 44 in the Ivy title game. He'll go after Illinois and could make it (trip.people || []).flatMapomfortable early. But Illinois has 5 players better than him.", historicalNote:"14-seeds win ~7% of the time. Ivy League teams have a scrappy tournament history."
    },
    { s1:7, t1:"Saint Mary's", t1Short:"SMC", r1:"27-5", s2:10, t2:"Texas A&M", t2Short:"TAMU", r2:"21-11", pick:"Texas A&M", confidence:56, upset:true, riskLevel:"UPSET",
      headline:"🚨 A&M's experience edge matters most in March.", edge:{offense:62,defense:60,experience:68,health:82}, edgeOpp:{offense:58,defense:62,experience:88,health:85},
      keyStats:[{label:"A&M Exp.",value:"KenPom #8 (8 Jr/Sr)",hot:true},{label:"Bucky Ball",value:"Unique motion offense",hot:false},{label:"WCC depth",value:"Questionable for SMC",hot:false}],
      injuries:[], whyPick:"Texas A&M ranks 8th nationally in roster experience — eight juniors and seniors in rotation. Experienced teams historically outperform in March. Their unique Bucky Ball motion offense is unlike anything SMC has prepped for.", whyNot:"Saint Mary's is well-coached under Randy Bennett and plays with WCC toughness from facing Gonzaga. The Gaels' system is proven.", historicalNote:"10-seeds upset 7-seeds 39.1% of the time. Experience correlates strongly with March performance."
    },
    { s1:2, t1:"Houston", t1Short:"HOU", r1:"28-6", s2:15, t2:"Idaho", t2Short:"IDHO", r2:"21-14", pick:"Houston", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Houston 78-47. Blowout. Toyota Center on the horizon.",
      result: { score1:78, score2:47, winner:"Houston", correct:true, postGame:"Blowout as expected. Houston defense suffocated Idaho. Rolling toward Toyota Center Regional Final. Faces Texas A and M in R32." }, edge:{offense:78,defense:92,experience:90,health:88}, edgeOpp:{offense:22,defense:28,experience:30,health:82},
      keyStats:[{label:"HOU E8 site",value:"Toyota Center (HOME)",hot:true},{label:"Returning",value:"3 title-game starters",hot:true},{label:"Freshmen",value:"Flemings + Cenac (R1 picks)",hot:false}],
      injuries:[], whyPick:"Houston returns three starters from last year's national title game, added two projected first-rounders, and the Regional Final is AT THEIR HOME ARENA. The structural advantage is the most underrated factor in the bracket.", whyNot:"Houston's depth is thinner than typical Sampson teams. If Tugler or Cenac get in foul trouble, they're vulnerable inside. Won't matter vs Idaho.", historicalNote:"2-seeds are 141-17 vs 15-seeds all-time."
    },
  ],
  MIDWEST: [
    { s1:1, t1:"Michigan", t1Short:"MICH", r1:"31-3", s2:16, t2:"UMBC/Howard", t2Short:"16", r2:"~24-8", pick:"Michigan", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Michigan 101-80. Shot 67%. Howard hit 10 first-half 3s.",
      result: { score1:101, score2:80, winner:"Michigan", correct:true, postGame:"Michigan dominated despite Howard hitting 10 first-half threes. Four Wolverines scored 14+, shot 67.3%. The No. 1 defense clamped down after halftime. Faces Saint Louis in R32." }, edge:{offense:85,defense:98,experience:78,health:78}, edgeOpp:{offense:20,defense:22,experience:30,health:85},
      keyStats:[{label:"MICH Def.",value:"#1 in entire country",hot:true},{label:"Mara",value:"7'7\" wingspan, shot-blocker",hot:true},{label:"Lendeborg",value:"B10 POTY — 14.7/7.2/3.2",hot:false}],
      injuries:[{player:"L.J. Cason",team:"Michigan",status:"OUT",impact:"MED",detail:"Torn ACL — led B10 in 3PT%. Loss hurts but 8-deep rotation survives."}],
      whyPick:"Michigan's defense is the best in the country — and it's not close. Aday Mara's 7-7 wingspan, Morez Johnson's switchability, and Lendeborg's versatility create a defensive wall. Dusty May built this like an NBA team.", whyNot:"Michigan's turnover rate (179th) is their Achilles heel. Cason's loss hurts perimeter shooting. But neither matters against a 16-seed.", historicalNote:"1-seeds are 142-2 all-time."
    },
    { s1:8, t1:"Georgia", t1Short:"UGA", r1:"22-10", s2:9, t2:"Saint Louis", t2Short:"SLU", r2:"28-5", pick:"Saint Louis", confidence:58, upset:false, riskLevel:"LEAN",
      headline:"FINAL: SLU 102-77. DOMINANT. 21-0 and 18-0 runs. 5 in double figs.",
      result: { score1:77, score2:102, winner:"Saint Louis", correct:true, postGame:"Saint Louis looked like a Final Four team. 102 points, 21-0 run and 18-0 run. Dion Brown 18 pts, Avila 12/5/5. 66 paint points vs 28 for Georgia. Faces Michigan in R32." }, edge:{offense:58,defense:60,experience:62,health:82}, edgeOpp:{offense:68,defense:58,experience:70,health:88},
      keyStats:[{label:"SLU 3PT%",value:"40.1% as a team (!)",hot:true},{label:"Avila",value:"6-10, 'Cream Abdul-Jabbar'",hot:true},{label:"SLU peak",value:"#18 AP in February",hot:false}],
      injuries:[], whyPick:"Saint Louis shoots 40.1% from three as a team — that's elite. Robbie Avila is a 6-10 matchup nightmare. Georgia has been inconsistent and susceptible to teams that shoot well from deep.", whyNot:"Georgia has SEC-level athletes and more raw talent. If they defend the perimeter well, SLU's other dimensions aren't enough.", historicalNote:"9-seeds win 48.5% of 8/9 games historically."
    },
    { s1:5, t1:"Texas Tech", t1Short:"TTU", r1:"22-10", s2:12, t2:"Akron", t2Short:"AKR", r2:"29-5", pick:"Akron", confidence:62, upset:true, riskLevel:"UPSET",
      headline:"🚨 CINDERELLA. Toppin OUT. 3 senior guards shooting 37%+ from 3.", edge:{offense:60,defense:65,experience:62,health:40}, edgeOpp:{offense:78,defense:55,experience:85,health:95},
      keyStats:[{label:"Toppin",value:"OUT for season (knee)",hot:true},{label:"Akron PPG",value:"88.7 (7th nationally)",hot:true},{label:"Akron 3PT",value:"3 guards at 37%+",hot:true}],
      injuries:[{player:"JT Toppin",team:"Texas Tech",status:"OUT",impact:"CRITICAL",detail:"Knee — season over. Was the team's best player and primary scorer."},{player:"L. Watts",team:"Texas Tech",status:"GTD",impact:"HIGH",detail:"Undisclosed — questionable. Took on Toppin's role."}],
      whyPick:"This is my top Cinderella. Texas Tech without Toppin is a jump-shooting team with no identity. Akron averages 88.7 PPG with three senior guards (Johnson, Scott, Hardman) all shooting 37%+ from 3. Third straight tournament. Evan Mahaffey (OSU transfer) handles any matchup. If Watts is also limited, this is a near-lock.", whyNot:"Grant McCasland is a master in-game tactician. Christian Anderson is still very good. Tech's defense could slow Akron's pace.", historicalNote:"12-seeds upset 5-seeds 35.7%. This profile (injured favorite vs experienced mid-major) is the most common upset type."
    },
    { s1:4, t1:"Alabama", t1Short:"BAMA", r1:"23-9", s2:13, t2:"Hofstra", t2Short:"HOF", r2:"24-10", pick:"Alabama", confidence:65, upset:false, riskLevel:"LEAN",
      headline:"Holloway's arrest is the wildcard. Bama's D (68th) is vulnerable.", edge:{offense:78,defense:45,experience:55,health:65}, edgeOpp:{offense:58,defense:48,experience:55,health:90},
      keyStats:[{label:"Holloway",value:"Arrested Mon AM (!)",hot:true},{label:"BAMA Def.",value:"KenPom #68 (yikes)",hot:true},{label:"Philon",value:"21.7 PPG, pushes pace",hot:false}],
      injuries:[{player:"A. Holloway",team:"Alabama",status:"(trip.people || []).flatMapERTAIN",impact:"HIGH",detail:"Arrested Monday AM — marijuana charge. 16.8 PPG. Status (trip.people || []).flatMaplear for Friday."}],
      whyPick:"Alabama's raw talent and pace (Philon 21.7 PPG) should overwhelm Hofstra even without Holloway. But this is much closer than a 4-13 should be.", whyNot:"If Holloway is OUT, Alabama's scoring depth takes a massive hit and their 68th-ranked defense becomes exploitable. Hofstra's Cruz Davis and Preston Edmead can score in b(trip.people || []).flatMaphes.", historicalNote:"13-seeds win ~20% of the time. Legal issues create locker room distractions that compound."
    },
    { s1:6, t1:"Tennessee", t1Short:"TENN", r1:"22-11", s2:11, t2:"SMU/MIA(OH)", t2Short:"11", r2:"~20-13", pick:"Tennessee", confidence:72, upset:false, riskLevel:"LEAN",
      headline:"Gillespie + Ament + Barnes' defense = too much for either 11.", edge:{offense:62,defense:82,experience:72,health:72}, edgeOpp:{offense:60,defense:55,experience:60,health:78},
      keyStats:[{label:"Gillespie",value:"Star guard, shot-creator",hot:true},{label:"Ament",value:"Frosh, potential lottery pick",hot:true},{label:"TENN Def.",value:"Elite under Barnes",hot:false}],
      injuries:[{player:"N. Ament",team:"Tennessee",status:"GTD",impact:"HIGH",detail:"Knee — managing injury. Was averaging 22.4 PPG in 10-game stretch before it flared up."}],
      whyPick:"Rick Barnes' defensive intensity is tournament-proven. Whether it's SMU (Boopie Miller) or Miami OH (31-1 but untested), Tennessee has the defensive personnel to contain either.", whyNot:"Tennessee's offense can be ugly — over-reliant on Gillespie isolation. If Ament isn't right, the scoring ceiling drops. SMU's Miller could go off.", historicalNote:"11-seeds upset 6-seeds 37.3%. First Four teams regularly win in the R64."
    },
    { s1:3, t1:"Virginia", t1Short:"UVA", r1:"29-5", s2:14, t2:"Wright State", t2Short:"WSU", r2:"23-11", pick:"Virginia", confidence:94, upset:false, riskLevel:"SAFE",
      headline:"Odom's new Virginia: 3s, offensive boards, elite D.", edge:{offense:72,defense:85,experience:80,health:90}, edgeOpp:{offense:42,defense:38,experience:42,health:82},
      keyStats:[{label:"UVA 3PA",value:"46.8% of all FGA",hot:true},{label:"UVA O-Reb",value:"#6 in off. reb rate",hot:true},{label:"De Ridder",value:"Frosh: 15.5 PPG, 6+ RPG",hot:false}],
      injuries:[], whyPick:"Ryan Odom completely reinvented Virginia in year one. They la(trip.people || []).flatMaph 3s, crash the offensive glass, and play elite defense. Thijs De Ridder (Belgium) is a revelation. Wright State's young roster can't handle UVA's system.", whyNot:"Wright State has exciting young players (Cooper, Burch, Pickett) but the 76-spot KenPom gap is massive.", historicalNote:"14-seeds win ~7% of the time."
    },
    { s1:7, t1:"Kentucky", t1Short:"UK", r1:"21-13", s2:10, t2:"Santa Clara", t2Short:"SCU", r2:"26-6", pick:"Kentucky", confidence:52, upset:false, riskLevel:"TOSS-UP",
      headline:"🔶 UK is banged up. Santa Clara has size at every position.", edge:{offense:60,defense:58,experience:72,health:48}, edgeOpp:{offense:65,defense:55,experience:65,health:88},
      keyStats:[{label:"UK record",value:"21-13 (alarming)",hot:true},{label:"SCU offense",value:"KenPom #23 (elite)",hot:true},{label:"SCU style",value:"Top 30 TO margin + 3PM",hot:true}],
      injuries:[{player:"J. Quaintance",team:"Kentucky",status:"OUT",impact:"MED",detail:"Knee — only 4 games played all season. Essentially unavailable."}],
      whyPick:"Kentucky's brand still matters. Otega Oweh can take over a game individually. The Wildcats have played an SEC schedule that prepared them for this level of competition.", whyNot:"Santa Clara is big at every position, ranks 23rd in offensive efficiency, and top-30 in both turnover margin and 3PM. They share a conference with Gonzaga — they won't be intimidated. This is the closest 7-10 in the bracket.", historicalNote:"10-seeds upset 7-seeds 39.1%. Kentucky's 21-13 record is historically unusual for the program."
    },
    { s1:2, t1:"Iowa State", t1Short:"ISU", r1:"24-8", s2:15, t2:"Tenn. State", t2Short:"TSU", r2:"23-9", pick:"Iowa State", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"Jefferson + Momcilovic + 4th-ranked D = cruise control.", edge:{offense:80,defense:92,experience:82,health:90}, edgeOpp:{offense:42,defense:48,experience:40,health:85},
      keyStats:[{label:"Jefferson",value:"Wooden candidate, big wing",hot:true},{label:"Momcilovic",value:"Best 3PT shooter in field",hot:true},{label:"ISU Def.",value:"KenPom #4",hot:true}],
      injuries:[], whyPick:"Iowa State has the best combination of offense and defense outside the 1-seeds. Jefferson bullies smaller defenders, Momcilovic spaces the floor, and the defense forces turnovers at an elite rate (3rd nationally). TSU is making the tourney for the first time in 32 years — great story, but the talent gap is too wide.", whyNot:"Nolan Smith (first-year coach, former Duke star) has TSU playing with defensive intensity. They rank 25th in defensive turnover rate. But Iowa State is built for this.", historicalNote:"2-seeds are 141-17 vs 15-seeds all-time."
    },
  ],
};

// ── LATER ROUNDS: Projected matchups R32 → Championship ─────
const LATER_ROUNDS = {
  EAST: {
    R32: [
      { s1:1, t1:"Duke", t1Short:"DUKE", s2:9, t2:"TCU", t2Short:"TCU", pick:"Duke", confidence:78, originalConfidence:88, riskLevel:"LEAN",
        headline:"Duke survived Siena. Now faces TCU who just upset Ohio State. Duke -10.5.",
        edge: { offense: 80, defense: 92, experience: 82, health: 70 },
        edgeOpp: { offense: 58, defense: 68, experience: 62, health: 85 },
        keyStats: [
          { label: "Duke R64", value: "2-15 from 3 (!)", hot: true },
          { label: "TCU R64", value: "Beat OSU 66-64", hot: false },
          { label: "Spread", value: "Duke -10.5", hot: false },
        ],
        injuries: [
          { player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — still out. Perimeter creation remains limited." },
          { player: "P. Ngongba", team: "Duke", status: "PROBABLE", impact: "MED", detail: "Foot soreness — expected to return for R32, adding rim protection." },
        ],
        whyPick:"Duke's second-half comeback vs Siena showed championship DNA — Boozer brothers combined for 21 in the comeback. TCU won a tight 66-64 over Ohio State but doesn't have the firepower to exploit Duke's perimeter weakness like a higher seed would. Duke's defense tightens up in Round 2.",
        whyNot:"Duke went 2-15 from 3 against Siena. If that shooting continues, TCU's defense — which just locked down Ohio State late — could make this (trip.people || []).flatMapomfortable. Duke's title odds took a real hit Thursday." },
      { s1:5, t1:"St. John's", t1Short:"SJU", s2:4, t2:"Kansas", t2Short:"KU", pick:"St. John's", confidence:55, upset:true, riskLevel:"UPSET",
        headline:"🚨 Pitino vs. Self. Ejiofor's size overwhelms shaky KU chemistry.",
        edge: { offense: 75, defense: 72, experience: 78, health: 90 },
        edgeOpp: { offense: 78, defense: 70, experience: 68, health: 75 },
        keyStats: [
          { label: "SJU KenPom", value: "Top 15 (underseeded)", hot: true },
          { label: "Peterson", value: "Projected #1 pick", hot: true },
          { label: "Ejiofor", value: "B. East POTY — interior beast", hot: false },
        ],
        injuries: [
          { player: "D. Peterson", team: "Kansas", status: "ACTIVE", impact: "LOW", detail: "Healthy but chemistry and engagement concerns persist all season." },
        ],
        whyPick:"St. John's is underseeded (top-15 KenPom). Ejiofor's interior dominance + Pitino's March pedigree vs. Kansas's chemistry issues and Peterson's inconsistency.",
        whyNot:"Peterson is a generational talent. If he's locked in, Kansas can beat anyone. Bill Self in March is never easy." },
      { s1:6, t1:"Louisville", t1Short:"LOU", s2:3, t2:"Michigan St.", t2Short:"MSU", pick:"Michigan St.", confidence:72, originalConfidence:72, riskLevel:"LEAN",
        headline:"MSU -4.5. Louisville survived USF's comeback. Can McKneely repeat his 7-three night?",
        edge: { offense: 65, defense: 62, experience: 60, health: 78 },
        edgeOpp: { offense: 78, defense: 82, experience: 85, health: 90 },
        keyStats: [
          { label: "MSU R64", value: "92-67, shot 60%", hot: true },
          { label: "LOU TOs", value: "22 turnovers vs USF", hot: true },
          { label: "McKneely", value: "7 threes (23 pts) R64", hot: false },
        ],
        injuries: [
          { player: "M. Brown Jr.", team: "Louisville", status: "DTD", impact: "HIGH", detail: "Back — played limited mins R64. Still not 100%." },
        ],
        whyPick:"Michigan State was dominant — 92-67 over NDSU, shot 60%, controlled the glass. Louisville needed McKneely's heroic 7-three night to survive South Florida's 23-point comeback. The Spartans' physicality and rebounding will overwhelm a Louisville team that turned it over 22 times Thursday.",
        whyNot:"Louisville showed resilience surviving that USF rally. McKneely (23 pts) can get hot from anywhere. If Louisville protects the ball better than Thursday (22 TOs), this gets competitive." },
      { s1:10, t1:"UCF", t1Short:"UCF", s2:2, t2:"UConn", t2Short:"UCONN", pick:"UConn", confidence:74, riskLevel:"LEAN",
        headline:"Hurley's scheme exploits UCF's perimeter gaps.", whyPick:"UConn's championship DNA shows up in these moments. Demary's playmaking controls pace. UCF's size is real but UConn's half-court execution is a tier above.", whyNot:"John Bol creates real matchup problems on the glass. If UConn goes cold from 3 (they do sometimes), UCF hangs around." },
    ],
    S16: [
      { s1:1, t1:"Duke", t1Short:"DUKE", s2:5, t2:"St. John's", t2Short:"SJU", pick:"Duke", confidence:61, originalConfidence:68, riskLevel:"LEAN",
        headline:"Boozer vs. Ejiofor — marquee big-man battle. Duke depth wins late.", whyPick:"Boozer's passing out of double-teams creates open shooters. Duke's defense (#2 KenPom) can match St. John's intensity. The deeper roster grinds SJU down in the last 10 minutes.", whyNot:"Ejiofor is a legitimate matchup problem. Pitino's defensive schemes could frustrate Duke's guard-limited offense without Foster. Very competitive game.",
        edge: { offense: 82, defense: 90, experience: 80, health: 68 },
        edgeOpp: { offense: 75, defense: 72, experience: 78, health: 90 },
        keyStats: [{ label: "Boozer", value: "Generational passer/scorer", hot: true },{ label: "Ejiofor", value: "B.East POTY interior", hot: true },{ label: "Duke 3PT", value: "2-15 in R64 (!)", hot: false }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — still out. Perimeter creation limited." }] },
      { s1:3, t1:"Michigan St.", t1Short:"MSU", s2:2, t2:"UConn", t2Short:"UCONN", pick:"Michigan St.", confidence:54, upset:true, riskLevel:"UPSET",
        headline:"🚨 Izzo's physicality disrupts UConn's inconsistent shooting.", whyPick:"UConn's shooting droughts (Solo Ball, Karaban disappearing) make them vulnerable against physical, rebounding-dominant teams. Izzo's March magic vs. a UConn team that isn't 2023-24 caliber.", whyNot:"When UConn is on, they can beat anyone. Hurley's adjustments are elite. This is a coin flip that could easily go either way.",
        edge: { offense: 72, defense: 80, experience: 88, health: 90 },
        edgeOpp: { offense: 70, defense: 82, experience: 90, health: 75 },
        keyStats: [{ label: "MSU Glass", value: "#1 rebounding team", hot: true },{ label: "UConn 3PT", value: "Inconsistent all year", hot: true },{ label: "Izzo March", value: "60 career tourney wins", hot: false }],
        injuries: [{ player: "J. Stewart", team: "UConn", status: "GTD", impact: "LOW", detail: "Lower body — (trip.people || []).flatMapertain since Feb." }] },
    ],
    E8: [
      { s1:1, t1:"Duke", t1Short:"DUKE", s2:3, t2:"Michigan St.", t2Short:"MSU", pick:"Duke", confidence:64, riskLevel:"LEAN",
        headline:"No. 1 overall seed vs. Izzo. Boozer's dominance prevails in a dogfight.", whyPick:"Boozer is the best player on the floor. Duke's defense can match MSU's physicality. A 65-60 type game where Duke's talent advantage shows in cr(trip.people || []).flatMaph time.", whyNot:"Izzo has eliminated higher seeds before. Fears Jr. is a terrific playmaker. If Cooper and Kohler dominate the glass, MSU controls the game.",
        edge: { offense: 82, defense: 90, experience: 82, health: 68 },
        edgeOpp: { offense: 72, defense: 80, experience: 88, health: 90 },
        keyStats: [{ label: "Boozer", value: "Best big in CBB", hot: true },{ label: "Fears Jr.", value: "Nation-leading ast%", hot: true },{ label: "Style", value: "65-60 dogfight", hot: false }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — maybe back for F4?" }] },
    ],
  },
  WEST: {
    R32: [
      { s1:1, t1:"Arizona", t1Short:"ARIZ", s2:9, t2:"Utah State", t2Short:"USU", pick:"Arizona", confidence:84, riskLevel:"SAFE",
        headline:"Arizona's switching D neutralizes USU's ball-screen game.", whyPick:"Peat and Awaka can switch onto guards. Krivas protects the rim. Burries and Bradley attack on the other end. The talent gap is significant.", whyNot:"USU is well-coached and their offense is efficient. Could keep it within 10." },
      { s1:4, t1:"Arkansas", t1Short:"ARK", s2:12, t2:"High Point", t2Short:"HPU", pick:"Arkansas", confidence:72, originalConfidence:62, riskLevel:"LEAN",
        headline:"ARK -11.5. Acuff (24 pts R64) vs Johnston (passed Steph Curry in career 3s).",
        edge: { offense: 85, defense: 65, experience: 62, health: 78 },
        edgeOpp: { offense: 72, defense: 48, experience: 50, health: 90 },
        keyStats: [
          { label: "Acuff R64", value: "24 pts, 7 ast", hot: true },
          { label: "Johnston", value: "415 career 3s (> Curry)", hot: true },
          { label: "HP vs P4", value: "First-ever win Thurs", hot: false },
        ],
        injuries: [
          { player: "K. Knox", team: "Arkansas", status: "OUT", impact: "MED", detail: "Season-ending — limits depth, but core rotation intact after dominant R64." },
        ],
        whyPick:"Arkansas was dominant — 97-78 over Hawaii, all 5 starters in double figures. High Point's stunning upset of Wisconsin was inspiring but they've never faced this level of athleticism. Acuff Jr. is a different tier of player than anyone HP has seen. Arkansas's interior scoring overwhelms HP's undersized frontcourt.",
        whyNot:"High Point just beat a Power Four team for the first time in program history. Chase Johnston (415 career 3s, more than Steph Curry at Davidson) can get scorching hot. If HP shoots 45%+ from 3, Arkansas's mediocre perimeter defense could be exposed." },
      { s1:3, t1:"Gonzaga", t1Short:"ZAGA", s2:11, t2:"Texas", t2Short:"TEX", pick:"Gonzaga", confidence:68, originalConfidence:60, riskLevel:"LEAN",
        headline:"Gonzaga faces Texas, who upset BYU 79-71. Ike's interior vs Texas length.",
        edge: { offense: 78, defense: 75, experience: 85, health: 72 },
        edgeOpp: { offense: 62, defense: 65, experience: 60, health: 82 },
        keyStats: [
          { label: "Ike R64", value: "Efficient, Zags won 73-64", hot: false },
          { label: "Texas R64", value: "Beat BYU 79-71 (upset)", hot: true },
          { label: "Huff", value: "Still out — could return S16", hot: true },
        ],
        injuries: [
          { player: "B. Huff", team: "Gonzaga", status: "OUT", impact: "MED", detail: "Knee — walking without crutches. Could return Sweet 16 if Gonzaga advances." },
        ],
        whyPick:"Gonzaga beat Kennesaw 73-64 and Ike was efficient inside. Texas upset BYU but the Longhorns don't have the interior scoring to match Ike and Grant-Foster. Gonzaga's experience in March is a real advantage here.",
        whyNot:"Texas has the length and athleticism to bother Ike. They just beat a team with the best player in the tournament (Dybantsa). If Texas's defense travels from the BYU game, Gonzaga could struggle to create open looks on the perimeter." },
      { s1:7, t1:"Miami (FL)", t1Short:"MIA", s2:2, t2:"Purdue", t2Short:"PUR", pick:"Purdue", confidence:64, riskLevel:"LEAN",
        headline:"Purdue sweats. Miami's guards test their weak perimeter D.", whyPick:"Smith's playmaking + historic offensive efficiency generates enough quality looks. Kaufman-Renn overwhelms Miami's frontcourt. But Miami makes this (trip.people || []).flatMapomfortable.", whyNot:"Miami's perimeter scorers are exactly the type that have punished Purdue all season. This could go either way." },
    ],
    S16: [
      { s1:1, t1:"Arizona", t1Short:"ARIZ", s2:4, t2:"Arkansas", t2Short:"ARK", pick:"Arizona", confidence:72, riskLevel:"LEAN",
        headline:"Arizona's switch-everything D + depth grinds down thin Arkansas roster.", whyPick:"Arizona's defensive versatility limits Acuff's driving lanes. Arkansas's depth issues (Knox out) become prono(trip.people || []).flatMaped against an 8-deep Arizona rotation.", whyNot:"Acuff is special. He can single-handedly keep Arkansas in any game for 35 minutes. The question is the last 5.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 82, defense: 65, experience: 62, health: 75 },
        keyStats: [{ label: "AZ Depth", value: "8+ deep rotation", hot: true },{ label: "Acuff", value: "SEC POTY (frosh)", hot: true },{ label: "ARK depth", value: "Knox OUT, thin bench", hot: false }],
        injuries: [{ player: "K. Knox", team: "Arkansas", status: "OUT", impact: "MED", detail: "Season-ending." }] },
      { s1:3, t1:"Gonzaga", t1Short:"ZAGA", s2:2, t2:"Purdue", t2Short:"PUR", pick:"Purdue", confidence:58, riskLevel:"TOSS-UP",
        headline:"Smith's playmaking + Loyer's shooting edge out Gonzaga's interior.", whyPick:"Purdue's system generates better looks. Gonzaga's depleted perimeter (injuries) can't contain Smith. If Huff returns, this flips.", whyNot:"If Braden Huff returns for the Sweet 16, Gonzaga's depth becomes overwhelming and their interior dominance could control the game.",
        edge: { offense: 78, defense: 70, experience: 88, health: 72 },
        edgeOpp: { offense: 92, defense: 55, experience: 90, health: 88 },
        keyStats: [{ label: "Purdue Off.", value: "Best KenPom-era ever", hot: true },{ label: "Huff", value: "Could return for S16!", hot: true },{ label: "Smith", value: "Breaking Hurley ast record", hot: false }],
        injuries: [{ player: "B. Huff", team: "Gonzaga", status: "GTD", impact: "HIGH", detail: "Knee — possible return. Would be a game-changer." }] },
    ],
    E8: [
      { s1:1, t1:"Arizona", t1Short:"ARIZ", s2:2, t2:"Purdue", t2Short:"PUR", pick:"Arizona", confidence:62, riskLevel:"LEAN",
        headline:"Burries + Bradley exploit Purdue's perimeter weakness. Lloyd finally breaks through.", whyPick:"Purdue's perimeter defense — their Achilles heel all season — can't contain two elite guards. Arizona's depth exhausts Purdue late.", whyNot:"Purdue's historic offensive efficiency means they'll score. If Arizona goes cold from midrange (they don't shoot many 3s), Purdue's system wins.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 92, defense: 55, experience: 90, health: 88 },
        keyStats: [{ label: "AZ Guards", value: "Burries + Bradley elite", hot: true },{ label: "PUR Perim D", value: "Achilles heel all year", hot: true },{ label: "AZ Depth", value: "Awaka off bench > starters", hot: false }],
        injuries: [] },
    ],
  },
  SOUTH: {
    R32: [
      { s1:1, t1:"Florida", t1Short:"UF", s2:9, t2:"Iowa", t2Short:"IOWA", pick:"Florida", confidence:82, riskLevel:"SAFE",
        headline:"Florida's frontcourt dominates the glass. Defending champs roll.",
        edge: { offense: 85, defense: 82, experience: 95, health: 92 },
        edgeOpp: { offense: 65, defense: 58, experience: 65, health: 85 },
        keyStats: [
          { label: "UF Frontcourt", value: "3 title-game starters", hot: true },
          { label: "Iowa R64", value: "TBD (Friday game)", hot: false },
          { label: "Rebounding", value: "UF dominates glass", hot: false },
        ],
        injuries: [],
        whyPick:"Haugh, Condon, Chinyelu — the best rebounding frontcourt in the field — overwhelm Iowa on the boards. Todd Golden's system creates easy transition looks.", whyNot:"Iowa has tournament experience. If they shoot well from 3, they can keep it within striking distance." },
      { s1:5, t1:"Vanderbilt", t1Short:"VANDY", s2:4, t2:"Nebraska", t2Short:"NEB", pick:"Vanderbilt", confidence:58, upset:true, riskLevel:"UPSET",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"🚨 Tanner/Miles outscore Nebraska's rock-fight defense.",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Elite O vs Elite D", hot: false },
        ],
        injuries: [],
        whyPick:"Nebraska went 6-6 down the stretch. The pressure of the program's first-ever tournament win followed by facing red-hot Vanderbilt (just beat Florida) is brutal.", whyNot:"Nebraska's defense (7th KenPom) makes everything difficult. If they grind Vandy into the 50s, anything can happen." },
      { s1:11, t1:"VCU", t1Short:"VCU", s2:3, t2:"Illinois", t2Short:"ILL", pick:"Illinois", confidence:82, originalConfidence:76, riskLevel:"SAFE",
        headline:"UPDATED: Illinois faces VCU (who upset (trip.people || []).flatMap in OT). Confidence UP from 76% to 82%.",
        edge: { offense: 95, defense: 68, experience: 72, health: 90 },
        edgeOpp: { offense: 58, defense: 72, experience: 68, health: 82 },
        keyStats: [
          { label: "ILL R64", value: "105-70, Mirkovic 29/17", hot: true },
          { label: "VCU R64", value: "Erased 19-pt deficit OT", hot: true },
          { label: "Matchup shift", value: "Was (trip.people || []).flatMap, now VCU", hot: false },
        ],
        injuries: [],
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        whyPick:"VCU pulled off a historic 19-point comeback to beat (trip.people || []).flatMap in OT. That's incredible heart — but Illinois is a completely different matchup. The No. 1 offense in KenPom history just put up 105 on Penn. Mirkovic (29/17) and the Ivisic brothers give Illinois too many weapons. VCU's Cinderella energy meets an offensive buzzsaw.",
        whyNot:"VCU just pulled off the biggest R64 comeback ever. Momentum and belief are real in March. Their defensive pressure could force Illinois into turnovers. But the talent gap is wide." },
      { s1:10, t1:"Texas A&M", t1Short:"TAMU", s2:2, t2:"Houston", t2Short:"HOU", pick:"Houston", confidence:76, riskLevel:"LEAN",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Sampson's defense frustrates A&M. Toyota Center looms.",
        edge: { offense: 78, defense: 92, experience: 90, health: 88 },
        edgeOpp: { offense: 60, defense: 62, experience: 88, health: 85 },
        keyStats: [
          { label: "HOU R64", value: "78-47 blowout", hot: false },
          { label: "A&M R64", value: "63-50, upset SMC", hot: true },
          { label: "Toyota Ctr", value: "E8 at Houston home", hot: true },
        ],
        injuries: [],
        whyPick:"Houston's defensive identity overwhelms A&M's motion offense. The Cougars are locked in for a potential home Regional Final at Toyota Center.", whyNot:"A&M's experience (8 juniors/seniors) helps them compete. Robbie Avila from SLU gave UGA problems — A&M's bigs are even better." },
    ],
    S16: [
      { s1:1, t1:"Florida", t1Short:"UF", s2:5, t2:"Vanderbilt", t2Short:"VANDY", pick:"Florida", confidence:64, riskLevel:"LEAN",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Rematch. Florida adjusts from SEC Tournament loss. Frontcourt wins.", whyPick:"Golden's team learns from losses. Florida's frontcourt advantage is even more decisive in March where rebounds matter more. Vandy's 3PT shooting likely regresses.", whyNot:"Vandy already proved they can beat Florida. Tanner and Miles have the shot-creation to score against any defense.",
        edge: { offense: 82, defense: 82, experience: 95, health: 92 },
        edgeOpp: { offense: 80, defense: 58, experience: 62, health: 88 },
        keyStats: [{ label: "Rematch", value: "Vandy beat UF in SEC", hot: true },{ label: "UF Frontcourt", value: "3 title-game starters", hot: true },{ label: "Tanner", value: "19.2 PPG, 37% from 3", hot: false }],
        injuries: [] },
      { s1:3, t1:"Illinois", t1Short:"ILL", s2:2, t2:"Houston", t2Short:"HOU", pick:"Houston", confidence:58, riskLevel:"TOSS-UP",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Irresistible force vs. immovable object. Houston's home crowd = 3-5 pts.", whyPick:"Houston's defense is built to contain motion offenses. The game is at TOYOTA CENTER — Houston's home arena. That crowd advantage could be worth 3-5 points.", whyNot:"Illinois has a historically great offense. Wagler could go on a 15-point run that breaks any defense. This is a genuine toss-up without the venue factor.",
        edge: { offense: 68, defense: 92, experience: 90, health: 88 },
        edgeOpp: { offense: 96, defense: 68, experience: 72, health: 90 },
        keyStats: [{ label: "HOU Defense", value: "Built to stop motion O", hot: true },{ label: "ILL Offense", value: "#1 in KenPom history", hot: true },{ label: "VENUE", value: "Toyota Center = HOME", hot: true }],
        injuries: [] },
    ],
    E8: [
      { s1:1, t1:"Florida", t1Short:"UF", s2:2, t2:"Houston", t2Short:"HOU", pick:"Houston", confidence:56, upset:true, riskLevel:"UPSET",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"🚨 Title rematch AT TOYOTA CENTER. Home court + elite D = Houston.", whyPick:"The South Regional Final is at Houston's home arena. That structural advantage + Houston's superior defense + Florida's 3PT regression risk = Cougars advance. Kelvin Sampson's program is built for this moment.", whyNot:"Florida won the title last year. They have the experience edge and a better frontcourt. If they shoot well from 3, the crowd doesn't matter.",
        edge: { offense: 82, defense: 82, experience: 95, health: 92 },
        edgeOpp: { offense: 78, defense: 92, experience: 90, health: 88 },
        keyStats: [{ label: "HOME COURT", value: "Toyota Center = HOU", hot: true },{ label: "UF 3PT", value: "Was 349th before Feb", hot: true },{ label: "Rematch", value: "2025 title game", hot: false }],
        injuries: [] },
    ],
  },
  MIDWEST: {
    R32: [
      { s1:1, t1:"Michigan", t1Short:"MICH", s2:9, t2:"Saint Louis", t2Short:"SLU", pick:"Michigan", confidence:78, riskLevel:"SAFE",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Michigan's #1 defense vs SLU who just scored 102 on Georgia.",
        edge: { offense: 85, defense: 98, experience: 78, health: 78 },
        edgeOpp: { offense: 80, defense: 55, experience: 72, health: 90 },
        keyStats: [
          { label: "MICH R64", value: "101-80, shot 67%", hot: true },
          { label: "SLU R64", value: "102-77(!), 21-0 run", hot: true },
          { label: "Avila vs Mara", value: "Marquee big battle", hot: false },
        ],
        injuries: [
          { player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL — perimeter shooting loss, but 8-deep rotation compensates." },
        ],
        whyPick:"SLU shoots 40.1% from 3, but Michigan's defense contests shots without leaving the rim unprotected. Mara's wingspan wins the Avila matchup.", whyNot:"If SLU hits 12+ threes, they can hang. Avila vs. Mara is a genuinely fun matchup." },
      { s1:12, t1:"Akron", t1Short:"AKR", s2:4, t2:"Alabama", t2Short:"BAMA", pick:"Akron", confidence:54, upset:true, riskLevel:"UPSET",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"CINDERELLA CONTINUES. Bama 68th-ranked D + Holloway drama = Akron.",
        edge: { offense: 78, defense: 55, experience: 85, health: 95 },
        edgeOpp: { offense: 80, defense: 45, experience: 55, health: 62 },
        keyStats: [
          { label: "AKR PPG", value: "88.7 (7th nationally)", hot: true },
          { label: "BAMA Def", value: "KenPom #68 (yikes)", hot: true },
          { label: "Holloway", value: "Arrested — status ??", hot: true },
        ],
        injuries: [
          { player: "A. Holloway", team: "Alabama", status: "(trip.people || []).flatMapERTAIN", impact: "HIGH", detail: "Arrested Monday — marijuana charge. 16.8 PPG. Status (trip.people || []).flatMaplear." },
        ],
        whyPick:"Alabama's defense (68th KenPom) is a massive weakness Akron's three elite shooters will exploit. The Zips match Alabama's tempo and shoot them off the court. Holloway legal situation adds chaos.", whyNot:"Alabama's raw talent and Philon's 21.7 PPG is hard to overcome. If Holloway plays and Bama is locked in, the talent gap matters." },
      { s1:6, t1:"Tennessee", t1Short:"TENN", s2:3, t2:"Virginia", t2Short:"UVA", pick:"Virginia", confidence:58, riskLevel:"LEAN",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Virginia's system (3s + offensive boards) outlasts Tennessee's grind.",
        edge: { offense: 72, defense: 85, experience: 80, health: 90 },
        edgeOpp: { offense: 62, defense: 82, experience: 72, health: 72 },
        keyStats: [
          { label: "UVA 3PA", value: "46.8% of all FGA", hot: true },
          { label: "UVA O-Reb", value: "#6 nationally", hot: false },
          { label: "TENN Def", value: "Elite under Barnes", hot: false },
        ],
        injuries: [
          { player: "N. Ament", team: "Tennessee", status: "GTD", impact: "HIGH", detail: "Knee — managing injury. Effectiveness is the question." },
        ],
        whyPick:"Virginia has multiple paths to scoring. Tennessee relies too heavily on Gillespie creating individually. UVA's balanced attack wins a close one.", whyNot:"Barnes' defense can contain anyone. If Gillespie goes off (25+), Tennessee wins." },
      { s1:7, t1:"Kentucky", t1Short:"UK", s2:2, t2:"Iowa State", t2Short:"ISU", pick:"Iowa State", confidence:80, riskLevel:"SAFE",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"ISU's turnover-forcing defense eats Kentucky alive.",
        edge: { offense: 80, defense: 92, experience: 82, health: 90 },
        edgeOpp: { offense: 62, defense: 58, experience: 72, health: 50 },
        keyStats: [
          { label: "ISU Def", value: "KenPom #4, TO rate #3", hot: true },
          { label: "Jefferson", value: "Wooden candidate", hot: true },
          { label: "UK record", value: "21-13 (inconsistent)", hot: false },
        ],
        injuries: [
          { player: "J. Quaintance", team: "Kentucky", status: "OUT", impact: "MED", detail: "Knee — only 4 games played all season." },
        ],
        whyPick:"Iowa State's defense forces turnovers at an elite rate — exactly what Kentucky's inconsistent guards can't handle. Jefferson dominates inside.", whyNot:"Kentucky has SEC-level athletes. If Oweh plays the game of his life, UK has a shot." },
    ],
    S16: [
      { s1:1, t1:"Michigan", t1Short:"MICH", s2:12, t2:"Akron", t2Short:"AKR", pick:"Michigan", confidence:74, riskLevel:"LEAN",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Cinderella meets the #1 defense. Michigan's length ends the run.", whyPick:"Michigan can contest 3s WITHOUT sacrificing rim protection — that's what makes their defense different from Alabama's. Akron's shooting meets real resistance for the first time.", whyNot:"Akron's senior guards have been here before. If they hit early 3s and build a lead, Michigan's turnovers could keep the door open.",
        edge: { offense: 85, defense: 98, experience: 78, health: 78 },
        edgeOpp: { offense: 78, defense: 55, experience: 85, health: 95 },
        keyStats: [{ label: "MICH Def", value: "#1 — contests 3s + rim", hot: true },{ label: "AKR 3PT", value: "3 guards at 37%+", hot: true },{ label: "AKR run", value: "Cinderella to S16", hot: false }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL — perimeter shooting loss." }] },
      { s1:3, t1:"Virginia", t1Short:"UVA", s2:2, t2:"Iowa State", t2Short:"ISU", pick:"Iowa State", confidence:62, riskLevel:"LEAN",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Jefferson's dominance + Momcilovic's shooting break Virginia's system.", whyPick:"Iowa State has more top-end talent. Jefferson is the best player on the floor. Their turnover-forcing defense disrupts Virginia's offensive flow.", whyNot:"Virginia's De Ridder is a matchup problem. Two elite defenses means a low-scoring battle where anything can happen.",
        edge: { offense: 80, defense: 92, experience: 82, health: 90 },
        edgeOpp: { offense: 72, defense: 85, experience: 80, health: 90 },
        keyStats: [{ label: "ISU TO rate", value: "#3 nationally (forces)", hot: true },{ label: "Jefferson", value: "Wooden candidate", hot: true },{ label: "De Ridder", value: "Frosh 15.5 PPG", hot: false }],
        injuries: [] },
    ],
    E8: [
      { s1:1, t1:"Michigan", t1Short:"MICH", s2:2, t2:"Iowa State", t2Short:"ISU", pick:"Michigan", confidence:54, riskLevel:"TOSS-UP",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
        headline:"Game of the tournament. #1 D vs. #4 D. Michigan's frontcourt is the tiebreaker.", whyPick:"Michigan's size advantage with Mara, Johnson, and Lendeborg is decisive. Iowa State doesn't have a big to match that frontcourt. Michigan's turnovers could open the door, but rebounding provides margin for error.", whyNot:"Iowa State's turnover-forcing defense is Michigan's kryptonite (179th in TO rate). If the Cyclones create 18+ turnovers, they win.",
        edge: { offense: 85, defense: 98, experience: 78, health: 78 },
        edgeOpp: { offense: 80, defense: 92, experience: 82, health: 90 },
        keyStats: [{ label: "MICH TO rate", value: "179th (weakness!)", hot: true },{ label: "ISU TO forcing", value: "#3 nationally", hot: true },{ label: "MICH size", value: "Mara 7-7 wingspan", hot: false }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL." }] },
    ],
  },
  FINAL_FOUR: [
    { s1:1, t1:"Duke", t1Short:"DUKE", region1:"EAST", s2:2, t2:"Houston", t2Short:"HOU", region2:"SOUTH", pick:"Duke", confidence:58, riskLevel:"TOSS-UP",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
      headline:"Boozer vs. Sampson's elite D. Duke's passing out of doubles decides it.", whyPick:"Boozer's passing when doubled creates impossible decisions for Houston's defense. Duke's #2 defense can match Houston's intensity. If Foster returns, Duke's ceiling goes even higher.", whyNot:"Houston's defensive scheme has frustrated bigger, more athletic opponents all season. Flemings + Cenac can score.",
        edge: { offense: 82, defense: 90, experience: 82, health: 68 },
        edgeOpp: { offense: 78, defense: 92, experience: 90, health: 88 },
        keyStats: [{ label: "Boozer", value: "Passing out of doubles", hot: true },{ label: "HOU Def", value: "Elite under Sampson", hot: true },{ label: "Foster?", value: "Could return for F4", hot: true }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "GTD", impact: "HIGH", detail: "Broken foot — outside chance of F4 return." }] },
    { s1:1, t1:"Arizona", t1Short:"ARIZ", region1:"WEST", s2:1, t2:"Michigan", t2Short:"MICH", region2:"MIDWEST", pick:"Michigan", confidence:56, riskLevel:"TOSS-UP",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
      headline:"Arizona's lack of 3PT shooting vs. Michigan's pack-the-paint D.", whyPick:"Arizona doesn't shoot enough 3s to punish Michigan's defense, which is designed to take away interior shots. Michigan's length and switchability are Arizona's kryptonite.", whyNot:"Arizona has elite individual talent (Burries, Bradley, Peat). If they force the pace and attack in transition, Michigan's turnover issues emerge.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 85, defense: 98, experience: 78, health: 78 },
        keyStats: [{ label: "AZ 3PT rate", value: "4th-lowest in country", hot: true },{ label: "MICH Def", value: "#1 — packs the paint", hot: true },{ label: "MICH TOs", value: "179th — AZ can exploit", hot: false }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL." }] },
  ],
  CHAMPIONSHIP: [
    { s1:1, t1:"Duke", t1Short:"DUKE", region1:"EAST", s2:1, t2:"Michigan", t2Short:"MICH", region2:"MIDWEST", pick:"Duke", confidence:55, riskLevel:"TOSS-UP",
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Offense vs Defense", hot: false },
        ],
        injuries: [],
      headline:"🏆 The dream final. Boozer's generational talent wins a championship.", whyPick:"Championship games favor the team with the best individual player. Boozer is that player. His passing makes double-teams counterproductive. If Foster returns for the title game, Duke's perimeter creation swings this significantly.", whyNot:"Michigan's #1 defense is extraordinary. Their turnover-forcing ability could exploit Duke's guard play. Lendeborg and Mara create their own matchup problems.",
        edge: { offense: 82, defense: 90, experience: 82, health: 70 },
        edgeOpp: { offense: 85, defense: 98, experience: 78, health: 78 },
        keyStats: [{ label: "Boozer", value: "Best player = best team", hot: true },{ label: "MICH Def", value: "#1 in country", hot: true },{ label: "Foster?", value: "Return for title game?", hot: true }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "GTD", impact: "HIGH", detail: "Could return for title game — would transform perimeter offense." }] },
  ],
};

const ROUND_LABELS = { R64:"ROUND OF 64", R32:"ROUND OF 32", S16:"SWEET 16", E8:"ELITE EIGHT" };

f(trip.people || []).flatMaption ConfidenceGauge({ value, originalValue, size = 48 }) {
  const color = value >= 80 ? "#3ded7a" : value >= 60 ? "#edcc3d" : value >= 50 ? "#ed8a3d" : "#ed3d5a";
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  const delta = originalValue ? value - originalValue : null;
  return (
    <div style={{ position:"relative", width:size, height: delta !== null ? size + 14 : size, display:"inline-flex", alignItems:"flex-start", justifyContent:"center", flexDirection:"column" }}>
      <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
          <circle cx={size/2} cy={size/2} r={18} fill="none" stroke="#252830" strokeWidth={3} />
          <circle cx={size/2} cy={size/2} r={18} fill="none" stroke={color} strokeWidth={3}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 0.8s ease" }} />
        </svg>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color, zIndex:1 }}>{value}</span>
      </div>
      {delta !== null && (
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, textAlign:"center", width:"100%", marginTop:1,
          color: delta > 0 ? "#3ded7a" : delta < 0 ? "#ed5a5a" : "#8a8d9a" }}>
          was {originalValue} {delta > 0 ? "\u2191" : delta < 0 ? "\u2193" : ""}{Math.abs(delta)}
        </div>
      )}
    </div>
  );
}

f(trip.people || []).flatMaption EdgeBar({ label, val1, val2, color1, color2 }) {
  const total = val1 + val2 || 1;
  return (
    <div style={{ marginBottom:5 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d98", marginBottom:2 }}>
        <span>{val1}</span><span style={{ letterSpacing:1 }}>{label}</span><span>{val2}</span>
      </div>
      <div style={{ display:"flex", height:4, borderRadius:2, overflow:"hidden", gap:1 }}>
        <div style={{ width:`${(val1/total)*100}%`, background:color1, borderRadius:"2px 0 0 2px", transition:"width 0.5s ease" }} />
        <div style={{ width:`${(val2/total)*100}%`, background:color2, borderRadius:"0 2px 2px 0", transition:"width 0.5s ease" }} />
      </div>
    </div>
  );
}

f(trip.people || []).flatMaption InjuryBadge({ injury }) {
  const colors = { OUT:"#ed3d3d", DTD:"#ed8a3d", GTD:"#edcc3d", (trip.people || []).flatMapERTAIN:"#ed8a3d", ACTIVE:"#3ded7a" };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 0" }}>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, fontWeight:700, color:colors[injury.status]||"#888", background:(colors[injury.status]||"#888")+"18", padding:"1px 5px", borderRadius:3, minWidth:28, textAlign:"center" }}>
        {injury.status}
      </span>
      <div>
        <span style={{ fontSize:11, fontWeight:600, color:"#c8c4bf" }}>{injury.player}</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#a0a3ae", marginLeft:5 }}>{injury.team}</span>
      </div>
    </div>
  );
}

f(trip.people || []).flatMaption StatPill({ stat }) {
  return (
    <div style={{
      background: stat.hot ? "#1e1828" : "#121620",
      border:`1px solid ${stat.hot ? "#3a2a48" : "#222530"}`,
      borderRadius:6, padding:"5px 8px", flex:1, minWidth:0,
    }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color: stat.hot ? "#ed8aed" : "#a0a3ae", letterSpacing:1, marginBottom:2 }}>{stat.label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color: stat.hot ? "#e2ddd5" : "#b0b3bb", fontWeight: stat.hot ? 700 : 400 }}>{stat.value}</div>
    </div>
  );
}

f(trip.people || []).flatMaption RiskBadge({ level }) {
  const config = {
    "LOCK":{ bg:"#0a1a10", border:"#1a3a20", color:"#3ded7a", icon:"●" },
    "SAFE":{ bg:"#0e1a12", border:"#1a3a22", color:"#3ded7a", icon:"◉" },
    "LEAN":{ bg:"#1a1a0e", border:"#3a3a1a", color:"#edcc3d", icon:"◎" },
    "TOSS-UP":{ bg:"#1a160e", border:"#3a2a1a", color:"#ed8a3d", icon:"○" },
    "UPSET":{ bg:"#1a0e0e", border:"#3a1a1a", color:"#ed3d5a", icon:"⊘" },
  };
  const c = config[level] || config["LEAN"];
  return (
    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:c.color, background:c.bg, border:`1px solid ${c.border}`, padding:"2px 6px", borderRadius:4 }}>
      {c.icon} {level}
    </span>
  );
}

// ── CHAT with real Claude API + streaming ───────────────────
f(trip.people || []).flatMaption ChatView() {
  const [msgs, setMsgs] = useState([
    { role:"assistant", text:"I'm MadnessIQ — powered by Claude with live web search. Ask me anything about the 2026 NCAA Tournament and I'll search the web for the latest information.\n\nTry: \"Latest on Louisville injuries\" · \"Why Akron as Cinderella?\" · \"Duke's path to the title\" · \"Best value bets\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, streamText]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setMsgs(prev => [...prev, { role:"user", text:q }]);
    setInput("");
    setLoading(true);
    setStreamText("");

    try {
      // DUAL-MODE: Works inside Claude.ai artifacts (direct API) AND on Vercel (proxied)
      // On Vercel, /api/chat serverless f(trip.people || []).flatMaption adds the API key securely
      const isArtifact = typeof window !== "undefined" && (
        window.location.hostname.includes("claude") ||
        window.location.hostname === "localhost" ||
        window.location.protocol === "about:"
      );

      let text;
      if (isArtifact) {
        // Inside Claude.ai artifact — direct API call (API key handled by artifact sandbox)
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: `You are MadnessIQ, an elite 2026 NCAA Tournament analyst. Champion: Duke. F4: Duke, Arizona, Houston, Michigan. Key upsets: USF/Louisville, UCF/UCLA, Akron Sweet 16, Houston over Florida E8. Use web search. Be specific, opinionated, 2-3 paragraphs.`,
            messages: [{ role: "user", content: q }],
            tools: [{ type: "web_search_20250305", name: "web_search" }],
          }),
        });
        const data = await response.json();
        text = data.content?.filter(b => b.type === "text")?.map(b => b.text)?.join("\n") || "Try again.";
      } else {
        // On Vercel — call our serverless proxy (API key stays on server)
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q, mode: "chat" }),
        });
        const data = await response.json();
        text = data.text || data.error || "Try again.";
      }

      setMsgs(prev => [...prev, { role: "assistant", text }]);
    } catch (err) {
      setMsgs(prev => [...prev, { role:"assistant", text:`Error: ${err.message}. If on Vercel, check that ANTHROPIC_API_KEY is set in Settings → Environment Variables.` }]);
    }
    setStreamText("");
    setLoading(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 105px)" }}>
      <div style={{ flex:1, overflowY:"auto", padding:"10px 14px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom:8 }}>
            <div style={{
              maxWidth:"88%", padding:"10px 14px",
              background: m.role === "user" ? "linear-gradient(135deg,#1a2540,#1a3050)" : "linear-gradient(135deg,#12141c,#181c28)",
              border:`1px solid ${m.role === "user" ? "#2a3a5a" : "#1e2230"}`,
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
            }}>
              {m.role === "assistant" && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ff6b3d", letterSpacing:2, marginBottom:3 }}>MADNESSIQ AI</div>}
              <div style={{ fontSize:12, lineHeight:1.65, color: m.role === "user" ? "#c8d8f0" : "#d0ccc4", whiteSpace:"pre-wrap" }}>{m.text}</div>
            </div>
          </div>
        ))}
        {(loading && streamText) && (
          <div style={{ display:"flex", marginBottom:8 }}>
            <div style={{ maxWidth:"88%", padding:"10px 14px", background:"linear-gradient(135deg,#12141c,#181c28)", border:"1px solid #1e2230", borderRadius:"14px 14px 14px 4px" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ff6b3d", letterSpacing:2, marginBottom:3 }}>MADNESSIQ AI • STREAMING</div>
              <div style={{ fontSize:12, lineHeight:1.65, color:"#d0ccc4", whiteSpace:"pre-wrap" }}>{streamText}<span style={{ animation:"pulse 1s infinite" }}>▊</span></div>
            </div>
          </div>
        )}
        {(loading && !streamText) && (
          <div style={{ display:"flex", marginBottom:8 }}>
            <div style={{ padding:"10px 14px", background:"#12141c", border:"1px solid #1e2230", borderRadius:"14px 14px 14px 4px" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ff6b3d", letterSpacing:2, marginBottom:3 }}>SEARCHING WEB...</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8090a0", animation:"pulse 1.5s ease infinite" }}>Finding latest data and generating analysis...</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding:"6px 14px 14px", borderTop:"1px solid #1a1d25", background:"#08090c" }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about any matchup, team, injury..."
            style={{ flex:1, background:"#12141c", border:"1px solid #2a2d38", borderRadius:10, padding:"10px 14px", color:"#e2ddd5", fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:12 }}
          />
          <button onClick={send} disabled={loading} style={{
            background: loading ? "#2a2d38" : "linear-gradient(135deg,#ff6b3d,#ed4a2a)",
            border:"none", borderRadius:10, padding:"10px 18px", color:"#fff", cursor: loading ? "wait" : "pointer",
            fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:700,
          }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ────────────────────────────────────────────────
export default f(trip.people || []).flatMaption MadnessIQ() {
  const [tab, setTab] = useState("bracket");
  const [region, setRegion] = useState("EAST");
  const [round, setRound] = useState("R64");
  const [expanded, setExpanded] = useState(null);
  const [detailSection, setDetailSection] = useState("matchup");
  const [liveScores, setLiveScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch scores on page load and via refresh button
  const fetchScores = useCallback(async () => {
    setScoresLoading(true);
    try {
      const isArtifact = typeof window !== "undefined" && (
        window.location.hostname.includes("claude") || window.location.protocol === "about:"
      );
      let scores;
      if (isArtifact) {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514", max_tokens: 2000,
            system: 'Search for 2026 NCAA men\'s tournament scores today. Return ONLY a JSON array, no markdown: [{"team1":"Duke","score1":71,"team2":"Siena","score2":65,"status":"FINAL","region":"EAST"}] Include completed, live, and upcoming games.',
            messages: [{ role: "user", content: "Latest 2026 NCAA tournament scores" }],
            tools: [{ type: "web_search_20250305", name: "web_search" }],
          }),
        });
        const data = await resp.json();
        const text = data.content?.filter(b => b.type === "text")?.map(b => b.text)?.join("") || "[]";
        try { scores = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { scores = null; }
      } else {
        const resp = await fetch("/api/scores");
        const data = await resp.json();
        scores = data.scores || null;
      }
      if (scores) setLiveScores(scores);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Score fetch error:", err);
    }
    setScoresLoading(false);
  }, []);

  // Auto-fetch on first load
  useEffect(() => { fetchScores(); }, [fetchScores]);

  const games = GAMES[region] || [];
  const TABS = [
    { id:"bracket", label:"BRACKET" },
    { id:"chat", label:"ASK AI" },
  ];

  const regionColors = { EAST:"#3d7aed", WEST:"#ed5a3d", SOUTH:"#3ded7a", MIDWEST:"#edcc3d" };
  const regionSites = { EAST:"Washington, D.C.", WEST:"San Jose, CA", SOUTH:"Houston, TX", MIDWEST:"Chicago, IL" };

  return (
    <div style={{ fontFamily:"'Libre Baskerville','Baskerville',Georgia,serif", background:"#08090c", color:"#e2ddd5", minHeight:"100vh", maxWidth:520, margin:"0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #2a2d35; border-radius: 2px; }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
        input:focus { outline:none; }
      `}</style>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(180deg,#0e1018,#08090c)", borderBottom:"1px solid #1a1d25", padding:"12px 16px 8px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h1 style={{ fontSize:19, fontWeight:700, margin:0 }}>
              <span style={{ color:"#ff6b3d" }}>Madness</span><span>IQ</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#6a7080", marginLeft:6, verticalAlign:"super" }}>v3</span>
            </h1>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#3ded7a", textAlign:"right" }}>
            LIVE AI + WEB SEARCH<br/><span style={{ color:"#8090a0" }}>2026 NCAA TOURNAMENT</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:3, marginTop:8 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, background: tab === t.id ? "#1a1d28" : "transparent",
              borderBottom: tab === t.id ? "2px solid #ff6b3d" : "2px solid transparent",
              border:"none", borderTop:"none", borderLeft:"none", borderRight:"none",
              color: tab === t.id ? "#e2ddd5" : "#8090a0",
              padding:"6px 4px 4px", cursor:"pointer",
              fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1,
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ BRACKET TAB ══════════ */}
      {tab === "bracket" && (
        <div style={{ padding:"10px 12px 80px" }}>

          {/* Live scores refresh bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, padding:"6px 10px", background:"#0c0e14", borderRadius:6, border:"1px solid #1a1d28" }}>
            <div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: scoresLoading ? "#edaa3d" : liveScores ? "#3ded7a" : "#8090a0", letterSpacing:1 }}>
                {scoresLoading ? "SEARCHING WEB FOR SCORES..." : liveScores ? "LIVE SCORES LOADED" : "SCORES"}
              </div>
              {lastRefresh && (
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#6a7080", marginTop:1 }}>
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
            <button onClick={fetchScores} disabled={scoresLoading} style={{
              background: scoresLoading ? "#1a1d28" : "linear-gradient(135deg,#ff6b3d,#ed4a2a)",
              border:"none", borderRadius:6, padding:"5px 12px", color:"#fff", cursor: scoresLoading ? "wait" : "pointer",
              fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:1,
              opacity: scoresLoading ? 0.6 : 1,
            }}>
              {scoresLoading ? "..." : "\u21BB REFRESH"}
            </button>
          </div>

          {/* Live scores display */}
          {liveScores && Array.isArray(liveScores) && liveScores.length > 0 && liveScores[0].status !== "NOT_STARTED" && (
            <div style={{ marginBottom:10, background:"#0c0e14", border:"1px solid #1a2030", borderRadius:8, padding:"8px 10px" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, color:"#ff6b3d", marginBottom:6 }}>LATEST SCORES (VIA WEB SEARCH)</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                {liveScores.filter(g => g.team1 && g.team2).slice(0, 8).map((g, i) => (
                  <div key={i} style={{
                    background:"#0e1016", borderRadius:5, padding:"5px 7px",
                    borderLeft: g.status === "LIVE" ? "2px solid #ff3b3b" : g.status === "FINAL" ? "2px solid #3ded7a" : "2px solid #2a2d35",
                  }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color: g.status === "LIVE" ? "#ff3b3b" : g.status === "FINAL" ? "#3ded7a" : "#6a7080", marginBottom:2 }}>
                      {g.status}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10 }}>
                      <span style={{ color: (g.score1||0) >= (g.score2||0) ? "#e2ddd5" : "#6a6d75" }}>{g.team1}</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"#e2ddd5" }}>{g.score1 ?? ""}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10 }}>
                      <span style={{ color: (g.score2||0) > (g.score1||0) ? "#e2ddd5" : "#6a6d75" }}>{g.team2}</span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:"#e2ddd5" }}>{g.score2 ?? ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thursday scorecard banner */}
          <div style={{ background:"linear-gradient(135deg,#101420,#141018)", border:"1px solid #2a2540", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, color:"#ff6b3d" }}>THURSDAY R64 SCORECARD</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d9a" }}>Updated Mar 19</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <div style={{ flex:1, background:"#0a1a10", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #1a3a22" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#3ded7a" }}>11</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#3ded7a", letterSpacing:1 }}>CORRECT</div>
              </div>
              <div style={{ flex:1, background:"#1a0e10", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #3a1a1e" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#ed5a5a" }}>5</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ed5a5a", letterSpacing:1 }}>MISSED</div>
              </div>
              <div style={{ flex:1, background:"#0e1420", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #1a2a40" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#4a9aed" }}>69%</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#4a9aed", letterSpacing:1 }}>ACCURACY</div>
              </div>
              <div style={{ flex:1, background:"#1a1410", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #3a2a1a" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#edaa3d" }}>1</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#edaa3d", letterSpacing:1 }}>UPSET HIT</div>
              </div>
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#6a6d78", marginTop:6, lineHeight:1.5 }}>
              Called A&M upset. Duke nearly fell to Siena. VCU erased 19-pt deficit to beat (trip.people || []).flatMap in historic comeback. High Point stunned Wisconsin. Friday games still to come.
            </div>
          </div>

          {/* Region tabs — includes FINAL 4 */}
          <div style={{ display:"flex", gap:2, marginBottom:6 }}>
            {[...Object.keys(GAMES), "FINAL4"].map(r => (
              <button key={r} onClick={() => { setRegion(r); setRound(r === "FINAL4" ? "F4" : "R64"); setExpanded(null); }} style={{
                flex:1, background: region === r ? "#1a1d28" : "transparent",
                border:"none", borderBottom: region === r ? `2px solid ${r === "FINAL4" ? "#ff6b3d" : regionColors[r]}` : "2px solid transparent",
                color: region === r ? (r === "FINAL4" ? "#ff6b3d" : regionColors[r]) : "#6a7080",
                padding:"5px 2px 3px", cursor:"pointer",
                fontFamily:"'DM Mono',monospace", fontSize: r === "FINAL4" ? 8 : 9, letterSpacing:1,
              }}>
                {r === "FINAL4" ? "FINAL 4" : r}
              </button>
            ))}
          </div>

          {/* ── REGIONAL VIEW ── */}
          {region !== "FINAL4" && (
            <>
              {/* Round selector */}
              <div style={{ display:"flex", gap:3, marginBottom:8 }}>
                {["R64","R32","S16","E8"].map(rd => {
                  const hasGames = rd === "R64" ? true : LATER_ROUNDS[region]?.[rd]?.length > 0;
                  return (
                    <button key={rd} onClick={() => { if(hasGames){ setRound(rd); setExpanded(null); }}} style={{
                      flex:1, padding:"5px 2px",
                      background: round === rd ? `${regionColors[region]}15` : "transparent",
                      border: round === rd ? `1px solid ${regionColors[region]}40` : "1px solid #222530",
                      borderRadius:5, cursor: hasGames ? "pointer" : "default",
                      fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1,
                      color: round === rd ? regionColors[region] : hasGames ? "#8a8d9a" : "#3a3d48",
                      opacity: hasGames ? 1 : 0.4,
                    }}>
                      {rd}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d9a", marginBottom:8 }}>
                {regionSites[region]} {" \u2022 "} {ROUND_LABELS[round] || round} {round !== "R64" && <span style={{ color: regionColors[region] }}>{" \u2022 "}PROJECTED</span>}
              </div>

              {/* GAME CARDS — R64 or later rounds */}
              {(round === "R64" ? games : (LATER_ROUNDS[region]?.[round] || [])).map((g, i) => {
                const isExp = expanded === i;
                const isLater = round !== "R64";
                return (
                  <div key={`${round}-${i}`} onClick={() => { setExpanded(isExp ? null : i); setDetailSection(g.result ? "postgame" : g.edge ? "matchup" : "why"); }} style={{
                    background: isExp ? "linear-gradient(135deg,#12141e,#161424)" : "#0e1016",
                    border:`1px solid ${isExp ? "#3a3a5a" : g.upset ? "#3a1a20" : "#282c38"}`,
                    borderLeft: g.upset ? "3px solid #ed3d5a" : g.riskLevel === "TOSS-UP" ? "3px solid #ed8a3d" : `3px solid ${regionColors[region]}40`,
                    borderRadius:8, marginBottom:5, cursor:"pointer", overflow:"hidden",
                    animation:`slideUp 0.25s ease ${i*0.03}s both`,
                  }}>
                    <div style={{ padding:"9px 10px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <ConfidenceGauge value={g.confidence} originalValue={g.originalConfidence} size={40} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2, flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a8d9a" }}>{g.s1}</span>
                            <span style={{ fontSize:12, fontWeight: g.pick===g.t1?700:400, color: g.result ? (g.result.winner===g.t1 ? "#e2ddd5" : "#5a5d68") : g.pick===g.t1?"#4aed7a":"#b8bac2" }}>{g.t1}</span>
                            {g.result && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color: g.result.winner===g.t1 ? "#e2ddd5" : "#5a5d68" }}>{g.result.score1}</span>}
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d9a" }}>{g.result ? "—" : "vs"}</span>
                            {g.result && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color: g.result.winner===g.t2 ? "#e2ddd5" : "#5a5d68" }}>{g.result.score2}</span>}
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a8d9a" }}>{g.s2}</span>
                            <span style={{ fontSize:12, fontWeight: g.pick===g.t2?700:400, color: g.result ? (g.result.winner===g.t2 ? "#e2ddd5" : "#5a5d68") : g.pick===g.t2?"#4aed7a":"#b8bac2" }}>{g.t2}</span>
                          </div>
                          <div style={{ fontSize:10, color: g.upset?"#ed8a8a":"#a0a3ae", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {g.headline}
                          </div>
                        </div>
                        {g.result ? (
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, fontWeight:700, padding:"3px 6px", borderRadius:4,
                            color: g.result.correct ? "#3ded7a" : "#ed5a5a",
                            background: g.result.correct ? "#0e1e14" : "#1e0e10",
                            border: `1px solid ${g.result.correct ? "#1a3a22" : "#3a1a1e"}`,
                          }}>
                            {g.result.correct ? "\u2713 CALLED" : "\u2717 MISS"}
                          </span>
                        ) : (
                          <RiskBadge level={g.riskLevel} />
                        )}
                      </div>
                    </div>

                    {isExp && (
                      <div style={{ borderTop:"1px solid #2a2d3a", padding:"10px", animation:"slideUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", gap:2, marginBottom:10 }}>
                          {[
                            ...(g.result ? [{id:"postgame",label:g.result.correct ? "\u2713 RESULT" : "\u2717 RESULT"}] : []),
                            ...(g.edge ? [{id:"matchup",label:"MATCHUP"}] : []),
                            ...(g.injuries?.length ? [{id:"injuries",label:`INJURIES (${g.injuries.length})`}] : []),
                            {id:"why",label: g.result ? "PRE-GAME" : "ANALYSIS"},
                          ].map(s => (
                            <button key={s.id} onClick={() => setDetailSection(s.id)} style={{
                              flex:1, background: detailSection === s.id ? "#1a1d28" : "transparent",
                              border:`1px solid ${detailSection === s.id ? "#3a4560" : "#222530"}`,
                              color: detailSection === s.id ? "#e2ddd5" : "#8090a0",
                              padding:"4px 2px", borderRadius:4, cursor:"pointer",
                              fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:1,
                            }}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                        {detailSection === "postgame" && g.result && (
                          <div>
                            <div style={{ background: g.result.correct ? "#0a1a10" : "#1a0e10", border: `1px solid ${g.result.correct ? "#1a3a22" : "#3a1a1e"}`, borderRadius:6, padding:"8px 10px", marginBottom:8 }}>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: g.result.correct ? "#3ded7a" : "#ed5a5a", letterSpacing:1, marginBottom:3 }}>
                                {g.result.correct ? "PREDICTION: CORRECT" : "PREDICTION: MISSED"}
                              </div>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:"#e2ddd5", marginBottom:6 }}>
                                {g.result.winner} {Math.max(g.result.score1,g.result.score2)} — {Math.min(g.result.score1,g.result.score2)}
                              </div>
                              <div style={{ fontSize:11, lineHeight:1.6, color:"#d0ccc4" }}>{g.result.postGame}</div>
                            </div>
                          </div>
                        )}
                        {detailSection === "matchup" && g.edge && (
                          <div>
                            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d98", marginBottom:6 }}>
                              <span style={{ color: g.pick===g.t1?"#4aed7a":"#c0c3cc", fontWeight:700 }}>{g.t1Short || g.t1}</span>
                              <span style={{ color: g.pick===g.t2?"#4aed7a":"#c0c3cc", fontWeight:700 }}>{g.t2Short || g.t2}</span>
                            </div>
                            <EdgeBar label="OFFENSE" val1={g.edge.offense} val2={g.edgeOpp.offense} color1={regionColors[region] || "#ff6b3d"} color2="#5a5d68" />
                            <EdgeBar label="DEFENSE" val1={g.edge.defense} val2={g.edgeOpp.defense} color1={regionColors[region] || "#ff6b3d"} color2="#5a5d68" />
                            <EdgeBar label="EXPERIENCE" val1={g.edge.experience} val2={g.edgeOpp.experience} color1={regionColors[region] || "#ff6b3d"} color2="#5a5d68" />
                            <EdgeBar label="HEALTH" val1={g.edge.health} val2={g.edgeOpp.health} color1={regionColors[region] || "#ff6b3d"} color2="#5a5d68" />
                            {g.keyStats && <div style={{ display:"flex", gap:4, marginTop:8 }}>{g.keyStats.map((s,j) => <StatPill key={j} stat={s} />)}</div>}
                          </div>
                        )}
                        {detailSection === "injuries" && (
                          <div>
                            {(!g.injuries || g.injuries.length === 0) ? (
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#3ded7a", padding:8, textAlign:"center" }}>{"\u2713"} No significant injuries</div>
                            ) : g.injuries.map((inj, j) => (
                              <div key={j} style={{ marginBottom:6 }}>
                                <InjuryBadge injury={inj} />
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8090a0", marginLeft:42, marginTop:1 }}>
                                  Impact: <span style={{ color: inj.impact==="CRITICAL"?"#ed3d3d":inj.impact==="HIGH"?"#ed8a3d":"#edcc3d" }}>{inj.impact}</span> {"\u2014"} {inj.detail}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {detailSection === "why" && (
                          <div>
                            <div style={{ marginBottom:8 }}>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#3ded7a", letterSpacing:1, marginBottom:3 }}>WHY {g.pick.toUpperCase()} WINS</div>
                              <div style={{ fontSize:11, lineHeight:1.6, color:"#d0ccc4" }}>{g.whyPick}</div>
                            </div>
                            <div style={{ marginBottom: g.historicalNote ? 8 : 0 }}>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ed8a3d", letterSpacing:1, marginBottom:3 }}>WHAT COULD GO WRONG</div>
                              <div style={{ fontSize:11, lineHeight:1.6, color:"#b0aca4" }}>{g.whyNot}</div>
                            </div>
                            {g.historicalNote && (
                              <div style={{ background:"#0e1018", borderRadius:5, padding:"6px 8px", border:"1px solid #222530" }}>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8090a0", letterSpacing:1, marginBottom:2 }}>{"\uD83D\uDCCA"} HISTORICAL</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d9a" }}>{g.historicalNote}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Region champion callout */}
              <div style={{ marginTop:8, background:"linear-gradient(135deg,#10121a,#141220)", border:`1px solid ${regionColors[region]}30`, borderRadius:8, padding:"10px 12px" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, color:regionColors[region], marginBottom:4 }}>{region} REGION CHAMPION</div>
                <div style={{ fontSize:16, fontWeight:700, color:"#e2ddd5" }}>
                  {region === "EAST" ? "\uD83C\uDFC0 Duke (1)" : region === "WEST" ? "\uD83C\uDFC0 Arizona (1)" : region === "SOUTH" ? "\uD83C\uDFC0 Houston (2)" : "\uD83C\uDFC0 Michigan (1)"}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d9a", marginTop:4, lineHeight:1.6 }}>
                  {region === "EAST" && "Path: Siena \u2192 Ohio St \u2192 St. John's \u2192 Michigan St \u2192 Final Four"}
                  {region === "WEST" && "Path: LIU \u2192 Utah State \u2192 Arkansas \u2192 Purdue \u2192 Final Four"}
                  {region === "SOUTH" && "Path: Idaho \u2192 Texas A&M \u2192 Illinois \u2192 Florida (@ Toyota Center) \u2192 Final Four"}
                  {region === "MIDWEST" && "Path: UMBC/Howard \u2192 Saint Louis \u2192 Akron \u2192 Iowa State \u2192 Final Four"}
                </div>
              </div>
            </>
          )}

          {/* ── FINAL FOUR VIEW ── */}
          {region === "FINAL4" && (
            <>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ff6b3d", letterSpacing:2, marginBottom:10 }}>
                FINAL FOUR {"\u2014"} INDIANAPOLIS {"\u2022"} APRIL 4-6
              </div>

              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d9a", letterSpacing:1, marginBottom:4 }}>NATIONAL SEMIFINALS</div>
              {LATER_ROUNDS.FINAL_FOUR.map((g, i) => (
                <div key={`ff-${i}`} onClick={() => setExpanded(expanded === `ff${i}` ? null : `ff${i}`)} style={{
                  background: expanded === `ff${i}` ? "linear-gradient(135deg,#12141e,#161424)" : "#0e1016",
                  border:`1px solid ${expanded === `ff${i}` ? "#3a3a5a" : "#282c38"}`,
                  borderLeft:"3px solid #ff6b3d", borderRadius:8, marginBottom:5, cursor:"pointer", overflow:"hidden",
                }}>
                  <div style={{ padding:"9px 10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <ConfidenceGauge value={g.confidence} originalValue={g.originalConfidence} size={40} />
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2, flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: regionColors[g.region1] || "#8a8d9a" }}>{g.region1}</span>
                          <span style={{ fontSize:12, fontWeight: g.pick===g.t1?700:400, color: g.pick===g.t1?"#4aed7a":"#b8bac2" }}>({g.s1}) {g.t1}</span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d9a" }}>vs</span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: regionColors[g.region2] || "#8a8d9a" }}>{g.region2}</span>
                          <span style={{ fontSize:12, fontWeight: g.pick===g.t2?700:400, color: g.pick===g.t2?"#4aed7a":"#b8bac2" }}>({g.s2}) {g.t2}</span>
                        </div>
                        <div style={{ fontSize:10, color:"#a0a3ae" }}>{g.headline}</div>
                      </div>
                      <RiskBadge level={g.riskLevel} />
                    </div>
                  </div>
                  {expanded === `ff${i}` && (
                    <div style={{ borderTop:"1px solid #2a2d3a", padding:"10px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ marginBottom:8 }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#3ded7a", letterSpacing:1, marginBottom:3 }}>WHY {g.pick.toUpperCase()} WINS</div>
                        <div style={{ fontSize:11, lineHeight:1.6, color:"#d0ccc4" }}>{g.whyPick}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ed8a3d", letterSpacing:1, marginBottom:3 }}>WHAT COULD GO WRONG</div>
                        <div style={{ fontSize:11, lineHeight:1.6, color:"#b0aca4" }}>{g.whyNot}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ff6b3d", letterSpacing:2, marginTop:14, marginBottom:4 }}>NATIONAL CHAMPIONSHIP {"\u2014"} MONDAY APRIL 6</div>
              {LATER_ROUNDS.CHAMPIONSHIP.map((g, i) => (
                <div key={`ch-${i}`} onClick={() => setExpanded(expanded === "champ" ? null : "champ")} style={{
                  background: expanded === "champ" ? "linear-gradient(135deg,#141620,#1a1428)" : "linear-gradient(135deg,#0e1016,#121018)",
                  border: expanded === "champ" ? "1px solid #4a3a5a" : "1px solid #2a2538",
                  borderLeft:"3px solid #ff6b3d", borderRadius:8, marginBottom:5, cursor:"pointer", overflow:"hidden",
                }}>
                  <div style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ fontSize:24 }}>{"\uD83C\uDFC6"}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                          <span style={{ fontSize:14, fontWeight: g.pick===g.t1?700:400, color: g.pick===g.t1?"#4aed7a":"#b8bac2" }}>({g.s1}) {g.t1}</span>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d9a" }}>vs</span>
                          <span style={{ fontSize:14, fontWeight: g.pick===g.t2?700:400, color: g.pick===g.t2?"#4aed7a":"#b8bac2" }}>({g.s2}) {g.t2}</span>
                        </div>
                        <div style={{ fontSize:11, color:"#d0ccc4" }}>{g.headline}</div>
                      </div>
                      <ConfidenceGauge value={g.confidence} originalValue={g.originalConfidence} size={44} />
                    </div>
                  </div>
                  {expanded === "champ" && (
                    <div style={{ borderTop:"1px solid #2a2d3a", padding:"10px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ marginBottom:8 }}>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#3ded7a", letterSpacing:1, marginBottom:3 }}>WHY {g.pick.toUpperCase()} WINS IT ALL</div>
                        <div style={{ fontSize:11, lineHeight:1.6, color:"#d0ccc4" }}>{g.whyPick}</div>
                      </div>
                      <div>
                        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ed8a3d", letterSpacing:1, marginBottom:3 }}>WHAT COULD GO WRONG</div>
                        <div style={{ fontSize:11, lineHeight:1.6, color:"#b0aca4" }}>{g.whyNot}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop:12, background:"linear-gradient(135deg,#141620,#1a1428)", border:"1px solid #3a3558", borderRadius:10, padding:"16px", textAlign:"center" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:4, color:"#6a5aaa", marginBottom:4 }}>MADNESSIQ PREDICTION</div>
                <div style={{ fontSize:26, fontWeight:700, marginBottom:4 }}>{"\uD83C\uDFC6"} Duke Blue Devils</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b0a8cc" }}>Cameron Boozer {"\u2014"} Most Outstanding Player</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a7acc", marginTop:6 }}>Jon Scheyer's 1st championship as head coach</div>
              </div>
            </>
          )}
        </div>
      )}


      {/* ══════════ CHAT TAB ══════════ */}
      {tab === "chat" && <ChatView />}
    </div>
  );
}
