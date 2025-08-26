## vue3和vue2的区别
- 数据劫持方法不一样，vue3采用的是proxy方法，比vue2更灵活，可以修改属性。
- 使用组合式API，vue2是选项式API
- 函数更符合函数写法，对TypeScript更友好

Vue2 的响应式基于 Object.defineProperty，只能劫持已有属性，数组要特殊处理；Vue3 改用 Proxy，能监听整个对象，支持新增/删除属性，性能更好。
Vue2 用 Options API，逻辑分散，复用性差；Vue3 引入 Composition API（setup、ref、reactive），逻辑更清晰，利于复用和 TypeScript 支持。
Vue3 还做了很多性能优化：比如编译阶段加 静态标记（PatchFlag），只更新动态节点，支持 静态提升，性能比 Vue2 更高。
此外 Vue3 新增了 Teleport、Suspense 等特性，源码也用 TS 重写，更适合大型项目。

## Vue3的核心原理
Vue3 的核心是 响应式系统 + 渲染优化。
在响应式上，Vue3 用 Proxy 拦截对象的 get/set 操作，结合依赖收集（effect）和触发更新（trigger）实现视图更新。
在渲染上，Vue3 会在编译时给动态节点加 PatchFlag，只更新需要的节点；同时把静态内容提升为常量，避免重复创建。
最终结合 Tree-Shaking，让未使用的功能不会打包进去，运行更快、体积更小。


## vue3代码的执行流程
 - 入口文件执行 -> 执行creatapp()创建应用实例 -> 挂在到DOM -> 初始化，执行setup(),创建响应式数据 -> 生成虚拟DOM ->渲染真实DOM -> proxy实时劫持更新数据，使用diff算法

 Vue3 的执行流程是：入口文件 main.js 里用 createApp 创建应用 → 挂载到 DOM → 初始化根组件并执行 setup() → 编译模板生成虚拟 DOM → 渲染为真实 DOM → 数据变化时通过 Proxy 触发更新，重新生成 VNode，再通过 diff 算法局部更新 DOM。

## DOM Diff算法
 - DOM是文档对象模型，把HTML渲染成树状结构
 - diff算法（差异比较算法）先对比新旧VNode的区别，只做同级比较，使用辅助key来作比较,(patch过程)

DOM 是浏览器提供的文档对象模型，把 HTML 转成树状结构，可以通过 JS 操作，但性能开销大。
Vue3 用虚拟 DOM 来描述真实 DOM，当数据变化时，先更新虚拟 DOM，再通过 Diff 算法对比新旧虚拟 DOM，找出差异并局部更新真实 DOM，从而提高性能。