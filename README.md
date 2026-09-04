# HP × Nate × Lisa 文字游戏

这是当前可运行的第一版纯文字框架。

## 怎么运行

最简单的方法：

1. 下载整个文件夹。
2. 双击 `index.html`。
3. 浏览器会直接打开游戏。

如果要放到 GitHub Pages：

1. 新建一个 GitHub repository。
2. 上传：
   - `index.html`
   - `style.css`
   - `game.js`
3. 打开仓库 Settings。
4. 进入 Pages。
5. Source 选择 Deploy from a branch。
6. 选择 `main` 分支和 `/root`。
7. 保存后等待 GitHub Pages 地址生成。

## 你之后主要改哪里

### 改剧情正文

打开 `game.js`。

每个场景都会长这样：

```js
someScene: {
  title: "场景标题",
  paragraphs: [
    "仍需填入xxx场景描写。",
    "这里换成你真正写好的正文。",
  ],
  choices: () => [
    ...
  ],
},
```

你只需要把：

```text
仍需填入xxx场景描写
```

换成自己的正文即可。

### 改选项文字

还是在 `game.js` 里，找到：

```js
text: "A. 这里是选项",
```

直接改引号里面的文字。

### 改好感度

例如：

```js
addAffection("lisa", 30);
```

这里的 `30` 就是加分值。

扣分则写：

```js
addAffection("lisa", -20);
```

Nate 同理：

```js
addAffection("nate", 25);
```

### 玩家状态

现在记录：

- 学院
- 血统背景
- Lisa 当前好感
- Nate 当前好感
- Lisa 历史最高好感
- Nate 历史最高好感
- Lisa 初遇选择
- 是否干预 Lisa
- Lisa 干预方式
- 是否坐到 Nate 身边
- Nate 第一次搭讪方式

这些都在 `state` 中。

### 图片版预留

`index.html` 已经有：

```html
<section class="visual-slot">
```

这是未来背景和立绘区域。

当前只显示占位框，不影响纯文字版运行。

以后可以继续扩展：

- `background`
- Lisa 立绘
- Nate 立绘
- 表情差分
- BGM
- 音效

不需要推翻当前剧情系统。

## 当前结局判定函数

`game.js` 底部已经预留 `evaluateEnding()`。

目前规则写入了：

- Nate 单人
- Lisa 单人
- 三人
- 独善其身
- 普通结局
- 尚未定义的中间状态 `unresolved`

当前剧情还没有推进到结局，所以这个函数暂时不会自动触发。

## 当前已完成剧情

- 学院选择
- 其他学院 → “正在续写中...”
- 格兰芬多开场
- Lisa 公共休息室初遇
- Lisa 第一印象判定
- 干预 / 不干预
- 三种干预方式
- 三种 Lisa 反应占位
- Nate 共课初遇
- 坐 / 不坐
- 三种 Nate 搭讪方式
- 纯血 / 麻瓜出身锁定
- 三种 Nate 反应占位
- 三人第一次同框
- 当前版本结束提示
