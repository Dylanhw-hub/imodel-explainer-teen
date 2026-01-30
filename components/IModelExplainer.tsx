import React, { useState, useRef, useEffect } from 'react';

const labels = ['Integrity', 'Intuition', 'Inquiry', 'Intentionality'];
const colors: Record<string, string> = {
  Intentionality: '#06b6d4', // Cyan
  Integrity: '#10b980',      // Emerald Green
  Inquiry: '#f59e0b',        // Amber
  Intuition: '#f43f5e'       // Rose/Pink
};

interface IModeData {
  feelsLike: string;
  whatItIs: string;
  whenYouUseIt: string;
  definition: string;
  coreQuestions: string[];
}

interface ScenarioModeData {
  withoutThisI: string;
  theQuestion: string;
  withThisI: string;
}

const explanations: Record<string, IModeData> = {
  Intentionality: {
    feelsLike: "Having a clear sense of direction; knowing your why",
    whatItIs: "Being clear about purpose and direction",
    whenYouUseIt: "Before you start, when deciding whether to use AI",
    definition: "This is the mode of clarity about why you're using AI and what you want to achieve—including whether AI is the right tool at all.",
    coreQuestions: ["Why am I using AI for this?", "What do I actually want to achieve?", "Should I use AI here, do this myself, or work together?"]
  },
  Integrity: {
    feelsLike: "Confidence that you can stand behind your choices; no ethical discomfort",
    whatItIs: "Ensuring ethical, honest, and appropriate use",
    whenYouUseIt: "When there are stakes—'Is this still my work?' 'Should I disclose I used AI?'",
    definition: "This is the mode of using AI honestly and responsibly—being transparent about its role, taking accountability for outputs, ensuring alignment with your values.",
    coreQuestions: ["Is my use of AI honest and responsible?", "Would I stand behind this work?", "Am I being transparent about AI's role?"]
  },
  Inquiry: {
    feelsLike: "Engaged curiosity; critically examining rather than passively accepting",
    whatItIs: "Critical examination and quality checking",
    whenYouUseIt: "While working—'Is this actually what I asked for?' 'Does this match my needs?'",
    definition: "This is the mode of active questioning—prompting well, evaluating outputs critically, probing deeper when needed. Good inquiry means staying curious about both what AI produces and how you're working with it.",
    coreQuestions: ["Am I asking the right questions?", "Does this output truly answer what I need?", "What should I probe further?"]
  },
  Intuition: {
    feelsLike: "That internal signal saying wait or something's not right here",
    whatItIs: "Trusting expertise and professional judgment",
    whenYouUseIt: "When something feels generic, too easy, or not quite right",
    definition: "This is the mode of your internal compass—the sense that something isn't right, or that you should pause. Instead of ignoring these feelings, you treat them as signals worth investigating.",
    coreQuestions: ["What is my gut telling me?", "Does anything feel off?", "Should I pause before continuing?"]
  }
};

interface ScenarioData {
  title: string;
  description: string;
  modes: Record<string, ScenarioModeData>;
}

const scenarios: Record<string, ScenarioData> = {
  teacher: {
    title: "Lesson Planning",
    description: "A history teacher needs to plan a lesson on the French Revolution. She opens ChatGPT and types: 'Create a lesson plan on the causes of the French Revolution.' What AI gives her: A perfectly adequate lesson plan. Three causes: economic inequality, Enlightenment ideas, political crisis. Activities: read a text, answer comprehension questions, group discussion. It's fine. It would work. Which I-Mode should guide her next move?",
    modes: {
      Intentionality: {
        withoutThisI: "You accept a generic lesson that ticks curriculum boxes but doesn't connect with your students",
        theQuestion: "What am I actually trying to create? Not 'teach the French Revolution'—what do I want students to feel?",
        withThisI: "You ask for something that makes economic injustice visceral and connects to students' lives today"
      },
      Integrity: {
        withoutThisI: "You present AI-generated content as your own teaching without acknowledging where ideas came from",
        theQuestion: "Is this still my lesson? Am I being honest about how I'm using this tool?",
        withThisI: "You use AI as a brainstorming partner, but the pedagogy and final design remain authentically yours"
      },
      Inquiry: {
        withoutThisI: "You accept a plan that ignores what you know about your specific students—their struggles, context, what actually lands",
        theQuestion: "What do I know about my students that should shape this? What will actually work for Year 9?",
        withThisI: "You probe deeper: 'What hooks these specific students?' 'How do I make this feel relevant?' and get something useful"
      },
      Intuition: {
        withoutThisI: "You use a plan that looks fine on paper but misses something important about how your students learn",
        theQuestion: "Something feels generic about this. What's my gut telling me? Do I trust that feeling?",
        withThisI: "You trust your instinct that the plan lacks depth and push for something with more authenticity"
      }
    }
  },
  principal: {
    title: "Staff Development",
    description: "A principal gets a directive from the board: 'Teachers need training on AI tools.' First impulse: Book an external provider. Get someone to show teachers how ChatGPT works. Tick the box. Move on. Which I-Mode should guide her decision?",
    modes: {
      Intentionality: {
        withoutThisI: "You book generic training that wastes time and money because it doesn't address what your staff actually need",
        theQuestion: "What's the actual goal? Not 'AI training'—what are my teachers struggling with?",
        withThisI: "You realize different staff need different things: veterans need reassurance, early-career teachers need boundaries. You create targeted conversations instead"
      },
      Integrity: {
        withoutThisI: "You follow the board's directive without checking if it actually serves your teachers",
        theQuestion: "Am I making this decision based on what's best for my staff, or just ticking a box?",
        withThisI: "You listen to staff concerns first, then design something that addresses real anxieties and honors their expertise"
      },
      Inquiry: {
        withoutThisI: "You book a workshop that misses the real tensions—what's actually making your teachers anxious or excited",
        theQuestion: "What are my teachers experiencing? What am I hearing in the corridors? What do they actually need?",
        withThisI: "You spend a week listening through coffee conversations and discover the real issues are about pedagogy and consistency, not technology"
      },
      Intuition: {
        withoutThisI: "You book training that looks impressive on paper but doesn't fit your school's culture or staff needs",
        theQuestion: "This proposal looks polished, but do I trust it? What does my experience tell me will actually work here?",
        withThisI: "You trust your instinct that one-size-fits-all won't work and invest in conversations and a shared framework instead"
      }
    }
  },
  parent: {
    title: "Homework Help",
    description: "A parent's 14-year-old has a history essay due tomorrow. The topic: 'How did World War I change society?' The student has done research but is stuck on how to structure the essay. The temptation: The parent thinks: 'I could just ask ChatGPT to write an outline. Or even the whole thing. She can read it, learn from it, submit it. She's tired. I'm tired. The teacher will never know.' It would be so easy. Which I-Mode should guide her choice?",
    modes: {
      Intentionality: {
        withoutThisI: "You use AI in ways that help her finish quickly but undermine her learning to write",
        theQuestion: "What am I actually trying to achieve? Help her finish, or help her learn?",
        withThisI: "You recognize those are different goals and choose to support her thinking process, not just her productivity"
      },
      Integrity: {
        withoutThisI: "AI writes the essay, she submits it as her own. Easy. Quick. But what are you teaching her about honesty?",
        theQuestion: "What standard am I holding right now? What lesson about integrity is she learning from me?",
        withThisI: "You choose not to take the shortcut—not because you won't help, but because you want her to know what doing her own work means"
      },
      Inquiry: {
        withoutThisI: "An AI-generated essay might be perfect structurally but miss what she actually understands about the topic",
        theQuestion: "What does she actually need help with? Not the whole essay—what's the real blocker here?",
        withThisI: "You ask better questions: 'What are the three biggest changes?' 'How would you explain that to a friend?' and help her find the structure"
      },
      Intuition: {
        withoutThisI: "You take the easy path that feels wrong—undermining something important about her learning and integrity",
        theQuestion: "This feels like a shortcut. What does my gut tell me about what she needs from me right now?",
        withThisI: "You trust that feeling and sit with her through the struggle—which is where real learning happens"
      }
    }
  },
  governor: {
    title: "Budget Decision",
    description: "The school's governing board is reviewing budget proposals. The head of IT presents: an AI-powered learning platform for all students. The platform promises 'personalized learning pathways,' 'real-time progress tracking,' 'engagement analytics.' The cost is significant but not unreasonable. The presentation is polished. The data looks impressive. The pitch: 'This is the future of education. Schools that don't invest in AI will fall behind. Our students deserve the best technology.' Which I-Mode should guide the board's decision?",
    modes: {
      Intentionality: {
        withoutThisI: "You approve spending based on impressive features rather than actual school needs",
        theQuestion: "What problem are we actually trying to solve? What do our students and teachers need?",
        withThisI: "You ask what teachers actually need and discover they want time to develop approaches, not another platform to manage"
      },
      Integrity: {
        withoutThisI: "You approve the budget because it looks innovative, without checking if it truly serves students and staff",
        theQuestion: "Does this serve our school community, or does it just look impressive? Are we being honest about needs vs. wants?",
        withThisI: "You hold the line—asking whether this aligns with the school's actual values and priorities before committing resources"
      },
      Inquiry: {
        withoutThisI: "You approve based on a polished presentation without investigating what teachers and students actually experience",
        theQuestion: "Have we consulted teachers? Piloted this? What evidence do we have that this solves a real problem?",
        withThisI: "You discover there's been no teacher consultation, no pilot, and the 'problem' is vague. You request proper investigation first"
      },
      Intuition: {
        withoutThisI: "You ignore that uneasy feeling and approve something that looks right on paper but feels wrong",
        theQuestion: "This sounds impressive, but something feels off. What is my experience telling me?",
        withThisI: "You trust your instinct that something's not right and ask the hard questions about implementation and real impact"
      }
    }
  }
};

interface LayeredContent {
  type: string;
  response: string;
  missing?: string;
  strength?: string;
}

const scenarioLayeredContent: Record<string, Record<string, any>> = {
  teacher: {
    single: {
      intentionality: {
        response: "You've clarified your purpose: 'I want to learn about this topic and demonstrate my understanding.' But without other modes, you might still use AI in ways that undermine that purpose.",
        missing: "You know your WHY, but not HOW to maintain authenticity or WHAT questions to ask the AI."
      },
      integrity: {
        response: "You're committed to honesty and proper attribution. But without other modes, you might be overly restrictive—avoiding AI entirely when it could legitimately help.",
        missing: "You have ethical guardrails, but no clear PURPOSE guiding your choices or AWARENESS of when AI output doesn't sound like you."
      },
      inquiry: {
        response: "You're asking good questions: 'What do I actually need help with?' But without other modes, your questions might lead you astray if you're not checking against your values.",
        missing: "You're exploring possibilities, but without INTEGRITY checks or INTUITION about authenticity."
      },
      intuition: {
        response: "You notice when something feels off—'This paragraph doesn't sound like me.' But without other modes, you might not know what to do with that feeling.",
        missing: "You sense inauthenticity, but lack the INQUIRY skills to fix it or INTEGRITY framework to guide revision."
      }
    },
    double: {
      "inquiry+intentionality": {
        response: "You're purposeful AND curious: asking 'What specific aspects do I need help with? What can I do myself?' You're using AI strategically.",
        missing: "Without INTEGRITY, you might rationalize shortcuts. Without INTUITION, you might miss when AI text doesn't fit.",
        strength: "Purpose-driven exploration"
      },
      "integrity+intentionality": {
        response: "Strong foundation: You know WHY you're writing (to learn and demonstrate understanding) AND you're committed to honesty. You'll attribute AI help properly.",
        missing: "You might still struggle with HOW to use AI effectively or RECOGNIZING when output doesn't reflect your voice.",
        strength: "Clear purpose + ethical commitment"
      },
      "integrity+inquiry": {
        response: "You're asking thoughtful questions within ethical bounds. 'How can I use AI to help me learn, not bypass learning?'",
        missing: "Without clear PURPOSE, your exploration might wander. Without INTUITION, you might not catch subtle inauthenticity.",
        strength: "Ethical exploration"
      },
      "integrity+intuition": {
        response: "You're committed to honesty AND you notice when something feels wrong. If AI text doesn't sound like you, that feeling triggers an ethical flag.",
        missing: "You might not know WHAT to do next—lacking purposeful direction or systematic questioning.",
        strength: "Ethical + authentic sensing"
      },
      "inquiry+intuition": {
        response: "You're asking questions AND sensing what's right. 'Does this explanation actually make sense to me? Can I explain it differently?'",
        missing: "Without PURPOSE, your exploration lacks direction. Without INTEGRITY, you might justify problematic shortcuts.",
        strength: "Curious + self-aware"
      },
      "intentionality+intuition": {
        response: "You know your purpose AND you're tuned into authenticity. When AI generates text, you immediately sense whether it reflects your actual understanding.",
        missing: "You might not have systematic QUESTIONS to improve output or clear ETHICAL guidelines for attribution.",
        strength: "Purpose + authenticity radar"
      }
    },
    triple: {
      "inquiry+integrity+intentionality": {
        response: "You know WHY you're writing, you're committed to honesty, and you're asking good questions about how to use AI. Your process is sound.",
        missing: "Without INTUITION, you might miss subtle moments where AI output doesn't quite match your voice or understanding—the final authenticity check.",
        strength: "Purpose + Ethics + Method"
      },
      "integrity+intuition+intentionality": {
        response: "You have purpose, ethics, and authenticity awareness. You'll catch most problems and know they matter.",
        missing: "Without INQUIRY, you might not have systematic strategies for improving AI output or knowing what questions to ask.",
        strength: "Purpose + Ethics + Awareness"
      },
      "inquiry+intuition+intentionality": {
        response: "You're purposeful, curious, and self-aware. You're exploring AI's capabilities while staying tuned to authenticity.",
        missing: "Without INTEGRITY, you might rationalize choices that technically serve your purpose but compromise honesty.",
        strength: "Purpose + Method + Awareness"
      },
      "integrity+inquiry+intuition": {
        response: "You're ethical, questioning, and self-aware. Strong foundation for responsible AI use.",
        missing: "Without clear INTENTIONALITY, you might lack direction—being responsible but not purposeful about your learning goals.",
        strength: "Ethics + Method + Awareness"
      }
    },
    complete: {
      response: "Full integration: You know your PURPOSE (genuine learning), maintain INTEGRITY (honest attribution), use INQUIRY (strategic questions about what help you need), and trust your INTUITION (sensing when output doesn't reflect your understanding). Your lesson is authentically yours—AI helped you think better, not think for you.",
      strength: "The complete I-Model in action"
    }
  },
  principal: {
    single: {
      intentionality: {
        response: "You've clarified what you're really trying to solve. But without deeper understanding of your staff, you might create a solution that doesn't address their actual concerns.",
        missing: "You know WHAT to achieve, but not HOW to listen or WHAT your teachers are actually experiencing."
      },
      integrity: {
        response: "You're committed to making decisions that serve your staff, not just checking boxes for the board. But without inquiry and listening, you might miss what they actually need.",
        missing: "You have good intentions, but lack the LISTENING to understand their concerns and the DISCERNMENT to know what's really at stake."
      },
      inquiry: {
        response: "You're asking questions and listening—great first step. But without clarity on why this matters and trust in your instincts, you might over-complicate the solution.",
        missing: "You're exploring, but need CLARITY about your values and TRUST in your pattern recognition about what works."
      },
      intuition: {
        response: "You sense something's off about the standard proposal. But without asking questions or clarity about goals, you might reject a solution without understanding why.",
        missing: "You sense the problem, but need INQUIRY to understand it and INTENTIONALITY to know what you're optimizing for."
      }
    },
    double: {
      "inquiry+intentionality": {
        response: "You know what you're trying to achieve AND you're asking the right questions. You're discovering what your staff actually needs rather than imposing a solution.",
        missing: "Without INTEGRITY guardrails and INTUITION, you might propose something well-intentioned but off-target."
      },
      "integrity+intentionality": {
        response: "Strong foundation: You're clear about serving your staff authentically, and you're committed to decisions that align with that purpose.",
        missing: "You need the LISTENING of inquiry and the PATTERN RECOGNITION of intuition to translate values into the right actions."
      },
      "integrity+inquiry": {
        response: "You're asking good questions from an ethical place—'What do you actually need? What concerns you?' Your staff feels heard.",
        missing: "Without CLARITY of purpose, your inquiry might wander. Without INSTINCT, you might miss the real issue underneath the surface complaint."
      },
      "inquiry+intuition": {
        response: "You're asking thoughtful questions AND trusting your gut about what's off. This combination helps you separate real needs from surface requests.",
        missing: "Without CLARITY about why this matters and INTEGRITY commitments, you might chase the wrong solutions."
      },
      "integrity+intuition": {
        response: "You trust your instincts about what matters ethically, and you're willing to push back on proposals that don't align. This is strong leadership.",
        missing: "Without LISTENING and CLARITY, you might be right about something being off but wrong about what to do instead."
      },
      "intentionality+intuition": {
        response: "You know what you're optimizing for AND you trust your experience-based pattern recognition. You can smell a bad solution from a mile away.",
        missing: "Without INQUIRY, you might not understand *why* something feels wrong or what your staff actually needs instead."
      }
    },
    triple: {
      "inquiry+integrity+intentionality": {
        response: "You're clear about purpose, you're asking the right questions ethically, and you're committed to decisions that serve your staff. Your approach is sound.",
        missing: "Without INTUITION—that pattern recognition from experience—you might miss subtle signals about what will or won't work."
      },
      "integrity+intuition+intentionality": {
        response: "You know your values, you trust your instincts, and you're clear about what you're optimizing for. You make strong, principled decisions.",
        missing: "Without deep INQUIRY and listening, you might be confident in the wrong direction."
      },
      "inquiry+intuition+intentionality": {
        response: "You're purposeful, curious, and trusting your gut. You're exploring solutions from a clear place and your instincts guide the inquiry.",
        missing: "Without INTEGRITY checks on your values, you might prioritize efficiency over what's right for your people."
      },
      "integrity+inquiry+intuition": {
        response: "You're ethical, questioning, and intuitive. You listen from the heart and trust what you're sensing about your staff's real needs.",
        missing: "Without INTENTIONALITY—clarity about what you're optimizing for—you might be responsive but lack strategic direction."
      }
    },
    complete: {
      response: "Full integration: You know your PURPOSE (supporting your staff authentically), maintain INTEGRITY (listening and honoring their expertise), use INQUIRY (asking questions before solving), and trust your INTUITION (pattern recognition from years of leadership). You create solutions that feel right because they *are* right.",
      strength: "The complete I-Model in action"
    }
  },
  parent: {
    single: {
      intentionality: {
        response: "You've clarified that you want to support her learning, not just finish the homework. But without other modes, you might push in ways that add pressure instead of help.",
        missing: "You know your PURPOSE, but not HOW to stay ethical about the boundary or WHAT questions to ask that will actually help her think."
      },
      integrity: {
        response: "You're committed to not just taking shortcuts, even when it would be easy. But without clarity about your goal or instincts about what helps, you might not know how to actually support her.",
        missing: "You have strong values, but lack CLARITY about what you're optimizing for and INSTINCT about what real help looks like."
      },
      inquiry: {
        response: "You're asking good questions—'What does she actually need?'—but without values guardrails or instinct, you might accept an easy solution that feels like help.",
        missing: "You're exploring, but need INTEGRITY about what's acceptable and INTUITION to sense what your daughter really needs."
      },
      intuition: {
        response: "You sense that using AI to write the essay would be wrong. But without clarity on why or the ability to ask better questions, you might struggle to find real alternatives.",
        missing: "You sense the problem, but need CLARITY about your values and INQUIRY skills to find better solutions."
      }
    },
    double: {
      "inquiry+intentionality": {
        response: "You're purposeful AND curious: 'I want to support her learning. What would actually help?' You ask ChatGPT for structure suggestions instead of finished work.",
        missing: "Without INTEGRITY clarity, you might rationalize using more AI than you should. Without INTUITION, you might miss when something doesn't feel right."
      },
      "integrity+intentionality": {
        response: "Strong foundation: You know you want to support her learning AND you're committed to an honest process. You won't use shortcuts even when tempted.",
        missing: "You need the LISTENING of inquiry to know what she actually needs and the INSTINCT to guide your conversations."
      },
      "integrity+inquiry": {
        response: "You're asking thoughtful questions within ethical bounds: 'What's the real blocker? What would help without me doing it for you?'",
        missing: "Without CLARITY about your learning goals, your help might wander. Without INSTINCT, you might miss when she needs more support or less."
      },
      "inquiry+intuition": {
        response: "You're asking good questions AND sensing what feels right. When she says she's stuck, you probe to understand: stuck on structure? on thinking? on motivation?",
        missing: "Without PURPOSE clarity, your inquiry might not have direction. Without INTEGRITY, you might accept solutions that shortcut her learning."
      },
      "integrity+intuition": {
        response: "You're committed to honest help AND you sense when something would feel wrong. If AI-generated content would undermine her integrity, you feel it.",
        missing: "Without CLARITY about your learning goal or INQUIRY skills, you might say 'no' but not know what 'yes' looks like instead."
      },
      "intentionality+intuition": {
        response: "You know you're supporting her learning AND you sense what true support requires. You trust that struggling through is sometimes what she needs.",
        missing: "Without INQUIRY, you might not understand what kind of struggle—unproductive or growth-producing. Without INTEGRITY, you might not hold the line."
      }
    },
    triple: {
      "inquiry+integrity+intentionality": {
        response: "You know you want to support her learning, you're committed to an honest process, and you're asking good questions. Your approach respects her and supports real growth.",
        missing: "Without INTUITION—trusting your parental instinct about what she needs—you might over-scaffold or under-support."
      },
      "integrity+intuition+intentionality": {
        response: "You know your values, you trust your instincts as a parent, and you're clear about what you're optimizing for (her growth, not her grade). This is strong parenting.",
        missing: "Without deep INQUIRY and curiosity about what she's actually experiencing, you might be principled but miss her real needs."
      },
      "inquiry+intuition+intentionality": {
        response: "You're purposeful, curious, and trusting your parental instincts. You ask questions from a clear place about what she needs right now.",
        missing: "Without INTEGRITY—commitment to an honest process—you might cave to temptation when she's frustrated."
      },
      "integrity+inquiry+intuition": {
        response: "You're ethical, questioning, and trusting your gut. You listen to understand what she really needs, and you sense when she needs more support vs. independence.",
        missing: "Without CLARITY about your actual goal (learning, not productivity), you might be responsive but lack direction."
      }
    },
    complete: {
      response: "Full integration: You know your PURPOSE (supporting her learning and integrity), maintain INTEGRITY (not taking shortcuts even when tempted), use INQUIRY (asking questions to understand her real needs), and trust your INTUITION (parental instinct about what she needs to grow). The struggle becomes the gift.",
      strength: "The complete I-Model in action"
    }
  },
  governor: {
    single: {
      intentionality: {
        response: "You've asked 'What problem are we solving?' which is smart. But without asking whether this is the right tool or trusting your gut about the proposal, you might approve it anyway.",
        missing: "You know to ask WHAT, but not HOW to stay curious or TRUST your pattern recognition that something's off."
      },
      integrity: {
        response: "You're committed to decisions based on student benefit, not vendor promises. But without clarity about what you're actually trying to achieve or instinct about proposals like this, you might struggle to hold the line.",
        missing: "You have strong values, but lack CLARITY about what you're optimizing for and INSTINCT to recognize patterns in 'solution' pitches."
      },
      inquiry: {
        response: "You're asking good questions—'Have we talked to teachers? Have we piloted this?'—which is exactly right. But without clarity about your values or instinct, you might not know what to do with the answers.",
        missing: "You're being curious, but need INTEGRITY commitments about what criteria matter and INTUITION to interpret what you're hearing."
      },
      intuition: {
        response: "You sense something's off about the proposal—a pattern recognition from having seen similar 'solutions' before. But without asking hard questions or clarity about values, you might not have evidence to push back.",
        missing: "You sense the problem, but need CLARITY about what you're optimizing for and INQUIRY to understand what's really needed instead."
      }
    },
    double: {
      "inquiry+intentionality": {
        response: "You know what you're trying to achieve (student benefit, not board optics) AND you're asking the right questions (Have we asked teachers? Is this the right solution?). You're on solid ground.",
        missing: "Without INTEGRITY guardrails about what's acceptable, you might accept a 'good enough' answer. Without INTUITION, you might miss the real issue."
      },
      "integrity+intentionality": {
        response: "You're clear about your values (student benefit) and you're committed to ethical decision-making. You won't be swayed by impressive presentations that don't serve students.",
        missing: "You need the LISTENING of inquiry to understand what teachers and students actually need, and INSTINCT to sense when a proposal won't work."
      },
      "integrity+inquiry": {
        response: "You're asking good questions from an ethical place: 'What do teachers actually need? What will this actually do for students?' Your staff respects this rigor.",
        missing: "Without PURPOSE clarity, your inquiry might get distracted. Without INTUITION, you might not sense the real problem underneath surface requests."
      },
      "inquiry+intuition": {
        response: "You're asking thoughtful questions AND trusting your gut about what's off. This combination helps you see through polished presentations to real needs.",
        missing: "Without CLARITY about student benefit and INTEGRITY commitments, you might sense something's wrong but not know why or what to do."
      },
      "integrity+intuition": {
        response: "You trust your instincts that this proposal doesn't align with student benefit, and you're willing to say no even though it looks good on paper.",
        missing: "Without INQUIRY—deep understanding of alternatives—you might be right about the 'no' but lack the 'yes' to propose instead."
      },
      "intentionality+intuition": {
        response: "You know what you're optimizing for (actual student learning, not cutting-edge appearance) AND you trust your pattern recognition about solutions like this. You're hard to fool.",
        missing: "Without INQUIRY and INTEGRITY rigor, you might be right intuitively but lack evidence to convince others of your reasoning."
      }
    },
    triple: {
      "inquiry+integrity+intentionality": {
        response: "You're clear about purpose, you're asking rigorous questions, and you're committed to decisions based on actual student benefit. Your governance is strong.",
        missing: "Without INTUITION—that seasoned pattern recognition—you might ask all the right questions but not trust your gut about the answer."
      },
      "integrity+intuition+intentionality": {
        response: "You know your values, you trust your experience-based instincts, and you're clear about what you're optimizing for. You make strong, principled decisions even under pressure.",
        missing: "Without INQUIRY and deep listening, you might be confident in the wrong direction despite good intentions."
      },
      "inquiry+intuition+intentionality": {
        response: "You're purposeful, curious, and trusting your gut. You ask hard questions from a clear place and your instincts guide your skepticism.",
        missing: "Without INTEGRITY—commitment to student benefit above all else—you might be swayed by factors other than what's best."
      },
      "integrity+inquiry+intuition": {
        response: "You're ethical, questioning, and intuitive. You listen deeply, you sense what's real, and you hold firm to what serves students.",
        missing: "Without CLARITY and INTENTIONALITY, you might be right about rejecting this proposal but lack vision for what's better."
      }
    },
    complete: {
      response: "Full integration: You know your PURPOSE (actual student learning and teacher support), maintain INTEGRITY (rejecting impressive-looking solutions that don't serve students), use INQUIRY (asking hard questions before approving), and trust your INTUITION (pattern recognition that this won't work). You redirect resources to what matters.",
      strength: "The complete I-Model in action"
    }
  }
};

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

type RevealType = 'feelsLike' | 'questionsToAsk' | 'whenYouUseIt' | null;
type ScenarioRevealType = 'withoutThisI' | 'theQuestion' | 'withThisI' | null;

export default function IModelExplainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 400, height: 300 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<Position | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [nearLock, setNearLock] = useState<boolean>(false);
  const [activeReveal, setActiveReveal] = useState<RevealType | ScenarioRevealType>(null);
  const [viewMode, setViewMode] = useState<'explainer' | 'scenario'>('explainer');
  const [currentScenario, setCurrentScenario] = useState<string>('teacher');
  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [showQuestions, setShowQuestions] = useState<boolean>(false);

  // Get current content based on view mode
  const currentContent = viewMode === 'scenario' ? scenarios[currentScenario].modes : explanations;
  const currentTitle = viewMode === 'scenario' ? scenarios[currentScenario].title : 'The I-Model';

  // Get layered content for scenario mode based on active modes
  const getLayeredContent = (): LayeredContent | null => {
    if (viewMode !== 'scenario' || activeModes.length === 0) return null;

    const content = scenarioLayeredContent[currentScenario];

    if (activeModes.length === 1) {
      const mode = activeModes[0].toLowerCase();
      return {
        type: 'single',
        ...content.single[mode]
      };
    }

    if (activeModes.length === 2) {
      const key = activeModes.map((m: string) => m.toLowerCase()).sort().join('+');
      return {
        type: 'double',
        ...content.double[key]
      };
    }

    if (activeModes.length === 3) {
      const key = activeModes.map((m: string) => m.toLowerCase()).sort().join('+');
      return {
        type: 'triple',
        ...content.triple[key]
      };
    }

    if (activeModes.length === 4) {
      return {
        type: 'complete',
        ...content.complete
      };
    }

    return null;
  };

  const layeredContent = getLayeredContent();

  // Layout constants
  const webCenterX = dimensions.width - 150;
  const webCenterY = dimensions.height / 2;
  const radius = 90;
  const lockZone = { x: dimensions.width * 0.50, y: dimensions.height / 2 };
  const lockRadius = 60;
  const revealDetectionRadius = 110;

  const getRevealZones = () => {
    // Three bubbles vertically separated: Without This I (top), The Question (middle), With This I (bottom)
    const spacing = 120; // vertical spacing between bubbles
    const topBubbleY = webCenterY - spacing - 40;
    const middleBubbleY = webCenterY - 40;
    const bottomBubbleY = webCenterY + spacing - 40;

    if (viewMode === 'scenario') {
      return [
        { id: 'withoutThisI' as const, label: 'Without This I-Mode', y: topBubbleY, x: lockZone.x - 140 },
        { id: 'theQuestion' as const, label: 'The Question', y: middleBubbleY, x: lockZone.x - 140 },
        { id: 'withThisI' as const, label: 'With This I-Mode', y: bottomBubbleY, x: lockZone.x - 140 }
      ];
    }
    return [
      { id: 'feelsLike' as const, label: 'Feels Like', y: topBubbleY, x: lockZone.x - 140 },
      { id: 'questionsToAsk' as const, label: 'Questions to Ask', y: middleBubbleY, x: lockZone.x - 140 },
      { id: 'whenYouUseIt' as const, label: 'When You Use It', y: bottomBubbleY, x: lockZone.x - 140 }
    ];
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    const timeout = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timeout);
    };
  }, []);

  // Reset showQuestions when locked mode changes
  useEffect(() => {
    setShowQuestions(false);
  }, [locked]);

  const getRestPositions = (): Record<string, Position> => {
    const positions: Record<string, Position> = {};
    const angleOffset = -Math.PI / 2;
    labels.forEach((label, i) => {
      const angle = angleOffset + (i * Math.PI * 2) / 4;
      positions[label] = {
        x: webCenterX + Math.cos(angle) * radius,
        y: webCenterY + Math.sin(angle) * radius
      };
    });
    return positions;
  };

  const getTargetPositions = (leadLabel: string) => {
    const leadIndex = labels.indexOf(leadLabel);
    const oppositeIndex = (leadIndex + 2) % 4;
    const oppositeLabel = labels[oppositeIndex];
    const neighborIndices = [0, 1, 2, 3].filter(i => i !== leadIndex && i !== oppositeIndex);
    const getYScore = (i: number) => {
        if (i === 0) return -1;
        if (i === 2) return 1;
        return 0;
    };
    neighborIndices.sort((a, b) => getYScore(a) - getYScore(b));
    const neighbor1Label = labels[neighborIndices[0]];
    const neighbor2Label = labels[neighborIndices[1]];

    return {
      [leadLabel]: { x: lockZone.x, y: lockZone.y },
      [oppositeLabel]: { x: lockZone.x + 350, y: lockZone.y },
      [neighbor1Label]: { x: lockZone.x + 250, y: lockZone.y - 120 },
      [neighbor2Label]: { x: lockZone.x + 250, y: lockZone.y + 120 }
    };
  };

  const getPositions = (): Record<string, Position> => {
    const rest = getRestPositions();
    if (locked) {
      const lockedPositions = getTargetPositions(locked);
      if (dragging === locked && dragPos) {
        lockedPositions[locked] = dragPos;
      } else {
        lockedPositions[locked] = { x: lockZone.x, y: lockZone.y };
      }
      return lockedPositions;
    }
    if (dragging && dragPos) {
      const positions = { ...rest };
      positions[dragging] = dragPos;
      const dx = dragPos.x - lockZone.x;
      const dy = dragPos.y - lockZone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < lockRadius * 3.5) {
        const targets = getTargetPositions(dragging);
        const t = Math.max(0, 1 - dist / (lockRadius * 3.5));
        labels.forEach(label => {
          if (label === dragging) return;
          const start = rest[label];
          const end = targets[label];
          positions[label] = {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t
          };
        });
      }
      return positions;
    }
    return rest;
  };

  const positions = getPositions();

  const handlePointerDown = (label: string, e: React.PointerEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragging(label);
      setDragPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPos = {
      x: Math.max(45, Math.min(dimensions.width - 45, e.clientX - rect.left)),
      y: Math.max(45, Math.min(dimensions.height - 45, e.clientY - rect.top))
    };
    setDragPos(newPos);
    
    const dx = newPos.x - lockZone.x;
    const dy = newPos.y - lockZone.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    setNearLock(dist < lockRadius * 1.8);

    if (locked && dragging === locked) {
      let foundZone: RevealType | ScenarioRevealType = null;
      getRevealZones().forEach(zone => {
        const zdx = newPos.x - zone.x;
        const zdy = newPos.y - zone.y;
        const zdist = Math.sqrt(zdx * zdx + zdy * zdy);
        if (zdist < revealDetectionRadius) foundZone = zone.id;
      });

      if (foundZone) {
        setActiveReveal(foundZone);
      } else if (activeReveal) {
        const currentZone = getRevealZones().find(z => z.id === activeReveal);
        if (currentZone) {
          const czdx = newPos.x - currentZone.x;
          const czdy = newPos.y - currentZone.y;
          const czdist = Math.sqrt(czdx * czdx + czdy * czdy);
          if (czdist > revealDetectionRadius * 1.5) {
            setActiveReveal(null);
          }
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragging) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      if (dragPos) {
        const dx = dragPos.x - lockZone.x;
        const dy = dragPos.y - lockZone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Check if dropped on a reveal zone
        let droppedZoneId: RevealType | ScenarioRevealType = null;
        getRevealZones().forEach(zone => {
          const zdx = dragPos.x - zone.x;
          const zdy = dragPos.y - zone.y;
          const zdist = Math.sqrt(zdx * zdx + zdy * zdy);
          if (zdist < revealDetectionRadius) droppedZoneId = zone.id;
        });

        // Single-lock model: drag mode to center or to a reveal zone
        if (dist < lockRadius * 1.5 || droppedZoneId) {
          setLocked(dragging);
          setActiveReveal(droppedZoneId || null);
          setActiveModes([]); // Clear accumulation, use locked instead
        } else if (locked && dragging === locked) {
          // If dragging the locked mode away
          if (dist > lockRadius * 3 || dragPos.x > lockZone.x + 200) {
            setLocked(null);
            setActiveReveal(null);
          } else {
            setActiveReveal(null);
          }
        }
      }
    }
    setDragging(null);
    setDragPos(null);
    setNearLock(false);
  };

  const connections: [string, string][] = [];
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      connections.push([labels[i], labels[j]]);
    }
  }

  const getLineStyle = (a: string, b: string) => {
    const isActive = dragging && (a === dragging || b === dragging);
    const isLocked = locked && (a === locked || b === locked);
    const currentColor = dragging ? colors[dragging] : (locked ? colors[locked] : '#475569');
    
    return {
      stroke: isActive || isLocked ? currentColor : '#475569',
      strokeWidth: isActive || isLocked ? 2 : 1,
      opacity: isActive || isLocked ? 0.8 : 0.25,
    };
  };

  const transition = dragging ? 'none' : 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e1b4b)' }}>
      {/* Left-aligned heading and right-aligned instructions in explainer mode */}
      {viewMode !== 'scenario' && (
        <>
          <div className="absolute bottom-0 left-6 z-30 pointer-events-none">
            <h1 className="text-lg font-thin tracking-[0.5em] text-white/60 uppercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '0.5em' }}>The I-Model</h1>
          </div>
          <div className="absolute bottom-0 right-6 z-30 pointer-events-none">
            <p className="text-lg font-thin tracking-[0.1em] text-white/60 lowercase" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '0.1em' }}>drag a mode into the explore button to understand more about it</p>
          </div>
        </>
      )}

      {/* Scenario Tabs - Bottom Left and Right - Letter Only */}
      {viewMode === 'scenario' && (
        <>
          <div className="absolute bottom-6 left-6 z-30 flex gap-3 pointer-events-auto">
            {[
              { id: 'teacher', label: 'T' },
              { id: 'principal', label: 'P' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setCurrentScenario(role.id as string);
                  setLocked(null);
                  setActiveReveal(null);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-light transition-all duration-300 backdrop-blur-sm ${
                  currentScenario === role.id
                    ? 'shadow-lg scale-110'
                    : 'opacity-50 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: currentScenario === role.id ? 'rgba(168, 85, 247, 0.4)' : 'rgba(100, 116, 139, 0.15)',
                  border: currentScenario === role.id ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
                  color: currentScenario === role.id ? '#a855f7' : 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.05em'
                }}
              >
                {role.label}
              </button>
            ))}
          </div>

          <div className="absolute bottom-6 right-6 z-30 flex gap-3 pointer-events-auto">
            {[
              { id: 'parent', label: 'Pa' },
              { id: 'governor', label: 'G' }
            ].map(role => (
              <button
                key={role.id}
                onClick={() => {
                  setCurrentScenario(role.id as string);
                  setLocked(null);
                  setActiveReveal(null);
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-light transition-all duration-300 backdrop-blur-sm ${
                  currentScenario === role.id
                    ? 'shadow-lg scale-110'
                    : 'opacity-50 hover:opacity-75'
                }`}
                style={{
                  backgroundColor: currentScenario === role.id ? 'rgba(168, 85, 247, 0.4)' : 'rgba(100, 116, 139, 0.15)',
                  border: currentScenario === role.id ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.15)',
                  color: currentScenario === role.id ? '#a855f7' : 'rgba(255,255,255,0.5)',
                  letterSpacing: '0.05em'
                }}
              >
                {role.label}
              </button>
            ))}
          </div>
        </>
      )}

      <div
        ref={containerRef}
        className="flex-1 relative select-none touch-none mx-4 min-h-[400px]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className="absolute pointer-events-none"
          style={{ left: lockZone.x, top: lockZone.y, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 160, height: 160, left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
              background: locked 
                ? (nearLock && dragging === locked) || !dragging
                    ? `radial-gradient(circle, ${colors[locked]}35 0%, transparent 65%)`
                    : 'transparent'
                : nearLock && dragging
                    ? `radial-gradient(circle, ${colors[dragging]}30 0%, transparent 65%)`
                    : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 65%)',
              transition: 'all 0.3s ease',
              opacity: locked && dragging === locked && !nearLock ? 0.2 : 1
            }}
          />
          {!locked && (
            <div className="absolute rounded-full flex items-center justify-center" 
                 style={{ width: 100, height: 100, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', border: '1.5px solid rgba(255,255,255,0.1)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Explore</span>
            </div>
          )}
        </div>

        {/* Floating Reveal Box */}
        {locked && activeReveal && (
          <div
            className="absolute z-50 pointer-events-none animate-revealFloating"
            style={{
              left: lockZone.x - 420,
              top: lockZone.y,
              transform: 'translate(-50%, -50%)',
              width: '420px'
            }}
          >
            <div
              className="rounded-xl p-8 backdrop-blur-lg shadow-2xl"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: `1px solid ${colors[locked]}60`,
                boxShadow: `0 15px 50px -15px ${colors[locked]}40`
              }}
            >
              <h3
                className="text-xs uppercase tracking-[0.6em] font-thin mb-4"
                style={{ color: colors[locked], fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '0.6em' }}
              >
                {viewMode === 'scenario'
                  ? (activeReveal === 'withoutThisI' ? 'Without This I-Mode' : activeReveal === 'theQuestion' ? 'The Question' : 'With This I-Mode')
                  : (activeReveal === 'feelsLike' ? 'Feels Like' : activeReveal === 'questionsToAsk' ? 'Questions to Ask' : 'When You Use It')
                }
              </h3>
              {activeReveal === 'questionsToAsk' && viewMode === 'explainer' ? (
                <ul className="text-2xl leading-relaxed text-slate-50 font-extralight space-y-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {explanations[locked].coreQuestions.map((question, index) => (
                    <li key={index} className="list-disc list-inside">
                      {question}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-2xl leading-relaxed text-slate-50 font-extralight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {currentContent[locked][activeReveal]}
                </p>
              )}
            </div>
          </div>
        )}

        {locked && (
          <div className="absolute" style={{ left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {getRevealZones().map((zone) => {
              const isActive = activeReveal === zone.id;
              // Show eye indicator for first and third bubbles in scenario mode
              const showEye = viewMode === 'scenario' && (zone.id === 'withoutThisI' || zone.id === 'withThisI');
              return (
                <div
                  key={zone.id}
                  className="absolute flex flex-col items-center justify-center"
                  style={{ left: zone.x, top: zone.y, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-28 h-28 rounded-full border border-dashed flex items-center justify-center transition-all duration-300 relative"
                    style={{
                      borderColor: isActive ? colors[locked] : 'rgba(255,255,255,0.1)',
                      backgroundColor: isActive ? `${colors[locked]}25` : 'transparent',
                      boxShadow: isActive ? `0 0 35px ${colors[locked]}50` : 'none',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="text-[10px] uppercase font-black text-center px-2 transition-all duration-300"
                      style={{
                        color: isActive ? colors[locked] : 'rgba(255,255,255,0.3)',
                        textShadow: isActive ? `0 0 10px ${colors[locked]}80` : 'none'
                      }}
                    >
                      {zone.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
          {connections.map(([a, b], idx) => {
            if (!positions[a] || !positions[b]) return null;
            const style = getLineStyle(a, b);
            return (
              <line
                key={idx}
                x1={positions[a].x}
                y1={positions[a].y}
                x2={positions[b].x}
                y2={positions[b].y}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                opacity={style.opacity}
                style={{ transition }}
              />
            );
          })}
        </svg>

        {labels.map((label) => {
          const pos = positions[label];
          if (!pos) return null;
          const isLead = locked === label;
          const isDragging = dragging === label;
          return (
            <div
              key={label}
              onPointerDown={(e) => handlePointerDown(label, e)}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : transition,
                zIndex: isDragging || isLead ? 20 : 1,
                cursor: 'grab',
              }}
            >
              <div
                className="rounded-full flex items-center justify-center text-white font-bold select-none"
                style={{
                  width: isLead ? 72 : 56, height: isLead ? 72 : 56,
                  fontSize: isLead ? 24 : 18, backgroundColor: colors[label],
                  boxShadow: `0 0 ${isLead ? 40 : 20}px ${colors[label]}${isLead ? '70' : '50'}`,
                  transition: 'all 0.2s ease', fontFamily: 'Georgia, serif',
                }}
              >
                I
              </div>
              <span className="mt-2 text-xs font-medium tracking-wide text-slate-400 opacity-80">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Info Panel */}
      <div className="px-4 pb-12 shrink-0 relative z-20 min-h-[200px] flex flex-col justify-end">
        {viewMode === 'scenario' ? (
          <div
            className="rounded-xl animate-fadeIn w-full max-w-4xl mx-auto backdrop-blur-md"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid #a855f740`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px #a855f710`,
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '48px',
            }}
          >
            <p className="text-3xl leading-relaxed text-slate-50 font-extralight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontStyle: 'italic' }}>
              {scenarios[currentScenario].description}
            </p>
          </div>
        ) : locked ? (
          <div
            className="rounded-xl p-10 animate-fadeIn w-full max-w-3xl mx-auto backdrop-blur-md"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${colors[locked]}40`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px ${colors[locked]}10`,
            }}
          >
            <div className="flex items-center gap-3 mb-6 transition-all duration-300">
              <div className="w-3 h-10 rounded-full" style={{ backgroundColor: colors[locked] }} />
              <h2 className="text-3xl font-semibold tracking-[0.3em] uppercase" style={{ color: colors[locked], fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', letterSpacing: '0.3em' }}>{locked}</h2>
            </div>

            <div className="flex flex-col justify-center">
              <div key="definition" className="animate-revealText">
                <p className="text-2xl leading-relaxed text-slate-50 font-extralight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
                  {(currentContent[locked] as any).definition}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* View Mode Toggle Button */}
      <button
        onClick={() => {
          setViewMode(viewMode === 'explainer' ? 'scenario' : 'explainer');
          setLocked(null);
          setActiveReveal(null);
          setDragging(null);
          setDragPos(null);
          setActiveModes([]);
        }}
        className="absolute top-8 left-8 z-40 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          width: 50,
          height: 50,
          backgroundColor: '#a855f7',
          boxShadow: `0 0 25px #a855f730`,
          cursor: 'pointer'
        }}
        title={viewMode === 'explainer' ? 'Open Scenario' : 'Back to Explainer'}
      >
        <span className="text-white font-bold text-2xl">⚙</span>
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes revealText {
          from { opacity: 0; transform: translateX(-15px); filter: blur(6px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes revealFloating {
          from { opacity: 0; transform: translate(-45%, -50%) scale(0.95); filter: blur(4px); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); filter: blur(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
        .animate-revealText { animation: revealText 0.3s ease-out forwards; }
        .animate-revealFloating { animation: revealFloating 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
}