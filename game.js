const INITIAL_STATE = {
  player: {
    firstName: "",
    lastName: "",
    birthMonth: null,
    birthDay: null,
    house: null,
    bloodStatus: null,
  },

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

    slytherinSusannaDebate: null,
    slytherinNateThanksStyle: null,
  },

  ui: {
    usingNeutralTheme: true,
  },
};

let state = structuredClone(INITIAL_STATE);

const HOUSE_NAMES = {
  gryffindor: "格兰芬多",
  ravenclaw: "拉文克劳",
  hufflepuff: "赫奇帕奇",
  slytherin: "斯莱特林",
};

const BLOOD_NAMES = {
  pureblood: "纯血家族",
  muggleborn: "麻瓜出身",
};

const sceneTitle = document.querySelector("#scene-title");
const chapterLabel = document.querySelector("#chapter-label");
const storyBox = document.querySelector("#story-box");
const choicesBox = document.querySelector("#choices-box");

const birthdayForm = document.querySelector("#birthday-form");
const birthMonthInput = document.querySelector("#birth-month");
const birthDayInput = document.querySelector("#birth-day");

const nameForm = document.querySelector("#name-form");
const firstNameInput = document.querySelector("#first-name");
const lastNameInput = document.querySelector("#last-name");

const themeButton = document.querySelector("#theme-button");
const statusButton = document.querySelector("#status-button");

const statusDrawer = document.querySelector("#status-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const drawerClose = document.querySelector("#drawer-close");

const statusName = document.querySelector("#status-name");
const statusBirthday = document.querySelector("#status-birthday");
const statusHouse = document.querySelector("#status-house");
const statusBlood = document.querySelector("#status-blood");
const statusLisa = document.querySelector("#status-lisa");
const statusNate = document.querySelector("#status-nate");

const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modal-title");
const modalText = document.querySelector("#modal-text");
const modalClose = document.querySelector("#modal-close");

function fullName() {
  const first = state.player.firstName.trim();
  const last = state.player.lastName.trim();
  return [first, last].filter(Boolean).join(" ");
}

function birthdayText() {
  const month = state.player.birthMonth;
  const day = state.player.birthDay;
  return month && day ? `${month}月${day}日` : "";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// 剧情文本支持两个简单功能：
// 1. 写【玩家名字】时，自动替换成玩家输入的姓名。
// 2. 用 *文字* 包起来时，显示为斜体。
// 以后正文里可以直接沿用这种写法，不需要手动改 HTML。
function formatStoryText(text) {
  let safe = escapeHTML(text);
  safe = safe.replaceAll("【玩家名字】", escapeHTML(fullName()));
  safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return safe;
}

function addAffection(character, amount) {
  state.affection[character] += amount;
  state.peakAffection[character] = Math.max(
    state.peakAffection[character],
    state.affection[character]
  );
  updateStatusPanel();
}

function updateStatusPanel() {
  statusName.textContent = fullName() || "未填写";
  statusBirthday.textContent = birthdayText() || "未填写";
  statusHouse.textContent = state.player.house
    ? HOUSE_NAMES[state.player.house]
    : "未选择";
  statusBlood.textContent = state.player.bloodStatus
    ? BLOOD_NAMES[state.player.bloodStatus]
    : "未确定";
  statusLisa.textContent = state.affection.lisa;
  statusNate.textContent = state.affection.nate;

  statusButton.classList.toggle("hidden", !fullName());
  themeButton.classList.toggle("hidden", !state.player.house);
}

function applyTheme() {
  if (!state.player.house || state.ui.usingNeutralTheme) {
    document.body.dataset.theme = "neutral";
    themeButton.textContent = state.player.house ? "恢复学院配色" : "回到初始配色";
    return;
  }

  document.body.dataset.theme = state.player.house;
  themeButton.textContent = "回到初始配色";
}

function chooseHouse(house) {
  state.player.house = house;
  state.ui.usingNeutralTheme = false;
  applyTheme();
  updateStatusPanel();
}

themeButton.addEventListener("click", () => {
  state.ui.usingNeutralTheme = !state.ui.usingNeutralTheme;
  applyTheme();
});

statusButton.addEventListener("click", () => {
  updateStatusPanel();
  statusDrawer.classList.add("open");
  statusDrawer.setAttribute("aria-hidden", "false");
});

function closeDrawer() {
  statusDrawer.classList.remove("open");
  statusDrawer.setAttribute("aria-hidden", "true");
}

drawerBackdrop.addEventListener("click", closeDrawer);
drawerClose.addEventListener("click", closeDrawer);

function showModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

birthdayForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const month = Number(birthMonthInput.value);
  const day = Number(birthDayInput.value);

  const maxDay = new Date(2000, month, 0).getDate();
  const isValid =
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= maxDay;

  const oldError = birthdayForm.querySelector(".form-error");
  if (oldError) oldError.remove();

  if (!isValid) {
    const error = document.createElement("p");
    error.className = "form-error";
    error.textContent = "请输入有效的月份和日期。";
    birthdayForm.insertBefore(error, birthdayForm.querySelector(".primary-button"));
    return;
  }

  state.player.birthMonth = month;
  state.player.birthDay = day;
  updateStatusPanel();
  renderScene("nameScene");
});

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();

  if (!firstName || !lastName) return;

  state.player.firstName = firstName;
  state.player.lastName = lastName;
  updateStatusPanel();
  renderScene("afterName");
});

function makeChoiceButton(choice) {
  const button = document.createElement("button");
  button.className = "choice-button";
  button.type = "button";

  const label = document.createElement("span");
  label.textContent = choice.text;
  button.appendChild(label);

  // note 只用于必要的世界观 / 身份锁定提示。
  // 不再显示“Lisa +30”“Nate +20”等好感变化。
  if (choice.note) {
    const note = document.createElement("span");
    note.className = "choice-note";
    note.textContent = choice.note;
    button.appendChild(note);
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

  chapterLabel.textContent = scene.chapter || "";
  sceneTitle.textContent = scene.title || "";

  storyBox.innerHTML = "";
  scene.paragraphs().forEach((text) => {
    const p = document.createElement("p");
    p.innerHTML = formatStoryText(text);
    storyBox.appendChild(p);
  });

  birthdayForm.classList.toggle("hidden", sceneId !== "birthdayScene");
  nameForm.classList.toggle("hidden", sceneId !== "nameScene");

  choicesBox.innerHTML = "";
  scene.choices().forEach((choice) => {
    choicesBox.appendChild(makeChoiceButton(choice));
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  updateStatusPanel();
}

const scenes = {
  opening: {
    chapter: "PROLOGUE",
    title: "",
    paragraphs: () => [
      "又是一个九月，你从九又四分之三站台踏上了列车。",
      "在车厢中望向窗外向后退的景色，你多少还是有些惆怅：部分为了暑假不再来，部分为了，这个学年你就要满十六岁了，青春期莫名多变的情绪时不时会汹涌出来，包裹住你。",
      "还有多久到你的生日来着？......",
    ],
    choices: () => [
      {
        text: "继续",
        next: "birthdayScene",
      },
    ],
  },

  birthdayScene: {
    chapter: "PROLOGUE",
    title: "",
    paragraphs: () => [],
    choices: () => [],
  },

  nameScene: {
    chapter: "PROLOGUE",
    title: "",
    paragraphs: () => [
      "生日记住了。接下来，你叫什么名字？",
    ],
    choices: () => [],
  },

  afterName: {
    chapter: "PROLOGUE",
    title: "",
    paragraphs: () => [
      "好了，十五岁，马上就要十六岁的【玩家名字】，希望你在霍格沃茨度过丰富的、也许能收获漂亮成绩单和*期待中的邂逅*的一年。",
      "仍需填入：这一段之后的开场内容。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "houseSelection",
      },
    ],
  },

  houseSelection: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [
      "给新生的分院仪式还是老样子，你和同院生善意地向被报到你们院名字的新生鼓掌欢呼。",
      "这些小孩子们脸颊红扑扑的，眼睛里闪着光，多少有对刚刚被分院帽念出的、你们学院那些品质的认同：......",
    ],
    choices: () => [
      {
        text: "继续",
        next: "houseQualityChoice",
      },
    ],
  },

  houseQualityChoice: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [],
    choices: () => [
      {
        text: "A. 勇敢，活力，骑士精神",
        action: () => chooseHouse("gryffindor"),
        next: "gryffindorDeclaration",
      },
      {
        text: "B. 野心勃勃，谋略，传承",
        action: () => chooseHouse("slytherin"),
        next: "slytherinDeclaration",
      },
      {
        text: "C. 博学，洞察，机敏过人",
        action: () => chooseHouse("ravenclaw"),
        next: "ravenclawDeclaration",
      },
      {
        text: "D. 忠诚，热心，一视同仁",
        action: () => chooseHouse("hufflepuff"),
        next: "hufflepuffDeclaration",
      },
    ],
  },

  gryffindorDeclaration: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [
      "*我们来自荒野，我们渴望力量，我们充满理想，我们英勇无畏，我们正义果敢，我们永不言弃，我们是 格兰芬多！*",
    ],
    choices: () => [
      {
        text: "继续",
        next: "gryffindorIntro",
      },
    ],
  },

  slytherinDeclaration: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [
      "*我们来自泥潭，我们渴望权力，我们充满野心，我们强大冷静，我们优雅自持，我们从不后悔，我们是 斯莱特林！*",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinIntro",
      },
    ],
  },

  ravenclawDeclaration: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [
      "*我们来自河畔，我们聪慧过人，我们冷静思考，我们刻骨钻研，我们追求真理，我们永不言弃，我们是 拉文克劳！*",
    ],
    choices: () => [
      {
        text: "继续",
        action: () => {
          showModal("正在续写中...", "拉文克劳路线正在续写中...");
        },
      },
    ],
  },

  hufflepuffDeclaration: {
    chapter: "SORTING",
    title: "",
    paragraphs: () => [
      "*我们来自森林，我们心怀大爱，我们忠于自然，我们正直忠诚，我们坚韧诚实，我们不畏艰险，我们是 赫奇帕奇！*",
    ],
    choices: () => [
      {
        text: "继续",
        action: () => {
          showModal("正在续写中...", "赫奇帕奇路线正在续写中...");
        },
      },
    ],
  },

  slytherinIntro: {
    chapter: "SLYTHERIN",
    title: "",
    paragraphs: () => [
      "仍需填入：斯莱特林主控对 Nate Luo 与 Lisa Rowe 的既有认知。",
      "仍需填入：斯莱特林内部普遍对血统、家族、名气与实力更加门儿清；即使主控自己并不热衷这些，周围人也会像谈论名牌一样谈论这些东西，因此主控早已对 Nate 与 Lisa 的名气、实力和血统小有耳闻。",
      "仍需填入：这里体现斯莱特林主控比其他学院多一层名利与家世上的观察，但不要因此预设主控本人一定认同这种价值观。",
      "仍需填入：自然过渡到斯莱特林毕业生 Susanna Kaysen 教授的课程。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinSusannaClass",
      },
    ],
  },

  slytherinSusannaClass: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [
      "仍需填入：Susanna Kaysen 作为斯莱特林毕业生、如今任课教授的课堂场景。",
      "仍需填入：Nate 与 Lisa 在这门课上的表现如何引起斯莱特林学生的注意。",
      "仍需填入：一次课后，你留下来向 Susanna 问问题；Nate 与 Lisa 也照旧围在老师身边。",
      "仍需填入：你与 Susanna 围绕一道题 / 一个得分点发生争论，Susanna 的态度比较温和。",
      "仍需填入：Susanna 表示，如果你现在能把问题全部答对，就给你算满分。",
    ],
    choices: () => [
      {
        text: "继续",
        action: () => {
          state.choices.slytherinSusannaDebate = "full_score_challenge";
        },
        next: "slytherinNateHint",
      },
    ],
  },

  slytherinNateHint: {
    chapter: "SLYTHERIN · NATE",
    title: "",
    paragraphs: () => [
      "仍需填入：你开始回答 Susanna 的问题。",
      "仍需填入：你在中间有一个疏忽的地方，Nate 悄悄戳了戳你的手心，给你提示。",
      "仍需填入：你顺利把答案补完整，Susanna 如何回应。",
      "你转向 Nate，道了声谢。你还想顺便把距离拉近一点——",
    ],
    choices: () => [
      {
        text: "A. 请你们去霍格莫德买东西吧？",
        action: () => {
          state.choices.slytherinNateThanksStyle = "hogsmeade";
          addAffection("nate", 15);
          addAffection("lisa", 10);
        },
        next: "slytherinAfterThanks",
      },
      {
        text: "B. 下次一起在图书馆自习好吗？",
        action: () => {
          state.choices.slytherinNateThanksStyle = "library";
          addAffection("nate", 20);
          addAffection("lisa", 10);
        },
        next: "slytherinAfterThanks",
      },
      {
        text: "C. 假期来我家玩好吗？",
        action: () => {
          state.choices.slytherinNateThanksStyle = "holiday_visit";
          addAffection("nate", 20);
          addAffection("lisa", 10);
        },
        next: "slytherinAfterThanks",
      },
    ],
  },

  slytherinAfterThanks: {
    chapter: "SLYTHERIN · NATE / LISA",
    title: "",
    paragraphs: () => [
      "仍需填入：Nate 对你这次主动拉近距离的具体反应。",
      "仍需填入：若选择霍格莫德，体现 Nate 会觉得和陌生人一起出去很久有点麻烦、也有点怵。",
      "仍需填入：若选择图书馆自习，体现 Nate 对这种相对轻松、可控的邀请更容易接受。",
      "仍需填入：若选择假期去你家，体现 Nate 对邀请本身的反应。",
      "仍需填入：Lisa 因为你是斯莱特林，又主动和她的 Nate 搭话，开始重新打量你。",
      "仍需填入：如果文案需要，可体现你有意无意借助纯血 / 家族层面的社交方式拉近关系；混血设定下的 Lisa 会觉得这个人还挺有招。",
      "当前斯莱特林主线暂时写到这里。",
    ],
    choices: () => [
      {
        text: "结束当前版本",
        action: () => {
          showModal(
            "正在续写中...",
            "当前斯莱特林初遇主线已结束。后续剧情正在续写中..."
          );
        },
      },
    ],
  },

  gryffindorIntro: {
    chapter: "GRYFFINDOR",
    title: "",
    paragraphs: () => [
      "仍需填入格兰芬多学院生活开场场景描写。",
      "仍需填入自然过渡到公共休息室、并让玩家注意到 Lisa Rowe 的文字。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "lisaCommonRoom",
      },
    ],
  },

  lisaCommonRoom: {
    chapter: "GRYFFINDOR · LISA",
    title: "公共休息室",
    paragraphs: () => [
      "仍需填入：你第一次在格兰芬多公共休息室真正注意到 Lisa Rowe 的场景描写。",
      "仍需填入：Lisa 在众人面前展现出压倒性魅力，同时带有仗势欺人 / 残酷意味的具体事件。",
      "仍需填入：被她发难的人、周围人的反应、Lisa 的具体言行。",
      "你看着她。你觉得——",
    ],
    choices: () => [
      {
        text: "A. 有些吓人，但反而很有魅力。",
        action: () => {
          state.choices.lisaFirstImpression = "intimidating_but_attractive";
          addAffection("lisa", 20);
        },
        next: "lisaInterveneChoice",
      },
      {
        text: "B. 太好了，很好，如果和她一起玩一定很开心。",
        action: () => {
          state.choices.lisaFirstImpression = "looks_fun";
          addAffection("lisa", 30);
        },
        next: "lisaInterveneChoice",
      },
      {
        text: "C. 这样做不太对，我要阻止她。",
        action: () => {
          state.choices.lisaFirstImpression = "this_is_wrong";
        },
        next: "lisaInterveneChoice",
      },
    ],
  },

  lisaInterveneChoice: {
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
      "仍需填入：Lisa 对那个人的发难继续发展的场景描写。",
      "你要插手吗？",
    ],
    choices: () => [
      {
        text: "A. 不干预。",
        action: () => {
          state.choices.lisaIntervened = false;
        },
        next: "lisaDayEnds",
      },
      {
        text: "B. 干预。",
        action: () => {
          state.choices.lisaIntervened = true;
        },
        next: "lisaInterventionStyle",
      },
    ],
  },

  lisaInterventionStyle: {
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
      "仍需填入：你决定插手前的短暂场景描写。",
    ],
    choices: () => [
      {
        text: "A. 委婉地处理，没有驳她的面子，但救下了那个被发难的人。",
        action: () => {
          state.choices.lisaInterventionStyle = "diplomatic";
          addAffection("lisa", 30);
        },
        next: "lisaReactionDiplomatic",
      },
      {
        text: "B. 加入她，给她提供助力的小知识。",
        action: () => {
          state.choices.lisaInterventionStyle = "join";
          addAffection("lisa", 30);
        },
        next: "lisaReactionJoin",
      },
      {
        text: "C. 直接站起来说你不能这样，把被发难的人护到身后。",
        action: () => {
          state.choices.lisaInterventionStyle = "confront";
          addAffection("lisa", 30);
        },
        next: "lisaReactionConfront",
      },
    ],
  },

  lisaReactionDiplomatic: {
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR · LISA",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
      "仍需填入：这门格兰芬多与拉文克劳共同课程的场景描写。",
      "仍需填入：你第一次看见 Nate Luo 时，她本身的魅力给你留下的第一印象。",
      "后来真正让你着迷的，会是她身上的反差，以及她对你的好。",
      "现在，你可以决定要不要坐到她旁边。",
    ],
    choices: () => [
      {
        text: "A. 坐到她旁边。",
        action: () => {
          state.choices.satWithNate = true;
          addAffection("nate", 30);
        },
        next: "nateApproach",
      },
      {
        text: "B. 不坐她旁边。",
        action: () => {
          state.choices.satWithNate = false;
        },
        next: "nateNoSit",
      },
    ],
  },

  nateNoSit: {
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
      "仍需填入：你坐到 Nate 旁边时，她的第一反应。",
      "接下来，你决定怎样和她搭话。",
    ],
    choices: () => [
      {
        text: "A. 直接开口，靠自己的主动与谈吐接近她。",
        action: () => {
          state.choices.nateFirstApproach = "direct_charm";
          addAffection("nate", 30);
        },
        next: "nateReactionDirect",
      },
      {
        text: "B. 提到自己也是纯血家族，以此和她攀谈。",
        note: "选择此选项后，本局游戏将以纯血家族巫师背景游玩。",
        action: () => {
          state.choices.nateFirstApproach = "pureblood_topic";
          state.player.bloodStatus = "pureblood";
          addAffection("nate", 20);
        },
        next: "nateReactionPureblood",
      },
      {
        text: "C. 作为麻瓜出身的巫师，问她一些你不了解的事情，让她给你解答。",
        note: "选择此选项后，本局游戏将以麻瓜出身巫师背景游玩。",
        action: () => {
          state.choices.nateFirstApproach = "ask_for_help";
          state.player.bloodStatus = "muggleborn";
          addAffection("nate", 25);
        },
        next: "nateReactionMuggleborn",
      },
    ],
  },

  nateReactionDirect: {
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
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
    chapter: "GRYFFINDOR × RAVENCLAW",
    title: "",
    paragraphs: () => [
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
    chapter: "THREE",
    title: "",
    paragraphs: () => [
      "仍需填入：课程继续后的场景描写。",
      "Lisa 就坐在 Nate 的另一边。",
      "仍需填入：你、Nate、Lisa 第一次真正共同处在一个场景中的具体互动。",
      "当前主线暂时写到这里。",
    ],
    choices: () => [
      {
        text: "结束当前版本",
        action: () => {
          showModal(
            "正在续写中...",
            "当前格兰芬多初遇主线已结束。后续剧情正在续写中..."
          );
        },
      },
    ],
  },
};

// 结局判定暂时保留，不在当前短篇流程中自动触发。
function evaluateEnding() {
  const lisa = state.affection.lisa;
  const nate = state.affection.nate;
  const lisaPeak = state.peakAffection.lisa;
  const natePeak = state.peakAffection.nate;

  if (nate > 280 && lisa > 280) {
    return "trio";
  }

  if (
    natePeak > 250 &&
    lisaPeak > 250 &&
    nate < 200 &&
    lisa < 200
  ) {
    return "independent";
  }

  if (nate > 250 && lisa > 100 && lisa < 200) {
    return "nate";
  }

  if (lisa > 280) {
    return "lisa";
  }

  if (natePeak <= 250 && lisaPeak <= 250) {
    return "normal";
  }

  return "unresolved";
}

applyTheme();
updateStatusPanel();
renderScene("opening");
