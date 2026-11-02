const details = {
  knowledge: { label: '01 / KNOWLEDGE', title: '让知识，真正流动', paragraphs: [
    ['从信息堆积到任务支持', '知识库的意义，不止于存下更多文档。更值得探索的是：当一个具体问题出现时，用户能否找到相关信息，理解它的来处，并据此推进下一步。'],
    ['需要被设计的，不只有答案', '来源呈现、文档时效、访问权限，以及找不到答案时的反馈，都属于知识产品的体验。一个清晰说明依据与边界的回答，才更有机会被放心使用。'],
    ['探索的问题', '怎样让检索更贴近用户的表达？怎样把引用放在恰当的位置？当资料相互冲突时，产品应该如何帮助用户判断？这些问题比单纯增加一个聊天框更值得打磨。'] ] },
  agent: { label: '02 / AGENT', title: '从回答，到完成', paragraphs: [
    ['用任务定义能力', '从用户想完成的事情出发，拆解输入、步骤、工具和完成标准。Agent 的价值，需要在完整任务中被检验，而不仅是对话中的流畅表达。'],
    ['在自主与可控之间', '读取信息、生成草稿与执行不可逆操作，需要不同程度的控制。清晰的执行状态、关键步骤确认和失败后的恢复方式，是工作流的重要组成部分。'],
    ['探索的问题', '哪些步骤适合固定流程，哪些适合让模型判断？什么时候需要人来接手？任务中断之后，能否保留已经完成的工作并继续？'] ] },
  experience: { label: '03 / EXPERIENCE', title: '让智能，有好的体验', paragraphs: [
    ['让用户知道正在发生什么', '等待、生成、调用工具、执行失败，这些状态都应有清晰的表达。反馈不必复杂，但需要帮助用户决定继续等待、调整输入，还是换一种方式。'],
    ['把控制权放在合适的位置', '好的协作体验让用户可以检查、编辑、撤回或重新尝试。减少操作并不意味着隐藏重要决定，而是让每一次必要的参与更轻松。'],
    ['探索的问题', '第一次使用如何建立正确预期？模型不确定时如何表达？如何在提供帮助的同时，保留人的判断与主动性？'] ] },
  problem: { label: 'PRODUCT NOTE / 01', title: '先找到值得解决的问题，再谈 AI 的可能', paragraphs: [
    ['', '“这个场景可以用 AI”是一个技术判断，还不是充分的产品理由。更具体的起点，是看清谁在什么情境下遇到了什么困难，以及现在如何解决。'],
    ['让问题足够具体', '把“提升效率”改写成一个能够观察的任务：从什么输入开始，需要哪些操作，什么结果意味着完成。只有这样，才能讨论 AI 究竟减少了哪一步负担，又增加了什么成本。'],
    ['也给简单方案一个机会', '如果更清晰的流程、一个筛选器或一份模板已经能解决问题，就值得优先比较。选择 AI 应当来自对问题的理解，而不是来自对技术的偏爱。'],
    ['', '值得反复问的一句话是：如果拿掉 AI 这个标签，用户还会需要这个产品吗？'] ] },
  trust: { label: 'PRODUCT NOTE / 02', title: '好的 AI 体验，也包括知道何时交还控制权', paragraphs: [
    ['', '自动完成更多事情，并不天然等于更好的体验。当产品代替用户做判断时，也需要让用户知道发生了什么，以及还可以如何参与。'],
    ['让不确定性可见', '资料不完整、条件有歧义、结果缺乏依据，这些都可以成为清晰的产品反馈。坦诚说明边界，并给出可执行的下一步，比一个看似确定的回答更有帮助。'],
    ['在重要时刻邀请用户参与', '对于外部发送、付费或不可恢复的操作，确认应当展示具体对象与影响。对于容易回退的小步骤，则可以减少打断，把注意力留给真正需要判断的地方。'],
    ['', '控制感来自可理解的过程、可检查的结果，以及必要时能够介入的入口。'] ] },
  delivery: { label: 'PRODUCT NOTE / 03', title: '从一个惊艳的 Demo，到一个可靠的产品', paragraphs: [
    ['', '演示可以说明一种可能，而产品需要面对重复使用、复杂输入和失败情况。把这两者连接起来，靠的是持续验证。'],
    ['从真实任务建立评估', '用具有代表性的任务观察完成情况，记录失败发生在哪一步。评估结果质量的同时，也关注等待时间、使用成本，以及用户需要额外做多少检查。'],
    ['把失败也纳入设计', '网络中断、信息缺失和工具不可用，都不应该只剩一句“出错了”。保存进度、解释原因、提供重试或替代路径，能让产品在不理想的条件下仍然可用。'],
    ['', '每次迭代都应回答一个具体问题：这次改变，是否让用户更稳定、更轻松地完成了任务？'] ] }
};
const dialog = document.querySelector('#detail-dialog');
const closeButton = document.querySelector('.dialog-close');
let previousFocus;
document.querySelectorAll('[data-detail]').forEach(button => button.addEventListener('click', () => {
  const item = details[button.dataset.detail];
  previousFocus = button;
  document.querySelector('#dialog-label').textContent = item.label;
  document.querySelector('#dialog-title').textContent = item.title;
  const body = document.querySelector('#dialog-body');
  body.replaceChildren();
  item.paragraphs.forEach(([heading, text]) => {
    if (heading) { const h = document.createElement('h3'); h.textContent = heading; body.append(h); }
    const p = document.createElement('p'); p.textContent = text; body.append(p);
  });
  dialog.showModal(); dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
  closeButton.focus();
}));
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus({ preventScroll: true }); });
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '打开导航'); nav.classList.remove('open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航'); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
document.addEventListener('click', e => { if (!nav.contains(e.target) && !menu.contains(e.target)) closeMenu(); });
const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...nav.querySelectorAll('a')];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => { const active = link.hash === '#' + entry.target.id; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); });
}, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
sections.forEach(section => observer.observe(section));
document.querySelector('#year').textContent = new Date().getFullYear();
