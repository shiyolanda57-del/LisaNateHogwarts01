const INITIAL_STATE = {
  house: null,
  bloodStatus: null,

  affection: {
    lisa: 0,
    nate: 0,
  },

  peakAffection: {
    lisa: 0,
    nate: 0,
  },

  choices: {
    lisaFirstImpression: null,
    lisaIntervened: null,
    lisaInterventionStyle: null,

    satWithNate: null,
    nateFirstApproach: null,
  },
};

let state = structuredClone(INITIAL_STATE);

const sceneTitle = document.querySelector("#scene-title");
const storyBox = document.querySelector("#story-box");
const choicesBox = document.querySelector("#choices-box");

const statusHouse = document.querySelector("#status-house");
const statusBlood = document.querySelector("#status-blood");
const statusLisa = document.querySelector("#status-lisa");
const statusNate = document.querySelector("#status-nate");
const debugState = document.querySelector("#debug-state");

const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modal-title");
const modalText = document.querySelector("#modal-text");
const modalClose = document.querySelector("#modal-close");

document.querySelector("#reset-button").addEventListener("click", () => {
  state = structuredClone(INITIAL_STATE);
  renderScene("houseSelection");
});

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

function addAffection(character, amount) {
  state.affection[character] += amount;
  state.peakAffection[character] = Math.max(
    state.peakAffection[character],
    state.affection[character]
  );
}

function updateStatus() {
  const houseMap = {
    gryffindor: "格兰芬多",
    ravenclaw: "拉文克劳",
    hufflepuff: "赫奇帕奇",
    slytherin: "斯莱特林",
  };

  const bloodMap = {
    pureblood: "纯血家族",
    muggleborn: "麻瓜出身",
  };

  statusHouse.textContent = state.house ? houseMap[state.house] : "未选择";
  statusBlood.textContent = state.bloodStatus ? bloodMap[state.bloodStatus] : "未确定";
  statusLisa.textContent = state.affection.lisa;
  statusNate.textContent = state.affection.nate;
  debugState.textContent = JSON.stringify(state, null, 2);
}

function showModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.classList.remove("hidden");
}

function makeChoiceButton(choice) {
  const button = document.createElement("button");
  button.className = "choice-button";
  button.type = "button";

  const label = document.createElement("span");
  label.textContent = choice.text;
  button.appendChild(label);

  if (choice.meta) {
    const meta = document.createElement("span");
    meta.className = "choice-meta";
    meta.textContent = choice.meta;
    button.appendChild(meta);
  }

  button.addEventListener("click", () => {
    if (choice.action) choice.action();
    if (choice.next) renderScene(choice.next);
  });

  return button;
}

function renderScene(sceneId) {
  const scene = scenes[sceneId];

  if (!scene) {
    console.error(`未找到场景：${sceneId}`);
    return;
  }

  sceneTitle.textContent = scene.title;
  storyBox.innerHTML = "";

  scene.paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    if (text.startsWith("【")) p.classList.add("system-note");
    storyBox.appendChild(p);
  });

  choicesBox.innerHTML = "";
  scene.choices().forEach((choice) => {
    choicesBox.appendChild(makeChoiceButton(choice));
  });

  updateStatus();
}

const scenes = {
  houseSelection: {
    title: "第一步：选择你的学院",
    paragraphs: [
      "仍需填入霍格沃茨开场与分院前场景描写。",
      "仍需填入四个学院各自更完整的介绍。当前只有格兰芬多路线已开放。",
    ],
    choices: () => [
      {
        text: "A. 格兰芬多",
        meta: "当前已开放路线",
        action: () => {
          state.house = "gryffindor";
        },
        next: "gryffindorIntro",
      },
      {
        text: "B. 拉文克劳",
        meta: "仍需填入拉文克劳路线",
        action: () => showModal("正在续写中...", "拉文克劳路线正在续写中..."),
      },
      {
        text: "C. 赫奇帕奇",
        meta: "仍需填入赫奇帕奇路线",
        action: () => showModal("正在续写中...", "赫奇帕奇路线正在续写中..."),
      },
      {
        text: "D. 斯莱特林",
        meta: "仍需填入斯莱特林路线",
        action: () => showModal("正在续写中...", "斯莱特林路线正在续写中..."),
      },
    ],
  },

  gryffindorIntro: {
    title: "格兰芬多",
    paragraphs: [
      "仍需填入格兰芬多学院生活开场场景描写。",
      "接下来，你会先在公共休息室注意到 Lisa Rowe。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "lisaCommonRoom",
      },
    ],
  },

  lisaCommonRoom: {
    title: "公共休息室 · Lisa",
    paragraphs: [
      "仍需填入：你第一次在格兰芬多公共休息室真正注意到 Lisa Rowe 的场景描写。",
      "仍需填入：Lisa 在众人面前展现出压倒性魅力，同时带有仗势欺人 / 残酷意味的具体事件。",
      "仍需填入：被她发难的人、周围人的反应、Lisa 的具体言行。",
      "你看着她。你觉得——",
    ],
    choices: () => [
      {
        text: "A. 有些吓人，但反而很有魅力。",
        meta: "Lisa 好感 +20",
        action: () => {
          state.choices.lisaFirstImpression = "intimidating_but_attractive";
          addAffection("lisa", 20);
        },
        next: "lisaInterveneChoice",
      },
      {
        text: "B. 太好了，很好，如果和她一起玩一定很开心。",
        meta: "Lisa 好感 +30",
        action: () => {
          state.choices.lisaFirstImpression = "looks_fun";
          addAffection("lisa", 30);
        },
        next: "lisaInterveneChoice",
      },
      {
        text: "C. 这样做不太对，我要阻止她。",
        meta: "Lisa 好感 +0",
        action: () => {
          state.choices.lisaFirstImpression = "this_is_wrong";
        },
        next: "lisaInterveneChoice",
      },
    ],
  },

  lisaInterveneChoice: {
    title: "公共休息室 · 是否干预",
    paragraphs: [
      "仍需填入：Lisa 对那个人的发难继续发展的场景描写。",
      "你现在可以选择是否干预。",
    ],
    choices: () => [
      {
        text: "A. 不干预。",
        meta: "无事发生；当天结束",
        action: () => {
          state.choices.lisaIntervened = false;
        },
        next: "lisaDayEnds",
      },
      {
        text: "B. 干预。",
        meta: "进入三种不同干预方式",
        action: () => {
          state.choices.lisaIntervened = true;
        },
        next: "lisaInterventionStyle",
      },
    ],
  },

  lisaInterventionStyle: {
    title: "公共休息室 · 你怎么做",
    paragraphs: [
      "仍需填入：你决定插手前的短暂场景描写。",
    ],
    choices: () => [
      {
        text: "A. 委婉地处理，没有驳她的面子，但救下了那个被发难的人。",
        meta: "Lisa 好感 +30",
        action: () => {
          state.choices.lisaInterventionStyle = "diplomatic";
          addAffection("lisa", 30);
        },
        next: "lisaReactionDiplomatic",
      },
      {
        text: "B. 加入她，给她提供助力的小知识。",
        meta: "Lisa 好感 +30",
        action: () => {
          state.choices.lisaInterventionStyle = "join";
          addAffection("lisa", 30);
        },
        next: "lisaReactionJoin",
      },
      {
        text: "C. 直接站起来说你不能这样，把被发难的人护到身后。",
        meta: "Lisa 好感 +30",
        action: () => {
          state.choices.lisaInterventionStyle = "confront";
          addAffection("lisa", 30);
        },
        next: "lisaReactionConfront",
      },
    ],
  },

  lisaReactionDiplomatic: {
    title: "Lisa 的反应",
    paragraphs: [
      "仍需填入：当你委婉处理、既没有当众驳 Lisa 面子，又救下对方时，Lisa 的专属反应。",
      "仍需填入：你们因此正式认识 / 不打不相识的收束场景。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "afterLisaMeeting",
      },
    ],
  },

  lisaReactionJoin: {
    title: "Lisa 的反应",
    paragraphs: [
      "仍需填入：当你加入 Lisa，并用小知识给她提供助力时，Lisa 的专属反应。",
      "仍需填入：你们因此正式认识的收束场景。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "afterLisaMeeting",
      },
    ],
  },

  lisaReactionConfront: {
    title: "Lisa 的反应",
    paragraphs: [
      "仍需填入：当你直接站出来阻止 Lisa、把被发难的人护到身后时，Lisa 的专属反应。",
      "仍需填入：你们因此不打不相识、正式认识的收束场景。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "afterLisaMeeting",
      },
    ],
  },

  lisaDayEnds: {
    title: "这一天过去了",
    paragraphs: [
      "仍需填入：你没有干预之后，这一天如何自然结束的场景描写。",
      "你已经注意到了 Lisa，但这一次没有进一步插手。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "afterLisaMeeting",
      },
    ],
  },

  afterLisaMeeting: {
    title: "之后",
    paragraphs: [
      "仍需填入：从 Lisa 初遇过渡到之后与拉文克劳共同课程的时间推进。",
      "无论你之前以怎样的方式靠近她，你已经知道 Lisa 是谁了。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "nateClassIntro",
      },
    ],
  },

  nateClassIntro: {
    title: "格兰芬多 × 拉文克劳共课",
    paragraphs: [
      "仍需填入：这门格兰芬多与拉文克劳共同课程的场景描写。",
      "仍需填入：你第一次看见 Nate Luo 时，她本身的魅力给你留下的第一印象。",
      "真正让你后来着迷的，会是她身上的反差，以及她对你的好。",
      "现在，你可以决定要不要坐到她旁边。",
    ],
    choices: () => [
      {
        text: "A. 坐到她旁边。",
        meta: "Nate 好感 +30",
        action: () => {
          state.choices.satWithNate = true;
          addAffection("nate", 30);
        },
        next: "nateApproach",
      },
      {
        text: "B. 不坐她旁边。",
        meta: "无事发生",
        action: () => {
          state.choices.satWithNate = false;
        },
        next: "nateNoSit",
      },
    ],
  },

  nateNoSit: {
    title: "你没有坐过去",
    paragraphs: [
      "仍需填入：你没有坐到 Nate 旁边后，这节课如何自然继续。",
      "这一次，没有进一步的接近发生。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "trioScene",
      },
    ],
  },

  nateApproach: {
    title: "你坐到了 Nate 身边",
    paragraphs: [
      "仍需填入：你坐到 Nate 旁边时，她的第一反应。",
      "接下来，你决定怎样和她搭话。",
    ],
    choices: () => [
      {
        text: "A. 直接开口，靠自己的主动与谈吐接近她。",
        meta: "Nate 好感 +30；血统背景暂不锁定",
        action: () => {
          state.choices.nateFirstApproach = "direct_charm";
          addAffection("nate", 30);
        },
        next: "nateReactionDirect",
      },
      {
        text: "B. 提到自己也是纯血家族，以此和她攀谈。",
        meta: "Nate 好感 +20；选择后，本局以纯血家族巫师背景游玩",
        action: () => {
          state.choices.nateFirstApproach = "pureblood_topic";
          state.bloodStatus = "pureblood";
          addAffection("nate", 20);
        },
        next: "nateReactionPureblood",
      },
      {
        text: "C. 作为麻瓜出身的巫师，问她一些你不了解的事情，让她给你解答。",
        meta: "Nate 好感 +25；选择后，本局以麻瓜出身巫师背景游玩",
        action: () => {
          state.choices.nateFirstApproach = "ask_for_help";
          state.bloodStatus = "muggleborn";
          addAffection("nate", 25);
        },
        next: "nateReactionMuggleborn",
      },
    ],
  },

  nateReactionDirect: {
    title: "Nate 的反应",
    paragraphs: [
      "仍需填入：你直接搭话、靠主动和谈吐接近 Nate 时，她的专属反应。",
      "仍需填入：她抵抗不住主动的人这一点，在具体互动中的表现。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "trioScene",
      },
    ],
  },

  nateReactionPureblood: {
    title: "Nate 的反应",
    paragraphs: [
      "仍需填入：你以同为纯血家族为切入口和 Nate 攀谈时，她的专属反应。",
      "仍需填入：你们确实有共同话题，但她第一反应里也有一点“原来你是这样的人啊”的无趣感。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "trioScene",
      },
    ],
  },

  nateReactionMuggleborn: {
    title: "Nate 的反应",
    paragraphs: [
      "仍需填入：你作为麻瓜出身的巫师向 Nate 请教魔法世界知识时，她的专属反应。",
      "仍需填入：她喜欢能够帮到别人的感觉，在具体互动中的表现。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "trioScene",
      },
    ],
  },

  trioScene: {
    title: "三个人",
    paragraphs: [
      "仍需填入：课程继续后的场景描写。",
      "Lisa 就坐在 Nate 的另一边。",
      "仍需填入：你、Nate、Lisa 第一次真正共同处在一个场景中的具体互动。",
      "当前主线暂时写到这里。",
    ],
    choices: () => [
      {
        text: "结束当前版本",
        action: () => {
          showModal("正在续写中...", "当前格兰芬多初遇主线已结束。后续剧情正在续写中...");
        },
      },
    ],
  },
};

// 预留：未来结局判定规则。
// 当前剧情尚未推进到结局节点，因此暂不自动调用。
function evaluateEnding() {
  const lisa = state.affection.lisa;
  const nate = state.affection.nate;
  const lisaPeak = state.peakAffection.lisa;
  const natePeak = state.peakAffection.nate;

  // 三人结局
  if (nate > 280 && lisa > 280) {
    return "trio";
  }

  // 独善其身
  if (
    natePeak > 250 &&
    lisaPeak > 250 &&
    nate < 200 &&
    lisa < 200
  ) {
    return "independent";
  }

  // Nate 单人结局
  if (nate > 250 && lisa > 100 && lisa < 200) {
    return "nate";
  }

  // Lisa 单人结局
  if (lisa > 280) {
    return "lisa";
  }

  // 普通结局：
  // 最终不满足单人 / 三人标准，
  // 且两人的历史最高好感都没有超过 250。
  if (natePeak <= 250 && lisaPeak <= 250) {
    return "normal";
  }

  // 目前尚未定义的中间状态。
  return "unresolved";
}

renderScene("houseSelection");
