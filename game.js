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

    slytherinFirstView: null,
    slytherinSusannaDebate: null,
    slytherinSusannaOpeningLine: "",
    slytherinNateThanksStyle: null,

    ravenclawBaselineApplied: false,
    ravenclawBreakIceChoice: null,
    ravenclawAfterClassReply: null,
  },

  ui: {
    usingNeutralTheme: true,
  },
};

let state = structuredClone(INITIAL_STATE);
let currentSceneId = "opening";

const AUTOSAVE_KEY = "lisaNateHogwarts_autosave_v1";
const SAVE_SLOT_PREFIX = "lisaNateHogwarts_save_v1_slot_";
const SAVE_SLOT_COUNT = 6;

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

const customLineForm = document.querySelector("#custom-line-form");
const customLineInput = document.querySelector("#custom-line-input");

const themeButton = document.querySelector("#theme-button");
const menuButton = document.querySelector("#menu-button");

const menuDrawer = document.querySelector("#menu-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const drawerClose = document.querySelector("#drawer-close");
const restartButton = document.querySelector("#restart-button");
const saveSlots = document.querySelector("#save-slots");
const loadSlots = document.querySelector("#load-slots");
const menuTitle = document.querySelector("#menu-title");
const menuHome = document.querySelector("#menu-home");
const menuStatus = document.querySelector("#menu-status");
const menuSave = document.querySelector("#menu-save");
const menuLoad = document.querySelector("#menu-load");
const menuSystem = document.querySelector("#menu-system");
const menuTiles = document.querySelectorAll(".menu-tile");
const menuBackButtons = document.querySelectorAll(".menu-back-button");
const systemThemeButton = document.querySelector("#system-theme-button");

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

menuButton.addEventListener("click", () => {
  updateStatusPanel();
  renderSaveSlots();
  showMenuView("home");
  menuDrawer.classList.add("open");
  menuDrawer.setAttribute("aria-hidden", "false");
});

function showMenuView(viewName) {
  const views = {
    home: menuHome,
    status: menuStatus,
    save: menuSave,
    load: menuLoad,
    system: menuSystem,
  };

  Object.values(views).forEach((view) => {
    view.classList.add("hidden");
  });

  views[viewName].classList.remove("hidden");

  const titles = {
    home: "菜单",
    status: "状态",
    save: "存档",
    load: "读档",
    system: "系统",
  };
  menuTitle.textContent = titles[viewName];

  if (viewName === "status") {
    updateStatusPanel();
  }

  if (viewName === "save" || viewName === "load") {
    renderSaveSlots();
  }

  if (viewName === "system") {
    syncSystemThemeButton();
  }
}

menuTiles.forEach((button) => {
  button.addEventListener("click", () => {
    showMenuView(button.dataset.menuTarget);
  });
});

menuBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showMenuView("home");
  });
});

function syncSystemThemeButton() {
  if (!state.player.house) {
    systemThemeButton.textContent = "初始配色";
    systemThemeButton.disabled = true;
    return;
  }

  systemThemeButton.disabled = false;
  systemThemeButton.textContent = state.ui.usingNeutralTheme
    ? "恢复学院配色"
    : "回到初始配色";
}

systemThemeButton.addEventListener("click", () => {
  if (!state.player.house) return;
  state.ui.usingNeutralTheme = !state.ui.usingNeutralTheme;
  applyTheme();
  syncSystemThemeButton();
  writeAutosave();
});

function closeDrawer() {
  menuDrawer.classList.remove("open");
  menuDrawer.setAttribute("aria-hidden", "true");
}

drawerBackdrop.addEventListener("click", closeDrawer);
drawerClose.addEventListener("click", closeDrawer);

restartButton.addEventListener("click", () => {
  const ok = window.confirm("回到开头？当前自动进度会被重置，但六个手动存档不会删除。");
  if (!ok) return;

  state = structuredClone(INITIAL_STATE);
  currentSceneId = "opening";
  localStorage.removeItem(AUTOSAVE_KEY);
  closeDrawer();
  applyTheme();
  updateStatusPanel();
  renderScene("opening");
});


function cloneStateForStorage() {
  return JSON.parse(JSON.stringify(state));
}

function makeSavePayload(sceneId = currentSceneId) {
  return {
    version: 1,
    sceneId,
    state: cloneStateForStorage(),
    savedAt: new Date().toISOString(),
  };
}

function isValidSavePayload(payload) {
  return Boolean(
    payload &&
    typeof payload === "object" &&
    typeof payload.sceneId === "string" &&
    payload.state &&
    typeof payload.state === "object"
  );
}

function writeAutosave() {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(makeSavePayload()));
  } catch (error) {
    console.warn("自动保存失败：", error);
  }
}

function readSave(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return isValidSavePayload(parsed) ? parsed : null;
  } catch (error) {
    console.warn("读取存档失败：", error);
    return null;
  }
}

function restoreSave(payload) {
  if (!isValidSavePayload(payload) || !scenes[payload.sceneId]) return false;

  state = payload.state;
  currentSceneId = payload.sceneId;

  // 为以后新增字段留一点兼容空间。
  state.ui = state.ui || { usingNeutralTheme: !state.player?.house };
  state.player = state.player || structuredClone(INITIAL_STATE.player);
  state.affection = state.affection || structuredClone(INITIAL_STATE.affection);
  state.peakAffection =
    state.peakAffection || structuredClone(INITIAL_STATE.peakAffection);
  state.choices = state.choices || structuredClone(INITIAL_STATE.choices);

  applyTheme();
  updateStatusPanel();
  renderScene(currentSceneId);
  return true;
}

function formatSaveTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function sceneDisplayName(sceneId) {
  const scene = scenes[sceneId];
  if (!scene) return sceneId;

  const chapter = scene.chapter || "";
  const title = scene.title || "";
  return [chapter, title].filter(Boolean).join(" · ") || "故事中";
}

function saveToSlot(slotNumber) {
  const key = SAVE_SLOT_PREFIX + slotNumber;
  const oldSave = readSave(key);

  if (oldSave) {
    const overwrite = window.confirm(`覆盖存档 ${slotNumber}？`);
    if (!overwrite) return;
  }

  localStorage.setItem(key, JSON.stringify(makeSavePayload()));
  renderSaveSlots();
}

function loadFromSlot(slotNumber) {
  const key = SAVE_SLOT_PREFIX + slotNumber;
  const payload = readSave(key);
  if (!payload) return;

  const ok = window.confirm(`读取存档 ${slotNumber}？当前未手动保存的进度会被替换。`);
  if (!ok) return;

  closeDrawer();
  restoreSave(payload);
}

function deleteSlot(slotNumber) {
  const key = SAVE_SLOT_PREFIX + slotNumber;
  const payload = readSave(key);
  if (!payload) return;

  const ok = window.confirm(`删除存档 ${slotNumber}？`);
  if (!ok) return;

  localStorage.removeItem(key);
  renderSaveSlots();
}

function buildSlotCard(slot, mode) {
  const payload = readSave(SAVE_SLOT_PREFIX + slot);
  const card = document.createElement("div");
  card.className = "save-slot";

  const top = document.createElement("div");
  top.className = "save-slot-top";

  const info = document.createElement("div");
  const title = document.createElement("p");
  title.className = "save-slot-title";
  title.textContent = `存档 ${slot}`;

  const meta = document.createElement("p");
  meta.className = "save-slot-meta";

  if (payload) {
    const savedState = payload.state || {};
    const player = savedState.player || {};
    const savedName = [player.firstName, player.lastName].filter(Boolean).join(" ");
    const house = player.house ? HOUSE_NAMES[player.house] : "未分院";
    meta.textContent =
      `${savedName || "未命名"} · ${house} · ${sceneDisplayName(payload.sceneId)} · ${formatSaveTime(payload.savedAt)}`;
  } else {
    meta.textContent = "空档位";
  }

  info.appendChild(title);
  info.appendChild(meta);
  top.appendChild(info);
  card.appendChild(top);

  const actions = document.createElement("div");
  actions.className = "save-slot-actions";

  if (mode === "save") {
    const saveButton = document.createElement("button");
    saveButton.className = "slot-button save-slot-action";
    saveButton.type = "button";
    saveButton.textContent = payload ? "覆盖" : "存档";
    saveButton.addEventListener("click", () => saveToSlot(slot));
    actions.appendChild(saveButton);

    const deleteButton = document.createElement("button");
    deleteButton.className = "slot-button delete-slot-action";
    deleteButton.type = "button";
    deleteButton.textContent = "删除";
    deleteButton.disabled = !payload;
    deleteButton.addEventListener("click", () => deleteSlot(slot));
    actions.appendChild(deleteButton);
  }

  if (mode === "load") {
    const loadButton = document.createElement("button");
    loadButton.className = "slot-button load-slot-action";
    loadButton.type = "button";
    loadButton.textContent = "读档";
    loadButton.disabled = !payload;
    loadButton.addEventListener("click", () => loadFromSlot(slot));
    actions.appendChild(loadButton);
  }

  card.appendChild(actions);
  return card;
}

function renderSaveSlots() {
  saveSlots.innerHTML = "";
  loadSlots.innerHTML = "";

  for (let slot = 1; slot <= SAVE_SLOT_COUNT; slot++) {
    saveSlots.appendChild(buildSlotCard(slot, "save"));
    loadSlots.appendChild(buildSlotCard(slot, "load"));
  }
}

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

customLineForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const line = customLineInput.value.trim();
  if (!line) return;

  state.choices.slytherinSusannaOpeningLine = line;
  renderScene("slytherinSusannaResponse");
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

  currentSceneId = sceneId;

  chapterLabel.textContent = scene.chapter || "";
  sceneTitle.textContent = scene.title || "";

  storyBox.innerHTML = "";
  scene.paragraphs().forEach((item) => {
    const p = document.createElement("p");

    if (typeof item === "string") {
      p.innerHTML = formatStoryText(item);
    } else {
      p.innerHTML = formatStoryText(item.text);
      if (item.className) p.classList.add(item.className);
    }

    storyBox.appendChild(p);
  });

  birthdayForm.classList.toggle("hidden", sceneId !== "birthdayScene");
  nameForm.classList.toggle("hidden", sceneId !== "nameScene");
  customLineForm.classList.toggle(
    "hidden",
    sceneId !== "slytherinSusannaPlayerLine"
  );

  if (sceneId === "slytherinSusannaPlayerLine") {
    customLineInput.value = state.choices.slytherinSusannaOpeningLine || "";
  }

  choicesBox.innerHTML = "";
  scene.choices().forEach((choice) => {
    choicesBox.appendChild(makeChoiceButton(choice));
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  updateStatusPanel();
  writeAutosave();
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
          if (!state.choices.ravenclawBaselineApplied) {
            addAffection("nate", 30);
            state.choices.ravenclawBaselineApplied = true;
          }
        },
        next: "ravenclawHistory",
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

  ravenclawHistory: {
    chapter: "RAVENCLAW",
    title: "",
    paragraphs: () => [
      "仍需填入：一年级刚入学时，你和 Nate 曾经很亲近的前情。",
      "仍需填入：那时 Nate 还没有认识跨院的 Lisa；你和 Nate 都早慧，脑回路相似，有一种双生镜像般的默契。",
      "仍需填入：你们曾经有一丝机会成为真正的挚友，但那个机会后来像珠蚌一样合上了。",
      "仍需填入：Nate 很快把更多的注意力转向 Lisa。你知道 Lisa 更外放、更直观地有魅力，也明白为什么她能吸引 Nate；与此同时，你对 Lisa 既有艳羡、嫉妒，也承认她确实有魅力。",
      "仍需填入：对 Nate，你并不只是单纯地怨恨。某种意义上，你甚至觉得 Lisa 陪着她也很好；但这个曾经关闭的机会，在这个学年重新出现了。",
      "【前情状态：Nate 对你原本已有 30 好感度。】",
    ],
    choices: () => [
      {
        text: "继续",
        next: "ravenclawClassGrouping",
      },
    ],
  },

  ravenclawClassGrouping: {
    chapter: "RAVENCLAW · NATE",
    title: "",
    paragraphs: () => [
      "仍需填入：开学后的某一节拉文克劳课程，以及课堂分组的场景描写。",
      "仍需填入：你和 Nate 被分到同一组。久违地坐得这样近，她先主动和你说了话，像是在试图把什么重新接起来。",
      "你怎么回答？",
    ],
    choices: () => [
      {
        text: "A. 回答她，冷酷的。",
        action: () => {
          state.choices.ravenclawBreakIceChoice = "cold";
          addAffection("nate", 30);
        },
        next: "ravenclawColdReaction",
      },
      {
        text: "B. 回答她，让她知道刚入学时转瞬即逝的友谊对自己没有产生任何影响。",
        action: () => {
          state.choices.ravenclawBreakIceChoice = "unaffected";
          addAffection("nate", 30);
        },
        next: "ravenclawColdReaction",
      },
      {
        text: "C. 回答她，并潇洒地说：嘿，我知道这听起来很突然，等下你想一起去黑湖边散散步吗？别说你有其他计划，我会把你借走的……而这一切都是为了不久后当 Lisa 不找她玩了，再狠狠离开她。",
        action: () => {
          state.choices.ravenclawBreakIceChoice = "black_lake_invite";
          addAffection("nate", 30);
        },
        next: "ravenclawBlackLakeReaction",
      },
      {
        text: "D. 不回答她，去和另一边的女生说话，并完全不注意她的动静。",
        action: () => {
          state.choices.ravenclawBreakIceChoice = "ignore";
          addAffection("nate", 30);
        },
        next: "ravenclawIgnoreReaction",
      },
    ],
  },

  ravenclawColdReaction: {
    chapter: "RAVENCLAW · NATE",
    title: "",
    paragraphs: () => [
      "Nate 只是“oh”了一声，笑笑地看了你一眼，乖乖地回去做自己的了。",
      "仍需填入：这里关于 Nate 魅力形象的描写。",
      "她做自己的事情之后，你刚刚那个约她一起的念头又冒出来了。看着她的样子，你竟然不再觉得这是愚蠢至极的——她看起来会答应任何事。",
      "但你没有开口。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "ravenclawNateInvitesHogsmeade",
      },
    ],
  },

  ravenclawIgnoreReaction: {
    chapter: "RAVENCLAW · NATE",
    title: "",
    paragraphs: () => [
      "仍需填入：你完全不回答 Nate、转而和另一边的女生说话时，课堂继续的场景。",
      "仍需填入：Nate 没有因此恼怒，她仍然以一种包容而近乎宠爱的方式对待你的拒绝。",
      "下课以后，她又一次尝试把这层冰敲开。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "ravenclawNateInvitesHogsmeade",
      },
    ],
  },

  ravenclawNateInvitesHogsmeade: {
    chapter: "RAVENCLAW · NATE",
    title: "",
    paragraphs: () => [
      "下课后，Nate 转过来对你说：“hey，周日想一起去霍格莫德吃饭吗？”",
    ],
    choices: () => [
      {
        text: "A. 就我们俩？",
        action: () => {
          state.choices.ravenclawAfterClassReply = "just_us";
        },
        next: "ravenclawHogsmeadeClarification",
      },
      {
        text: "B. 那个谁不会也……",
        action: () => {
          state.choices.ravenclawAfterClassReply = "will_lisa_be_there";
        },
        next: "ravenclawHogsmeadeClarification",
      },
    ],
  },

  ravenclawHogsmeadeClarification: {
    chapter: "RAVENCLAW · NATE / LISA",
    title: "",
    paragraphs: () => [
      "Nate 说：“我们俩，和我的好朋友 Lisa 一起，她会超喜欢你的。”",
      "仍需填入：这一刻你对重新进入 Nate 的生活、以及 Lisa 被自然带入你们之间的感受。",
      "仍需填入：之后 Nate 和你回到普通朋友关系，并逐渐邀请你与 Lisa 三个人一起行动。",
      "仍需填入：未来可从这里并入各学院共享的霍格莫德等共同剧情。",
      "当前拉文克劳主线暂时写到这里。",
    ],
    choices: () => [
      {
        text: "结束当前版本",
        action: () => {
          showModal(
            "正在续写中...",
            "当前拉文克劳初遇主线已结束。后续剧情正在续写中..."
          );
        },
      },
    ],
  },

  ravenclawBlackLakeReaction: {
    chapter: "RAVENCLAW · NATE",
    title: "",
    paragraphs: () => [
      "Nate 罕见地露出灿烂的笑容：“我很乐意。”",
      "仍需填入：她答应黑湖散步时的具体反应与 Nate 的魅力描写。",
      "她接着说，等周日你们俩可以先一起散步，然后还可以去找 Lisa，三个人一起去霍格莫德小聚。",
      "仍需填入：你原本带着一点报复意味的邀约，在她毫无戒备的接受里产生了怎样的变化。",
      "仍需填入：之后 Nate 和你重新回到普通朋友关系，并自然把 Lisa 带进共同活动。",
      "当前拉文克劳主线暂时写到这里。",
    ],
    choices: () => [
      {
        text: "结束当前版本",
        action: () => {
          showModal(
            "正在续写中...",
            "当前拉文克劳初遇主线已结束。后续剧情正在续写中..."
          );
        },
      },
    ],
  },

  slytherinIntro: {
    chapter: "SLYTHERIN",
    title: "",
    paragraphs: () => [
      "你是个斯莱特林，这意味着不管你内心怎么看待这些，你周围的人总是将血统和姓氏当作名牌一样谈论。",
      "所以当然，你知道 Nate 和 Lisa。你们院很多人将这对诡异的组合戏谑称之“那个养了只疯狗的亚洲人”：亚裔的纯血拉文克劳、从美国来的混血格兰芬多，两个女孩毫不避讳地形影不离，唉，听听看，多奇怪啊。",
      "偏偏她们加在一起刚好有能唬人的血统、真会上手揍到你掉牙齿的拳头和蒙骗各院院长相信她们蒙太奇手法借口的成绩单，所以没人能当面这么叫她们；",
      "偏偏她们行走在霍格沃茨走廊和大厅时会吸引许多爱慕的、艳羡的目光，许多甜蜜的寒暄。尽管院里一些同级生坚持说她们那些拥趸和同盟也都目光短浅，但事实就是，她们还没有默默无闻到让人安心忽略、放下叫这些外号的企图的地步。",
      "你的看法是......",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinFirstViewChoice",
      },
    ],
  },

  slytherinFirstViewChoice: {
    chapter: "SLYTHERIN",
    title: "",
    paragraphs: () => [],
    choices: () => [
      {
        text: "A. 那个拉文克劳是纯血，父亲在魔法部工作，所以没必要招惹她们。",
        action: () => {
          state.choices.slytherinFirstView = "status_pragmatist";
        },
        next: "slytherinSusannaClass",
      },
      {
        text: "B. 不管她们远观如何，周围人怎么议论，你并不知道真实的她们是怎么样的人。",
        action: () => {
          state.choices.slytherinFirstView = "open_minded";
          addAffection("nate", 15);
        },
        next: "slytherinSusannaClass",
      },
      {
        text: "C. 这些你和你周围人家族共同遵守的、按姓氏血统论资排辈的信条，正给这两人带来多少便利呢？你从不觉得这些有什么了不起，甚至微妙的厌恶于别人整日谈论它们，可是眼下这有两个人，到底是在利用这些违反校规，还是用这种方式嘲讽这些东西呢？",
        action: () => {
          state.choices.slytherinFirstView = "questioning_hierarchy";
          addAffection("nate", 15);
        },
        next: "slytherinSusannaClass",
      },
    ],
  },

  slytherinSusannaClass: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [
      "梅林的胡子，这个新学年虽然才刚开始不久，但霍格沃茨的空气有了什么新东西，至少你和你的同级生能感受到。",
      "继 Elisa 晚归时哭哭啼啼，Thomas 突然变得沉默寡言之类的事情桩桩件件发生之后，发生在你身上的命运推手是：才在前一晚思考过自己对 Nate 和 Lisa 这对校园红人应该是什么样的态度，第二天，当你早早赶去黑魔法防御课教授 Susanna Kaysen 的教室，想就上一次随堂测的结果争论几分回来，就正好看见这两个人也围在教授身边。",
      "课表上，格兰芬多的黑魔法防御在半小时前就该结束了，拉文克劳的更是不在今日。这两人果然还是有几分诡谲。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinSusannaAdmiration",
      },
    ],
  },

  slytherinSusannaAdmiration: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [
      "你不欣赏学生缠着年轻好说话的老师献媚以获取好处的行为，何况这次后者是毕业于斯莱特林 Susanna Kaysen，她的履历之强有力和举止之优雅，都是典型的斯莱特林，让本院的孩子们与有荣焉。",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinSusannaGradeMotivation",
      },
    ],
  },

  slytherinSusannaGradeMotivation: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [
      "不管怎么说，自己的事要紧，上次随堂课你只因为小小的失误才没有得到满分，如果能想办法说服教授帮你改回来，一定会收到母亲的许多温情的称赞和礼物，是的，你仍然在意这个。",
      "你清了清嗓子引起注意，说道：……",
    ],
    choices: () => [
      {
        text: "继续",
        next: "slytherinSusannaPlayerLine",
      },
    ],
  },

  slytherinSusannaPlayerLine: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [],
    choices: () => [],
  },

  slytherinSusannaResponse: {
    chapter: "SLYTHERIN · SUSANNA KAYSEN",
    title: "",
    paragraphs: () => [
      {
        text: state.choices.slytherinSusannaOpeningLine,
        className: "player-written-line",
      },
      "教授如你所想，微笑着，“当然可以，亲爱的，我也注意到你所犯的失误是十分可惜的，与随堂测中要检验的，巫师对咒语的理解并不相关。然而我无法只是这样改掉你的卷面分数，这恐怕会引起争议，这样吧，现在我用随堂测中的题目的变体重新考核你一次，如果这次你的确做到了满分的水准，那就是你把握住了机会，值得相应的分数。”",
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

const autosave = readSave(AUTOSAVE_KEY);

if (!autosave || !restoreSave(autosave)) {
  applyTheme();
  updateStatusPanel();
  renderScene("opening");
}
