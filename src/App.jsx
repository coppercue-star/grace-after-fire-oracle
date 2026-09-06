import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Lock, Sparkles, BookOpen, Flame, Bell, BellOff, X, ChevronRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

/* =========================================================
   STEP 1 OF SETUP — paste your own Supabase details below.
   You'll get these from supabase.com after creating a free
   project. See the "Getting It Live" guide for exact steps.
========================================================= */
const SUPABASE_URL = "https://zpdubxodoovikwgrjasx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwZHVieG9kb292aWt3Z3JqYXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5MzMxMzAsImV4cCI6MjA5OTUwOTEzMH0.RBFpEeLRvkYrkivLcWYAiAQdttF2smWVSWcDXj3IkX0";

const supabase =
  SUPABASE_URL.startsWith("http") ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Each visitor gets a private, anonymous ID stored in their own browser.
// This is what keeps her journal/streak tied to her, without needing login.
function getDeviceId() {
  let id = localStorage.getItem("gaf-device-id");
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("gaf-device-id", id);
  }
  return id;
}

/* ---------------------------------------------------------
   GRACE AFTER FIRE — DAILY ORACLE
   "Align. Release. Unfold."
   100 original cards across 10 healing themes.
   First 15 are free; the rest unlock with Premium.
--------------------------------------------------------- */

const CARDS = [
  // ---- Reclaiming Reality (free) ----
  { theme: "Reclaiming Reality", title: "Your Memory Is Not Broken", message: "You spent years being told what you saw wasn't real, what you felt wasn't fair, what you knew wasn't true. It was real. It was fair. You knew.", affirmation: "I trust what I remember." },
  { theme: "Reclaiming Reality", title: "The Fog Lifts Slowly", message: "Clarity doesn't return all at once — it comes back in pieces, in moments where something suddenly makes sense. Be patient with the fog; it is leaving.", affirmation: "I am allowed to see clearly again." },
  { theme: "Reclaiming Reality", title: "You Were Not Too Sensitive", message: "Every time you were called dramatic for noticing what was actually happening, a part of you learned to doubt itself. That part gets to come home now.", affirmation: "My sensitivity was always perception, not weakness." },
  { theme: "Self-Worth", title: "Worth Was Never Up for Debate", message: "Your worth was never something that needed to be earned back through good behaviour. It was never lost. It was only hidden from you.", affirmation: "My worth was never negotiable." },
  { theme: "Self-Worth", title: "You Are Not Behind", message: "There is no clock you failed to beat. There is only the moment you're in now, and it is exactly on time.", affirmation: "I release the idea that I am behind." },
  { theme: "Safety", title: "Your Body Remembers, and That's Okay", message: "Startling easily, staying alert, needing to know the exits — your body is not broken, it is protecting you from a war that's over. Thank it, and let it rest.", affirmation: "My body is allowed to feel safe now." },
  { theme: "Safety", title: "Calm Is Not Suspicious", message: "After chaos, peace can feel like something is about to go wrong. It isn't. You are allowed to simply be at ease.", affirmation: "I am allowed to trust the quiet." },
  { theme: "Boundaries", title: "No Is a Complete Sentence", message: "You do not owe anyone an essay explaining why you won't. No, on its own, is enough.", affirmation: "My no does not require an explanation." },
  { theme: "Boundaries", title: "Boundaries Are Not Punishments", message: "Setting a boundary isn't cruelty, even if it's called that. It is simply you deciding what you will and won't carry.", affirmation: "My boundaries are acts of self-respect, not attacks." },
  { theme: "Grief for Lost Time", title: "The Years Were Not Wasted", message: "They were survived. Every one of them built the strength that is carrying you out the other side.", affirmation: "My years of survival were not wasted; they were the making of me." },
  { theme: "Voice", title: "Your Voice Was Never Too Loud", message: "You were taught that speaking up caused trouble. It didn't. Silence protected someone else, never you.", affirmation: "I am allowed to be heard." },
  { theme: "Trust in Self", title: "Your Judgment Is Recovering", message: "It was undermined for a long time, but judgment, like a muscle, comes back with use. Trust it a little more each day.", affirmation: "My judgment grows stronger every time I use it." },
  { theme: "Joy", title: "Joy Is Not Frivolous", message: "You do not need to justify happiness with productivity or explain why you're allowed to feel good.", affirmation: "Joy needs no justification." },
  { theme: "Identity", title: "You Are Not Starting From Zero", message: "Everything you learned about strength, love, and survival is coming with you into this next chapter. Nothing valuable was lost.", affirmation: "I carry everything I've learned into who I'm becoming." },
  { theme: "Future Self", title: "She Is Already Proud of You", message: "The woman you're becoming, a few years from now, is already looking back at this moment with deep respect for how hard you're trying.", affirmation: "My future self is proud of the effort I'm making today." },

  // ---- Premium: Reclaiming Reality ----
  { theme: "Reclaiming Reality", title: "Sanity Was Never the Question", message: "You were never the unstable one. You were reacting sanely to an insane situation. Say that to yourself until it settles in your bones.", affirmation: "I was sane all along." },
  { theme: "Reclaiming Reality", title: "Rewriting the Record", message: "The story you were given about yourself was written by someone with a reason to keep you small. You get to write the true one now.", affirmation: "I am the author of my own story now." },
  { theme: "Reclaiming Reality", title: "Your Gut Was Right", message: "That feeling in your stomach, the one you learned to override — it was accurate the entire time. Let it speak again.", affirmation: "I listen to my body's first knowing." },
  { theme: "Reclaiming Reality", title: "Nothing Was Wrong With You", message: "You went looking for what was wrong with you for years. There was nothing to find. The problem was never you.", affirmation: "I release the search for my own flaws." },
  { theme: "Reclaiming Reality", title: "Reality Has a Witness Now", message: "You don't have to hold the truth of what happened alone anymore. You can say it out loud, and it will still be true.", affirmation: "My truth doesn't need permission to exist." },
  { theme: "Reclaiming Reality", title: "The Confusion Was the Point", message: "Feeling confused, off-balance, unsure — that wasn't an accident. It was the intended effect. Understanding that is the beginning of never falling for it again.", affirmation: "I see the pattern now, and I am safe from it." },
  { theme: "Reclaiming Reality", title: "You Get to Trust the Evidence", message: "Not his version. Not their version. The evidence — what you lived, what you felt, what happened in your own body.", affirmation: "The evidence of my life belongs to me." },

  // ---- Premium: Self-Worth ----
  { theme: "Self-Worth", title: "Enough, As You Are Today", message: "Not once you heal more. Not once you're calmer, thinner, softer, easier. Today, exactly as you are, enough.", affirmation: "I am enough today." },
  { theme: "Self-Worth", title: "You Were Never the Burden", message: "Being told you were too much was a way of making you smaller. You were never too much. You were simply more than someone wanted to hold.", affirmation: "I am not too much for the right life." },
  { theme: "Self-Worth", title: "Your Needs Are Not a Debt", message: "Having needs is not something you have to apologise for or repay. Needs are just part of being human.", affirmation: "I am allowed to need things." },
  { theme: "Self-Worth", title: "Value Isn't Measured by Who Stayed", message: "The length of a relationship was never proof of your worth, and its ending is not proof against it.", affirmation: "My worth is not measured by who chose to stay." },
  { theme: "Self-Worth", title: "You Deserved Softness", message: "You deserved to be spoken to gently, long before you learned to speak to yourself that way. Start now. It still counts.", affirmation: "I offer myself the gentleness I always deserved." },
  { theme: "Self-Worth", title: "Worthy Before the Proof", message: "You don't need one more accomplishment, one more sacrifice, one more year of good behaviour to prove you're worthy of love. You already are.", affirmation: "I am worthy without needing to prove it." },
  { theme: "Self-Worth", title: "You Are Not What Was Done to You", message: "What happened to you is part of your story, not the whole of your identity. You are still, underneath it, entirely yourself.", affirmation: "I am more than what was done to me." },
  { theme: "Self-Worth", title: "Quiet Confidence Returning", message: "You don't have to shout to know your own worth. It can come back quietly, like a light turned low, growing brighter each day.", affirmation: "My confidence is returning, gently and steadily." },

  // ---- Premium: Safety ----
  { theme: "Safety", title: "Rest Is Not Weakness", message: "You do not have to earn your rest through exhaustion. Your nervous system needed rest yesterday. Give it to yourself today.", affirmation: "I rest without needing to earn it." },
  { theme: "Safety", title: "You Get to Set the Pace", message: "No one is rushing you back into the world. Healing on your own timeline is not slowness — it is respect for what you survived.", affirmation: "I move at the pace that is right for me." },
  { theme: "Safety", title: "Safety Is Being Rebuilt, Brick by Brick", message: "It doesn't return all at once. It returns in small, repeated proofs — a locked door, a quiet evening, a promise kept to yourself.", affirmation: "I am building safety one small proof at a time." },
  { theme: "Safety", title: "Your Breath Is Yours Again", message: "Notice it right now. In, out. No one controls its rhythm but you. That is no small thing.", affirmation: "My breath belongs to me." },
  { theme: "Safety", title: "The Alarm Bells Can Quiet Down", message: "Hypervigilance kept you alive once. It is allowed to soften now, gradually, as your world becomes genuinely safer.", affirmation: "I am safe enough to let my guard down, slowly." },
  { theme: "Safety", title: "Home Can Feel Like Home Again", message: "The place you live is allowed to become a place where your shoulders drop the second you walk in. Let it become that.", affirmation: "I am creating a home where I can exhale." },
  { theme: "Safety", title: "You Are Allowed to Feel Good Without Bracing", message: "Good moments don't have to be followed by dread anymore. You can simply enjoy them.", affirmation: "I let good moments be simply good." },
  { theme: "Safety", title: "Your Nervous System Is Learning New Evidence", message: "Every calm day is teaching your body a new truth: this is what safe actually feels like. Keep giving it evidence.", affirmation: "Each safe day is proof my body can learn to trust again." },

  // ---- Premium: Boundaries ----
  { theme: "Boundaries", title: "You Can Love Someone and Still Say No", message: "Boundaries and love are not opposites. You can care about someone deeply and still protect your peace from them.", affirmation: "I can hold love and boundaries in the same hand." },
  { theme: "Boundaries", title: "The Guilt Will Fade, the Boundary Stays", message: "The discomfort of disappointing someone passes. The relief of having protected yourself lasts far longer.", affirmation: "I let the boundary outlast the guilt." },
  { theme: "Boundaries", title: "You Are Not Responsible for Their Reaction", message: "How someone responds to your limit is theirs to manage, not yours to fix.", affirmation: "Their reaction to my boundary is not mine to carry." },
  { theme: "Boundaries", title: "Boundaries Protect the Relationship With Yourself", message: "Every boundary you hold is a promise kept to the person you're becoming.", affirmation: "I keep my promises to myself." },
  { theme: "Boundaries", title: "You Can Change Your Mind", message: "A boundary you set once isn't a life sentence. You're allowed to adjust it as you learn what you truly need.", affirmation: "I can revise my boundaries as I grow." },
  { theme: "Boundaries", title: "Silence Is Also a Boundary", message: "You don't owe a response to everything. Sometimes the most powerful boundary is simply not answering.", affirmation: "I choose what deserves my response." },
  { theme: "Boundaries", title: "Protecting Your Peace Is Not Selfish", message: "It was called selfish so you'd stop doing it. It wasn't selfish then, and it isn't now.", affirmation: "Protecting my peace is not selfish, it is necessary." },
  { theme: "Boundaries", title: "The Door You Get to Close", message: "You get to decide who has access to you now — your time, your energy, your story. That door is yours to open or close.", affirmation: "I decide who has access to my life." },

  // ---- Premium: Grief for Lost Time ----
  { theme: "Grief for Lost Time", title: "You Are Allowed to Grieve the Life You Didn't Get", message: "Mourning the years, the version of yourself you might have been — that grief is valid, and it deserves space.", affirmation: "I give myself permission to grieve what was taken." },
  { theme: "Grief for Lost Time", title: "There Is Still Time", message: "However many years passed, there is still time ahead of you — more than you think, and entirely your own.", affirmation: "The time ahead of me is mine to use fully." },
  { theme: "Grief for Lost Time", title: "Grief and Hope Can Sit Together", message: "You don't have to finish grieving before you're allowed to hope again. They can exist in the same day, even the same hour.", affirmation: "I let grief and hope share the same space in me." },
  { theme: "Grief for Lost Time", title: "You Didn't Lose Yourself, You Set Her Aside", message: "The woman you were before is not gone. She was set carefully aside for safekeeping, and she is ready to be found again.", affirmation: "I am finding the parts of myself I set aside to survive." },
  { theme: "Grief for Lost Time", title: "It's Not Too Late", message: "Whatever age you are, whatever you think you missed — it is not too late for the next chapter to be the best one.", affirmation: "It is not too late for my life to change." },
  { theme: "Grief for Lost Time", title: "You Don't Have to Get the Time Back to Move Forward", message: "Healing doesn't require reclaiming every lost year. It only requires living fully in the ones still ahead.", affirmation: "I move forward without needing the past returned to me." },
  { theme: "Grief for Lost Time", title: "The Comparison Trap", message: "Your life is not behind anyone else's timeline. There is no race, no deadline, only your own path unfolding as it needs to.", affirmation: "I release comparing my timeline to anyone else's." },
  { theme: "Grief for Lost Time", title: "What Was Survived Can Be Honoured", message: "One day you may look back not with only sorrow, but with respect for how you endured. That day is coming.", affirmation: "I honour the strength it took to survive." },
  { theme: "Grief for Lost Time", title: "New Memories Are Being Made", message: "The years ahead will hold their own moments, ones that are entirely, freely yours. Let them start collecting.", affirmation: "I am making new memories that belong only to me." },

  // ---- Premium: Voice ----
  { theme: "Voice", title: "Saying It Out Loud Makes It Real", message: "Speaking the truth of what happened, even just to yourself in a mirror, gives it a shape that isolation never could.", affirmation: "My voice gives my truth its rightful shape." },
  { theme: "Voice", title: "You Don't Need the Perfect Words", message: "Waiting for the exact right sentence has kept many women silent for years. Imperfect words spoken are worth more than perfect words unsaid.", affirmation: "I speak, even when the words aren't perfect." },
  { theme: "Voice", title: "Your Opinion Was Always Allowed", message: "You don't need consensus to have a viewpoint. It was always yours to hold, whether or not anyone agreed.", affirmation: "My opinions are mine to hold without permission." },
  { theme: "Voice", title: "Asking for Help Is Not Failure", message: "Reaching out was never weakness. It takes real strength to say the words, \"I need help.\"", affirmation: "Asking for help is a strength, not a failure." },
  { theme: "Voice", title: "You Can Interrupt", message: "You are allowed to speak before you're finished thinking, to interrupt, to take up your fair share of the conversation.", affirmation: "I take up my rightful space in conversation." },
  { theme: "Voice", title: "The Apology Habit Can Be Unlearned", message: "Not every sentence needs to start with \"sorry.\" You are allowed simply to speak.", affirmation: "I speak without needing to apologise first." },
  { theme: "Voice", title: "Your Story Is Yours to Tell", message: "Who, when, how much — you decide. No one else gets a vote in how or whether you share what happened to you.", affirmation: "I control the telling of my own story." },
  { theme: "Voice", title: "A Raised Voice Doesn't Mean You've Lost Control", message: "Sometimes anger needs volume. Feeling it doesn't undo the progress you've made — it's simply being human.", affirmation: "I allow my voice its full range, including anger." },
  { theme: "Voice", title: "You Get the Last Word on Your Own Life", message: "Not them. Not the past. You.", affirmation: "I have the final word on my own story." },

  // ---- Premium: Trust in Self ----
  { theme: "Trust in Self", title: "Small Decisions Rebuild Big Trust", message: "Choosing what to eat for dinner, what to wear, what to watch — every small choice you make for yourself is proof you can be trusted with bigger ones.", affirmation: "Every small choice rebuilds my trust in myself." },
  { theme: "Trust in Self", title: "You Are Allowed to Be Wrong Sometimes", message: "Being wrong occasionally doesn't mean your judgment can't be trusted. It means you're human, the same as everyone else.", affirmation: "I can trust myself and still make mistakes." },
  { theme: "Trust in Self", title: "Second-Guessing Is Not the Same as Wisdom", message: "Notice when doubt is protecting you, and when it's just an old habit talking. They are not the same voice.", affirmation: "I can tell the difference between wisdom and old fear." },
  { theme: "Trust in Self", title: "You Knew Then, You Know Now", message: "The part of you that eventually saw the truth clearly and left — that part has always been wise. Trust her leadership.", affirmation: "I trust the part of me that got me out." },
  { theme: "Trust in Self", title: "Instincts Are Not Optional Extras", message: "That flicker of unease, that pull toward or away from something — it is information, and it deserves your attention.", affirmation: "I honour my instincts as valuable information." },
  { theme: "Trust in Self", title: "You Are the Expert on Your Own Life", message: "No one else has lived inside your experience. No one else's opinion outranks your own lived knowledge.", affirmation: "I am the leading expert on my own life." },
  { theme: "Trust in Self", title: "Confidence Comes From Doing, Not Waiting", message: "You don't have to feel ready to trust yourself. Acting, even imperfectly, is how the trust gets rebuilt.", affirmation: "I build self-trust through action, not waiting." },
  { theme: "Trust in Self", title: "You Chose Right, Even When It Was Hard", message: "Every hard choice you made to protect yourself and your children was the right one, even if it didn't feel like it at the time.", affirmation: "I trust the hard choices I made to survive." },
  { theme: "Trust in Self", title: "Your Inner Voice Is Not the Old Voice", message: "The critical, doubting voice in your head may sound familiar, but it is not truth. It is an echo. You can choose a different voice.", affirmation: "I choose my own voice over the echo of the old one." },

  // ---- Premium: Joy ----
  { theme: "Joy", title: "You Are Allowed to Laugh Loudly", message: "Laughter that once might have drawn unwanted attention can now simply be laughter. Let it be loud if it wants to be.", affirmation: "I let my joy be as loud as it needs to be." },
  { theme: "Joy", title: "Pleasure Is Part of Healing", message: "A good meal, warm sun, a favourite song — these are not distractions from healing. They are healing.", affirmation: "I welcome pleasure as part of my healing, not a distraction from it." },
  { theme: "Joy", title: "Reclaim What Was Taken From You", message: "The hobby you dropped, the music you loved, the friends you drifted from — you are allowed to want them back.", affirmation: "I am reclaiming the parts of my life that were taken from me." },
  { theme: "Joy", title: "You Don't Need a Reason to Celebrate", message: "Getting through an ordinary Tuesday is worth celebrating when Tuesdays used to be survived, not lived.", affirmation: "I celebrate the ordinary days I get to simply live." },
  { theme: "Joy", title: "Colour Is Allowed Back In", message: "If your world went grey for a while, you're allowed to let colour back in — in your clothes, your home, your days.", affirmation: "I welcome colour and lightness back into my life." },
  { theme: "Joy", title: "Silliness Was Never Beneath You", message: "Being playful, a little ridiculous, unguarded — that was never immature. It was joy, and you're allowed it back.", affirmation: "I give myself permission to be playful again." },
  { theme: "Joy", title: "You Can Want Good Things Without Guilt", message: "Wanting comfort, beauty, ease — none of that needs to be earned through suffering first.", affirmation: "I want good things for myself, without guilt." },
  { theme: "Joy", title: "Delight Is a Form of Rebellion", message: "After being made small, choosing delight on purpose is its own quiet act of reclaiming your life.", affirmation: "My delight is proof I am reclaiming my life." },
  { theme: "Joy", title: "This Happiness Is Allowed to Last", message: "You don't have to brace for it to be taken away. Let yourself believe good things can simply continue.", affirmation: "I let good things last without bracing for their end." },

  // ---- Premium: Identity ----
  { theme: "Identity", title: "Who Are You, Underneath It All?", message: "Beneath the roles you played to keep the peace, there is a woman with her own tastes, opinions, and dreams. She is still there, waiting.", affirmation: "I am rediscovering who I am beneath the roles I played." },
  { theme: "Identity", title: "You Get to Choose Your Own Values Now", message: "Not the ones assigned to you, not the ones that kept the peace — your own, chosen freely.", affirmation: "I choose my values freely, for myself." },
  { theme: "Identity", title: "Curiosity Is a Good Place to Start", message: "You don't need to know exactly who you are yet. You only need to stay curious about what feels true.", affirmation: "I approach my own identity with curiosity, not pressure." },
  { theme: "Identity", title: "You Are Allowed to Change Your Mind About Yourself", message: "The person you thought you were under pressure isn't necessarily who you are when you're free. Both can coexist as you figure it out.", affirmation: "I am allowed to keep discovering who I am." },
  { theme: "Identity", title: "Independence Is Being Rebuilt", message: "Financially, emotionally, practically — every skill you're building now is proof of a life that belongs fully to you.", affirmation: "I am building an independent life that is entirely mine." },
  { theme: "Identity", title: "You Are More Than Any Role You've Played", message: "Mother, employee, partner, survivor — you are the sum of these and also something more, still unfolding.", affirmation: "I am more than any single role I've played." },
  { theme: "Identity", title: "Your Taste Belongs to You Again", message: "What you like, what you wear, how you decorate your space — these choices can be entirely your own once more.", affirmation: "My preferences are mine to choose, freely." },
  { theme: "Identity", title: "The Woman You're Becoming Is Worth Meeting", message: "Give yourself the chance to get to know her, slowly, without rushing the introduction.", affirmation: "I am excited to meet who I'm becoming." },
  { theme: "Identity", title: "You Are Allowed to Be a Work in Progress", message: "You don't need a finished identity to be worthy of respect right now, mid-becoming.", affirmation: "I am worthy exactly as I am, still becoming." },

  // ---- Premium: Future Self ----
  { theme: "Future Self", title: "The Best Chapter May Not Have Started Yet", message: "Endings can also be beginnings in disguise. This one might be the doorway to the life you actually wanted.", affirmation: "I stay open to the good that hasn't arrived yet." },
  { theme: "Future Self", title: "Hope Is Not Naive", message: "Choosing to hope after everything you've survived is not foolishness. It's courage.", affirmation: "My hope is a form of courage, not naivety." },
  { theme: "Future Self", title: "You Are Someone's Proof That It's Possible", message: "Somewhere, someone still inside a hard situation needs to know a woman like you made it through. You are becoming her proof.", affirmation: "My healing is proof for someone else that it's possible." },
  { theme: "Future Self", title: "The Life Ahead Doesn't Have to Repeat the Past", message: "What you experienced does not have to be the pattern of what comes next. You get to build something different.", affirmation: "My future is not obligated to repeat my past." },
  { theme: "Future Self", title: "Small Steps Are Still Progress", message: "You don't need a dramatic transformation today. One small, good choice is enough to keep moving forward.", affirmation: "Small steps still carry me forward." },
  { theme: "Future Self", title: "You Are Building Something Real", message: "Piece by piece — your finances, your confidence, your peace — you are constructing a life that will hold you.", affirmation: "I am building a life sturdy enough to hold me." },
  { theme: "Future Self", title: "One Day This Will Be a Chapter, Not the Whole Book", message: "Right now it may feel enormous. In time, it becomes one part of a much longer, richer story.", affirmation: "This chapter does not define my whole story." },
  { theme: "Future Self", title: "You Get to Imagine a Good Life Now", message: "Not just survive one — imagine one. What would you build if you truly believed you deserved it?", affirmation: "I allow myself to imagine a genuinely good life." },
  { theme: "Future Self", title: "The Fire Didn't End You, It Cleared the Ground", message: "What burned away was never the truest parts of you. It was the parts that were never really yours to carry. What's left is what gets to grow now.", affirmation: "What's left in me after the fire is what was always real." },
].map((c, i) => ({ ...c, id: i, isPremium: i >= 15 }));

const FREE_LIMIT = 15;
const STORAGE_KEY = "gaf-oracle-state";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function GraceAfterFireOracle() {
  const [loaded, setLoaded] = useState(false);
  const [drawn, setDrawn] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [journal, setJournal] = useState({});
  const [noteDraft, setNoteDraft] = useState("");
  const [streak, setStreak] = useState(0);
  const [lastDrawDate, setLastDrawDate] = useState(null);
  const [view, setView] = useState("draw"); // draw | deck | journal
  const [showUpsell, setShowUpsell] = useState(false);
  const [remindersOn, setRemindersOn] = useState(false);
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const deviceIdRef = useRef(null);

  // Load state from Supabase (falls back to local-only mode if not configured yet)
  useEffect(() => {
    (async () => {
      deviceIdRef.current = getDeviceId();
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("oracle_users")
            .select("state")
            .eq("device_id", deviceIdRef.current)
            .single();
          if (data && data.state) {
            const s = data.state;
            setJournal(s.journal || {});
            setStreak(s.streak || 0);
            setLastDrawDate(s.lastDrawDate || null);
            setRemindersOn(!!s.remindersOn);
          }
        }
      } catch (e) {
        // First-time visitor — no row yet, that's normal
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = useCallback(async (partial) => {
    const current = { journal, streak, lastDrawDate, remindersOn, ...partial };
    try {
      if (supabase) {
        await supabase
          .from("oracle_users")
          .upsert(
     { device_id: deviceIdRef.current, state: current, updated_at: new Date().toISOString() },
     { onConflict: "device_id" }
   );
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  }, [journal, streak, lastDrawDate, remindersOn]);

  // In-app "reminder" simulation — stands in for real push notifications
  useEffect(() => {
    if (remindersOn) {
      const fire = () => {
        const pool = CARDS.filter((c) => !c.isPremium);
        const card = pool[Math.floor(Math.random() * pool.length)];
        setToast(card);
        const delay = 4000;
        setTimeout(() => setToast((t) => (t && t.id === card.id ? null : t)), delay);
      };
      const interval = 45000; // demo cadence; real version fires 1x/day via push
      timerRef.current = setInterval(fire, interval);
      return () => clearInterval(timerRef.current);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [remindersOn]);

  const toggleReminders = () => {
    const next = !remindersOn;
    setRemindersOn(next);
    persist({ remindersOn: next });
    if (next) {
      setToast({ title: "Reminders on", message: "You'll see gentle messages appear while the app is open. Real push notifications (even when the app is closed) come with deployment.", affirmation: "" , system: true});
      setTimeout(() => setToast(null), 4500);
    }
  };

  const drawCard = (specific) => {
    let card = specific;
    if (!card) {
      const pool = CARDS.filter((c) => !c.isPremium);
      card = pool[Math.floor(Math.random() * pool.length)];
    }
    if (card.isPremium) {
      setShowUpsell(true);
      return;
    }
    setDrawn(card);
    setFlipped(false);
    setNoteDraft(journal[card.id]?.note || "");
    setView("draw");

    const today = todayStr();
    if (lastDrawDate !== today) {
      const wasYesterday = lastDrawDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = wasYesterday ? streak + 1 : 1;
      setStreak(newStreak);
      setLastDrawDate(today);
      persist({ streak: newStreak, lastDrawDate: today });
    }
  };

  const saveNote = async () => {
    if (!drawn) return;
    const updated = { ...journal, [drawn.id]: { note: noteDraft, date: todayStr(), title: drawn.title } };
    setJournal(updated);
    await persist({ journal: updated });
    setToast({ title: "Saved to your journal", message: "This reflection is kept for you.", affirmation: "", system: true });
    setTimeout(() => setToast(null), 2500);
  };

  if (!loaded) {
    return (
      <div style={styles.loadingWrap}>
        <Flame size={28} color="#C97B84" />
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <style>{fontImport}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <Flame size={20} color="#C97B84" strokeWidth={2} />
          <span style={styles.brandName}>Grace After Fire</span>
        </div>
        <div style={styles.tagline}>Align. Release. Unfold.</div>
        <div style={styles.streakPill}>
          <Sparkles size={13} color="#B8895A" />
          <span>{streak} day{streak === 1 ? "" : "s"} of showing up</span>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div style={styles.toast} onClick={() => setToast(null)}>
          <div style={styles.toastInner}>
            {!toast.system && <div style={styles.toastTitle}>{toast.title}</div>}
            <div style={styles.toastMsg}>{toast.message}</div>
            {toast.affirmation ? <div style={styles.toastAff}>"{toast.affirmation}"</div> : null}
          </div>
        </div>
      )}

      {/* Main view */}
      <main style={styles.main}>
        {view === "draw" && (
          <DrawView
            drawn={drawn}
            flipped={flipped}
            setFlipped={setFlipped}
            onDraw={() => drawCard()}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            onSaveNote={saveNote}
            hasSavedNote={drawn && journal[drawn.id]}
          />
        )}
        {view === "deck" && (
          <DeckView cards={CARDS} onSelect={drawCard} onLocked={() => setShowUpsell(true)} />
        )}
        {view === "journal" && (
          <JournalView journal={journal} cards={CARDS} />
        )}
      </main>

      {/* Bottom nav */}
      <nav style={styles.nav}>
        <NavButton icon={<Flame size={19} />} label="Today" active={view === "draw"} onClick={() => setView("draw")} />
        <NavButton icon={<Sparkles size={19} />} label="Full Deck" active={view === "deck"} onClick={() => setView("deck")} />
        <NavButton icon={<BookOpen size={19} />} label="Journal" active={view === "journal"} onClick={() => setView("journal")} />
        <NavButton
          icon={remindersOn ? <Bell size={19} /> : <BellOff size={19} />}
          label="Reminders"
          active={remindersOn}
          onClick={toggleReminders}
        />
      </nav>

      {showUpsell && <UpsellModal onClose={() => setShowUpsell(false)} />}
    </div>
  );
}

function DrawView({ drawn, flipped, setFlipped, onDraw, noteDraft, setNoteDraft, onSaveNote, hasSavedNote }) {
  return (
    <div style={styles.drawWrap}>
      {!drawn ? (
        <div style={styles.emptyState}>
          <div style={styles.cardBack} onClick={onDraw}>
            <div style={styles.cardBackInner}>
              <Flame size={30} color="#F6E4E6" />
              <div style={styles.cardBackText}>Tap to draw<br />today's message</div>
            </div>
          </div>
          <p style={styles.emptyHint}>One card, chosen for exactly where you are today.</p>
        </div>
      ) : (
        <>
          <div style={styles.cardStage} onClick={() => setFlipped(true)}>
            <div style={{ ...styles.card, ...(flipped ? styles.cardFlipped : {}) }}>
              {!flipped ? (
                <div style={styles.cardFaceBack}>
                  <Flame size={26} color="#F6E4E6" />
                  <div style={styles.cardBackText}>Tap to reveal</div>
                </div>
              ) : (
                <div style={styles.cardFaceFront}>
                  <div style={styles.cardTheme}>{drawn.theme}</div>
                  <div style={styles.cardTitle}>{drawn.title}</div>
                  <div style={styles.cardMessage}>{drawn.message}</div>
                  <div style={styles.cardAffirmation}>"{drawn.affirmation}"</div>
                </div>
              )}
            </div>
          </div>

          {flipped && (
            <>
              <div style={styles.noteBox}>
                <div style={styles.noteLabel}>What does this bring up for you?</div>
                <textarea
                  style={styles.noteInput}
                  rows={3}
                  placeholder="A private reflection, just for you..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                />
                <button style={styles.saveBtn} onClick={onSaveNote}>
                  {hasSavedNote ? "Update reflection" : "Save reflection"}
                </button>
              </div>
              <button style={styles.drawAgainBtn} onClick={onDraw}>Draw another free card</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function DeckView({ cards, onSelect, onLocked }) {
  const themes = [...new Set(cards.map((c) => c.theme))];
  return (
    <div style={styles.deckWrap}>
      <div style={styles.deckIntro}>
        <div style={styles.deckIntroTitle}>The Full Oracle</div>
        <div style={styles.deckIntroSub}>{cards.length} cards across {themes.length} themes of healing.</div>
      </div>
      {themes.map((theme) => (
        <div key={theme} style={styles.themeGroup}>
          <div style={styles.themeLabel}>{theme}</div>
          <div style={styles.themeGrid}>
            {cards.filter((c) => c.theme === theme).map((c) => (
              <div
                key={c.id}
                style={styles.deckCard}
                onClick={() => (c.isPremium ? onLocked() : onSelect(c))}
              >
                {c.isPremium && (
                  <div style={styles.lockBadge}><Lock size={11} /></div>
                )}
                <div style={styles.deckCardTitle}>{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function JournalView({ journal, cards }) {
  const entries = Object.entries(journal).sort((a, b) => (a[1].date < b[1].date ? 1 : -1));
  return (
    <div style={styles.journalWrap}>
      <div style={styles.deckIntroTitle}>Your Reflections</div>
      {entries.length === 0 ? (
        <div style={styles.journalEmpty}>
          <BookOpen size={26} color="#D8AAB0" />
          <p>Reflections you save after drawing a card will appear here.</p>
        </div>
      ) : (
        entries.map(([id, entry]) => (
          <div key={id} style={styles.journalEntry}>
            <div style={styles.journalEntryHeader}>
              <span style={styles.journalEntryTitle}>{entry.title}</span>
              <span style={styles.journalEntryDate}>{entry.date}</span>
            </div>
            <div style={styles.journalEntryNote}>{entry.note}</div>
          </div>
        ))
      )}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button style={{ ...styles.navBtn, ...(active ? styles.navBtnActive : {}) }} onClick={onClick}>
      {icon}
      <span style={styles.navLabel}>{label}</span>
    </button>
  );
}

function UpsellModal({ onClose }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}><X size={18} /></button>
        <Heart size={26} color="#C97B84" />
        <div style={styles.modalTitle}>Unlock the Full Oracle</div>
        <p style={styles.modalBody}>
          85 more cards across boundaries, grief, voice, joy, identity and hope — plus unlimited draws and a
          private reflection journal that grows with you.
        </p>
        <div style={styles.modalPriceRow}>
          <div style={styles.modalPrice}>$6.99<span style={styles.modalPriceSub}>/month</span></div>
        </div>
        <button style={styles.modalCta}>Unlock Premium <ChevronRight size={16} /></button>
        <button style={styles.modalDismiss} onClick={onClose}>Not right now</button>
      </div>
    </div>
  );
}

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Quicksand:wght@400;500;600;700&display=swap');
`;

const styles = {
  loadingWrap: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF2F3" },
  app: {
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    background: "linear-gradient(180deg, #FDF2F3 0%, #FBEAEC 50%, #F7E1E4 100%)",
    fontFamily: "'Quicksand', sans-serif",
    color: "#5B3A45",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  header: { padding: "28px 24px 16px", textAlign: "center" },
  brandRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  brandName: { fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, letterSpacing: 0.5, color: "#7A4655" },
  tagline: { fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: "#C68994", marginTop: 4 },
  streakPill: {
    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14,
    background: "rgba(255,255,255,0.6)", border: "1px solid #F0C7CE", borderRadius: 999,
    padding: "6px 14px", fontSize: 12.5, color: "#8A5A67", fontWeight: 500,
  },
  main: { flex: 1, padding: "8px 20px 100px", overflowY: "auto" },

  drawWrap: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 },
  cardBack: {
    width: 220, height: 320, borderRadius: 20, cursor: "pointer",
    background: "linear-gradient(155deg, #D68C97 0%, #C97B84 55%, #B8677A 100%)",
    boxShadow: "0 18px 40px -12px rgba(201,123,132,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.35)",
  },
  cardBackInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" },
  cardBackText: { color: "#FBEAEC", fontSize: 14, fontWeight: 500, lineHeight: 1.5 },
  emptyHint: { marginTop: 22, fontSize: 13.5, color: "#A9707E", textAlign: "center", maxWidth: 260, lineHeight: 1.5 },

  cardStage: { perspective: 1200, cursor: "pointer" },
  card: {
    width: 260, minHeight: 340, borderRadius: 20, position: "relative",
    transition: "transform 0.15s ease",
  },
  cardFlipped: {},
  cardFaceBack: {
    width: 260, height: 340, borderRadius: 20,
    background: "linear-gradient(155deg, #D68C97 0%, #C97B84 55%, #B8677A 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
    boxShadow: "0 18px 40px -12px rgba(201,123,132,0.5)",
  },
  cardFaceFront: {
    width: 260, minHeight: 340, borderRadius: 20, padding: "28px 24px",
    background: "#FFFBF9",
    boxShadow: "0 18px 40px -14px rgba(120,70,80,0.35)",
    border: "1px solid #F3D3D9",
    display: "flex", flexDirection: "column", gap: 14,
  },
  cardTheme: { fontSize: 10.5, letterSpacing: 1.8, textTransform: "uppercase", color: "#C6899D", fontWeight: 600 },
  cardTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 600, color: "#7A4655", lineHeight: 1.25 },
  cardMessage: { fontSize: 14.5, lineHeight: 1.65, color: "#6B4B54" },
  cardAffirmation: { marginTop: "auto", fontSize: 13.5, fontStyle: "italic", color: "#B8895A", borderTop: "1px solid #F1DCDF", paddingTop: 14 },

  noteBox: { width: 260, marginTop: 22 },
  noteLabel: { fontSize: 12.5, color: "#8A5A67", marginBottom: 8, fontWeight: 500 },
  noteInput: {
    width: "100%", borderRadius: 14, border: "1px solid #F0C7CE", padding: 12,
    fontFamily: "'Quicksand', sans-serif", fontSize: 13.5, color: "#5B3A45", resize: "none",
    background: "rgba(255,255,255,0.7)", boxSizing: "border-box", outline: "none",
  },
  saveBtn: {
    marginTop: 10, width: "100%", padding: "11px 0", borderRadius: 999, border: "none",
    background: "#C97B84", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
    fontFamily: "'Quicksand', sans-serif",
  },
  drawAgainBtn: {
    marginTop: 14, background: "none", border: "none", color: "#B8677A",
    fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline",
    fontFamily: "'Quicksand', sans-serif",
  },

  deckWrap: { paddingTop: 8 },
  deckIntro: { textAlign: "center", marginBottom: 18 },
  deckIntroTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: "#7A4655" },
  deckIntroSub: { fontSize: 12.5, color: "#A9707E", marginTop: 4 },
  themeGroup: { marginBottom: 22 },
  themeLabel: { fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase", color: "#C6899D", fontWeight: 600, marginBottom: 10 },
  themeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  deckCard: {
    position: "relative", background: "rgba(255,255,255,0.75)", border: "1px solid #F1DCDF",
    borderRadius: 14, padding: "14px 12px", cursor: "pointer", minHeight: 58,
    display: "flex", alignItems: "center",
  },
  deckCardTitle: { fontSize: 12.5, color: "#6B4B54", fontWeight: 500, lineHeight: 1.35 },
  lockBadge: {
    position: "absolute", top: 8, right: 8, background: "#C97B84", color: "#fff",
    borderRadius: 999, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
  },

  journalWrap: { paddingTop: 8 },
  journalEmpty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 50, color: "#A9707E", fontSize: 13.5, textAlign: "center" },
  journalEntry: { background: "rgba(255,255,255,0.75)", border: "1px solid #F1DCDF", borderRadius: 14, padding: 16, marginBottom: 12 },
  journalEntryHeader: { display: "flex", justifyContent: "space-between", marginBottom: 6 },
  journalEntryTitle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 15.5, color: "#7A4655" },
  journalEntryDate: { fontSize: 11, color: "#C6899D" },
  journalEntryNote: { fontSize: 13, color: "#6B4B54", lineHeight: 1.5 },

  nav: {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
    display: "flex", justifyContent: "space-around", padding: "10px 8px 18px",
    background: "rgba(253,242,243,0.92)", backdropFilter: "blur(8px)", borderTop: "1px solid #F1DCDF",
  },
  navBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none",
    color: "#C6899D", cursor: "pointer", padding: "4px 10px", fontFamily: "'Quicksand', sans-serif",
  },
  navBtnActive: { color: "#B8677A" },
  navLabel: { fontSize: 10, fontWeight: 600 },

  toast: {
    position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", width: "88%", maxWidth: 420,
    zIndex: 50, cursor: "pointer",
  },
  toastInner: {
    background: "#7A4655", color: "#FBEAEC", borderRadius: 16, padding: "14px 18px",
    boxShadow: "0 14px 30px -10px rgba(90,50,60,0.5)",
  },
  toastTitle: { fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase", opacity: 0.8, marginBottom: 4 },
  toastMsg: { fontSize: 13, lineHeight: 1.5 },
  toastAff: { fontSize: 12.5, fontStyle: "italic", marginTop: 6, opacity: 0.9 },

  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(90,50,60,0.45)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
  },
  modalCard: {
    background: "#FFFBF9", borderRadius: 22, padding: "28px 24px", maxWidth: 340, width: "100%",
    position: "relative", textAlign: "center", boxShadow: "0 24px 60px -12px rgba(90,50,60,0.4)",
  },
  modalClose: { position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#C6899D", cursor: "pointer" },
  modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: "#7A4655", marginTop: 12 },
  modalBody: { fontSize: 13.5, color: "#6B4B54", lineHeight: 1.6, marginTop: 10 },
  modalPriceRow: { marginTop: 16 },
  modalPrice: { fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#7A4655" },
  modalPriceSub: { fontSize: 13, fontWeight: 400, color: "#A9707E" },
  modalCta: {
    marginTop: 16, width: "100%", padding: "13px 0", borderRadius: 999, border: "none",
    background: "#C97B84", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    fontFamily: "'Quicksand', sans-serif",
  },
  modalDismiss: { marginTop: 10, background: "none", border: "none", color: "#B8899", fontSize: 12.5, cursor: "pointer", color: "#A9707E" },
};
