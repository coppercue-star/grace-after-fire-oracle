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
  { theme: "Reclaiming Reality", title: "The Story Doesn't Need Their Approval", message: "You don't need them to agree with what happened before you're allowed to know it happened. Your knowing stands on its own.", affirmation: "My knowing needs no one else's agreement." },
  { theme: "Reclaiming Reality", title: "Two Things Were True at Once", message: "You can have loved someone and still have been harmed by them. Both things being true doesn't cancel either one out.", affirmation: "I hold complexity without needing to simplify it." },
  { theme: "Reclaiming Reality", title: "Hindsight Is Not Weakness", message: "Seeing it clearly now, after the fact, doesn't mean you were foolish then. It means you finally have the distance to see the whole shape of it.", affirmation: "Seeing clearly now doesn't undo who I was then." },
  { theme: "Reclaiming Reality", title: "You Are Allowed to Update the Story", message: "As you remember more, understand more, heal more, the story of what happened is allowed to become clearer and more complete.", affirmation: "I let my understanding of my own story keep growing." },
  { theme: "Reclaiming Reality", title: "Doubt Was Installed, Not Discovered", message: "The habit of doubting yourself wasn't something you were born with. It was taught to you, on purpose. That means it can be untaught too.", affirmation: "The doubt was installed in me, and I am removing it." },
  { theme: "Reclaiming Reality", title: "You Don't Need a Confession to Move On", message: "Waiting for someone to admit what they did can keep you tied to them indefinitely. Your healing does not require their honesty.", affirmation: "My healing does not depend on their admission." },
  { theme: "Reclaiming Reality", title: "The Explanations Were Never Really About You", message: "The reasons you were given for the way you were treated said far more about the person giving them than they ever said about you.", affirmation: "Their explanations were never the truth about me." },
  { theme: "Reclaiming Reality", title: "You Can Trust a Feeling You Can't Yet Explain", message: "Sometimes you know something is true in your body long before your mind can fully articulate why. That knowing is valid too.", affirmation: "I trust what I know before I can explain it." },
  { theme: "Reclaiming Reality", title: "Reality Doesn't Require a Witness to Be Real", message: "Even if no one else ever saw it, even if no one else ever believes it fully, what happened to you happened. It is real regardless.", affirmation: "What happened to me is real, witnessed or not." },
  { theme: "Reclaiming Reality", title: "You Are Allowed to Know What You Know", message: "Even without proof, even without anyone else confirming it, your own knowing is valid and enough for you to stand on.", affirmation: "I am allowed to fully know what I know." },

  // ---- Premium: Self-Worth ----
  { theme: "Self-Worth", title: "Enough, As You Are Today", message: "Not once you heal more. Not once you're calmer, thinner, softer, easier. Today, exactly as you are, enough.", affirmation: "I am enough today." },
  { theme: "Self-Worth", title: "You Were Never the Burden", message: "Being told you were too much was a way of making you smaller. You were never too much. You were simply more than someone wanted to hold.", affirmation: "I am not too much for the right life." },
  { theme: "Self-Worth", title: "Your Needs Are Not a Debt", message: "Having needs is not something you have to apologise for or repay. Needs are just part of being human.", affirmation: "I am allowed to need things." },
  { theme: "Self-Worth", title: "Value Isn't Measured by Who Stayed", message: "The length of a relationship was never proof of your worth, and its ending is not proof against it.", affirmation: "My worth is not measured by who chose to stay." },
  { theme: "Self-Worth", title: "You Deserved Softness", message: "You deserved to be spoken to gently, long before you learned to speak to yourself that way. Start now. It still counts.", affirmation: "I offer myself the gentleness I always deserved." },
  { theme: "Self-Worth", title: "Worthy Before the Proof", message: "You don't need one more accomplishment, one more sacrifice, one more year of good behaviour to prove you're worthy of love. You already are.", affirmation: "I am worthy without needing to prove it." },
  { theme: "Self-Worth", title: "You Are Not What Was Done to You", message: "What happened to you is part of your story, not the whole of your identity. You are still, underneath it, entirely yourself.", affirmation: "I am more than what was done to me." },
  { theme: "Self-Worth", title: "Quiet Confidence Returning", message: "You don't have to shout to know your own worth. It can come back quietly, like a light turned low, growing brighter each day.", affirmation: "My confidence is returning, gently and steadily." },
  { theme: "Self-Worth", title: "You Are Not a Project to Fix", message: "You don't have to finish healing, improving, or becoming someone else before you're allowed to be treated well right now.", affirmation: "I deserve good treatment today, not just once I'm 'fixed'." },
  { theme: "Self-Worth", title: "Being Chosen Isn't the Measure", message: "Whether or not someone chooses to stay says something about them and their capacity, not about your value.", affirmation: "My value doesn't rise or fall with who stays." },
  { theme: "Self-Worth", title: "You Don't Owe Anyone Smallness", message: "Playing small kept the peace once. You are allowed to take up your full size now.", affirmation: "I no longer owe anyone my smallness." },
  { theme: "Self-Worth", title: "Your Standards Are Allowed to Rise", message: "Wanting more than you used to accept isn't ungrateful or difficult. It's growth.", affirmation: "I allow my standards to rise as I heal." },
  { theme: "Self-Worth", title: "You Are Not Hard to Love", message: "You may have been told you were too much work, too complicated, too needy. None of that was ever true.", affirmation: "I am not hard to love; I was simply loved badly." },
  { theme: "Self-Worth", title: "Self-Respect Doesn't Need an Audience", message: "You can hold your own worth privately, quietly, without needing anyone else to confirm it for you.", affirmation: "My self-respect stands whether or not anyone is watching." },
  { theme: "Self-Worth", title: "Your Worth Doesn't Fluctuate With Your Mood", message: "On the hard days, your value hasn't dropped. It's simply harder to feel it. It's still there.", affirmation: "My worth stays steady even on days I can't feel it." },
  { theme: "Self-Worth", title: "You Are Allowed to Take Up Room", message: "In conversation, in relationships, in your own home — you are allowed to occupy your full, rightful space.", affirmation: "I take up the space I am entitled to." },
  { theme: "Self-Worth", title: "You Were Always the Prize, Not the Consolation", message: "Whatever story made you feel like the lesser option, the backup, the one who should be grateful — it was never true.", affirmation: "I was never a consolation. I was always enough." },
  { theme: "Self-Worth", title: "Your Worth Was Never Meant to Be Rationed", message: "You don't need to earn small portions of respect and care. You are entitled to the full amount, always.", affirmation: "I am entitled to full respect and care, not rationed amounts." },

  // ---- Premium: Safety ----
  { theme: "Safety", title: "Rest Is Not Weakness", message: "You do not have to earn your rest through exhaustion. Your nervous system needed rest yesterday. Give it to yourself today.", affirmation: "I rest without needing to earn it." },
  { theme: "Safety", title: "You Get to Set the Pace", message: "No one is rushing you back into the world. Healing on your own timeline is not slowness — it is respect for what you survived.", affirmation: "I move at the pace that is right for me." },
  { theme: "Safety", title: "Safety Is Being Rebuilt, Brick by Brick", message: "It doesn't return all at once. It returns in small, repeated proofs — a locked door, a quiet evening, a promise kept to yourself.", affirmation: "I am building safety one small proof at a time." },
  { theme: "Safety", title: "Your Breath Is Yours Again", message: "Notice it right now. In, out. No one controls its rhythm but you. That is no small thing.", affirmation: "My breath belongs to me." },
  { theme: "Safety", title: "The Alarm Bells Can Quiet Down", message: "Hypervigilance kept you alive once. It is allowed to soften now, gradually, as your world becomes genuinely safer.", affirmation: "I am safe enough to let my guard down, slowly." },
  { theme: "Safety", title: "Home Can Feel Like Home Again", message: "The place you live is allowed to become a place where your shoulders drop the second you walk in. Let it become that.", affirmation: "I am creating a home where I can exhale." },
  { theme: "Safety", title: "You Are Allowed to Feel Good Without Bracing", message: "Good moments don't have to be followed by dread anymore. You can simply enjoy them.", affirmation: "I let good moments be simply good." },
  { theme: "Safety", title: "Your Nervous System Is Learning New Evidence", message: "Every calm day is teaching your body a new truth: this is what safe actually feels like. Keep giving it evidence.", affirmation: "Each safe day is proof my body can learn to trust again." },
  { theme: "Safety", title: "You Are Allowed to Lock the Door and Relax", message: "Checking once is caution. Checking is enough. You are allowed to let your shoulders drop after that.", affirmation: "One check is enough; I let myself settle after." },
  { theme: "Safety", title: "Quiet Doesn't Mean Something's Wrong", message: "A quiet house, a quiet evening, a quiet relationship — quiet is allowed to simply mean peaceful now.", affirmation: "Quiet is peace now, not a warning sign." },
  { theme: "Safety", title: "You Can Unclench Now", message: "Notice your jaw, your shoulders, your hands. You don't have to hold yourself so tightly anymore.", affirmation: "I let my body soften, bit by bit." },
  { theme: "Safety", title: "Safety Includes Emotional Safety", message: "It's not just about locks and alarms. Being able to speak freely, disagree, and be yourself without fear is safety too.", affirmation: "I deserve emotional safety as much as physical safety." },
  { theme: "Safety", title: "You Get to Choose Who's Let Close", message: "Safety includes deciding, slowly and on your own terms, who earns access to your inner world again.", affirmation: "I choose carefully who gets close to me now." },
  { theme: "Safety", title: "Your Body's Timeline Isn't Wrong", message: "If it's taking longer than you expected to feel safe, that's not a failure. Healing nervous systems don't run on deadlines.", affirmation: "My body heals at its own correct pace." },
  { theme: "Safety", title: "A Bad Day Doesn't Undo Your Progress", message: "One hard, anxious day doesn't erase the safety you've built. It's a wave, not a reversal.", affirmation: "One hard day doesn't undo the safety I've built." },
  { theme: "Safety", title: "You Can Trust Good News Now", message: "Not every good thing is a setup for disappointment. Some good things are simply, plainly good.", affirmation: "I let good news simply be good." },
  { theme: "Safety", title: "Stillness Is Not Danger", message: "When nothing is happening, when things are simply calm and ordinary, that stillness is safety, not the quiet before a storm.", affirmation: "Stillness is safety, not a warning." },
  { theme: "Safety", title: "You Are Allowed to Feel Safe Even Before Everything Is Resolved", message: "Safety doesn't have to wait for every loose end to be tied up. It can arrive in pieces, ahead of full resolution.", affirmation: "I allow myself to feel safe even while things are still unfolding." },

  // ---- Premium: Boundaries ----
  { theme: "Boundaries", title: "You Can Love Someone and Still Say No", message: "Boundaries and love are not opposites. You can care about someone deeply and still protect your peace from them.", affirmation: "I can hold love and boundaries in the same hand." },
  { theme: "Boundaries", title: "The Guilt Will Fade, the Boundary Stays", message: "The discomfort of disappointing someone passes. The relief of having protected yourself lasts far longer.", affirmation: "I let the boundary outlast the guilt." },
  { theme: "Boundaries", title: "You Are Not Responsible for Their Reaction", message: "How someone responds to your limit is theirs to manage, not yours to fix.", affirmation: "Their reaction to my boundary is not mine to carry." },
  { theme: "Boundaries", title: "Boundaries Protect the Relationship With Yourself", message: "Every boundary you hold is a promise kept to the person you're becoming.", affirmation: "I keep my promises to myself." },
  { theme: "Boundaries", title: "You Can Change Your Mind", message: "A boundary you set once isn't a life sentence. You're allowed to adjust it as you learn what you truly need.", affirmation: "I can revise my boundaries as I grow." },
  { theme: "Boundaries", title: "Silence Is Also a Boundary", message: "You don't owe a response to everything. Sometimes the most powerful boundary is simply not answering.", affirmation: "I choose what deserves my response." },
  { theme: "Boundaries", title: "Protecting Your Peace Is Not Selfish", message: "It was called selfish so you'd stop doing it. It wasn't selfish then, and it isn't now.", affirmation: "Protecting my peace is not selfish, it is necessary." },
  { theme: "Boundaries", title: "The Door You Get to Close", message: "You get to decide who has access to you now — your time, your energy, your story. That door is yours to open or close.", affirmation: "I decide who has access to my life." },
  { theme: "Boundaries", title: "A Boundary Is Not a Wall", message: "Boundaries don't have to shut everyone out. They simply decide the terms on which people are let in.", affirmation: "My boundaries let the right people in, on my terms." },
  { theme: "Boundaries", title: "You Don't Need to Justify Your Limits", message: "'Because it's not okay with me' is a complete and sufficient reason.", affirmation: "My limits don't require justification to be valid." },
  { theme: "Boundaries", title: "Consistency Makes a Boundary Real", message: "A boundary held once and dropped the next time isn't a boundary yet. It becomes real through repetition.", affirmation: "I hold my boundaries steadily, again and again." },
  { theme: "Boundaries", title: "You Can Hold a Boundary With Kindness", message: "A boundary doesn't have to be delivered harshly to be firm. You can be both warm and immovable.", affirmation: "I can be kind and firm at the same time." },
  { theme: "Boundaries", title: "Family Boundaries Count Too", message: "Blood relation doesn't override your right to protect your peace. Family boundaries are just as valid as any other.", affirmation: "My boundaries apply to family too, without exception." },
  { theme: "Boundaries", title: "You Get to Change the Terms", message: "Relationships you kept on the old terms are allowed to be renegotiated now that you know your worth.", affirmation: "I am allowed to renegotiate old relationships on new terms." },
  { theme: "Boundaries", title: "Anticipating Pushback Doesn't Mean Don't Do It", message: "Knowing someone will react badly to a boundary is information, not a reason to abandon it.", affirmation: "Expected pushback doesn't cancel my right to a boundary." },
  { theme: "Boundaries", title: "A Boundary Can Be a Single Sentence", message: "You don't need a speech. 'That doesn't work for me' is often more than enough.", affirmation: "My boundaries can be brief and still be complete." },
  { theme: "Boundaries", title: "Your Time Is a Boundary Too", message: "Deciding how your hours are spent, and with whom, is one of the most powerful boundaries you hold.", affirmation: "I protect my time as fiercely as my peace." },
  { theme: "Boundaries", title: "A Boundary Ignored Once Is Still Worth Repeating", message: "If someone doesn't respect a boundary the first time, restating it isn't weakness. It's persistence.", affirmation: "I repeat my boundaries as many times as needed." },

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
  { theme: "Grief for Lost Time", title: "Grief Doesn't Follow a Schedule", message: "There's no correct timeline for mourning what you lost. It comes in waves, on its own unpredictable rhythm.", affirmation: "I let my grief move at its own pace." },
  { theme: "Grief for Lost Time", title: "You Can Grieve a Person Who Is Still Alive", message: "Mourning who they used to be, or who you hoped they'd become, is real grief even without a death.", affirmation: "My grief for what could have been is valid grief." },
  { theme: "Grief for Lost Time", title: "The Milestones You Missed Still Matter", message: "Birthdays celebrated smaller than they should have been, moments overshadowed — they're allowed to be grieved, even years later.", affirmation: "I honour the milestones that were dimmed, even now." },
  { theme: "Grief for Lost Time", title: "You Are Not Late to Your Own Life", message: "There is no universal schedule for when things are supposed to happen. Yours is unfolding exactly as it is.", affirmation: "I am not late; I am simply on my own path." },
  { theme: "Grief for Lost Time", title: "Anger and Grief Often Travel Together", message: "It's normal for grief over lost time to arrive dressed as anger. Both are allowed the same amount of room.", affirmation: "I let my anger and my grief exist side by side." },
  { theme: "Grief for Lost Time", title: "You Can Mourn the Version of You That Almost Disappeared", message: "Grieve, if you need to, for how close you came to losing yourself entirely. And then celebrate that you didn't.", affirmation: "I grieve who I almost lost, and I celebrate who remained." },
  { theme: "Grief for Lost Time", title: "Some Years Were for Surviving, Not Living", message: "Not every year needs to have been lived fully to have counted. Some years, simply making it through was the whole task.", affirmation: "The years I only survived still counted." },
  { theme: "Grief for Lost Time", title: "The Grief Softens, Even If It Never Fully Leaves", message: "It may not disappear completely, but its sharpness fades. What's left becomes something you can carry rather than something that carries you.", affirmation: "My grief is softening into something I can carry." },
  { theme: "Grief for Lost Time", title: "You Are Allowed a Future Bigger Than the Loss", message: "The years taken from you don't have to define the size of the years still ahead.", affirmation: "My future is not limited by what I lost." },
  { theme: "Grief for Lost Time", title: "You Can Honour the Past Without Living There", message: "Acknowledging what was lost doesn't require staying anchored to it. You can honour it and still move forward.", affirmation: "I honour my past while still moving forward." },

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
  { theme: "Voice", title: "Your Silence Was Never Consent", message: "Staying quiet to survive was strategy, not agreement. Don't let anyone rewrite it as the latter.", affirmation: "My silence then was survival, not agreement." },
  { theme: "Voice", title: "Disagreeing Out Loud Is a Skill You Can Rebuild", message: "If saying 'I don't agree' feels enormous right now, that's rusty muscle, not a personality flaw. It strengthens with use.", affirmation: "Speaking disagreement gets easier every time I practice it." },
  { theme: "Voice", title: "You Are Allowed to Correct the Record", message: "If someone misremembers or misrepresents what happened, you're allowed to say so, clearly and without apology.", affirmation: "I correct the record when it needs correcting." },
  { theme: "Voice", title: "A Trembling Voice Still Counts", message: "It doesn't have to come out steady and confident to be brave. Shaky and true beats smooth and silent.", affirmation: "My voice counts even when it shakes." },
  { theme: "Voice", title: "You Don't Need Everyone's Approval to Speak", message: "Waiting for unanimous support before saying something true means you might wait forever. Speak anyway.", affirmation: "I speak my truth without needing everyone's agreement first." },
  { theme: "Voice", title: "Texting It First Still Counts as Speaking Up", message: "If saying something out loud feels too hard today, writing it down and sending it is still your voice, still valid.", affirmation: "However I choose to say it, it still counts as my voice." },
  { theme: "Voice", title: "You Can Ask the Question You're Afraid to Ask", message: "The one that feels too direct, too vulnerable, too much — you're allowed to ask it anyway.", affirmation: "I ask the questions I need answers to." },
  { theme: "Voice", title: "Your Laughter Is Also a Voice", message: "Full, unguarded laughter is its own kind of speaking up — proof you're not hiding anymore.", affirmation: "My laughter is proof I'm no longer hiding." },
  { theme: "Voice", title: "You Are Allowed to Name What You Need", message: "Naming a need out loud, plainly, without wrapping it in apology, is a form of self-respect.", affirmation: "I name my needs plainly and without apology." },
  { theme: "Voice", title: "Your Voice Deserves the Same Room as Anyone Else's", message: "In conversations, in decisions, in your own life, your voice carries equal weight to anyone else's in the room.", affirmation: "My voice carries equal weight to anyone else's." },

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
  { theme: "Trust in Self", title: "You Don't Need Certainty to Move Forward", message: "Waiting until you feel completely sure before acting means waiting forever. Some trust has to come before the certainty does.", affirmation: "I can act with trust even without full certainty." },
  { theme: "Trust in Self", title: "Your Track Record Is Better Than You Think", message: "Look at everything you've already navigated. That's real evidence you can be trusted with what comes next.", affirmation: "My track record proves I can trust myself." },
  { theme: "Trust in Self", title: "Discernment Is Growing Back", message: "Knowing who's safe, who isn't, what's real, what isn't — that skill is returning to you with practice.", affirmation: "My discernment strengthens with every day I use it." },
  { theme: "Trust in Self", title: "You Can Trust Your No Even Without a Reason", message: "Sometimes something just feels wrong, and that's reason enough to decline.", affirmation: "A feeling of 'no' is reason enough for me." },
  { theme: "Trust in Self", title: "Your Values Are a Reliable Compass", message: "When you're unsure what to do, returning to what you value most will usually point you the right way.", affirmation: "My own values guide me reliably." },
  { theme: "Trust in Self", title: "You Are Allowed to Trust Slowly", message: "Rebuilding trust in yourself doesn't have to happen all at once. Incremental is still real.", affirmation: "I rebuild my self-trust one small step at a time." },
  { theme: "Trust in Self", title: "Your Choices Deserve the Benefit of the Doubt", message: "Give yourself the same grace you'd give a friend making a hard call with the information she had at the time.", affirmation: "I extend myself the same grace I'd give a friend." },
  { theme: "Trust in Self", title: "You Are Capable of Learning From Mistakes Without Self-Punishment", message: "A mistake can simply be information for next time, not proof you can't be trusted.", affirmation: "My mistakes teach me; they don't condemn me." },
  { theme: "Trust in Self", title: "Your Intuition Survived, Even If It Got Quiet", message: "It didn't disappear during the hard years. It just learned to whisper instead of speak. You can invite it to speak up again.", affirmation: "My intuition survived, and I'm inviting it to speak louder." },
  { theme: "Trust in Self", title: "You Are the Person You Can Rely on Most", message: "After everything, you are still here, still showing up for yourself. That makes you deeply reliable.", affirmation: "I am someone I can truly rely on." },

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
  { theme: "Joy", title: "You Can Enjoy Something Without Overanalyzing It", message: "Not every good feeling needs to be examined for hidden danger. Sometimes joy is just joy.", affirmation: "I let joy be simple, without overanalysing it." },
  { theme: "Joy", title: "Music Is Allowed Back In Fully", message: "Turning it up loud, singing off-key, dancing badly in your kitchen — none of that needs an excuse.", affirmation: "I welcome music and movement back into my days freely." },
  { theme: "Joy", title: "You Can Treat Yourself Without Earning It First", message: "The idea that pleasure must be earned through suffering isn't true. You can simply enjoy something because you want to.", affirmation: "I treat myself without needing to earn it first." },
  { theme: "Joy", title: "Small Joys Count Just as Much as Big Ones", message: "A good cup of tea, warm sheets, a favourite show — small joys are not lesser than big milestones.", affirmation: "I honour my small joys as fully as the big ones." },
  { theme: "Joy", title: "You Are Allowed to Be Light-Hearted Again", message: "Not every moment needs to carry weight. Lightness is not the same as denial — it's part of a full life.", affirmation: "I allow lightness back into my life." },
  { theme: "Joy", title: "Your Sense of Humour Survived", message: "Even through everything, some part of you kept the capacity to find things funny. Let that part come forward more.", affirmation: "My sense of humour is a survivor too, and I let it shine." },
  { theme: "Joy", title: "You Can Spend Money on Joy Without Guilt", message: "Within your means, spending on something purely because it delights you is a reasonable, healthy choice.", affirmation: "I allow myself to spend on what delights me, within reason." },
  { theme: "Joy", title: "Adventure Is Allowed Back In", message: "Trying something new, going somewhere unfamiliar, saying yes to spontaneity — these are open to you again.", affirmation: "I welcome adventure and spontaneity back into my life." },
  { theme: "Joy", title: "You Deserve Beauty in the Everyday", message: "Fresh flowers, a candle, a nice mug for your morning coffee — small deliberate beauty is not indulgent, it's nourishing.", affirmation: "I surround myself with small, deliberate beauty." },
  { theme: "Joy", title: "Joy Doesn't Need to Be Justified to Anyone", message: "You don't owe an explanation for why you're happy today. It's allowed to simply be, without a reason attached.", affirmation: "My joy doesn't need justification." },

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
  { theme: "Identity", title: "You Are Not Obligated to Explain Your Changes", message: "As you grow and change, you don't owe anyone an explanation for why you're different now.", affirmation: "My growth doesn't require anyone's explanation but my own." },
  { theme: "Identity", title: "You Can Try Things On Without Committing Forever", message: "A new hobby, a new style, a new way of speaking about yourself — you can experiment without it being permanent.", affirmation: "I try new versions of myself freely, without pressure to commit." },
  { theme: "Identity", title: "There Is No Single Correct Way to Heal", message: "Your path doesn't have to look like anyone else's recovery to be valid and working.", affirmation: "My healing path is valid, however it looks." },
  { theme: "Identity", title: "Old Labels Don't Have to Stick", message: "Whatever you were called, however you were defined by someone else — none of that has to be permanent.", affirmation: "I release labels that were given to me, not chosen by me." },
  { theme: "Identity", title: "You Contain More Than the Story of Survival", message: "You are also curious, funny, talented, ordinary in good ways — survival is one part of you, not the whole.", affirmation: "I am more than my survival story." },
  { theme: "Identity", title: "You Get to Decide What Defines You Now", message: "Not your past relationship, not what happened to you — you choose what sits at the center of your identity going forward.", affirmation: "I choose what defines me now." },
  { theme: "Identity", title: "Growth Doesn't Erase Who You Were", message: "The person you're becoming doesn't cancel out or shame the person who survived to get here.", affirmation: "Who I'm becoming honours who I had to be." },
  { theme: "Identity", title: "You Are Allowed Contradictions", message: "You can be strong and still scared, healed and still healing, confident and still unsure. All of it is you.", affirmation: "I hold all my contradictions as part of one whole self." },
  { theme: "Identity", title: "Your Identity Doesn't Need Anyone's Permission", message: "Who you are, what you like, how you define yourself — none of it requires approval from anyone else.", affirmation: "My identity needs no one's permission but my own." },
  { theme: "Identity", title: "You Are Allowed to Simply Like What You Like", message: "No hidden meaning, no justification needed — your tastes and preferences are valid exactly as they are.", affirmation: "I like what I like, without needing to explain it." },

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
  { theme: "Future Self", title: "You Are Allowed to Dream Bigger Than 'Just Okay'", message: "Surviving well is a real achievement, but it isn't the ceiling. You're allowed to want more than just okay.", affirmation: "I allow myself to dream beyond just getting by." },
  { theme: "Future Self", title: "Your Future Isn't Waiting on Anyone Else's Timeline", message: "It doesn't have to wait for a court date, an apology, or anyone else's next move. It starts whenever you decide to build it.", affirmation: "My future starts now, on my own timeline." },
  { theme: "Future Self", title: "The Habits You Build Today Are Gifts to Her", message: "Every healthy choice, every boundary held, every moment of rest — you're building all of it for the woman you're becoming.", affirmation: "Today's choices are gifts I'm giving my future self." },
  { theme: "Future Self", title: "You Get to Write the Next Chapter Blank", message: "No one else's pen is on this page anymore. What comes next is yours to write, freely.", affirmation: "I write my next chapter freely, in my own words." },
  { theme: "Future Self", title: "Believing in a Good Future Is Not Foolish", message: "It might not go exactly as imagined, but believing something good is possible is a reasonable, healthy stance to take.", affirmation: "I believe in a good future, and that belief is reasonable." },
  { theme: "Future Self", title: "You Are Someone's Future Inspiration", message: "A daughter, a niece, a friend watching quietly — your rebuilding is teaching someone what's possible for them too.", affirmation: "My rebuilding shows someone else what's possible." },
  { theme: "Future Self", title: "The Good Life Doesn't Need to Be Perfect to Count", message: "It doesn't have to be flawless to be genuinely good. Ordinary happiness still counts as a life well-lived.", affirmation: "An ordinary, imperfect happy life is still a good life." },
  { theme: "Future Self", title: "You Are Already Living Proof of Your Own Strength", message: "You don't need to wait for some future milestone to prove your strength. You've already proven it, every day so far.", affirmation: "I have already proven my strength, every day I've kept going." },
  { theme: "Future Self", title: "This Is the Beginning, Not the Aftermath", message: "What comes next doesn't have to be defined as recovery from something. It can simply be the start of something new.", affirmation: "I am beginning something new, not just recovering from something old." },
  { theme: "Future Self", title: "The Best Is Genuinely Still Ahead", message: "Not as a hollow platitude, but as a real possibility you are actively building toward, day by day.", affirmation: "The best of my life is genuinely still ahead of me." },

  // ---- Money & Independence ----
  { theme: "Money & Independence", title: "Financial Fear Doesn't Mean Financial Failure", message: "Feeling anxious about money after control was used against you doesn't mean you're bad with money. It means you're recovering from something specific.", affirmation: "My financial fear is a wound healing, not a flaw." },
  { theme: "Money & Independence", title: "Every Dollar You Control Is a Small Reclaiming", message: "Managing even a small amount of money on your own terms is proof of independence rebuilding.", affirmation: "Every dollar I control is proof of my independence." },
  { theme: "Money & Independence", title: "You Are Allowed to Learn This Slowly", message: "If money management feels unfamiliar or intimidating, that's a skill gap, not a character flaw. Skills can be learned.", affirmation: "I can learn financial skills at my own pace." },
  { theme: "Money & Independence", title: "Asking Questions About Money Isn't Shameful", message: "Not knowing something about finances doesn't make you foolish. It makes you someone still building knowledge, like everyone else once was.", affirmation: "I ask financial questions without shame." },
  { theme: "Money & Independence", title: "A Budget Is a Tool of Freedom, Not Restriction", message: "Understanding your money isn't a cage. It's the map that shows you the way to real independence.", affirmation: "My budget is a map toward freedom, not a limit on me." },
  { theme: "Money & Independence", title: "You Don't Need to Apologise for Needing Support", message: "Whether it's government assistance, family help, or community support, needing help while you rebuild is not a failure.", affirmation: "Needing support while I rebuild is not a failure." },
  { theme: "Money & Independence", title: "Small Savings Still Count", message: "You don't need a large amount put away for it to matter. Every bit set aside is real progress toward security.", affirmation: "Every small amount I save is real progress." },
  { theme: "Money & Independence", title: "Your Earning Power Is Growing", message: "Whatever your income looks like today, your skills, confidence, and options are expanding as you rebuild.", affirmation: "My earning power grows as I do." },
  { theme: "Money & Independence", title: "You Are Allowed to Want Financial Security", message: "Wanting to feel secure and stable with money isn't greedy. It's a reasonable, healthy goal.", affirmation: "Wanting financial security is reasonable, not greedy." },
  { theme: "Money & Independence", title: "Independence Is Built in Small, Boring Steps", message: "Opening an account, setting up a budget, checking a balance — none of it feels dramatic, but it all adds up to real freedom.", affirmation: "My independence is built through small, steady steps." },
  { theme: "Money & Independence", title: "You Can Separate Your Worth From Your Bank Balance", message: "Whatever your finances look like right now, it does not measure your value as a person.", affirmation: "My worth is not measured by my bank balance." },
  { theme: "Money & Independence", title: "You Are Allowed to Rebuild Credit Slowly", message: "If your credit or finances were damaged by circumstances outside your control, rebuilding them takes time, and that's okay.", affirmation: "I rebuild my finances patiently, without shame." },
  { theme: "Money & Independence", title: "Financial Control Was Never About Your Competence", message: "If money was used to control you, that control said nothing about your ability. It said everything about their need for power.", affirmation: "Financial control used against me was never about my competence." },
  { theme: "Money & Independence", title: "You Get to Decide Your Own Money Values", message: "What you save for, what you spend on, what matters to you financially — these are choices that belong entirely to you now.", affirmation: "My financial values are mine to define." },
  { theme: "Money & Independence", title: "You Are Capable of Understanding This", message: "Financial systems can feel complicated, but you are capable of learning them, one piece at a time.", affirmation: "I am capable of understanding my own finances." },
  { theme: "Money & Independence", title: "Every Bill Paid Alone Is a Milestone", message: "Managing expenses on your own terms, even when it's hard, is proof you are building a life that holds itself up.", affirmation: "Every bill I manage alone is a milestone of my independence." },
  { theme: "Money & Independence", title: "You Are Allowed to Spend on Your Own Priorities", message: "Your money can now reflect what matters to you, not what kept someone else comfortable or appeased.", affirmation: "My spending reflects my own priorities now." },
  { theme: "Money & Independence", title: "Financial Independence Is Also Emotional Independence", message: "Being able to support yourself changes more than your bank account. It changes how free you feel to make any decision.", affirmation: "My financial independence expands my freedom in every area." },
  { theme: "Money & Independence", title: "You Don't Need to Have It All Figured Out Yet", message: "A long-term plan can come together gradually. Right now, the next right step is enough.", affirmation: "I only need the next right step, not the whole plan." },
  { theme: "Money & Independence", title: "Security Doesn't Require Wealth, Only Stability", message: "You don't need to be rich to feel secure. You need steadiness, and steadiness is something you can build.", affirmation: "I build steadiness, not wealth, and that is enough for security." },

  // ---- Parenting Through It ----
  { theme: "Parenting Through It", title: "You Are Not Failing Them by Healing Slowly", message: "Taking time to rebuild yourself is not neglecting your children. A healed parent, even mid-healing, is a gift to them.", affirmation: "My healing is a gift to my children, even while it's still underway." },
  { theme: "Parenting Through It", title: "They Don't Need a Perfect Parent, They Need You", message: "Your presence, even imperfect and still recovering, matters more than an impossible standard of perfection.", affirmation: "My imperfect presence is exactly what they need." },
  { theme: "Parenting Through It", title: "Modeling Boundaries Teaches Them to Have Their Own", message: "Every time they watch you hold a limit with respect and calm, you're teaching them how to do the same one day.", affirmation: "My boundaries teach my children to have their own." },
  { theme: "Parenting Through It", title: "You Are Allowed to Ask Them for Patience", message: "It's okay to tell your children you're doing your best while you rebuild. Honesty, age-appropriately shared, is not a burden on them.", affirmation: "I can be honest with my children about my own growth." },
  { theme: "Parenting Through It", title: "Your Children Are Watching You Survive Well", message: "What they're learning from you right now is that hard things can be survived and rebuilt from. That's a lesson that will serve them for life.", affirmation: "I am showing my children that survival and rebuilding are possible." },
  { theme: "Parenting Through It", title: "Repair Matters More Than Never Getting It Wrong", message: "If you snap, if you have a hard day, what matters most is coming back afterward to repair the moment.", affirmation: "I repair with my children, and that matters more than perfection." },
  { theme: "Parenting Through It", title: "You Are Allowed to Grieve What Parenting Should Have Looked Like", message: "Mourning the family life you hoped for, even while building a good one now, is valid.", affirmation: "I grieve what could have been while building what is." },
  { theme: "Parenting Through It", title: "Calm Parenting Can Be Learned, Even If You Didn't Have the Model", message: "If you weren't shown gentle, steady parenting, you can still learn and build it now, deliberately.", affirmation: "I am learning calm parenting, even without having been shown it." },
  { theme: "Parenting Through It", title: "Your Children's Resilience Reflects Yours", message: "The steadiness you're rebuilding in yourself is quietly teaching them their own capacity to bounce back.", affirmation: "My resilience is teaching them their own." },
  { theme: "Parenting Through It", title: "It's Okay to Need Support Raising Them", message: "Asking for help — from family, from a village, from professionals — makes you a wiser parent, not a weaker one.", affirmation: "Asking for parenting support makes me wiser, not weaker." },
  { theme: "Parenting Through It", title: "You Get to Break Cycles Starting Now", message: "Whatever patterns you grew up with or lived through, you are allowed to consciously choose a different one for your own children.", affirmation: "I am breaking cycles, one deliberate choice at a time." },
  { theme: "Parenting Through It", title: "Your Children Don't Need You to Have All the Answers", message: "'I don't know, let's figure it out together' is a fully valid, connecting response.", affirmation: "I don't need every answer to be a good parent." },
  { theme: "Parenting Through It", title: "You Are Allowed Joy in Parenting Again", message: "Parenting doesn't have to be only survival mode. You're allowed to laugh with them, play, and enjoy this time.", affirmation: "I allow myself joy in parenting, not just survival." },
  { theme: "Parenting Through It", title: "Consistency Matters More Than Big Gestures", message: "Small, steady, everyday presence teaches your children more about love than any single grand moment.", affirmation: "My steady, everyday presence is what matters most." },
  { theme: "Parenting Through It", title: "You Are Allowed to Co-Parent Imperfectly", message: "If shared custody or co-parenting is part of your life, doing it imperfectly while protecting your peace is still doing it well.", affirmation: "I co-parent as best I can while protecting my own peace." },
  { theme: "Parenting Through It", title: "Your Children Are Not Responsible for Your Healing", message: "It's not their job to comfort you, manage your emotions, or make you feel okay. That responsibility stays with you.", affirmation: "My healing is my responsibility, not my children's." },
  { theme: "Parenting Through It", title: "You Can Talk About Hard Things Age-Appropriately", message: "Children can handle honest, simple truths delivered with care. You don't need to hide everything to protect them.", affirmation: "I can be honest with my children in ways that are appropriate for their age." },
  { theme: "Parenting Through It", title: "Their Love for You Isn't Conditional on Your Perfection", message: "Your children's love and connection to you doesn't depend on you never struggling in front of them.", affirmation: "My children's love for me isn't conditional on perfection." },
  { theme: "Parenting Through It", title: "You Are Building Them a Safer Blueprint", message: "The relationship model you're building now, healthier and calmer, is the blueprint they'll carry into their own future relationships.", affirmation: "I am building my children a safer blueprint for the future." },
  { theme: "Parenting Through It", title: "You Are Already a Good Enough Parent", message: "Good enough, consistently shown up, genuinely trying — that is the actual bar, and you are clearing it.", affirmation: "I am a good enough parent, and that is more than enough." },

  // ---- Anger as Information ----
  { theme: "Anger as Information", title: "Your Anger Is Not the Problem", message: "Anger is information, pointing at something that mattered and was violated. It deserves to be heard, not silenced.", affirmation: "My anger is information, and it deserves to be heard." },
  { theme: "Anger as Information", title: "You Are Allowed to Be Furious", message: "About the years, the treatment, the lies — fury is a fully appropriate response to real harm.", affirmation: "My fury is an appropriate response to what happened." },
  { theme: "Anger as Information", title: "Suppressed Anger Doesn't Disappear, It Waits", message: "Anger you were never allowed to express doesn't vanish. It waits for a safe place to finally be felt. This can be that place.", affirmation: "I let my long-suppressed anger finally be felt." },
  { theme: "Anger as Information", title: "Anger Can Coexist With Love", message: "You can be furious at what someone did and still have loved them. The anger doesn't cancel the love, and the love doesn't cancel the anger.", affirmation: "I hold my anger and my love without needing to choose." },
  { theme: "Anger as Information", title: "Your Anger Protected You", message: "In moments where fear might have frozen you, anger sometimes gave you the fuel to act, to leave, to survive.", affirmation: "My anger has protected me when I needed it most." },
  { theme: "Anger as Information", title: "You Don't Have to Perform Being Over It", message: "Pretending you've moved past your anger before you actually have only buries it deeper. You're allowed your real timeline.", affirmation: "I don't perform healing I haven't yet reached." },
  { theme: "Anger as Information", title: "Anger Directed Inward Isn't the Same as Anger Resolved", message: "If your anger has turned into self-blame, that's worth noticing gently — the anger belongs somewhere else.", affirmation: "I redirect my anger toward what it's actually about." },
  { theme: "Anger as Information", title: "You Can Feel Angry Without Acting on Every Impulse", message: "Feeling the full force of anger and choosing your response deliberately are two different, both valid, things.", affirmation: "I can feel my anger fully and still choose my response." },
  { theme: "Anger as Information", title: "Righteous Anger Doesn't Need to Apologise", message: "When anger is a fair response to real wrongdoing, it doesn't need to be softened or excused.", affirmation: "My righteous anger doesn't need an apology." },
  { theme: "Anger as Information", title: "Your Anger Can Fuel Change Rather Than Bitterness", message: "The same fire that's angry can be redirected into building something better, rather than being left to smolder.", affirmation: "I channel my anger into building, not just burning." },
  { theme: "Anger as Information", title: "You Are Allowed to Be Angry at More Than One Person", message: "At the person who harmed you, at those who didn't help, even at yourself for staying — all of it is allowed room.", affirmation: "My anger is allowed to include everyone it's about, including me, gently." },
  { theme: "Anger as Information", title: "Numbness Sometimes Comes Before Anger Arrives", message: "If you feel nothing yet, that's not failure. Sometimes numbness is the waiting room before real feeling returns.", affirmation: "I trust that feeling will return in its own time." },
  { theme: "Anger as Information", title: "You Can Express Anger Without Becoming Who Hurt You", message: "Feeling and voicing anger doesn't make you like them. There is a real difference between anger and abuse.", affirmation: "My anger does not make me like the person who hurt me." },
  { theme: "Anger as Information", title: "Anger at the Systems That Failed You Is Valid Too", message: "Courts, institutions, people who looked away — anger at systems, not just individuals, is a reasonable response.", affirmation: "My anger at the systems that failed me is valid." },
  { theme: "Anger as Information", title: "You Are Allowed to Write Letters You Never Send", message: "Putting rage onto paper, even words no one will ever read, can be a powerful, safe way to let it move through you.", affirmation: "I let my anger move through me safely, in my own way." },
  { theme: "Anger as Information", title: "Anger Doesn't Make You Bitter Forever", message: "Feeling it fully now doesn't sentence you to a lifetime of bitterness. Anger, expressed, tends to move rather than calcify.", affirmation: "My anger, once expressed, is free to move and soften." },
  { theme: "Anger as Information", title: "You Get to Decide What to Do With Your Anger", message: "It can become a boundary, a piece of writing, a fuel for change — or simply be felt and released. All are valid choices.", affirmation: "I choose what to do with my anger, on my own terms." },
  { theme: "Anger as Information", title: "Your Body Holds Anger You Haven't Spoken Yet", message: "Tension, clenched jaws, a tight chest — sometimes anger lives in the body before it finds words. Both are worth listening to.", affirmation: "I listen to the anger my body is holding." },
  { theme: "Anger as Information", title: "Anger Can Be a Doorway Back to Yourself", message: "Feeling angry on your own behalf, for the first time in a long time, can be a powerful sign that you matter to yourself again.", affirmation: "My anger is a doorway back to valuing myself." },
  { theme: "Anger as Information", title: "You Don't Owe Calm to Anyone Right Now", message: "You're allowed to be visibly, unapologetically angry, especially in spaces meant only for your own healing.", affirmation: "I don't owe anyone my calm while I process my anger." },

  // ---- Community & Connection ----
  { theme: "Community & Connection", title: "Isolation Was a Tool Used Against You, Not a Personality Trait", message: "If you feel disconnected from people now, that's often the lingering effect of deliberate isolation, not who you actually are.", affirmation: "My isolation was imposed on me; it is not who I am." },
  { theme: "Community & Connection", title: "Rebuilding Friendships Can Start Small", message: "A single text, a short coffee, a small reconnection — friendship doesn't need to be rebuilt all at once.", affirmation: "I rebuild connection in small, manageable steps." },
  { theme: "Community & Connection", title: "You Are Allowed to Need People Again", message: "Needing connection after being taught to need only one person is not weakness. It's a return to something healthy and human.", affirmation: "I allow myself to need people again." },
  { theme: "Community & Connection", title: "Old Friends May Understand More Than You Expect", message: "The people who cared about you before often want to reconnect more than your fear predicts.", affirmation: "I stay open to the friends who want to reconnect with me." },
  { theme: "Community & Connection", title: "You Get to Choose Your People This Time", message: "Community rebuilt now can be chosen deliberately, based on how people actually treat you.", affirmation: "I choose my community deliberately, based on how I'm treated." },
  { theme: "Community & Connection", title: "Vulnerability With the Right People Is Safe Again", message: "Not everyone will misuse your openness. With the right people, being known again is safe.", affirmation: "I can be known safely by the right people." },
  { theme: "Community & Connection", title: "You Are Allowed to Outgrow Some Relationships", message: "As you heal, some relationships from before may no longer fit. That's growth, not betrayal.", affirmation: "I allow myself to outgrow relationships that no longer fit." },
  { theme: "Community & Connection", title: "Support Groups Are a Sign of Strength, Not Weakness", message: "Seeking out others who understand isn't admitting defeat. It's a smart, resourceful way to heal.", affirmation: "Seeking support from others is a sign of my strength." },
  { theme: "Community & Connection", title: "Someone Out There Is Ready to Understand You", message: "Even if it doesn't feel like it yet, there are people who would understand exactly what you've been through.", affirmation: "There are people ready to understand my story." },
  { theme: "Community & Connection", title: "You Don't Have to Explain Everything to Belong", message: "You can be part of a group, a friendship, a community without needing to share every detail of your past.", affirmation: "I can belong without needing to explain everything." },
  { theme: "Community & Connection", title: "Being Around Others Doesn't Threaten Your Independence", message: "Leaning on people again doesn't undo the independence you've built. Both can exist together.", affirmation: "I can lean on others while still standing on my own." },
  { theme: "Community & Connection", title: "You Can Rebuild Trust With People One Interaction at a Time", message: "Trust doesn't need to return all at once. Each small, kept promise from someone new adds up.", affirmation: "I rebuild trust in others gradually, one interaction at a time." },
  { theme: "Community & Connection", title: "You Are Allowed to Set the Pace of New Friendships", message: "Not everyone gets fast access to your inner world. You control how quickly closeness develops now.", affirmation: "I set the pace at which people get close to me." },
  { theme: "Community & Connection", title: "Community Doesn't Have to Be Large to Be Real", message: "A handful of genuinely supportive people is more valuable than a wide circle of surface-level connections.", affirmation: "A small, real community is enough for me." },
  { theme: "Community & Connection", title: "You Deserve Friends Who Show Up Consistently", message: "Not just in a crisis, but in the ordinary, everyday moments too. Consistency is a fair thing to want.", affirmation: "I deserve friends who show up consistently, not just in emergencies." },
  { theme: "Community & Connection", title: "Being Seen Fully Is Worth the Risk Again", message: "Letting the right people see the real you, healing scars and all, is a risk worth taking now.", affirmation: "I let myself be fully seen by the people who've earned it." },
  { theme: "Community & Connection", title: "Helping Others Can Be Part of Your Own Healing", message: "Supporting someone else on a similar path can bring meaning and connection back into your own life.", affirmation: "Helping others is part of my own healing too." },
  { theme: "Community & Connection", title: "You Are Not a Burden for Needing Support", message: "Reaching out to friends or family for help does not make you a weight on their lives.", affirmation: "Needing support does not make me a burden." },
  { theme: "Community & Connection", title: "New Relationships Can Be Built on Honesty From the Start", message: "Unlike before, you can build new friendships and connections where honesty is present from day one.", affirmation: "I build new relationships on a foundation of honesty." },
  { theme: "Community & Connection", title: "Loneliness Now Is Not Permanent", message: "If you feel lonely in this season of rebuilding, that feeling is temporary, not a life sentence.", affirmation: "My loneliness right now is a season, not a permanent state." },

  // ---- Forgiveness of Self ----
  { theme: "Forgiveness of Self", title: "You Did the Best You Could With What You Knew", message: "Judging your past choices by what you know now isn't fair to the version of you who didn't have this clarity yet.", affirmation: "I forgive myself for not knowing then what I know now." },
  { theme: "Forgiveness of Self", title: "Staying Was Not a Failure", message: "Whatever kept you there — love, fear, hope, circumstance — it does not make you foolish or weak. It makes you human.", affirmation: "I release the idea that staying was a failure on my part." },
  { theme: "Forgiveness of Self", title: "You Are Not to Blame for Someone Else's Choices", message: "Their actions were theirs. No decision you made obligated them to treat you the way they did.", affirmation: "I release blame for choices that were never mine to own." },
  { theme: "Forgiveness of Self", title: "Self-Forgiveness Is Not the Same as Excusing What Happened", message: "Forgiving yourself for your own choices doesn't mean excusing what was done to you. Both truths can exist separately.", affirmation: "I forgive myself without excusing what was done to me." },
  { theme: "Forgiveness of Self", title: "You Can Release Guilt You Were Never Meant to Carry", message: "Some of the guilt you're holding was never yours to begin with. It was handed to you, and you're allowed to hand it back.", affirmation: "I return guilt that was never mine to carry." },
  { theme: "Forgiveness of Self", title: "You Are Allowed to Forgive Yourself Slowly", message: "Self-forgiveness doesn't need to happen in one dramatic moment. It can arrive gradually, in small steps.", affirmation: "I forgive myself gradually, in my own time." },
  { theme: "Forgiveness of Self", title: "The Time It Took to Leave Was the Time You Needed", message: "You left when you were ready, resourced, and safe enough to. That timing was not a failure.", affirmation: "I forgive myself for the time it took me to leave." },
  { theme: "Forgiveness of Self", title: "You Are Not Required to Be Perfect to Deserve Peace", message: "Peace of mind is not a reward reserved only for people who never made a mistake.", affirmation: "I deserve peace, imperfections and all." },
  { theme: "Forgiveness of Self", title: "Regret Doesn't Have to Turn Into Punishment", message: "You can wish something had gone differently without sentencing yourself to ongoing self-punishment for it.", affirmation: "I let regret exist without turning it into punishment." },
  { theme: "Forgiveness of Self", title: "You Forgive Yourself for Surviving However You Had To", message: "However you got through it — however messy, however imperfect — it worked. You're here. That's enough.", affirmation: "I forgive myself for however I had to survive." },
  { theme: "Forgiveness of Self", title: "You Are Not the Sum of Your Worst Moments", message: "A hard decision made under pressure or pain does not define the whole of who you are.", affirmation: "My worst moments do not define the whole of me." },
  { theme: "Forgiveness of Self", title: "Self-Compassion Is Not Self-Indulgence", message: "Being gentle with yourself about the past is not letting yourself off the hook. It's simply being fair.", affirmation: "Self-compassion toward my past self is fair, not indulgent." },
  { theme: "Forgiveness of Self", title: "You Can Let Go of Should-Haves", message: "'I should have seen it sooner' rarely helps. You saw it when you were able to. That's the only timeline that was ever possible.", affirmation: "I release the should-haves; I did what was possible at the time." },
  { theme: "Forgiveness of Self", title: "Forgiving Yourself Frees Up Energy for Healing", message: "Every bit of energy spent punishing your past self is energy that could go toward building your future instead.", affirmation: "I redirect the energy of self-blame into building my future." },
  { theme: "Forgiveness of Self", title: "You Are Allowed to Stop Rehashing It", message: "Replaying old decisions on a loop doesn't change them. You're allowed to simply set the loop down.", affirmation: "I am allowed to stop replaying the past on a loop." },
  { theme: "Forgiveness of Self", title: "You Made the Best Decision Available at the Time", message: "Given your resources, your fear, your circumstances then, the choice you made was the most reasonable one available to you.", affirmation: "I made the best decision I could with what was available to me." },
  { theme: "Forgiveness of Self", title: "Self-Forgiveness Is an Act of Strength", message: "It takes real courage to look honestly at the past and choose compassion over continued self-punishment.", affirmation: "Choosing self-forgiveness is an act of strength." },
  { theme: "Forgiveness of Self", title: "You Don't Need Anyone Else's Permission to Forgive Yourself", message: "This is between you and yourself. No outside approval is required.", affirmation: "I forgive myself without needing anyone else's permission." },
  { theme: "Forgiveness of Self", title: "The Child or Young Woman You Were Deserves Compassion", message: "Whoever you were when this started deserves the same gentleness you'd offer any other hurting young woman.", affirmation: "I offer the younger version of me the same compassion I'd give anyone else." },
  { theme: "Forgiveness of Self", title: "You Are Allowed to Simply Be Done Carrying It", message: "At some point, you get to set the self-blame down, not because it's fully resolved, but because you're allowed to be done.", affirmation: "I am allowed to put the self-blame down and be done." },
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
        <Flame size={28} color="#A8425A" />
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
              <div style={styles.cardFaceBack}>
                <Flame size={26} color="#F9E8EA" />
                <div style={styles.cardBackText}>Tap to reveal</div>
              </div>
              <div style={styles.cardFaceFront}>
                <div style={styles.cardTheme}>{drawn.theme}</div>
                <div style={styles.cardTitle}>{drawn.title}</div>
                <div style={styles.cardMessage}>{drawn.message}</div>
                <div style={styles.cardAffirmation}>"{drawn.affirmation}"</div>
              </div>
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
          285 more cards across boundaries, grief, voice, joy, identity, money, parenting, anger, connection,
          forgiveness and hope — plus unlimited draws and a private reflection journal that grows with you.
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
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');
`;

const styles = {
  loadingWrap: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7EDEA" },
  app: {
    minHeight: "100vh",
    maxWidth: 480,
    margin: "0 auto",
    background: "linear-gradient(180deg, #FBF3F0 0%, #F5E4E0 55%, #EFD5D8 100%)",
    fontFamily: "'Inter', sans-serif",
    color: "#3D2233",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  header: { padding: "32px 24px 14px", textAlign: "center" },
  brandRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  brandName: { fontFamily: "'Fraunces', serif", fontSize: 25, fontWeight: 600, letterSpacing: -0.3, color: "#3D2233" },
  tagline: { fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: "#B5697A", marginTop: 5, fontWeight: 500 },
  streakPill: {
    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
    background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.6)", borderRadius: 999,
    padding: "7px 16px", fontSize: 12, color: "#6B3E4C", fontWeight: 600,
    boxShadow: "0 4px 14px -6px rgba(120,60,75,0.15)",
  },
  main: { flex: 1, padding: "8px 20px 110px", overflowY: "auto" },

  drawWrap: { display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20 },
  cardBack: {
    width: 224, height: 324, borderRadius: 24, cursor: "pointer",
    background: "linear-gradient(150deg, #C4576B 0%, #A8425A 50%, #7D2E45 100%)",
    boxShadow: "0 24px 48px -16px rgba(125,46,69,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.25s cubic-bezier(.2,.8,.2,1)",
  },
  cardBackInner: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" },
  cardBackText: { color: "#F9E8EA", fontSize: 14, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0.1 },
  emptyHint: { marginTop: 24, fontSize: 13.5, color: "#9C6474", textAlign: "center", maxWidth: 250, lineHeight: 1.55 },

  cardStage: { perspective: 1400, cursor: "pointer", width: 264, height: 344 },
  card: {
    width: "100%", height: "100%", position: "relative",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(.2,.8,.2,1)",
  },
  cardFlipped: { transform: "rotateY(180deg)" },
  cardFaceBack: {
    position: "absolute", inset: 0, borderRadius: 22, backfaceVisibility: "hidden",
    background: "linear-gradient(150deg, #C4576B 0%, #A8425A 50%, #7D2E45 100%)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
    boxShadow: "0 24px 48px -16px rgba(125,46,69,0.5)",
  },
  cardFaceFront: {
    position: "absolute", inset: 0, borderRadius: 22, padding: "30px 26px",
    background: "#FFFCFB", transform: "rotateY(180deg)", backfaceVisibility: "hidden",
    boxShadow: "0 24px 48px -16px rgba(90,50,65,0.3)",
    border: "1px solid #F1DADD",
    display: "flex", flexDirection: "column", gap: 16, overflowY: "auto",
  },
  cardTheme: { fontSize: 10.5, letterSpacing: 1.6, textTransform: "uppercase", color: "#B5697A", fontWeight: 600 },
  cardTitle: { fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: "#3D2233", lineHeight: 1.2, letterSpacing: -0.3 },
  cardMessage: { fontSize: 14.5, lineHeight: 1.65, color: "#5C3B47" },
  cardAffirmation: { marginTop: "auto", fontSize: 13.5, fontStyle: "italic", fontFamily: "'Fraunces', serif", color: "#A8425A", borderTop: "1px solid #F1DADD", paddingTop: 15 },

  noteBox: { width: 264, marginTop: 24 },
  noteLabel: { fontSize: 12.5, color: "#7A4A58", marginBottom: 8, fontWeight: 600 },
  noteInput: {
    width: "100%", borderRadius: 16, border: "1px solid #EFCCD1", padding: 13,
    fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#3D2233", resize: "none",
    background: "rgba(255,255,255,0.65)", boxSizing: "border-box", outline: "none",
  },
  saveBtn: {
    marginTop: 10, width: "100%", padding: "12px 0", borderRadius: 999, border: "none",
    background: "linear-gradient(135deg, #C4576B, #A8425A)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer",
    fontFamily: "'Inter', sans-serif", boxShadow: "0 8px 20px -8px rgba(168,66,90,0.5)",
  },
  drawAgainBtn: {
    marginTop: 16, background: "none", border: "none", color: "#A8425A",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },

  deckWrap: { paddingTop: 10 },
  deckIntro: { textAlign: "center", marginBottom: 20 },
  deckIntroTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#3D2233", letterSpacing: -0.3 },
  deckIntroSub: { fontSize: 12.5, color: "#9C6474", marginTop: 5 },
  themeGroup: { marginBottom: 24 },
  themeLabel: { fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: "#B5697A", fontWeight: 700, marginBottom: 11 },
  themeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  deckCard: {
    position: "relative", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)",
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 16, padding: "15px 13px", cursor: "pointer", minHeight: 58,
    display: "flex", alignItems: "center", boxShadow: "0 6px 16px -10px rgba(120,60,75,0.2)",
  },
  deckCardTitle: { fontSize: 12.5, color: "#5C3B47", fontWeight: 500, lineHeight: 1.35 },
  lockBadge: {
    position: "absolute", top: 9, right: 9, background: "#A8425A", color: "#fff",
    borderRadius: 999, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
  },

  journalWrap: { paddingTop: 10 },
  journalEmpty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 50, color: "#9C6474", fontSize: 13.5, textAlign: "center" },
  journalEntry: { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, padding: 17, marginBottom: 12, boxShadow: "0 6px 16px -10px rgba(120,60,75,0.2)" },
  journalEntryHeader: { display: "flex", justifyContent: "space-between", marginBottom: 7 },
  journalEntryTitle: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, color: "#3D2233" },
  journalEntryDate: { fontSize: 11, color: "#B5697A", fontWeight: 500 },
  journalEntryNote: { fontSize: 13, color: "#5C3B47", lineHeight: 1.5 },

  nav: {
    position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448,
    display: "flex", justifyContent: "space-around", padding: "12px 8px",
    background: "rgba(255,255,255,0.55)", backdropFilter: "blur(16px)",
    borderRadius: 22, border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 16px 40px -14px rgba(90,50,65,0.35)",
  },
  navBtn: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none",
    color: "#B5697A", cursor: "pointer", padding: "4px 10px", fontFamily: "'Inter', sans-serif",
  },
  navBtnActive: { color: "#7D2E45" },
  navLabel: { fontSize: 10, fontWeight: 600 },

  toast: {
    position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", width: "88%", maxWidth: 420,
    zIndex: 50, cursor: "pointer",
  },
  toastInner: {
    background: "#3D2233", color: "#F9E8EA", borderRadius: 18, padding: "15px 19px",
    boxShadow: "0 18px 36px -12px rgba(61,34,51,0.5)",
  },
  toastTitle: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", opacity: 0.75, marginBottom: 4, fontWeight: 600 },
  toastMsg: { fontSize: 13, lineHeight: 1.5 },
  toastAff: { fontSize: 12.5, fontStyle: "italic", fontFamily: "'Fraunces', serif", marginTop: 6, opacity: 0.9 },

  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(61,34,51,0.5)", backdropFilter: "blur(4px)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24,
  },
  modalCard: {
    background: "#FFFCFB", borderRadius: 26, padding: "30px 26px", maxWidth: 340, width: "100%",
    position: "relative", textAlign: "center", boxShadow: "0 30px 70px -14px rgba(61,34,51,0.45)",
  },
  modalClose: { position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#B5697A", cursor: "pointer" },
  modalTitle: { fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: "#3D2233", marginTop: 12, letterSpacing: -0.3 },
  modalBody: { fontSize: 13.5, color: "#5C3B47", lineHeight: 1.6, marginTop: 11 },
  modalPriceRow: { marginTop: 18 },
  modalPrice: { fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 600, color: "#3D2233" },
  modalPriceSub: { fontSize: 13, fontWeight: 400, color: "#9C6474" },
  modalCta: {
    marginTop: 18, width: "100%", padding: "14px 0", borderRadius: 999, border: "none",
    background: "linear-gradient(135deg, #C4576B, #A8425A)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    fontFamily: "'Inter', sans-serif", boxShadow: "0 10px 24px -10px rgba(168,66,90,0.55)",
  },
  modalDismiss: { marginTop: 12, background: "none", border: "none", color: "#9C6474", fontSize: 12.5, cursor: "pointer" },
};
