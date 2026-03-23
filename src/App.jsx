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
      id:"E0", date:"Thu Mar 19", s1:1, t1:"Duke", t1Short:"DUKE", r1:"32-2", s2:16, t2:"Siena", t2Short:"SIENA", r2:"23-11",
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
      id:"E1", date:"Thu Mar 19", s1:8, t1:"Ohio State", t1Short:"OSU", r1:"21-12", s2:9, t2:"TCU", t2Short:"TCU", r2:"22-11",
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
      id:"E2", date:"Fri Mar 20", s1:5, t1:"St. John's", t1Short:"SJU", r1:"28-6", s2:12, t2:"Northern Iowa", t2Short:"UNI", r2:"23-12",
      pick:"St. John's", confidence:68, upset:false, riskLevel:"LEAN",
      headline:"FINAL: St. John's 73-55. Jumped to 20-3 lead. Ejiofor 14/11 double-double.",
      result: { score1:73, score2:55, winner:"St. John's", correct:true, postGame:"St. John's dominated from the opening tip — 20-3 run to start. Ejiofor had 14 pts, 11 reb double-double. UNI shot 39% and just 3-14 from deep. Red Storm advance to face Kansas in R32." },
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
      id:"E3", date:"Fri Mar 20", s1:4, t1:"Kansas", t1Short:"KU", r1:"23-10", s2:13, t2:"Cal Baptist", t2Short:"CBU", r2:"25-8",
      pick:"Kansas", confidence:82, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Kansas 68-60. Peterson 28 pts. Cal Baptist nearly came back.",
      result: { score1:68, score2:60, winner:"Kansas", correct:true, postGame:"Peterson showed up with 28 points on 11-24 shooting. Kansas led by 26 before Cal Baptist went on an 18-2 run behind Dominique Daniels Jr. (25 pts). Kansas survived and faces St. John's in R32 — Pitino vs Self." },
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
      id:"E4", date:"Thu Mar 19", s1:6, t1:"Louisville", t1Short:"LOU", r1:"23-10", s2:11, t2:"S. Florida", t2Short:"USF", r2:"25-8",
      pick:"S. Florida", confidence:62, upset:true, riskLevel:"UPSET",
      headline:"FINAL: Louisville 83-79. McKneely's 7 threes saved Louisville.",
      result: { score1:83, score2:79, winner:"Louisville", correct:false, postGame:"Our top upset pick missed. McKneely hit 7 threes (23 pts). USF erased a 23-point deficit but fell short. Louisville's 22 turnovers nearly cost them. Louisville faces Michigan State in R32." },
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
      id:"E5", date:"Thu Mar 19", s1:3, t1:"Michigan St.", t1Short:"MSU", r1:"25-7", s2:14, t2:"N. Dakota St.", t2Short:"NDSU", r2:"27-7",
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
      id:"E6", date:"Fri Mar 20", s1:7, t1:"UCLA", t1Short:"UCLA", r1:"23-11", s2:10, t2:"UCF", t2Short:"UCF", r2:"21-11",
      pick:"UCF", confidence:58, upset:true, riskLevel:"UPSET",
      headline:"FINAL: UCLA 75-71. Dailey 20 pts. 13 steals, 9 blocks as a team.",
      result: { score1:75, score2:71, winner:"UCLA", correct:false, postGame:"We picked UCF on UCLA's injuries but the Bruins won anyway. Bilodeau sat but Dent played. Dailey had 20 pts. UCLA forced 17 turnovers with 13 steals and 9 blocks. UCF's Stillwell had 10/13 but it wasn't enough. UCLA faces UConn in R32." },
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
      id:"E7", date:"Fri Mar 20", s1:2, t1:"UConn", t1Short:"UCONN", r1:"29-5", s2:15, t2:"Furman", t2Short:"FUR", r2:"22-12",
      pick:"UConn", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"FINAL: UConn 77-68. Reed Jr. 31 pts, 27 rebounds (!!) — historic.",
      result: { score1:77, score2:68, winner:"UConn", correct:true, postGame:"Tarris Reed Jr. had one of the greatest individual performances in tournament history: 31 pts, 27 rebounds (11 offensive). He personally outrebounded the entire Furman team. UConn shot just 5-25 from 3 but Reed dominated inside. Karaban added 22. UConn faces UCLA in R32." },
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
    { id:"W0", date:"Fri Mar 20", s1:1, t1:"Arizona", t1Short:"ARIZ", r1:"32-2", s2:16, t2:"Long Island", t2Short:"LIU", r2:"24-10", pick:"Arizona", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Arizona 92-58. Blowout. 53-29 at halftime.",
      result: { score1:92, score2:58, winner:"Arizona", correct:true, postGame:"Total domination. Arizona raced to a 53-29 halftime lead and never looked back. The Wildcats' depth and defense were overwhelming. Arizona faces Utah State in R32." }, edge:{offense:95,defense:94,experience:80,health:95}, edgeOpp:{offense:30,defense:25,experience:35,health:85},
      keyStats:[{label:"AZ Ranked Ws",value:"12 (tied record)",hot:true},{label:"AZ Defense",value:"KenPom #3",hot:true},{label:"Depth",value:"8+ deep rotation",hot:false}],
      injuries:[], whyPick:"Arizona may have the tournament's deepest, most talented roster. Bradley (B12 POTY), Burries (lottery pick), Peat, Krivas, Awaka — no 16-seed can compete.", whyNot:"Arizona hasn't passed the Sweet 16 under Lloyd. But LIU won't test that.", historicalNote:"16-seeds are 2-144 all-time."
    },
    { id:"W1", date:"Fri Mar 20", s1:8, t1:"Villanova", t1Short:"NOVA", r1:"24-8", s2:9, t2:"Utah State", t2Short:"USU", r2:"28-6", pick:"Utah State", confidence:56, upset:false, riskLevel:"TOSS-UP",
      headline:"FINAL: Utah State wins. All four 9-seeds won this year.",
      result: { score1:0, score2:0, winner:"Utah State", correct:true, postGame:"Utah State completes the 9-seed sweep — all four 8/9 games went to the 9-seed this tournament (TCU, Iowa, Utah State, Saint Louis). Utah State faces Arizona in R32." }, edge:{offense:62,defense:58,experience:70,health:55}, edgeOpp:{offense:65,defense:62,experience:72,health:90},
      keyStats:[{label:"KenPom",value:"USU 32nd, Nova 33rd",hot:true},{label:"Nova loss",value:"Hodge torn ACL",hot:true},{label:"MWC POTY",value:"Mason Falslev",hot:false}],
      injuries:[{player:"M. Hodge",team:"Villanova",status:"OUT",impact:"HIGH",detail:"Torn ACL — season over. Was averaging 9.2 PPG."}],
      whyPick:"USU is actually ranked higher in KenPom. Their ball-screen offense historically gives Willard's teams trouble. Villanova losing Hodge (ACL) weakens their interior.", whyNot:"Villanova has more tournament pedigree. If they shoot well from 3, they can overcome the matchup issues.", historicalNote:"9-seeds win 48.5% of 8/9 matchups."
    },
    { id:"W2", date:"Thu Mar 19", s1:5, t1:"Wisconsin", t1Short:"WISC", r1:"24-10", s2:12, t2:"High Point", t2Short:"HPU", r2:"30-4", pick:"Wisconsin", confidence:63, upset:false, riskLevel:"LEAN",
      headline:"FINAL: High Point 83-82! First upset of the tourney.",
      result: { score1:82, score2:83, winner:"High Point", correct:false, postGame:"Chase Johnston hit 4 threes and passed Steph Curry on the all-time NCAA 3-pointer list. HP was 0-57 vs Power Four before this. Faces Arkansas in R32." }, edge:{offense:62,defense:55,experience:75,health:88}, edgeOpp:{offense:68,defense:50,experience:48,health:90},
      keyStats:[{label:"HP Streak",value:"14 wins in a row",hot:true},{label:"HP SOS",value:"0 KenPom top-150 Ws",hot:true},{label:"Wisc TO%",value:"Elite ball control",hot:false}],
      injuries:[], whyPick:"High Point relies on turnovers to fuel their offense. Wisconsin doesn't turn it over. That stylistic mismatch favors the Badgers. Boyd and Blackwell are experienced guards who won't be rattled.", whyNot:"HP is 30-4 and red hot. If they hit threes early and build confidence, Wisconsin's mediocre defense (62nd) may not hold up.", historicalNote:"12-seeds upset 5-seeds 35.7% of the time."
    },
    { id:"W3", date:"Thu Mar 19", s1:4, t1:"Arkansas", t1Short:"ARK", r1:"26-8", s2:13, t2:"Hawaii", t2Short:"HAW", r2:"24-8", pick:"Arkansas", confidence:78, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Arkansas 97-78. Acuff 24 pts, all 5 starters in double figs.",
      result: { score1:97, score2:78, winner:"Arkansas", correct:true, postGame:"Blowout. Acuff Jr. had 24 pts and 7 assists. All five starters in double figures despite only 4 threes. Arkansas faces High Point in R32." }, edge:{offense:82,defense:68,experience:60,health:75}, edgeOpp:{offense:48,defense:55,experience:55,health:90},
      keyStats:[{label:"Acuff Jr.",value:"SEC POTY (frosh!)",hot:true},{label:"ARK Off.",value:"KenPom #6",hot:true},{label:"Hawaii SOS",value:"0 ranked opponents",hot:false}],
      injuries:[{player:"K. Knox",team:"Arkansas",status:"OUT",impact:"MED",detail:"Season-ending — limits depth, but core rotation intact."}],
      whyPick:"Darius Acuff Jr. became the first freshman outright SEC POTY since Anthony Davis (2012). Arkansas has a top-6 offense. Hawaii hasn't faced a single ranked team.", whyNot:"Hawaii can slow tempo with Isaac Johnson inside. Arkansas's depth took a hit losing Knox. Playing in Portland helps Hawaii geographically.", historicalNote:"13-seeds win ~20% of the time."
    },
    { id:"W4", date:"Thu Mar 19", s1:6, t1:"BYU", t1Short:"BYU", r1:"23-11", s2:11, t2:"NC St/Texas", t2Short:"NCST", r2:"~20-13", pick:"BYU", confidence:64, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Texas 79-71. Dybantsa not enough without Saunders.",
      result: { score1:71, score2:79, winner:"Texas", correct:false, postGame:"Texas (First Four winner) upset BYU. Dybantsa scored but supporting cast failed. Texas faces Gonzaga in R32." }, edge:{offense:80,defense:55,experience:55,health:60}, edgeOpp:{offense:55,defense:58,experience:62,health:78},
      keyStats:[{label:"Dybantsa",value:"25+ PPG, likely #1 pick",hot:true},{label:"BYU since loss",value:"Under .500 w/o Saunders",hot:true},{label:"Wright III",value:"18.2 PPG 2nd option",hot:false}],
      injuries:[{player:"E. Saunders",team:"BYU",status:"OUT",impact:"HIGH",detail:"Shoulder surgery — season over. BYU 4-6 since."}],
      whyPick:"AJ Dybantsa is a generational scorer — 43 vs Utah, seven games of 28+. He's matchup-proof. Robert Wright III gives BYU a legitimate second option.", whyNot:"BYU went under .500 after losing Saunders. They're a one-man team and the supporting cast hasn't stepped up consistently.", historicalNote:"11-seeds upset 6-seeds 37.3% of the time."
    },
    { id:"W5", date:"Thu Mar 19", s1:3, t1:"Gonzaga", t1Short:"ZAGA", r1:"28-6", s2:14, t2:"Kennesaw St.", t2Short:"KSU", r2:"21-13", pick:"Gonzaga", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Gonzaga 73-64. Ike efficient. Kennesaw hung tough.",
      result: { score1:73, score2:64, winner:"Gonzaga", correct:true, postGame:"Gonzaga controlled it but Kennesaw made them work. Ike efficient inside as projected. Gonzaga faces Texas in R32." }, edge:{offense:82,defense:70,experience:88,health:70}, edgeOpp:{offense:30,defense:32,experience:40,health:85},
      keyStats:[{label:"Ike",value:"19.7 PPG, 61% inside arc",hot:true},{label:"KenPom gap",value:"91 spots (largest R64)",hot:true},{label:"Huff",value:"Possible return S16?",hot:false}],
      injuries:[{player:"B. Huff",team:"Gonzaga",status:"OUT",impact:"MED",detail:"Knee — walking without crutches. Could return Sweet 16."}],
      whyPick:"Graham Ike is a dominant interior scorer. Kennesaw has a 91-spot KenPom gap — the largest in the first round. Kennesaw won't have an answer for Ike.", whyNot:"Gonzaga's ceiling is limited without Huff. If he returns for the second weekend, they become a Final Four sleeper.", historicalNote:"14-seeds win ~7% of the time."
    },
    { id:"W6", date:"Fri Mar 20", s1:7, t1:"Miami (FL)", t1Short:"MIA", r1:"25-8", s2:10, t2:"Missouri", t2Short:"MIZZ", r2:"20-12", pick:"Miami (FL)", confidence:59, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Miami 80-66. Reneau 24 pts (19 in 2nd half).",
      result: { score1:80, score2:66, winner:"Miami (FL)", correct:true, postGame:"Reneau scored 19 of his 24 in the second half to pull away. Miami forced an 11-0 run to take control. First NCAA tourney win since 2023. Miami faces Purdue in R32 — they'll test Purdue's weak perimeter D." }, edge:{offense:65,defense:68,experience:65,health:85}, edgeOpp:{offense:62,defense:55,experience:58,health:82},
      keyStats:[{label:"Style",value:"Both push pace",hot:false},{label:"MIA Defense",value:"Better switching scheme",hot:true},{label:"Mizzou",value:"Wildly inconsistent yr",hot:false}],
      injuries:[], whyPick:"Miami's defensive versatility in switching gives them the edge in an uptempo battle. Missouri has alternated between dominant and inexplicable all year.", whyNot:"Missouri's ceiling is very high when they're on. If they shoot well from 3 and force turnovers in transition, they can win a track meet.", historicalNote:"10-seeds upset 7-seeds 39.1% of the time."
    },
    { id:"W7", date:"Fri Mar 20", s1:2, t1:"Purdue", t1Short:"PUR", r1:"27-8", s2:15, t2:"Queens (NC)", t2Short:"QU", r2:"21-13", pick:"Purdue", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Purdue advances. Historic offense rolls past Queens.",
      result: { score1:0, score2:0, winner:"Purdue", correct:true, postGame:"Purdue's record-setting offense dispatched Queens in their first-ever D1 tournament appearance. Smith and Kaufman-Renn controlled the game. Purdue faces Miami in R32." }, edge:{offense:98,defense:52,experience:92,health:90}, edgeOpp:{offense:25,defense:30,experience:10,health:88},
      keyStats:[{label:"Purdue Off.",value:"Best KenPom-era ever",hot:true},{label:"Smith",value:"Breaking Hurley ast record",hot:true},{label:"Queens",value:"First D1 tourney ever",hot:false}],
      injuries:[], whyPick:"Purdue has the best offensive efficiency of the KenPom era (since 1997). Braden Smith, Trey Kaufman-Renn, and Fletcher Loyer have played in huge games together.", whyNot:"Purdue's perimeter defense is a genuine weakness — but Queens doesn't have the athletes to exploit it. That becomes a problem in later rounds.", historicalNote:"15-seeds win ~6% of the time."
    },
  ],
  SOUTH: [
    { id:"S0", date:"Fri Mar 20", s1:1, t1:"Florida", t1Short:"UF", r1:"26-7", s2:16, t2:"Lehigh/PVAMU", t2Short:"16", r2:"~18-16", pick:"Florida", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Florida wins by 59. 60-21 at half. 2nd-largest margin EVER.",
      result: { score1:100, score2:41, winner:"Florida", correct:true, postGame:"Historic obliteration. Florida led 60-21 at halftime — the second-largest halftime lead in tournament history. Won by 59, the second-largest margin ever. Seven players in double figures. The defending champs are rolling. Florida faces Iowa in R32." }, edge:{offense:85,defense:82,experience:95,health:92}, edgeOpp:{offense:20,defense:22,experience:25,health:85},
      keyStats:[{label:"Returning",value:"3 title-game starters",hot:true},{label:"Rebounding",value:"Best frontcourt in field",hot:true},{label:"3PT trend",value:"349th→65th since Feb",hot:false}],
      injuries:[], whyPick:"Todd Golden returns Haugh, Condon, and Chinyelu from last year's championship team. That frontcourt experience is unmatched.", whyNot:"Florida's 3PT shooting was 349th before February. If it regresses, they become vulnerable — but not to a 16-seed.", historicalNote:"1-seeds are 142-2 all-time vs 16-seeds."
    },
    { id:"S1", date:"Fri Mar 20", s1:8, t1:"Clemson", t1Short:"CLEM", r1:"24-10", s2:9, t2:"Iowa", t2Short:"IOWA", r2:"21-12", pick:"Iowa", confidence:64, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Iowa 67-61. All four 9-seeds won. Clemson falls.",
      result: { score1:61, score2:67, winner:"Iowa", correct:true, postGame:"Iowa completes the historic 9-seed sweep. Clemson rallied from 14 down but couldn't complete the comeback. Welling's ACL tear was too much to overcome. Iowa faces Florida in R32." }, edge:{offense:55,defense:62,experience:60,health:42}, edgeOpp:{offense:68,defense:58,experience:65,health:88},
      keyStats:[{label:"Clemson loss",value:"Welling torn ACL",hot:true},{label:"Iowa KenPom",value:"11 spots ahead",hot:true},{label:"Iowa exp.",value:"NCAA tourney vets",hot:false}],
      injuries:[{player:"C. Welling",team:"Clemson",status:"OUT",impact:"CRITICAL",detail:"Torn ACL in ACC Tourney. 10.2 PPG, 5.4 RPG — devastating loss."}],
      whyPick:"Clemson lost their 6-11 starting big Carter Welling to a torn ACL in the ACC Tournament. That fundamentally changes their ceiling. Iowa is 11 spots ahead in KenPom.", whyNot:"Clemson's defense is still intact and they have ACC tournament grit. If they can survive inside without Welling, their perimeter play keeps them competitive.", historicalNote:"9-seeds win 48.5% of 8/9 games."
    },
    { id:"S2", date:"Thu Mar 19", s1:5, t1:"Vanderbilt", t1Short:"VANDY", r1:"26-8", s2:12, t2:"McNeese", t2Short:"MCN", r2:"28-5", pick:"Vanderbilt", confidence:70, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Vandy 78-68. Tanner 26 pts, took over after scary start.",
      result: { score1:78, score2:68, winner:"Vanderbilt", correct:true, postGame:"Tanner delivered: 26 pts, 7 reb, 5 ast. McNeese led 19-8 early but Tanner took over. Faces Nebraska in R32." }, edge:{offense:80,defense:58,experience:60,health:90}, edgeOpp:{offense:55,defense:52,experience:55,health:88},
      keyStats:[{label:"Tanner",value:"19.2/5.3/2.4 + 37% 3PT",hot:true},{label:"Vandy form",value:"Just beat #1 Florida",hot:true},{label:"McNeese",value:"Beat Clemson as 12 in '25",hot:false}],
      injuries:[], whyPick:"Tyler Tanner had the best breakout sophomore season in college basketball. Vanderbilt just dismantled Florida in the SEC Tournament. Their guard play is too dynamic for McNeese.", whyNot:"McNeese upset Clemson as a 12-seed last year — they have tournament DNA. If Vandy looks past them, the Cowboys will make them pay.", historicalNote:"12-seeds upset 5-seeds 35.7% of the time."
    },
    { id:"S3", date:"Thu Mar 19", s1:4, t1:"Nebraska", t1Short:"NEB", r1:"26-6", s2:13, t2:"Troy", t2Short:"TROY", r2:"22-11", pick:"Nebraska", confidence:78, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Nebraska 76-47. FIRST EVER tourney win. Bud Lights unlocked.",
      result: { score1:76, score2:47, winner:"Nebraska", correct:true, postGame:"Historic. Nebraska's first NCAA Tournament win ever. Sandfort hit 23 pts with 14 team threes. Bud Light fridges across Omaha unlocked. Faces Vanderbilt in R32." }, edge:{offense:58,defense:88,experience:62,health:90}, edgeOpp:{offense:45,defense:48,experience:50,health:85},
      keyStats:[{label:"NEB History",value:"0 NCAA W's EVER",hot:true},{label:"NEB Defense",value:"KenPom #7",hot:true},{label:"NEB slide",value:"6-6 after 20-0 start",hot:false}],
      injuries:[], whyPick:"Nebraska's defense (7th in KenPom) will turn this into an ugly, low-scoring affair — and that's exactly where they thrive. The 70-spot KenPom gap and elite D should be enough.", whyNot:"Nebraska is 6-6 down the stretch and has never won a tournament game. The psychological weight of history is real. Troy beat SDSU on the road and took USC to 3OT.", historicalNote:"Programs with 0 tourney wins face extra pressure. Nebraska's best seeding since 1991."
    },
    { id:"S4", date:"Thu Mar 19", s1:6, t1:"North Carolina", t1Short:"UNC", r1:"24-8", s2:11, t2:"VCU", t2Short:"VCU", r2:"27-7", pick:"North Carolina", confidence:53, upset:false, riskLevel:"TOSS-UP",
      headline:"FINAL: VCU 82-78 OT! Erased 19-pt deficit — historic comeback.",
      result: { score1:78, score2:82, winner:"VCU", correct:false, postGame:"VCU erased a 19-POINT deficit — the largest R64 comeback in NCAA Tournament history. Djokovic hit the go-ahead 3 with 15 seconds left in OT. We picked UNC at 53% and flagged this as a coin flip. Wilson's absence was decisive. VCU advances to face Illinois in R32." },
      edge:{offense:62,defense:58,experience:75,health:35}, edgeOpp:{offense:55,defense:72,experience:65,health:92},
      keyStats:[{label:"Wilson",value:"OUT — thumb (top 5 pick)",hot:true},{label:"UNC w/o him",value:"0-2, including blowout",hot:true},{label:"VCU",value:"A-10 champs, hottest team",hot:true}],
      injuries:[{player:"C. Wilson",team:"North Carolina",status:"OUT",impact:"CRITICAL",detail:"Thumb — season over. Was projected top-5 NBA pick. UNC is 0-2 without him: lost to Duke 76-61, Clemson 80-79."}],
      whyPick:"UNC's brand and remaining talent still matter in March. VCU's offense can be limited. This is barely a lean — I'm only picking UNC because of program pedigree.", whyNot:"UNC without Wilson is a fundamentally different team. They got crushed by Duke and lost by 1 to Clemson without him. VCU's defense is elite and they're the A-10 champs riding a hot streak. This is a genuine coin flip.", historicalNote: "11-seeds upset 6-seeds 37.3%. This is the single best upset opportunity driven by a star injury."
    },
    { id:"S5", date:"Thu Mar 19", s1:3, t1:"Illinois", t1Short:"ILL", r1:"24-8", s2:14, t2:"Penn", t2Short:"PENN", r2:"18-11", pick:"Illinois", confidence:90, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Illinois 105-70. Mirkovic 29/17. Led by 40 at one point.",
      result: { score1:105, score2:70, winner:"Illinois", correct:true, postGame:"Obliteration. Mirkovic went off with 29 pts, 17 rebounds. Five in double figures. Led by 40. The No. 1 offense is for real. Faces VCU in R32." }, edge:{offense:96,defense:65,experience:70,health:90}, edgeOpp:{offense:42,defense:38,experience:50,health:88},
      keyStats:[{label:"ILL Offense",value:"#1 in KenPom HISTORY",hot:true},{label:"Wagler",value:"Frosh phenom, lottery pick",hot:true},{label:"Penn: Power",value:"44 pts in Ivy title game",hot:false}],
      injuries:[], whyPick:"Illinois has a historically great offense. Keaton Wagler, the Ivisic brothers, Mirkovic, Stojakovic — too many weapons. Four of their 8 losses came in OT, suggesting bad luck, not a flaw.", whyNot:"TJ Power (Duke/Virginia transfer) scored 44 in the Ivy title game. He'll go after Illinois and could make it uncomfortable early. But Illinois has 5 players better than him.", historicalNote:"14-seeds win ~7% of the time. Ivy League teams have a scrappy tournament history."
    },
    { id:"S6", date:"Thu Mar 19", s1:7, t1:"Saint Mary's", t1Short:"SMC", r1:"27-5", s2:10, t2:"Texas A&M", t2Short:"TAMU", r2:"21-11", pick:"Texas A&M", confidence:56, upset:true, riskLevel:"UPSET",
      headline:"FINAL: A&M 63-50. UPSET CALLED. Bucky Ball dominated wire-to-wire.",
      result: { score1:50, score2:63, winner:"Texas A&M", correct:true, postGame:"CALLED IT. Texas A&M led by as much as 20 and went wire-to-wire. Bucky Ball motion offense completely befuddled Saint Mary's. The experience advantage (8 juniors/seniors) showed exactly as predicted. A&M faces Houston in R32." }, edge:{offense:62,defense:60,experience:68,health:82}, edgeOpp:{offense:58,defense:62,experience:88,health:85},
      keyStats:[{label:"A&M Exp.",value:"KenPom #8 (8 Jr/Sr)",hot:true},{label:"Bucky Ball",value:"Unique motion offense",hot:false},{label:"WCC depth",value:"Questionable for SMC",hot:false}],
      injuries:[], whyPick:"Texas A&M ranks 8th nationally in roster experience — eight juniors and seniors in rotation. Experienced teams historically outperform in March. Their unique Bucky Ball motion offense is unlike anything SMC has prepped for.", whyNot:"Saint Mary's is well-coached under Randy Bennett and plays with WCC toughness from facing Gonzaga. The Gaels' system is proven.", historicalNote:"10-seeds upset 7-seeds 39.1% of the time. Experience correlates strongly with March performance."
    },
    { id:"S7", date:"Thu Mar 19", s1:2, t1:"Houston", t1Short:"HOU", r1:"28-6", s2:15, t2:"Idaho", t2Short:"IDHO", r2:"21-14", pick:"Houston", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Houston 78-47. Blowout. Toyota Center on the horizon.",
      result: { score1:78, score2:47, winner:"Houston", correct:true, postGame:"Blowout as expected. Houston defense suffocated Idaho. Rolling toward Toyota Center Regional Final. Faces Texas A and M in R32." }, edge:{offense:78,defense:92,experience:90,health:88}, edgeOpp:{offense:22,defense:28,experience:30,health:82},
      keyStats:[{label:"HOU E8 site",value:"Toyota Center (HOME)",hot:true},{label:"Returning",value:"3 title-game starters",hot:true},{label:"Freshmen",value:"Flemings + Cenac (R1 picks)",hot:false}],
      injuries:[], whyPick:"Houston returns three starters from last year's national title game, added two projected first-rounders, and the Regional Final is AT THEIR HOME ARENA. The structural advantage is the most underrated factor in the bracket.", whyNot:"Houston's depth is thinner than typical Sampson teams. If Tugler or Cenac get in foul trouble, they're vulnerable inside. Won't matter vs Idaho.", historicalNote:"2-seeds are 141-17 vs 15-seeds all-time."
    },
  ],
  MIDWEST: [
    { id:"M0", date:"Thu Mar 19", s1:1, t1:"Michigan", t1Short:"MICH", r1:"31-3", s2:16, t2:"UMBC/Howard", t2Short:"16", r2:"~24-8", pick:"Michigan", confidence:99, upset:false, riskLevel:"LOCK",
      headline:"FINAL: Michigan 101-80. Shot 67%. Howard hit 10 first-half 3s.",
      result: { score1:101, score2:80, winner:"Michigan", correct:true, postGame:"Michigan dominated despite Howard hitting 10 first-half threes. Four Wolverines scored 14+, shot 67.3%. The No. 1 defense clamped down after halftime. Faces Saint Louis in R32." }, edge:{offense:85,defense:98,experience:78,health:78}, edgeOpp:{offense:20,defense:22,experience:30,health:85},
      keyStats:[{label:"MICH Def.",value:"#1 in entire country",hot:true},{label:"Mara",value:"7'7\" wingspan, shot-blocker",hot:true},{label:"Lendeborg",value:"B10 POTY — 14.7/7.2/3.2",hot:false}],
      injuries:[{player:"L.J. Cason",team:"Michigan",status:"OUT",impact:"MED",detail:"Torn ACL — led B10 in 3PT%. Loss hurts but 8-deep rotation survives."}],
      whyPick:"Michigan's defense is the best in the country — and it's not close. Aday Mara's 7-7 wingspan, Morez Johnson's switchability, and Lendeborg's versatility create a defensive wall. Dusty May built this like an NBA team.", whyNot:"Michigan's turnover rate (179th) is their Achilles heel. Cason's loss hurts perimeter shooting. But neither matters against a 16-seed.", historicalNote:"1-seeds are 142-2 all-time."
    },
    { id:"M1", date:"Thu Mar 19", s1:8, t1:"Georgia", t1Short:"UGA", r1:"22-10", s2:9, t2:"Saint Louis", t2Short:"SLU", r2:"28-5", pick:"Saint Louis", confidence:58, upset:false, riskLevel:"LEAN",
      headline:"FINAL: SLU 102-77. DOMINANT. 21-0 and 18-0 runs. 5 in double figs.",
      result: { score1:77, score2:102, winner:"Saint Louis", correct:true, postGame:"Saint Louis looked like a Final Four team. 102 points, 21-0 run and 18-0 run. Dion Brown 18 pts, Avila 12/5/5. 66 paint points vs 28 for Georgia. Faces Michigan in R32." }, edge:{offense:58,defense:60,experience:62,health:82}, edgeOpp:{offense:68,defense:58,experience:70,health:88},
      keyStats:[{label:"SLU 3PT%",value:"40.1% as a team (!)",hot:true},{label:"Avila",value:"6-10, 'Cream Abdul-Jabbar'",hot:true},{label:"SLU peak",value:"#18 AP in February",hot:false}],
      injuries:[], whyPick:"Saint Louis shoots 40.1% from three as a team — that's elite. Robbie Avila is a 6-10 matchup nightmare. Georgia has been inconsistent and susceptible to teams that shoot well from deep.", whyNot:"Georgia has SEC-level athletes and more raw talent. If they defend the perimeter well, SLU's other dimensions aren't enough.", historicalNote:"9-seeds win 48.5% of 8/9 games historically."
    },
    { id:"M2", date:"Fri Mar 20", s1:5, t1:"Texas Tech", t1Short:"TTU", r1:"22-10", s2:12, t2:"Akron", t2Short:"AKR", r2:"29-5", pick:"Akron", confidence:62, upset:true, riskLevel:"UPSET",
      headline:"FINAL: Texas Tech 91-71. Shot 64%. Our Cinderella pick busted.",
      result: { score1:91, score2:71, winner:"Texas Tech", correct:false, postGame:"Our top Cinderella pick goes down hard. Texas Tech shot an absurd 64% from the floor and hit 11 threes. Jaylen Petty had 24 pts on 9-14 shooting. We expected Toppin's absence to cripple Tech — instead they found a new identity as a lethal shooting team. Akron's Johnson and Scott combined for 46 but couldn't keep up. Tech faces Alabama in R32." }, edge:{offense:60,defense:65,experience:62,health:40}, edgeOpp:{offense:78,defense:55,experience:85,health:95},
      keyStats:[{label:"Toppin",value:"OUT for season (knee)",hot:true},{label:"Akron PPG",value:"88.7 (7th nationally)",hot:true},{label:"Akron 3PT",value:"3 guards at 37%+",hot:true}],
      injuries:[{player:"JT Toppin",team:"Texas Tech",status:"OUT",impact:"CRITICAL",detail:"Knee — season over. Was the team's best player and primary scorer."},{player:"L. Watts",team:"Texas Tech",status:"GTD",impact:"HIGH",detail:"Undisclosed — questionable. Took on Toppin's role."}],
      whyPick:"This is my top Cinderella. Texas Tech without Toppin is a jump-shooting team with no identity. Akron averages 88.7 PPG with three senior guards (Johnson, Scott, Hardman) all shooting 37%+ from 3. Third straight tournament. Evan Mahaffey (OSU transfer) handles any matchup. If Watts is also limited, this is a near-lock.", whyNot:"Grant McCasland is a master in-game tactician. Christian Anderson is still very good. Tech's defense could slow Akron's pace.", historicalNote:"12-seeds upset 5-seeds 35.7%. This profile (injured favorite vs experienced mid-major) is the most common upset type."
    },
    { id:"M3", date:"Fri Mar 20", s1:4, t1:"Alabama", t1Short:"BAMA", r1:"23-9", s2:13, t2:"Hofstra", t2Short:"HOF", r2:"24-10", pick:"Alabama", confidence:65, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Alabama 87-69. Philon 29 pts. Holloway situation didn't matter.",
      result: { score1:87, score2:69, winner:"Alabama", correct:true, postGame:"Philon was unstoppable with 29 on 10-18 shooting. Sherrell added 15/15 double-double. The Holloway situation didn't derail the team. Alabama's offense is elite when it's clicking. Alabama faces Texas Tech in R32." }, edge:{offense:78,defense:45,experience:55,health:65}, edgeOpp:{offense:58,defense:48,experience:55,health:90},
      keyStats:[{label:"Holloway",value:"Arrested Mon AM (!)",hot:true},{label:"BAMA Def.",value:"KenPom #68 (yikes)",hot:true},{label:"Philon",value:"21.7 PPG, pushes pace",hot:false}],
      injuries:[{player:"A. Holloway",team:"Alabama",status:"UNCERTAIN",impact:"HIGH",detail:"Arrested Monday AM — marijuana charge. 16.8 PPG. Status unclear for Friday."}],
      whyPick:"Alabama's raw talent and pace (Philon 21.7 PPG) should overwhelm Hofstra even without Holloway. But this is much closer than a 4-13 should be.", whyNot:"If Holloway is OUT, Alabama's scoring depth takes a massive hit and their 68th-ranked defense becomes exploitable. Hofstra's Cruz Davis and Preston Edmead can score in bunches.", historicalNote:"13-seeds win ~20% of the time. Legal issues create locker room distractions that compound."
    },
    { id:"M4", date:"Fri Mar 20", s1:6, t1:"Tennessee", t1Short:"TENN", r1:"22-11", s2:11, t2:"SMU/MIA(OH)", t2Short:"11", r2:"~20-13", pick:"Tennessee", confidence:72, upset:false, riskLevel:"LEAN",
      headline:"FINAL: Tennessee advances over SMU/Miami OH.",
      result: { score1:0, score2:0, winner:"Tennessee", correct:true, postGame:"Tennessee's defense delivered as projected under Rick Barnes. Gillespie and Ament controlled the game. Tennessee faces Virginia in R32." }, edge:{offense:62,defense:82,experience:72,health:72}, edgeOpp:{offense:60,defense:55,experience:60,health:78},
      keyStats:[{label:"Gillespie",value:"Star guard, shot-creator",hot:true},{label:"Ament",value:"Frosh, potential lottery pick",hot:true},{label:"TENN Def.",value:"Elite under Barnes",hot:false}],
      injuries:[{player:"N. Ament",team:"Tennessee",status:"GTD",impact:"HIGH",detail:"Knee — managing injury. Was averaging 22.4 PPG in 10-game stretch before it flared up."}],
      whyPick:"Rick Barnes' defensive intensity is tournament-proven. Whether it's SMU (Boopie Miller) or Miami OH (31-1 but untested), Tennessee has the defensive personnel to contain either.", whyNot:"Tennessee's offense can be ugly — over-reliant on Gillespie isolation. If Ament isn't right, the scoring ceiling drops. SMU's Miller could go off.", historicalNote:"11-seeds upset 6-seeds 37.3%. First Four teams regularly win in the R64."
    },
    { id:"M5", date:"Fri Mar 20", s1:3, t1:"Virginia", t1Short:"UVA", r1:"29-5", s2:14, t2:"Wright State", t2Short:"WSU", r2:"23-11", pick:"Virginia", confidence:94, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Virginia advances. Odom's new system rolls.",
      result: { score1:0, score2:0, winner:"Virginia", correct:true, postGame:"Virginia's three-heavy attack and offensive rebounding overwhelmed Wright State. De Ridder was efficient. The Cavaliers face Tennessee in R32." }, edge:{offense:72,defense:85,experience:80,health:90}, edgeOpp:{offense:42,defense:38,experience:42,health:82},
      keyStats:[{label:"UVA 3PA",value:"46.8% of all FGA",hot:true},{label:"UVA O-Reb",value:"#6 in off. reb rate",hot:true},{label:"De Ridder",value:"Frosh: 15.5 PPG, 6+ RPG",hot:false}],
      injuries:[], whyPick:"Ryan Odom completely reinvented Virginia in year one. They launch 3s, crash the offensive glass, and play elite defense. Thijs De Ridder (Belgium) is a revelation. Wright State's young roster can't handle UVA's system.", whyNot:"Wright State has exciting young players (Cooper, Burch, Pickett) but the 76-spot KenPom gap is massive.", historicalNote:"14-seeds win ~7% of the time."
    },
    { id:"M6", date:"Fri Mar 20", s1:7, t1:"Kentucky", t1Short:"UK", r1:"21-13", s2:10, t2:"Santa Clara", t2Short:"SCU", r2:"26-6", pick:"Kentucky", confidence:52, upset:false, riskLevel:"TOSS-UP",
      headline:"FINAL: Kentucky 89-84 OT. Oweh 35 pts, deep 3 forces OT.",
      result: { score1:89, score2:84, winner:"Kentucky", correct:true, postGame:"What a game. Oweh hit a deep three to force overtime and finished with a career-high 35 points. Santa Clara led late in regulation but couldn't close. Kentucky faces Iowa State in R32 — but ISU's Jefferson left with an injury." }, edge:{offense:60,defense:58,experience:72,health:48}, edgeOpp:{offense:65,defense:55,experience:65,health:88},
      keyStats:[{label:"UK record",value:"21-13 (alarming)",hot:true},{label:"SCU offense",value:"KenPom #23 (elite)",hot:true},{label:"SCU style",value:"Top 30 TO margin + 3PM",hot:true}],
      injuries:[{player:"J. Quaintance",team:"Kentucky",status:"OUT",impact:"MED",detail:"Knee — only 4 games played all season. Essentially unavailable."}],
      whyPick:"Kentucky's brand still matters. Otega Oweh can take over a game individually. The Wildcats have played an SEC schedule that prepared them for this level of competition.", whyNot:"Santa Clara is big at every position, ranks 23rd in offensive efficiency, and top-30 in both turnover margin and 3PM. They share a conference with Gonzaga — they won't be intimidated. This is the closest 7-10 in the bracket.", historicalNote:"10-seeds upset 7-seeds 39.1%. Kentucky's 21-13 record is historically unusual for the program."
    },
    { id:"M7", date:"Fri Mar 20", s1:2, t1:"Iowa State", t1Short:"ISU", r1:"24-8", s2:15, t2:"Tenn. State", t2Short:"TSU", r2:"23-9", pick:"Iowa State", confidence:96, upset:false, riskLevel:"SAFE",
      headline:"FINAL: Iowa State 108-74. Dominant. But Jefferson injury is HUGE.",
      result: { score1:108, score2:74, winner:"Iowa State", correct:true, postGame:"Dominant performance — Toure 25/11/6, Heise 22 pts. But the story is Joshua Jefferson leaving with a scary injury. The Wooden Award candidate's status is unknown. If he's out, Iowa State's ceiling drops dramatically. They face Kentucky in R32." }, edge:{offense:80,defense:92,experience:82,health:90}, edgeOpp:{offense:42,defense:48,experience:40,health:85},
      keyStats:[{label:"Jefferson",value:"Wooden candidate, big wing",hot:true},{label:"Momcilovic",value:"Best 3PT shooter in field",hot:true},{label:"ISU Def.",value:"KenPom #4",hot:true}],
      injuries:[], whyPick:"Iowa State has the best combination of offense and defense outside the 1-seeds. Jefferson bullies smaller defenders, Momcilovic spaces the floor, and the defense forces turnovers at an elite rate (3rd nationally). TSU is making the tourney for the first time in 32 years — great story, but the talent gap is too wide.", whyNot:"Nolan Smith (first-year coach, former Duke star) has TSU playing with defensive intensity. They rank 25th in defensive turnover rate. But Iowa State is built for this.", historicalNote:"2-seeds are 141-17 vs 15-seeds all-time."
    },
  ],
};

// ── LATER ROUNDS: Projected matchups R32 → Championship ─────
const LATER_ROUNDS = {
  EAST: {
    R32: [
      { id:"ER0", s1:1, t1:"Duke", t1Short:"DUKE", s2:9, t2:"TCU", t2Short:"TCU", date:"Sat Mar 21", pick:"Duke", confidence:78, originalConfidence:88, riskLevel:"LEAN",
        headline:"FINAL: Duke 81-58. Boozer 19/11 (17 in 2H), 37-14 run. Ngongba back.",
        result: { score1:81, score2:58, winner:"Duke", correct:true, postGame:"Tied 44-44 with 13:56 left, then Duke exploded on a 37-14 run. Boozer had only 2 pts at half but scored 17 of his 19 after the break — twice on high-low feeds from Ngongba in his return. TCU went 10-38 from the field in the second half (26%). Four flagrant fouls called in a physical, chippy game. Evans had 17, Sarr 14 with 4 threes. Duke advances to Sweet 16 vs St. John's." },
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
        whyNot:"Duke went 2-15 from 3 against Siena. If that shooting continues, TCU's defense — which just locked down Ohio State late — could make this uncomfortable. Duke's title odds took a real hit Thursday." },
      { id:"ER1", s1:5, t1:"St. John's", t1Short:"SJU", s2:4, t2:"Kansas", t2Short:"KU", date:"Sun Mar 22", pick:"St. John's", confidence:58, originalConfidence:55, upset:true, riskLevel:"UPSET",
        headline:"FINAL: St. John's 67-65. Darling buzzer-beater layup! First S16 since 1999.",
        result: { score1:67, score2:65, winner:"St. John's", correct:true, postGame:"Dylan Darling's driving layup — his only points of the game — beat the buzzer to send SJU to the Sweet 16 for the first time since 1999. SJU led by 14 in the 2nd half but Kansas clawed back. Peterson tied it 65-65 with 13 sec left. Then Darling attacked. Ejiofor and Bryce Hopkins each had 18 pts. Peterson had 21 but Kansas committed 16 turnovers. SJU faces No. 1 Duke in the Sweet 16 on Friday." },
        edge: { offense: 75, defense: 78, experience: 78, health: 90 },
        edgeOpp: { offense: 80, defense: 68, experience: 68, health: 75 },
        keyStats: [
          { label: "SJU R64", value: "73-55, 20-3 opening run", hot: true },
          { label: "Peterson R64", value: "28 pts on 11-24", hot: true },
          { label: "Ejiofor R64", value: "14/11 double-double", hot: false },
        ],
        injuries: [
          { player: "D. Peterson", team: "Kansas", status: "ACTIVE", impact: "LOW", detail: "Healthy — had 28 pts R64. When he's engaged, KU is dangerous." },
        ],
        whyPick:"SJU's R64 dominance (20-3 opening run, 73-55 final) showed they're locked in. Ejiofor's 14/11 double-double is exactly the interior play that gives Kansas trouble. Pitino's defensive schemes should slow Peterson. SJU's confidence is higher than pre-tournament — they look like the better team.",
        whyNot:"Peterson's 28-point R64 game showed he CAN be the #1 pick when engaged. If he brings that same energy, Kansas can beat anyone. KU nearly blew a 26-point lead to Cal Baptist though — defensive intensity is a real concern." },
      { id:"ER2", s1:6, t1:"Louisville", t1Short:"LOU", s2:3, t2:"Michigan St.", t2Short:"MSU", date:"Sat Mar 21", pick:"Michigan St.", confidence:72, originalConfidence:72, riskLevel:"LEAN",
        headline:"FINAL: Michigan St. 77-69. Carr 21 pts, Fears 12/16 ast. Brown OUT for Louisville.",
        result: { score1:69, score2:77, winner:"Michigan St.", correct:true, postGame:"MSU controlled it throughout. Carr had 21 pts with highlight dunks early in the second half. Fears ran the show with 12 pts and 16 assists. Brown Jr. was OUT (back injury) which crippled Louisville's offense — they shot 41% and went 13-37 from 3. Conwell had 21 for Louisville but the rest of the team was 12-38. A flagrant foul on Louisville led to a 13-3 MSU run that sealed it. MSU advances to the Sweet 16." },
        edge: { offense: 65, defense: 62, experience: 60, health: 78 },
        edgeOpp: { offense: 78, defense: 82, experience: 85, health: 90 },
        keyStats: [
          { label: "MSU R64", value: "92-67, shot 60%", hot: true },
          { label: "LOU TOs", value: "22 turnovers vs USF", hot: true },
          { label: "McKneely", value: "7 threes (23 pts) R64", hot: false },
        ],
        injuries: [
          { player: "M. Brown Jr.", team: "Louisville", status: "OUT", impact: "CRITICAL", detail: "Back — did NOT play R32. Louisville's offense collapsed without him." },
        ],
        whyPick:"Michigan State was dominant — 92-67 over NDSU, shot 60%, controlled the glass. Louisville needed McKneely's heroic 7-three night to survive South Florida's 23-point comeback. The Spartans' physicality and rebounding will overwhelm a Louisville team that turned it over 22 times Thursday.",
        whyNot:"Louisville showed resilience surviving that USF rally. McKneely (23 pts) can get hot from anywhere. If Louisville protects the ball better than Thursday (22 TOs), this gets competitive." },
      { id:"ER3", s1:7, t1:"UCLA", t1Short:"UCLA", s2:2, t2:"UConn", t2Short:"UCONN", date:"Sun Mar 22", pick:"UConn", confidence:74, riskLevel:"LEAN",
        headline:"FINAL: UConn 73-57. Huskies pull away in 2H. Two-time champs rolling.",
        result: { score1:57, score2:73, winner:"UConn", correct:true, postGame:"UConn's defense suffocated UCLA in the second half. After leading 65-54 with 4:40 left, the Huskies kept the pressure on and won 73-57. Dan Hurley's squad looks increasingly dangerous — they've now won their last two by 16+ each. Reed Jr. and Karaban continue to dominate. Advances to Sweet 16 vs Michigan State in a fascinating matchup of tournament pedigree — Hurley vs Izzo in DC." },
        edge: { offense: 72, defense: 82, experience: 90, health: 75 },
        edgeOpp: { offense: 70, defense: 65, experience: 68, health: 70 },
        keyStats: [
          { label: "Reed Jr.", value: "31 pts, 27 reb R64", hot: true },
          { label: "UCLA", value: "Won without Bilodeau", hot: true },
          { label: "UConn 3PT", value: "5-25 in R64 (yikes)", hot: false },
        ],
        injuries: [
          { player: "T. Bilodeau", team: "UCLA", status: "GTD", impact: "HIGH", detail: "Knee — sat R64 but UCLA still won. Return would transform this matchup." },
        ],
        whyPick:"Reed Jr.'s historic 31/27 game shows UConn can win even shooting 5-25 from 3. That interior dominance + Karaban (22 pts) gives UConn multiple paths. UCLA won without Bilodeau but it was tight (75-71). Hurley's adjustments in R32 should exploit UCLA's defensive gaps.",
        whyNot:"UCLA proved they can win without Bilodeau. If he returns, their offense transforms. Dent had 10 pts, 5 ast, 6 steals — the Bruins' perimeter defense is legit." },
    ],
    S16: [
      { id:"ES0", s1:1, t1:"Duke", t1Short:"DUKE", s2:5, t2:"St. John's", t2Short:"SJU", date:"Fri Mar 27", time:"7:10 PM ET", site:"Capital One Arena, DC", pick:"Duke", confidence:61, originalConfidence:68, riskLevel:"LEAN",
        market: { spread:"Duke -6.5", ou:"142.5", ml1:"-280", ml2:"+220", take:"Line feels right. Duke's 2H explosion vs TCU showed they can flip the switch. But SJU is battle-tested — Pitino won't let this be a blowout. Lean Duke ATS but it's tight.", angle:"UNDER 142.5 — both elite defenses, Pitino slows tempo." },
        headline:"Duke 81-58 over TCU (37-14 run) vs SJU's buzzer-beater over Kansas. Boozer vs Ejiofor.", whyPick:"Duke's second-half explosion (37-14 run, Boozer 17 in 2H, Ngongba back) showed championship-level adjustment. SJU needed a buzzer-beater layup to survive Kansas — they're battle-tested but also fragile. Duke's defense (#2 KenPom) can match St. John's intensity. The deeper roster grinds SJU down late.", whyNot:"Ejiofor is a legitimate matchup problem for Duke. Pitino's defensive schemes could frustrate Duke's guard-limited offense (Foster still OUT). SJU has won 20 of 21 and thrives in exactly this type of physical, half-court game. Darling's buzzer-beater gives them house-money confidence.",
        edge: { offense: 82, defense: 90, experience: 80, health: 68 },
        edgeOpp: { offense: 75, defense: 72, experience: 78, health: 90 },
        keyStats: [{ label: "Boozer", value: "Generational passer/scorer", hot: true },{ label: "Ejiofor", value: "B.East POTY interior", hot: true },{ label: "Duke 3PT", value: "2-15 in R64 (!)", hot: false }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — still out. Perimeter creation limited." }] },
      { id:"ES1", date:"Fri Mar 27", time:"9:40 PM ET", site:"Capital One Arena, DC", s1:3, t1:"Michigan St.", t1Short:"MSU", s2:2, t2:"UConn", t2Short:"UCONN", pick:"Michigan St.", confidence:52, originalConfidence:54, riskLevel:"TOSS-UP",
        market: { spread:"UConn -3.5", ou:"138.5", ml1:"+150", ml2:"-180", take:"UConn is rightfully favored but 3.5 is thin. MSU has the rebounding edge and Fears is a matchup nightmare. This is a value spot on MSU +3.5.", angle:"MSU +3.5 — Izzo in March, rebounding edge, Fears' playmaking." },
        headline:"Izzo vs Hurley in DC. Fears' 27 ast in 2 games vs UConn's 73-57 dismantling of UCLA. Elite.",
        whyPick:"Fears just had 12 pts and 16 ASSISTS against Louisville — 27 assists in two games, most by a Big Ten player in 50 years. Carr's 21/10 double-double gives UConn a matchup problem. MSU's rebounding (#1 nationally) negates UConn's Reed inside. UConn shot 5-25 from 3 in R64 — inconsistent perimeter shooting is their Achilles heel.",
        whyNot:"UConn pulled away from UCLA 73-57 — looked dominant in the second half. Reed Jr. and Karaban are a lethal interior combo. Hurley has championship DNA (back-to-back titles in '23-'24) and his adjustments are elite. This UConn team is getting better every game.",
        edge: { offense: 72, defense: 80, experience: 88, health: 90 },
        edgeOpp: { offense: 70, defense: 82, experience: 90, health: 75 },
        keyStats: [{ label: "MSU Glass", value: "#1 rebounding team", hot: true },{ label: "UConn 3PT", value: "Inconsistent all year", hot: true },{ label: "Izzo March", value: "60 career tourney wins", hot: false }],
        injuries: [{ player: "J. Stewart", team: "UConn", status: "GTD", impact: "LOW", detail: "Lower body — uncertain since Feb." }] },
    ],
    E8: [
      { id:"EE", date:"Sat Mar 28", s1:1, t1:"Duke", t1Short:"DUKE", s2:3, t2:"Michigan St.", t2Short:"MSU", pick:"Duke", confidence:60, originalConfidence:64, riskLevel:"LEAN",
        headline:"Duke's 37-14 run vs TCU + Ngongba's return vs Fears' 27 assists in 2 games. Scheyer vs Izzo.", whyPick:"Boozer's second-half explosion (17 of 19 pts after half) showed he can flip the switch. Ngongba's return adds interior depth. But this assumes MSU beats UConn — which is a coin flip. Duke's talent in crunch time remains the tiebreaker.", whyNot:"Fears set a school tournament record with 16 assists. Carr's 21/10 double-double showed a different ceiling. If UConn wins instead, Duke faces a three-peat-chasing team with Hurley. Either opponent is dangerous.",
        edge: { offense: 82, defense: 90, experience: 82, health: 68 },
        edgeOpp: { offense: 75, defense: 82, experience: 88, health: 90 },
        keyStats: [{ label: "Boozer", value: "Best big in CBB", hot: true },{ label: "Fears R32", value: "12 pts, 16 assists(!)", hot: true },{ label: "Duke 3PT", value: "2-15 vs Siena — concern", hot: true }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "OUT", impact: "HIGH", detail: "Broken foot — maybe back for F4?" }] },
    ],
  },
  WEST: {
    R32: [
      { id:"WR0", s1:1, t1:"Arizona", t1Short:"ARIZ", s2:9, t2:"Utah State", t2Short:"USU", date:"Sun Mar 22", pick:"Arizona", confidence:84, riskLevel:"SAFE",
        headline:"FINAL: Arizona 78-66. Wildcats roll. Bradley and Peat control the game.",
        result: { score1:78, score2:66, winner:"Arizona", correct:true, postGame:"Arizona handled Utah State comfortably, never seriously threatened. Jayden Bradley orchestrated the offense while the Wildcats' switching defense neutralized USU's ball-screen attack. Arizona's depth and talent were evident throughout. Advances to Sweet 16 vs Arkansas in San Jose — the path to the Final Four is clear." },
        edge: { offense: 90, defense: 88, experience: 82, health: 95 },
        edgeOpp: { offense: 68, defense: 72, experience: 70, health: 90 },
        keyStats: [
          { label: "AZ R64", value: "92-58, dominant", hot: true },
          { label: "USU R64", value: "Beat Villanova 86-76", hot: false },
          { label: "AZ Def", value: "Top-3 KenPom", hot: true },
        ],
        injuries: [],
        whyPick:"Arizona's talent gap is massive. Top-3 Net Rating, deep rotation, elite defense.", whyNot:"USU's unique defensive scheme could cause turnovers, but Arizona wins in multiple styles." },
      { id:"WR1", s1:4, t1:"Arkansas", t1Short:"ARK", s2:12, t2:"High Point", t2Short:"HPU", date:"Sat Mar 21", pick:"Arkansas", confidence:72, originalConfidence:62, riskLevel:"LEAN",
        headline:"FINAL: Arkansas 94-88. Acuff 36 pts! 7 straight to break 83-83 tie.",
        result: { score1:94, score2:88, winner:"Arkansas", correct:true, postGame:"Tied 83-83 with 3 min left, then Darius Acuff scored 7 consecutive to seal it. Acuff finished with 36 pts and 6 ast — joining Chris Paul as the only freshmen with consecutive 20pt/5ast NCAA openers since 1973. Rob Martin had 30 and Fletcher 25 for High Point. Arkansas advances to Sweet 16 vs Arizona or Utah State." },
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
      { id:"WR2", s1:3, t1:"Gonzaga", t1Short:"ZAGA", s2:11, t2:"Texas", t2Short:"TEX", date:"Sat Mar 21", pick:"Gonzaga", confidence:68, originalConfidence:60, riskLevel:"LEAN",
        headline:"FINAL: Texas 74-68. 11-seed UPSETS 3-seed Gonzaga! Miller to S16 with 3rd program.",
        result: { score1:68, score2:74, winner:"Texas", correct:false, postGame:"First upset since R64. 11-seed Texas knocked off Gonzaga in a physical battle. Texas is the 6th team ever from First Four to Sweet 16. Sean Miller becomes 10th coach to take 3 programs to the second weekend. Gonzaga misses the Sweet 16 for a 2nd straight year after 9 consecutive appearances. Texas faces Purdue on Thursday." },
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
      { id:"WR3", s1:7, t1:"Miami (FL)", t1Short:"MIA", s2:2, t2:"Purdue", t2Short:"PUR", date:"Sun Mar 22", pick:"Purdue", confidence:64, riskLevel:"LEAN",
        headline:"FINAL: Purdue 79-69. Loyer 24 pts, 21/22 FTs. Cox knee injury concern.",
        result: { score1:69, score2:79, winner:"Purdue", correct:true, postGame:"Purdue outscored Miami by 12 in the second half behind Loyer's 24 pts. Shot 53.2% and hit 21/22 FTs. Concern: CJ Cox went down with non-contact knee injury on a fastbreak. He drilled 3 triples in the first half before going down. 3rd straight year in the Sweet 16 for Purdue — faces 11-seed Texas on Thursday." },
        whyPick:"Purdue's offensive efficiency overwhelmed Miami.", whyNot:"Cox's knee injury could be a factor going forward." },
    ],
    S16: [
      { id:"WS0", date:"Thu Mar 26", time:"7:10 PM ET", site:"SAP Center, San Jose", s1:1, t1:"Arizona", t1Short:"ARIZ", s2:4, t2:"Arkansas", t2Short:"ARK", pick:"Arizona", confidence:72, riskLevel:"LEAN",
        market: { spread:"Arizona -8.5", ou:"166.5", ml1:"-380", ml2:"+300", take:"166.5 is the highest total on the S16 board. Both teams can score. Arizona's defense is the difference — they'll contain Acuff enough. AZ covers.", angle:"OVER 166.5 — Acuff scores 25+ regardless, and Arizona pushes pace." },
        headline:"Arizona 78-66 over USU vs Arkansas 94-88 over High Point. Acuff's 36 pts vs Arizona's elite D.", whyPick:"Arizona's defensive versatility limits Acuff's driving lanes. Arizona just controlled Utah State 78-66 without breaking a sweat. Arkansas's depth issues (Knox out) become pronounced against an 8-deep Arizona rotation. Acuff was brilliant (36 pts) but needed every bit of it to survive High Point.", whyNot:"Acuff is generational — 36 pts, 6 ast, joined Chris Paul in the record books. If he plays like that again, no defense stops him for 40 minutes. Arkansas's confidence is sky-high after surviving a tough game.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 82, defense: 65, experience: 62, health: 75 },
        keyStats: [{ label: "AZ Depth", value: "8+ deep rotation", hot: true },{ label: "Acuff", value: "SEC POTY (frosh)", hot: true },{ label: "ARK depth", value: "Knox OUT, thin bench", hot: false }],
        injuries: [{ player: "K. Knox", team: "Arkansas", status: "OUT", impact: "MED", detail: "Season-ending." }] },
      { id:"WS1", date:"Thu Mar 26", time:"9:40 PM ET", site:"SAP Center, San Jose", s1:2, t1:"Purdue", t1Short:"PUR", s2:11, t2:"Texas", t2Short:"TEX", pick:"Purdue", confidence:74, riskLevel:"LEAN",
        market: { spread:"Purdue -7.5", ou:"148.5", ml1:"-340", ml2:"+270", take:"Biggest spread on the S16 board. Texas has been incredible but they're an 11-seed running on fumes from the First Four. Cox's injury matters. Purdue covers but it won't be comfortable.", angle:"TEXAS +7.5 — they've covered every game this tourney. House money energy is real." },
        headline:"Purdue -8.5. Texas is the Cinderella but Purdue's offense is historic. Cox injury is the key.",
        edge: { offense: 92, defense: 55, experience: 90, health: 72 },
        edgeOpp: { offense: 65, defense: 70, experience: 60, health: 82 },
        keyStats: [{ label: "Purdue Off.", value: "Best KenPom-era ever", hot: true },{ label: "Texas run", value: "First Four → S16 (3-0)", hot: true },{ label: "Cox injury", value: "Non-contact knee — status?", hot: true }],
        injuries: [{ player: "CJ Cox", team: "Purdue", status: "QUESTIONABLE", impact: "HIGH", detail: "Non-contact knee injury vs Miami. Drilled 3 triples before going down. Huge loss if out." }],
        whyPick:"Purdue's offensive efficiency is historically elite — best KenPom-era season. Loyer just had 24 pts and 21/22 FTs. Texas has been incredible but they're an 11-seed that came through the First Four. The talent gap is real. Purdue -8.5 is the biggest spread of the S16 for a reason.",
        whyNot:"Texas just beat Gonzaga. Sean Miller is 9 S16 appearances with 3 different programs. This team has nothing to lose and plays with house money energy. If Cox is out, Purdue's 3PT shooting takes a hit. And Texas's length bothered Gonzaga's interior — could do the same to Purdue." },
    ],
    E8: [
      { id:"WE", date:"Sat Mar 28", s1:1, t1:"Arizona", t1Short:"ARIZ", s2:2, t2:"Purdue", t2Short:"PUR", pick:"Arizona", confidence:65, riskLevel:"LEAN",
        headline:"Arizona's path cleared — Gonzaga gone. Purdue's perimeter D is the exploitable gap.", whyPick:"Gonzaga's elimination removed the most dangerous team in the West. Arizona's depth and defensive versatility should handle Arkansas. Purdue's perimeter defense — their Achilles heel — can't contain Bradley and Burries. Arizona's 78-66 win over USU showed controlled dominance.", whyNot:"Purdue's historic offensive efficiency means they'll score regardless. Cox's injury status matters — if healthy, Purdue's 3PT shooting stretches Arizona's switching. And Texas has already beaten one top-3 seed in this region.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 92, defense: 55, experience: 90, health: 88 },
        keyStats: [{ label: "AZ Guards", value: "Burries + Bradley elite", hot: true },{ label: "PUR Perim D", value: "Achilles heel all year", hot: true },{ label: "AZ Depth", value: "Awaka off bench > starters", hot: false }],
        injuries: [] },
    ],
  },
  SOUTH: {
    R32: [
      { id:"SR0", s1:1, t1:"Florida", t1Short:"UF", s2:9, t2:"Iowa", t2Short:"IOWA", date:"Sun Mar 22", pick:"Florida", confidence:82, riskLevel:"SAFE",
        headline:"FINAL: Iowa 73-72. 9-SEED UPSETS 1-SEED FLORIDA! Defending champs OUT.",
        result: { score1:72, score2:73, winner:"Iowa", correct:false, postGame:"STUNNER. 9-seed Iowa knocks off the defending national champion and 1-seed Florida 73-72. Iowa led at halftime and matched the Gators possession for possession. Florida's frontcourt advantage couldn't overcome Iowa's guard play and composure. The biggest upset of the tournament — Florida was -10.5. Iowa advances to face Nebraska in the Sweet 16, a game nobody predicted. The South region is wide open." },
        edge: { offense: 85, defense: 82, experience: 95, health: 92 },
        edgeOpp: { offense: 65, defense: 58, experience: 65, health: 85 },
        keyStats: [
          { label: "UF Frontcourt", value: "3 title-game starters", hot: true },
          { label: "Iowa R64", value: "TBD (Friday game)", hot: false },
          { label: "Rebounding", value: "UF dominates glass", hot: false },
        ],
        injuries: [],
        whyPick:"Haugh, Condon, Chinyelu — the best rebounding frontcourt in the field — overwhelm Iowa on the boards. Todd Golden's system creates easy transition looks.", whyNot:"Iowa has tournament experience. If they shoot well from 3, they can keep it within striking distance." },
      { id:"SR1", date:"Sat Mar 21", s1:5, t1:"Vanderbilt", t1Short:"VANDY", s2:4, t2:"Nebraska", t2Short:"NEB", pick:"Vanderbilt", confidence:58, upset:true, riskLevel:"UPSET",
        headline:"FINAL: Nebraska 74-72. Frager GW layup 2.2 sec left! Tanner half-court heave in/out.",
        result: { score1:72, score2:74, winner:"Nebraska", correct:false, postGame:"INSTANT CLASSIC. Nebraska led 39-32 at half shooting 56%, but Vandy stormed back behind Tyler Tanner (27 pts, 4 stl, eight 3s). Tanner gave Vandy a 70-68 lead with 1:42 left. Frager (15 pts off bench) hit the go-ahead layup with 2.2 sec. Tanner's desperation half-court heave bounced in and out. Nebraska to Sweet 16 for the FIRST TIME ever." },
        edge: { offense: 82, defense: 58, experience: 62, health: 88 },
        edgeOpp: { offense: 60, defense: 85, experience: 65, health: 88 },
        keyStats: [
          { label: "Tanner R64", value: "26 pts, 7 reb, 5 ast", hot: true },
          { label: "NEB R64", value: "76-47, first-ever W", hot: true },
          { label: "Style clash", value: "Elite O vs Elite D", hot: false },
        ],
        injuries: [],
        whyPick:"Nebraska went 6-6 down the stretch. The pressure of the program's first-ever tournament win followed by facing red-hot Vanderbilt (just beat Florida) is brutal.", whyNot:"Nebraska's defense (7th KenPom) makes everything difficult. If they grind Vandy into the 50s, anything can happen." },
      { id:"SR2", s1:11, t1:"VCU", t1Short:"VCU", s2:3, t2:"Illinois", t2Short:"ILL", date:"Sat Mar 21", pick:"Illinois", confidence:82, originalConfidence:76, riskLevel:"SAFE",
        headline:"FINAL: Illinois 76-55. Stojakovic 21 pts, Ivisic 14/11. Dominant.",
        result: { score1:55, score2:76, winner:"Illinois", correct:true, postGame:"VCU's Cinderella run ended hard. Illinois opened with a 15-5 run, led by double digits early in the second half, and never let VCU closer. Stojakovic had 21 pts off the bench, Ivisic posted 14/11 double-double. Illinois had 4 in double figures, dominated rebounding 45-29. VCU shot 2-6 from FT. Advances to face Houston in the Sweet 16." },
        edge: { offense: 95, defense: 68, experience: 72, health: 90 },
        edgeOpp: { offense: 58, defense: 72, experience: 68, health: 82 },
        keyStats: [
          { label: "ILL R64", value: "105-70, Mirkovic 29/17", hot: true },
          { label: "VCU R64", value: "Erased 19-pt deficit OT", hot: true },
          { label: "Matchup shift", value: "Was UNC, now VCU", hot: false },
        ],
        injuries: [],
        whyPick:"VCU pulled off a historic 19-point comeback to beat UNC in OT. That's incredible heart — but Illinois is a completely different matchup. The No. 1 offense in KenPom history just put up 105 on Penn. Mirkovic (29/17) and the Ivisic brothers give Illinois too many weapons. VCU's Cinderella energy meets an offensive buzzsaw.",
        whyNot:"VCU just pulled off the biggest R64 comeback ever. Momentum and belief are real in March. Their defensive pressure could force Illinois into turnovers. But the talent gap is wide." },
      { id:"SR3", date:"Sat Mar 21", s1:10, t1:"Texas A&M", t1Short:"TAMU", s2:2, t2:"Houston", t2Short:"HOU", pick:"Houston", confidence:76, riskLevel:"LEAN",
        headline:"FINAL: Houston 88-57. Sharp 18, Cenac 17/9. Total blowout.",
        result: { score1:57, score2:88, winner:"Houston", correct:true, postGame:"A&M trailed by just 1 with 8 min left in the first half, then got outscored 21-4 to close it. Houston cruised in the second half. Emanuel Sharp led with 18 pts, Chris Cenac had 17 and 9 boards. Houston advances to its 7th consecutive Sweet 16 — faces Illinois on Thursday." },
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
      { id:"SS0", date:"Thu Mar 26", time:"7:10 PM ET", site:"Toyota Center, Houston", s1:4, t1:"Nebraska", t1Short:"NEB", s2:9, t2:"Iowa", t2Short:"IOWA", pick:"Nebraska", confidence:58, riskLevel:"TOSS-UP",
        market: { spread:"Nebraska -2.5", ou:"133.5", ml1:"-140", ml2:"+120", take:"Lowest total on the S16 board — both teams grind. Nebraska's defense is the edge. Iowa just pulled off the biggest upset of the tourney (Florida) — regression is real. But this is a coin flip.", angle:"UNDER 133.5 — Nebraska's defense holds opponents below 30% from 3. This is a 60s game." },
        headline:"Nobody predicted this. Two mid-seeds in the Sweet 16 — Nebraska's first-ever, Iowa just killed Florida.",
        edge: { offense: 62, defense: 85, experience: 65, health: 88 },
        edgeOpp: { offense: 70, defense: 60, experience: 68, health: 85 },
        keyStats: [{ label: "NEB Def", value: "#7 KenPom adj. defense", hot: true },{ label: "Iowa", value: "Just beat 1-seed Florida 73-72", hot: true },{ label: "NEB 3PT", value: "14 made vs Troy, 4 shooters 50+", hot: false }],
        injuries: [],
        whyPick:"Nebraska's defense is elite — top-7 KenPom, held opponents below 30% from 3 all season. Iowa's offense is good but not great (4-9 vs Q1 opponents before the tourney). Frager's clutch gene (game-winner vs Vandy) gives Nebraska an edge in a close game. The Huskers are playing with house money and nothing to lose.",
        whyNot:"Iowa just beat a 1-seed. Tavion Banks and Bennett Stirtz have tournament confidence now. Iowa's ball movement can exploit Nebraska's aggressive help defense. If Iowa shoots 40%+ from 3, Nebraska's rim protection doesn't matter. This is a genuine toss-up." },
      { id:"SS1", date:"Thu Mar 26", time:"9:40 PM ET", site:"Toyota Center, Houston",
        market: { spread:"Houston -2.5", ou:"139.5", ml1:"-140", ml2:"+120", take:"Slimmest spread on the board. Houston gets home court at Toyota Center — that's worth 3-5 pts alone. Illinois has the #1 offense in KenPom history but Houston's defense is built to contain exactly this. Houston -2.5 is the best value on the board.", angle:"HOUSTON -2.5 — home court + elite defense. This spread should be -4.5." }, s1:3, t1:"Illinois", t1Short:"ILL", s2:2, t2:"Houston", t2Short:"HOU", pick:"Houston", confidence:58, riskLevel:"TOSS-UP",
        headline:"Houston 88-57 demolition vs Illinois 76-55 dominance. Irresistible force vs immovable object AT Toyota Center.", whyPick:"Houston just obliterated A&M 88-57 and the game is AT TOYOTA CENTER — Houston's home arena. That crowd advantage is worth 3-5 points. Houston's defense is built to contain motion offenses and they've locked in for a potential home Regional Final.", whyNot:"Illinois has a historically great offense — Stojakovic's 21 off the bench, Ivisic's 14/11 double-double, 4 in double figures vs VCU. Wagler could go on a 15-point run that breaks any defense. This is a genuine toss-up without the venue factor.",
        edge: { offense: 68, defense: 92, experience: 90, health: 88 },
        edgeOpp: { offense: 96, defense: 68, experience: 72, health: 90 },
        keyStats: [{ label: "HOU Defense", value: "Built to stop motion O", hot: true },{ label: "ILL Offense", value: "#1 in KenPom history", hot: true },{ label: "VENUE", value: "Toyota Center = HOME", hot: true }],
        injuries: [] },
    ],
    E8: [
      { id:"SE", date:"Sat Mar 28", s1:2, t1:"Houston", t1Short:"HOU", s2:4, t2:"Nebraska", t2Short:"NEB", pick:"Houston", confidence:72, riskLevel:"LEAN",
        headline:"Houston's path to F4 cleared. Florida and Vandy gone. Toyota Center = home court.",
        edge: { offense: 78, defense: 92, experience: 90, health: 88 },
        edgeOpp: { offense: 62, defense: 85, experience: 65, health: 88 },
        keyStats: [{ label: "HOME COURT", value: "Toyota Center = HOU", hot: true },{ label: "HOU R32", value: "88-57 blowout of A&M", hot: true },{ label: "NEB story", value: "First-ever S16 — house money", hot: false }],
        injuries: [],
        whyPick:"Houston's path cleared dramatically. No Florida, no Vanderbilt. Nebraska or Iowa in the E8 is the easiest possible draw for a Final Four bid. Houston's defense is elite and they're essentially playing at home. This is a gift bracket.", whyNot:"Nebraska's defense is genuinely elite (#7 KenPom). They can grind Houston into a 55-50 game where anything happens. But Houston has been here before and Nebraska hasn't." },
    ],
  },
  MIDWEST: {
    R32: [
      { id:"MR0", date:"Sat Mar 21", s1:1, t1:"Michigan", t1Short:"MICH", s2:9, t2:"Saint Louis", t2Short:"SLU", pick:"Michigan", confidence:78, riskLevel:"SAFE",
        headline:"FINAL: Michigan 95-72. Lendeborg 25 pts, Mara 16/5/4 blk. Shot 56%.",
        result: { score1:95, score2:72, winner:"Michigan", correct:true, postGame:"Dominant. Lendeborg had 25 pts with a monster coast-to-coast poster dunk. Mara had 16 pts, 5 reb, 4 blocks — held Avila to 9 pts on 3-13 shooting (3-10 from 3). All five starters in double figures. Michigan shot 56% from the field and 48% from three (11 made). SLU pulled within 6 early in the second half but Michigan blew it open. Advances to Sweet 16 vs Texas Tech or Alabama winner." },
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
      { id:"MR1", s1:5, t1:"Texas Tech", t1Short:"TTU", s2:4, t2:"Alabama", t2Short:"BAMA", date:"Sun Mar 22", pick:"Alabama", confidence:60, originalConfidence:54, riskLevel:"LEAN",
        headline:"FINAL: Alabama 90-65. Bama DEMOLISHES Texas Tech. Philon and offense explode.",
        result: { score1:65, score2:90, winner:"Alabama", correct:true, postGame:"Alabama's offense was overwhelming — led 49-25 at halftime and never looked back. This was the most dominant performance of the round. The Crimson Tide scored 90 points against a team that was supposed to play defense. Alabama advances to face 1-seed Michigan in the Sweet 16 in Chicago — that's a blockbuster. Nate Oats has this team peaking at the right time." },
        edge: { offense: 78, defense: 55, experience: 85, health: 95 },
        edgeOpp: { offense: 80, defense: 45, experience: 55, health: 62 },
        keyStats: [
          { label: "AKR PPG", value: "88.7 (7th nationally)", hot: true },
          { label: "BAMA Def", value: "KenPom #68 (yikes)", hot: true },
          { label: "Holloway", value: "Arrested — status ??", hot: true },
        ],
        injuries: [
          { player: "A. Holloway", team: "Alabama", status: "UNCERTAIN", impact: "HIGH", detail: "Arrested Monday — marijuana charge. 16.8 PPG. Status unclear." },
        ],
        whyPick:"Alabama's offense showed its full ceiling with Philon's 29 pts and Sherrell's 15/15 double-double. Texas Tech shot 64% in R64 but that's unsustainable. Alabama's raw talent and pace should overwhelm Tech in a shootout.", whyNot:"Texas Tech just shot 64% and hit 11 threes — their best game of the season. If Petty and Anderson repeat that performance, Tech's offense can outscore anyone. But shooting that hot twice in a row is unlikely." },
      { id:"MR2", date:"Sun Mar 22", s1:6, t1:"Tennessee", t1Short:"TENN", s2:3, t2:"Virginia", t2Short:"UVA", pick:"Virginia", confidence:58, riskLevel:"LEAN",
        headline:"FINAL: Tennessee 79-72. 6-seed upsets 3-seed Virginia! Boswell 3 triples.",
        result: { score1:79, score2:72, winner:"Tennessee", correct:false, postGame:"Tennessee led by as many as 9 in the second half. Virginia fought back within 5 but couldn't close. Bishop Boswell hit 3 triples to build the Vols' lead. Tennessee outscored UVA 18-8 in the paint in the first half. This was the game that busted the last perfect bracket in the country. Tennessee faces Iowa State in the Sweet 16 on Friday." },
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
      { id:"MR3", date:"Sun Mar 22", s1:7, t1:"Kentucky", t1Short:"UK", s2:2, t2:"Iowa State", t2Short:"ISU", pick:"Iowa State", confidence:68, originalConfidence:80, riskLevel:"LEAN",
        headline:"FINAL: Iowa State 82-63. Lipsey 26/10/5 stl! Jefferson OUT but ISU dominates.",
        result: { score1:63, score2:82, winner:"Iowa State", correct:true, postGame:"Iowa State proved it's more than Joshua Jefferson. Tamin Lipsey posted 26 pts, 10 ast, 5 steals. Milan Momcilovic added 20. Kentucky committed 20 turnovers leading to 18 ISU points. UK fell behind early, briefly rallied, then got outscored 51-33 in the second half. Kentucky's $20M roster exits in the Round of 32. ISU faces Tennessee in the Sweet 16." },
        edge: { offense: 72, defense: 82, experience: 78, health: 50 },
        edgeOpp: { offense: 75, defense: 62, experience: 68, health: 90 },
        keyStats: [
          { label: "Jefferson", value: "SCARY INJURY — status ??", hot: true },
          { label: "Oweh R64", value: "35 pts, OT-forcing 3", hot: true },
          { label: "ISU R64", value: "108-74 (dominant)", hot: false },
        ],
        injuries: [
          { player: "J. Jefferson", team: "Iowa State", status: "UNCERTAIN", impact: "CRITICAL", detail: "Left R64 with scary injury. Wooden Award candidate. If out, ISU ceiling collapses." },
        ],
        whyPick:"Even without Jefferson, ISU defense is elite (#4 KenPom, #3 TO rate). Toure (25/11/6 R64) and Heise (22 pts) showed other weapons. Kentucky turned it over repeatedly vs Santa Clara — ISU press will eat them alive.",
        whyNot:"Oweh just had the game of his life — 35 pts, deep 3 to force OT. If Jefferson can\'t go, Kentucky should be the favorite. Oweh\'s confidence is sky-high." },
    ],
    S16: [
      { id:"MS0", date:"Fri Mar 27", time:"7:10 PM ET", site:"United Center, Chicago", s1:1, t1:"Michigan", t1Short:"MICH", s2:4, t2:"Alabama", t2Short:"BAMA", pick:"Michigan", confidence:68, riskLevel:"LEAN",
        market: { spread:"Michigan -5.5", ou:"152.5", ml1:"-240", ml2:"+200", take:"Alabama just scored 90 on TTU — they can score on anyone. But Michigan's #1 defense is a different animal. This is the game of the S16. Michigan's size controls the paint. Lean Michigan but don't lay the points.", angle:"OVER 152.5 — Alabama pushes pace regardless. Michigan scores in the mid-70s, Bama gets 70+." },
        headline:"BLOCKBUSTER. Michigan's #1 defense vs Alabama's nation-best offense. 90-65 demolition of TTU sets the stage.",
        edge: { offense: 85, defense: 98, experience: 78, health: 78 },
        edgeOpp: { offense: 95, defense: 45, experience: 60, health: 88 },
        keyStats: [{ label: "MICH Def", value: "#1 KenPom — packs paint", hot: true },{ label: "BAMA Off", value: "#1 scoring offense (90 vs TTU!)", hot: true },{ label: "MICH TOs", value: "179th — Bama can exploit", hot: true }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL — but Michigan hasn't missed him." }],
        whyPick:"Michigan's defense is the best in the country and just held the best 3PT-shooting center in America to 3-13. Back-to-back blowouts (101-80, 95-72) with all five starters in double figures. Mara's rim protection makes Alabama's driving lanes disappear. Michigan controls tempo and grinds Alabama into a half-court game where talent is neutralized by system.",
        whyNot:"Alabama just scored 90 on Texas Tech and led 49-25 at HALF. Philon is explosive, the supporting cast showed up huge. Alabama's pace (top-5 nationally) can create transition chaos that exploits Michigan's 179th-ranked turnover rate. If Alabama forces 18+ turnovers and runs, Michigan's defense doesn't matter because they never get set. This is the most stylistically fascinating matchup of the Sweet 16." },
      { id:"MS1", date:"Fri Mar 27", time:"9:40 PM ET", site:"United Center, Chicago", s1:2, t1:"Iowa State", t1Short:"ISU", s2:6, t2:"Tennessee", t2Short:"TENN", pick:"Iowa State", confidence:62, riskLevel:"LEAN",
        market: { spread:"Iowa State -4.5", ou:"138.5", ml1:"-200", ml2:"+165", take:"ISU proved it can win without Jefferson. Lipsey's 26/10/5 was otherworldly. Tennessee is physical but ISU's turnover-forcing defense disrupts their half-court offense. ISU covers.", angle:"IOWA STATE -4.5 — Tennessee doesn't have the guard play to handle ISU's pressure." },
        headline:"ISU proved it doesn't need Jefferson (82-63 over UK). Tennessee upset Virginia. Physical battle incoming.",
        edge: { offense: 78, defense: 92, experience: 82, health: 55 },
        edgeOpp: { offense: 72, defense: 78, experience: 72, health: 85 },
        keyStats: [{ label: "Lipsey R32", value: "26 pts, 10 ast, 5 stl", hot: true },{ label: "TENN R32", value: "Beat Virginia 79-72 (upset)", hot: true },{ label: "Jefferson", value: "OUT — ankle. Lipsey is the guy now.", hot: true }],
        injuries: [{ player: "J. Jefferson", team: "Iowa State", status: "OUT", impact: "CRITICAL", detail: "Ankle injury R64. Was on crutches/boot Saturday. Lipsey took over — 26/10/5." }],
        whyPick:"Iowa State just annihilated Kentucky 82-63 WITHOUT their best player. Lipsey's 26/10/5 was the performance of the tournament. Momcilovic added 20. This team has proven it can win at an elite level without Jefferson. Tennessee upset Virginia but doesn't have the same offensive firepower to survive ISU's turnover-forcing defense.",
        whyNot:"Tennessee's physicality is real — they outscored Virginia 18-8 in the paint. Bishop Boswell can score in bunches. If Tennessee controls tempo and avoids turnovers (ISU forces TOs at the 3rd highest rate nationally), they can grind this into a coin flip. And Jefferson's absence eventually catches up — ISU's margin for error is thin." },
    ],
    E8: [
      { id:"ME", date:"Sun Mar 29", s1:1, t1:"Michigan", t1Short:"MICH", s2:2, t2:"Iowa State", t2Short:"ISU", pick:"Michigan", confidence:62, riskLevel:"LEAN",
        headline:"Michigan must survive Alabama's chaos first. Then ISU's press — Michigan's kryptonite.", whyPick:"If Michigan gets here, they've beaten Alabama's elite offense and proved they can handle pace. ISU without Jefferson is beatable — Lipsey is great but the supporting cast hasn't been tested deep into the tournament. Michigan's size overwhelms in a half-court game.", whyNot:"ISU's turnover-forcing defense (3rd nationally) exploits Michigan's worst weakness (179th TO rate). If Cyclones create 18+ turnovers, size doesn't matter. And if Jefferson returns by E8, this completely flips. Tennessee could also upset ISU — don't assume this matchup happens.",
        edge: { offense: 88, defense: 98, experience: 78, health: 78 },
        edgeOpp: { offense: 80, defense: 92, experience: 82, health: 60 },
        keyStats: [{ label: "MICH TO rate", value: "179th (weakness!)", hot: true },{ label: "ISU TO forcing", value: "#3 nationally", hot: true },{ label: "MICH R32", value: "95-72, all 5 in dbl figs", hot: false }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL." },{ player: "J. Jefferson", team: "Iowa State", status: "UNCERTAIN", impact: "CRITICAL", detail: "Scary R64 injury. Status unknown." }] },
    ],
  },
  FINAL_FOUR: [
    { id:"FF0", date:"Sat Apr 4", s1:1, t1:"Duke", t1Short:"DUKE", region1:"EAST", s2:2, t2:"Houston", t2Short:"HOU", region2:"SOUTH", pick:"Duke", confidence:58, riskLevel:"TOSS-UP",
      headline:"Boozer vs. Sampson's elite D. Duke's passing out of doubles decides it.", whyPick:"Boozer's passing when doubled creates impossible decisions for Houston's defense. Duke's #2 defense can match Houston's intensity. If Foster returns, Duke's ceiling goes even higher.", whyNot:"Houston's defensive scheme has frustrated bigger, more athletic opponents all season. Flemings + Cenac can score.",
        edge: { offense: 82, defense: 90, experience: 82, health: 68 },
        edgeOpp: { offense: 78, defense: 92, experience: 90, health: 88 },
        keyStats: [{ label: "Boozer", value: "Passing out of doubles", hot: true },{ label: "HOU Def", value: "Elite under Sampson", hot: true },{ label: "Foster?", value: "Could return for F4", hot: true }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "GTD", impact: "HIGH", detail: "Broken foot — outside chance of F4 return." }] },
    { id:"FF1", date:"Sat Apr 4", s1:1, t1:"Arizona", t1Short:"ARIZ", region1:"WEST", s2:1, t2:"Michigan", t2Short:"MICH", region2:"MIDWEST", pick:"Michigan", confidence:60, originalConfidence:56, riskLevel:"TOSS-UP",
      headline:"Michigan is rolling — 101-80, then 95-72. Can Arizona's athletes disrupt the machine?", whyPick:"Michigan has been the most dominant team through two rounds — back-to-back blowouts with all five starters in double figures. Mara's rim protection neutralizes Arizona's interior attack, and Arizona's low 3PT rate means they can't spread Michigan's pack-the-paint defense.", whyNot:"Arizona's elite athletes (Burries, Bradley, Peat) can force Michigan into turnovers in transition. If Arizona pushes tempo and Michigan's 179th-ranked TO rate shows up, Arizona's talent takes over.",
        edge: { offense: 90, defense: 92, experience: 80, health: 95 },
        edgeOpp: { offense: 85, defense: 98, experience: 78, health: 78 },
        keyStats: [{ label: "AZ 3PT rate", value: "4th-lowest in country", hot: true },{ label: "MICH Def", value: "#1 — packs the paint", hot: true },{ label: "MICH TOs", value: "179th — AZ can exploit", hot: false }],
        injuries: [{ player: "L.J. Cason", team: "Michigan", status: "OUT", impact: "MED", detail: "Torn ACL." }] },
  ],
  CHAMPIONSHIP: [
    { id:"CHAMP", date:"Mon Apr 6", s1:1, t1:"Duke", t1Short:"DUKE", region1:"EAST", s2:1, t2:"Michigan", t2Short:"MICH", region2:"MIDWEST", pick:"Duke", confidence:52, originalConfidence:55, riskLevel:"TOSS-UP",
      headline:"🏆 Michigan is playing like the best team in the field. But Boozer is the best player.", whyPick:"Championship games favor the team with the best individual player. Boozer is that player. But Michigan's 95-72 R32 blowout — all five starters in double figures, Mara shutting down Avila — makes this closer than pre-tournament. Duke needs Foster back to create perimeter offense against Michigan's #1 defense.", whyNot:"Michigan looks SCARY. Lendeborg, Mara, Johnson, Cadeau, Burnett — five legitimate scorers. Their defense held the best 3PT-shooting center in the country to 3-13. If Duke can't shoot from outside (2-15 vs Siena), Michigan's defense suffocates them.",
        edge: { offense: 82, defense: 90, experience: 82, health: 70 },
        edgeOpp: { offense: 85, defense: 98, experience: 78, health: 78 },
        keyStats: [{ label: "Boozer", value: "Best player = best team", hot: true },{ label: "MICH Def", value: "#1 in country", hot: true },{ label: "Foster?", value: "Return for title game?", hot: true }],
        injuries: [{ player: "C. Foster", team: "Duke", status: "GTD", impact: "HIGH", detail: "Could return for title game — would transform perimeter offense." }] },
  ],
};

const ROUND_LABELS = { R64:"ROUND OF 64", R32:"ROUND OF 32", S16:"SWEET 16", E8:"ELITE EIGHT" };

// ── FEEDER MAP: How games connect across rounds ─────────────
// Each later-round game is fed by two earlier games. When both feeders
// have results, the later game auto-updates with actual team names.
const FEEDERS = {
  // R32 fed by R64
  ER0: ["E0","E1"], ER1: ["E2","E3"], ER2: ["E4","E5"], ER3: ["E6","E7"],
  WR0: ["W0","W1"], WR1: ["W3","W2"], WR2: ["W5","W4"], WR3: ["W6","W7"],
  SR0: ["S0","S1"], SR1: ["S2","S3"], SR2: ["S4","S5"], SR3: ["S6","S7"],
  MR0: ["M0","M1"], MR1: ["M2","M3"], MR2: ["M4","M5"], MR3: ["M6","M7"],
  // S16 fed by R32
  ES0: ["ER0","ER1"], ES1: ["ER2","ER3"],
  WS0: ["WR0","WR1"], WS1: ["WR2","WR3"],
  SS0: ["SR0","SR1"], SS1: ["SR2","SR3"],
  MS0: ["MR0","MR1"], MS1: ["MR2","MR3"],
  // E8 fed by S16
  EE: ["ES0","ES1"], WE: ["WS0","WS1"], SE: ["SS0","SS1"], ME: ["MS0","MS1"],
  // F4 fed by E8
  FF0: ["EE","SE"], FF1: ["WE","ME"],
  // Championship fed by F4
  CHAMP: ["FF0","FF1"],
};

// Build a flat lookup of all games by ID (from both GAMES and LATER_ROUNDS)
function buildGameIndex() {
  const idx = {};
  Object.values(GAMES).forEach(region => region.forEach(g => { if (g.id) idx[g.id] = g; }));
  Object.values(LATER_ROUNDS).forEach(region => {
    if (Array.isArray(region)) { region.forEach(g => { if (g.id) idx[g.id] = g; }); }
    else { Object.values(region).forEach(round => round.forEach(g => { if (g.id) idx[g.id] = g; })); }
  });
  return idx;
}

// Given live results, find the winner of a game
function getWinner(gameId, liveResults, gameIndex) {
  // Check live results first
  if (liveResults[gameId]?.winner) return liveResults[gameId].winner;
  // Check pre-computed results
  const game = gameIndex[gameId];
  if (game?.result?.winner) return game.result.winner;
  return null;
}

// Apply live scores to a game — returns the game with result overlaid
function overlayResult(game, liveResults) {
  if (!game?.id || !liveResults[game.id]) return game;
  const live = liveResults[game.id];
  if (live.status === "FINAL" && live.score1 != null && live.score2 != null) {
    const isCorrect = game.pick === live.winner;
    return {
      ...game,
      result: {
        score1: live.score1, score2: live.score2, winner: live.winner,
        correct: isCorrect,
        postGame: live.postGame || (isCorrect
          ? `${live.winner} wins ${Math.max(live.score1,live.score2)}-${Math.min(live.score1,live.score2)}. Our pick was correct.`
          : `${live.winner} wins ${Math.max(live.score1,live.score2)}-${Math.min(live.score1,live.score2)}. We missed this one — picked ${game.pick}.`),
      },
    };
  }
  if (live.status === "LIVE") {
    return { ...game, liveScore: { score1: live.score1, score2: live.score2, time: live.time || "LIVE" } };
  }
  return game;
}

// Resolve R32+ team names based on feeder results
function resolveTeams(game, liveResults, gameIndex) {
  if (!game?.id || !FEEDERS[game.id]) return game;
  const [feeder1, feeder2] = FEEDERS[game.id];
  const winner1 = getWinner(feeder1, liveResults, gameIndex);
  const winner2 = getWinner(feeder2, liveResults, gameIndex);
  let updated = { ...game };
  if (winner1 && updated.t1 !== winner1) {
    updated.t1 = winner1;
    updated.t1Short = winner1.length <= 5 ? winner1.toUpperCase() : winner1.substring(0,5).toUpperCase();
  }
  if (winner2 && updated.t2 !== winner2) {
    updated.t2 = winner2;
    updated.t2Short = winner2.length <= 5 ? winner2.toUpperCase() : winner2.substring(0,5).toUpperCase();
  }
  return updated;
}

function ConfidenceGauge({ value, originalValue, size = 48 }) {
  const color = value >= 80 ? "#3ded7a" : value >= 60 ? "#edcc3d" : value >= 50 ? "#ed8a3d" : "#ed3d5a";
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (value / 100) * circumference;
  const delta = originalValue ? value - originalValue : null;
  return (
    <div style={{ position:"relative", width:size, height: delta !== null ? size + 14 : size, display:"inline-flex", alignItems:"flex-start", justifyContent:"center", flexDirection:"column" }}>
      <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)", position:"absolute" }}>
          <circle cx={size/2} cy={size/2} r={18} fill="none" stroke="#303340" strokeWidth={3} />
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

function EdgeBar({ label, val1, val2, color1, color2 }) {
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

function InjuryBadge({ injury }) {
  const colors = { OUT:"#ed3d3d", DTD:"#ed8a3d", GTD:"#edcc3d", UNCERTAIN:"#ed8a3d", ACTIVE:"#3ded7a" };
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

function StatPill({ stat }) {
  return (
    <div style={{
      background: stat.hot ? "#1e1828" : "#121620",
      border:`1px solid ${stat.hot ? "#3a2a48" : "#3a3f52"}`,
      borderRadius:6, padding:"5px 8px", flex:1, minWidth:0,
    }}>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color: stat.hot ? "#ed8aed" : "#a0a3ae", letterSpacing:1, marginBottom:2 }}>{stat.label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color: stat.hot ? "#e2ddd5" : "#b0b3bb", fontWeight: stat.hot ? 700 : 400 }}>{stat.value}</div>
    </div>
  );
}

function RiskBadge({ level }) {
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
function ChatView() {
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
      // On Vercel, /api/chat serverless function adds the API key securely
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
            <div style={{ padding:"10px 14px", background:"#14161f", border:"1px solid #1e2230", borderRadius:"14px 14px 14px 4px" }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ff6b3d", letterSpacing:2, marginBottom:3 }}>SEARCHING WEB...</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8090a0", animation:"pulse 1.5s ease infinite" }}>Finding latest data and generating analysis...</div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ padding:"6px 14px 14px", borderTop:"1px solid #2e3140", background:"#08090c" }}>
        <div style={{ display:"flex", gap:8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about any matchup, team, injury..."
            style={{ flex:1, background:"#14161f", border:"1px solid #2a2d38", borderRadius:10, padding:"10px 14px", color:"#e2ddd5", fontFamily:"'Libre Baskerville',Georgia,serif", fontSize:12 }}
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
export default function MadnessIQ() {
  const [tab, setTab] = useState("bracket");
  const [region, setRegion] = useState("EAST");
  const [round, setRound] = useState("R64");

  // Deep-link: read ?region=EAST&round=R32 from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("region");
    const rd = params.get("round");
    if (r && ["EAST","WEST","SOUTH","MIDWEST","FINAL4"].includes(r)) { setRegion(r); }
    if (rd && ["R64","R32","S16","E8","F4"].includes(rd)) { setRound(rd); }
  }, []);
  const [expanded, setExpanded] = useState(null);
  const [detailSection, setDetailSection] = useState("matchup");
  const [liveResults] = useState({});
  const gameIndex = useRef(buildGameIndex());

  // Apply live data to games for rendering
  const processGame = useCallback((g) => {
    if (!g?.id) return g;
    let processed = resolveTeams(g, liveResults, gameIndex.current);
    processed = overlayResult(processed, liveResults);
    return processed;
  }, [liveResults]);

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
      <div style={{ background:"linear-gradient(180deg,#0e1018,#08090c)", borderBottom:"1px solid #2e3140", padding:"12px 16px 8px", position:"sticky", top:0, zIndex:100 }}>
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
              flex:1, background: tab === t.id ? "#1c2030" : "transparent",
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

          {/* Scorecard banner */}
          <div style={{ background:"linear-gradient(135deg,#101420,#141018)", border:"1px solid #4a4568", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, color:"#ff6b3d" }}>R64 + R32 COMPLETE</div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"#8a8d9a" }}>Updated Mar 22</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <div style={{ flex:1, background:"#0a1a10", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #3a5a42" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#3ded7a" }}>37</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#3ded7a", letterSpacing:1 }}>CORRECT</div>
              </div>
              <div style={{ flex:1, background:"#1a0e10", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #5a3a3e" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#ed5a5a" }}>11</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#ed5a5a", letterSpacing:1 }}>MISSED</div>
              </div>
              <div style={{ flex:1, background:"#0e1420", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #1a2a40" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#4a9aed" }}>77%</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#4a9aed", letterSpacing:1 }}>ACCURACY</div>
              </div>
              <div style={{ flex:1, background:"#1a1410", borderRadius:6, padding:"6px 8px", textAlign:"center", border:"1px solid #3a2a1a" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:"#edaa3d" }}>1</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#edaa3d", letterSpacing:1 }}>UPSET HIT</div>
              </div>
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#6a6d78", marginTop:6, lineHeight:1.5 }}>
              R32 FINAL: 12-4 (75%). Florida stunned by Iowa 73-72 — biggest upset of tourney. Tennessee upset Virginia. Texas upset Gonzaga. Alabama demolished Tech 90-65. UConn pulled away from UCLA. Our F4 path (Duke/Arizona/Houston/Michigan) fully intact. Sweet 16 starts Thursday.
            </div>
          </div>

          {/* Championship Futures */}
          <div style={{ background:"linear-gradient(135deg,#101420,#141018)", border:"1px solid #3a3558", borderRadius:8, padding:"10px 12px", marginBottom:10 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:2, color:"#ffe050", marginBottom:8 }}>CHAMPIONSHIP FUTURES (Post-R32)</div>
            <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
              {[
                { team:"Michigan", odds:"+325", color:"#ffe050" },
                { team:"Arizona", odds:"+325", color:"#ff7855" },
                { team:"Duke", odds:"+425", color:"#5090ff" },
                { team:"Houston", odds:"+850", color:"#60ff90" },
                { team:"Purdue", odds:"16-1", color:"#b0b8c8" },
                { team:"Illinois", odds:"17-1", color:"#b0b8c8" },
                { team:"Iowa State", odds:"25-1", color:"#b0b8c8" },
                { team:"MSU", odds:"30-1", color:"#b0b8c8" },
                { team:"UConn", odds:"40-1", color:"#b0b8c8" },
                { team:"Alabama", odds:"50-1", color:"#b0b8c8" },
                { team:"SJU", odds:"50-1", color:"#b0b8c8" },
              ].map((f, i) => (
                <div key={i} style={{ background:"#0e1018", border:"1px solid #2a2d3a", borderRadius:4, padding:"4px 7px", textAlign:"center" }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8090a0" }}>{f.team}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color:f.color }}>{f.odds}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#6a6d78", marginTop:6, lineHeight:1.5 }}>
              Our pick: Duke +425. Michigan is the betting favorite but Duke has the best player (Boozer) and Ngongba's back. Florida's exit boosted Houston's path — our S. region champ pick now has the easiest E8 draw. Purdue 16-1 is intriguing value with Gonzaga gone from the West.
            </div>
          </div>

          {/* Bracket links */}
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            <a href="/bracket-view.html" style={{ flex:1, display:"block", background:"linear-gradient(135deg,#141420,#101018)", border:"1px solid #4a5068", borderRadius:8, padding:"10px 14px", textDecoration:"none", textAlign:"center" }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1, color:"#ffe050" }}>📊 FULL BRACKET</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#6a7080", display:"block", marginTop:2 }}>Traditional view · Pinch to zoom</span>
            </a>
            <a href="/bracket.html" style={{ flex:1, display:"block", background:"linear-gradient(135deg,#1a1420,#141018)", border:"1px solid #5a4a70", borderRadius:8, padding:"10px 14px", textDecoration:"none", textAlign:"center" }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:1, color:"#ff6b3d" }}>🏀 BRACKET CHALLENGE</span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#6a7080", display:"block", marginTop:2 }}>Family picks + scoreboard</span>
            </a>
          </div>

          {/* Region tabs — includes FINAL 4 */}
          <div style={{ display:"flex", gap:2, marginBottom:6 }}>
            {[...Object.keys(GAMES), "FINAL4"].map(r => (
              <button key={r} onClick={() => { setRegion(r); setRound(r === "FINAL4" ? "F4" : "R64"); setExpanded(null); }} style={{
                flex:1, background: region === r ? "#1c2030" : "transparent",
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
                      border: round === rd ? `1px solid ${regionColors[region]}40` : "1px solid #3a3f52",
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
              {(round === "R64" ? games : (LATER_ROUNDS[region]?.[round] || [])).map((rawGame, i) => {
                const g = processGame(rawGame);
                const isExp = expanded === i;
                const isLater = round !== "R64";
                return (
                  <div key={`${round}-${i}`} onClick={() => { setExpanded(isExp ? null : i); setDetailSection(g.result ? "postgame" : g.edge ? "matchup" : "why"); }} style={{
                    background: isExp ? "linear-gradient(135deg,#12141e,#161424)" : "#13151f",
                    border:`1px solid ${isExp ? "#4a4a6a" : g.upset ? "#3a1a20" : "#2e3345"}`,
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
                            {g.liveScore && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color:"#ff6b3d" }}>{g.liveScore.score1}</span>}
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: g.liveScore ? "#ff3b3b" : "#8a8d9a" }}>{g.result ? "\u2014" : g.liveScore ? "LIVE" : "vs"}</span>
                            {g.result && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color: g.result.winner===g.t2 ? "#e2ddd5" : "#5a5d68" }}>{g.result.score2}</span>}
                            {g.liveScore && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700, color:"#ff6b3d" }}>{g.liveScore.score2}</span>}
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a8d9a" }}>{g.s2}</span>
                            <span style={{ fontSize:12, fontWeight: g.pick===g.t2?700:400, color: g.result ? (g.result.winner===g.t2 ? "#e2ddd5" : "#5a5d68") : g.pick===g.t2?"#4aed7a":"#b8bac2" }}>{g.t2}</span>
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, lineHeight:1.3, overflow:"hidden" }}>
                            {g.date && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color: g.result ? "#6a7080" : "#8a8d9a", background: g.result ? "transparent" : "#0e1218", padding: g.result ? "0" : "1px 4px", borderRadius:3, flexShrink:0 }}>{g.date}</span>}
                            <span style={{ color: g.upset?"#ed8a8a":"#a0a3ae", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{g.headline}</span>
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
                      <div style={{ borderTop:"1px solid #3a4055", padding:"10px", animation:"slideUp 0.2s ease" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display:"flex", gap:2, marginBottom:10 }}>
                          {[
                            ...(g.result ? [{id:"postgame",label:g.result.correct ? "\u2713 RESULT" : "\u2717 RESULT"}] : []),
                            ...(g.market ? [{id:"market",label:"\uD83D\uDCB0 MARKET"}] : []),
                            ...(g.edge ? [{id:"matchup",label:"MATCHUP"}] : []),
                            ...(g.injuries?.length ? [{id:"injuries",label:`INJURIES (${g.injuries.length})`}] : []),
                            {id:"why",label: g.result ? "PRE-GAME" : "ANALYSIS"},
                          ].map(s => (
                            <button key={s.id} onClick={() => setDetailSection(s.id)} style={{
                              flex:1, background: detailSection === s.id ? "#1c2030" : "transparent",
                              border:`1px solid ${detailSection === s.id ? "#4a5570" : "#3a3f52"}`,
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
                        {detailSection === "market" && g.market && (
                          <div>
                            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                              <div style={{ flex:1, background:"#10121a", border:"1px solid #3a4055", borderRadius:6, padding:"8px", textAlign:"center" }}>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#8090a0", letterSpacing:1, marginBottom:2 }}>SPREAD</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:"#4aed7a" }}>{g.market.spread}</div>
                              </div>
                              <div style={{ flex:1, background:"#10121a", border:"1px solid #3a4055", borderRadius:6, padding:"8px", textAlign:"center" }}>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#8090a0", letterSpacing:1, marginBottom:2 }}>O/U</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:"#edcc3d" }}>{g.market.ou}</div>
                              </div>
                              <div style={{ flex:1, background:"#10121a", border:"1px solid #3a4055", borderRadius:6, padding:"8px", textAlign:"center" }}>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7, color:"#8090a0", letterSpacing:1, marginBottom:2 }}>MONEYLINE</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b8bac2" }}>{g.t1Short} {g.market.ml1}</div>
                                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b8bac2" }}>{g.t2Short} {g.market.ml2}</div>
                              </div>
                            </div>
                            {g.time && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8090a0", marginBottom:6 }}>{g.time} {"\u00B7"} {g.site}</div>}
                            <div style={{ background:"#0e1420", border:"1px solid #2a3a50", borderRadius:6, padding:"8px 10px", marginBottom:8 }}>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#4a9aed", letterSpacing:1, marginBottom:3 }}>MADNESSIQ TAKE</div>
                              <div style={{ fontSize:11, lineHeight:1.6, color:"#d0ccc4" }}>{g.market.take}</div>
                            </div>
                            <div style={{ background:"#101418", border:"1px solid #2a3040", borderRadius:6, padding:"8px 10px" }}>
                              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#edaa3d", letterSpacing:1, marginBottom:3 }}>{"\uD83C\uDFAF"} BEST ANGLE</div>
                              <div style={{ fontSize:11, lineHeight:1.6, color:"#edcc3d", fontWeight:600 }}>{g.market.angle}</div>
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
                              <div style={{ background:"#12141e", borderRadius:5, padding:"6px 8px", border:"1px solid #3a4055" }}>
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
              {LATER_ROUNDS.FINAL_FOUR.map((rawG, i) => { const g = processGame(rawG); return (
                <div key={`ff-${i}`} onClick={() => setExpanded(expanded === `ff${i}` ? null : `ff${i}`)} style={{
                  background: expanded === `ff${i}` ? "linear-gradient(135deg,#12141e,#161424)" : "#13151f",
                  border:`1px solid ${expanded === `ff${i}` ? "#4a4a6a" : "#2e3345"}`,
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
                        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:10 }}>
                          {g.date && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#8a8d9a", background:"#12161e", padding:"1px 4px", borderRadius:3, flexShrink:0 }}>{g.date}</span>}
                          <span style={{ color:"#a0a3ae" }}>{g.headline}</span>
                        </div>
                      </div>
                      <RiskBadge level={g.riskLevel} />
                    </div>
                  </div>
                  {expanded === `ff${i}` && (
                    <div style={{ borderTop:"1px solid #3a4055", padding:"10px" }} onClick={e => e.stopPropagation()}>
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
              )})}

              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ff6b3d", letterSpacing:2, marginTop:14, marginBottom:4 }}>NATIONAL CHAMPIONSHIP {"\u2014"} MONDAY APRIL 6</div>
              {LATER_ROUNDS.CHAMPIONSHIP.map((rawG, i) => { const g = processGame(rawG); return (
                <div key={`ch-${i}`} onClick={() => setExpanded(expanded === "champ" ? null : "champ")} style={{
                  background: expanded === "champ" ? "linear-gradient(135deg,#141620,#1a1428)" : "linear-gradient(135deg,#13151f,#121018)",
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
                        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                          {g.date && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"#ff6b3d", background:"#1a1014", padding:"1px 4px", borderRadius:3, flexShrink:0 }}>{g.date}</span>}
                          <span style={{ color:"#d0ccc4" }}>{g.headline}</span>
                        </div>
                      </div>
                      <ConfidenceGauge value={g.confidence} originalValue={g.originalConfidence} size={44} />
                    </div>
                  </div>
                  {expanded === "champ" && (
                    <div style={{ borderTop:"1px solid #3a4055", padding:"10px" }} onClick={e => e.stopPropagation()}>
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
              )})}

              <div style={{ marginTop:12, background:"linear-gradient(135deg,#141620,#1a1428)", border:"1px solid #4a4568", borderRadius:10, padding:"16px", textAlign:"center" }}>
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
