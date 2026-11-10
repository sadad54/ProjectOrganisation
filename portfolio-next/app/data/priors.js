/* ∇ Backward pass — the personal side of the site: what shaped the person
   the rest of the page describes. The section, the footer line and the
   "Ask the model" assistant all read from here.

   REVIEW: the `line` and `says` sentences below are written in Adnan's
   voice but were drafted for him. They are statements about what he thinks,
   so he should read each one and rewrite anything that isn't true to him.

   Facts that can be checked are kept checkable: publication years, the
   named source of each idea, and the arithmetic (computed in the component,
   never typed in). No quotation marks are used unless the words are the
   author's own. */

/* Act A — one idea, said twice: once about a brain, once about a model. */
export const PAIRS = [
  {
    human: 'Neuroplasticity',
    verb: 'is',
    machine: 'fine-tuning',
    line: 'A brain is never finished. What you practise gets wired in and what you stop using fades, which is the kindest fact I know about being a person. A model learns the same way: its weights move toward whatever it is shown most.',
    src: 'the premise of everything below',
  },
  {
    human: 'Habits',
    verb: 'are',
    machine: 'gradient descent',
    line: 'Nobody rewrites themselves in one step. You take a small step in the direction that reduces the error, then you take it again tomorrow. Training is just that, done a few million times.',
    src: 'Atomic Habits · James Clear, 2018',
  },
  {
    human: 'Self-image',
    verb: 'is',
    machine: 'the objective function',
    line: 'You steer toward the person you believe you are. Maltz borrowed the idea from cybernetics, the study of goal-seeking machines, and those machines are the ancestors of the models I work on. Choose the target badly and all the effort lands in the wrong place.',
    src: 'Psycho-Cybernetics · Maxwell Maltz, 1960',
  },
  {
    human: 'The subconscious',
    verb: 'is',
    machine: 'latent space',
    line: 'Most of what drives a decision was never written down as a rule. It sits underneath, learned from repetition, and you only see it in what comes out. A model keeps its knowledge the same way, in a hidden layer nobody typed in.',
    src: 'The Power of Your Subconscious Mind · Joseph Murphy, 1963',
  },
  {
    human: 'Self-accounting',
    verb: 'is',
    machine: 'the eval harness',
    line: 'Al-Ghazali wrote about muhasaba: at the end of the day, call yourself to account for it. Marcus Aurelius kept a private notebook for the same reason. It is the oldest version of the thing this whole site argues for: a number that says whether you got better.',
    src: 'Ihya’ ʿUlum al-Din, Book 38 · Meditations',
  },
];

/* Act C — the training corpus. `k` is the mono tag: the weight it updated. */
export const CORPUS = [
  {
    group: 'Books',
    items: [
      {
        name: 'Psycho-Cybernetics',
        by: 'Maxwell Maltz · 1960',
        k: 'objective',
        says: 'The book that made me treat my own goals as a control problem: set the target, watch the error, correct.',
      },
      {
        name: 'The Power of Your Subconscious Mind',
        by: 'Joseph Murphy · 1963',
        k: 'latent space',
        says: 'What you repeat is what gets stored. I became careful about what I repeat.',
      },
      {
        name: 'Atomic Habits',
        by: 'James Clear · 2018',
        k: 'learning rate',
        says: 'Small updates applied every day beat one heroic rewrite. It is the only training schedule I have seen work.',
      },
    ],
  },
  {
    group: 'Thinkers',
    items: [
      {
        name: 'Imam al-Ghazali',
        by: 'Ihya’ ʿUlum al-Din',
        k: 'evaluation',
        says: 'Knowing something and acting on it are different skills. He is the reason I measure the second one.',
      },
      {
        name: 'Rumi',
        by: 'Masnavi, Book I',
        k: 'denoising',
        says: 'In his story of the two groups of painters, the winners paint nothing. They polish their wall until it reflects. Taking the noise away is also a way of making something.',
      },
      {
        name: 'Marcus Aurelius',
        by: 'Meditations',
        k: 'logging',
        says: 'A private notebook, never meant for readers: an emperor debugging himself in writing, one entry at a time.',
      },
      {
        name: 'Naval Ravikant',
        by: 'How to Get Rich, 2018',
        k: 'compounding',
        says: 'Long-term games with long-term people. The curve is the same whether it is skill, trust or money.',
      },
      {
        name: 'Nero Knowledge',
        by: 'YouTube',
        k: 'discipline',
        says: 'The channel that got me reading about discipline and the psychology under it in the first place.',
      },
    ],
  },
  {
    group: 'Off the clock',
    items: [
      {
        name: 'Vincent van Gogh',
        by: 'The Starry Night · 1889',
        k: 'this sky',
        says: 'He painted the night the way it felt instead of the way it measured. The sky turning behind these cards is my attempt at his brushwork, in particles.',
      },
      {
        name: 'Real Madrid',
        by: 'Football',
        k: 'known bias',
        says: 'It is not over at ninety minutes. I have watched that be true too many times to stop believing it.',
      },
      {
        name: 'Ezio & Altaïr · Ragnar · Jax Teller',
        by: 'Assassin’s Creed · Vikings · Sons of Anarchy',
        k: 'fiction',
        says: 'Characters who live by a code and pay what it costs. I notice I only like the ones who keep learning.',
      },
    ],
  },
];

/* The footer's rotating credit. */
export const UPDATED_BY = ['Atomic Habits', 'Meditations', 'Psycho-Cybernetics', 'the Masnavi', 'The Starry Night', 'a late Madrid winner'];
