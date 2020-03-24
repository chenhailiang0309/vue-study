const compileUtil = {
    getVal(expr, vm) {
        // console.log(vm.$data)
        return expr.split('.').reduce((data, currentVal) => {
            // console.log(currentVal)
            return data[currentVal]
        }, vm.$data)
    },
    text(node, expr, vm) {
        let value;
        if (expr.indexOf('{{') !== -1) { // 
            value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
                return this.getVal(args[1], vm)
            })
        } else {
            value = this.getVal(expr, vm); // expr:text   <div v-text="person.text"></div>
            // const value = vm.$data[expr]
        }

        this.updater.textUpdater(node, value)
    },
    html(node, expr, vm) {
        const value = this.getVal(expr, vm)
        this.updater.htmlUpdater(node, value)
    },
    model(node, expr, vm) {
        const value = this.getVal(expr, vm)
        this.updater.modelUpdater(node, value)
    },
    on(node, expr, vm, eventName) {
        let fn = vm.$options.methods && vm.$options.methods[expr]
        node.addEventListener(eventName, fn.bind(vm), false)
    },
    bind(node,expr,vm,attrName){ // v-bind:src  :src

    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value
        },
        htmlUpdater(node, value) {
            node.textContent = value
        },
        modelUpdater(node, value) {
            node.value = value
        },
        on(node, expr, vm, eventName) {

        },
    }
}

class Compiler {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm

        // 1.获取文档碎片对象 放入内存中会减少页面的回流和重绘
        const fragment = this.node2Fragment(this.el)
        // console.log(fragment)
        // 2.编译模板
        this.compile(fragment)
        // 3.追加元素到根元素
        this.el.appendChild(fragment)
    }
    // 解析指令
    compile(fragments) {
        // 1.获取子节点
        const childNodes = fragments.childNodes;
        // 2.递归循环编译
        [...childNodes].forEach(child => {
            // 如果是元素节点
            if (this.isElementNode(child)) {
                this.compileElement(child);
            } else {
                // 文本节点
                this.compileText(child);
            }
            //递归遍历
            if (child.childNodes && child.childNodes.length) {
                this.compile(child);
            }
        })
    }

    // 拆指令 指令解析
    compileElement(node) {
        const attributes = node.attributes;
        [...attributes].forEach(attr => {
            const { name, value } = attr;
            if (this.isDirective(name)) { // 是一个指令 v-text v-html v-model v-on:click
                const [, dirctive] = name.split('-') // text html model on:click
                const [dirName, eventName] = dirctive.split(':') // text html model click 
                compileUtil[dirName](node, value, this.vm, eventName)

                // 删除有指令的标签上的属性
                node.removeAttribute('v-' + dirctive)
            } else if (this.isEventName(name)) { // @click='handleClick'
                let [,eventName] = name.split('@')
                compileUtil['on'](node,value,this.vm,eventName)
            }
        })
    }

    compileText(node) {
        // {{}} v-text
        const content = node.textContent;
        if (/\{\{(.+?)\}\}/.test(content)) {
            compileUtil.text(node, content, this.vm)
        }
    }

    isEventName(attrName) {
        return attrName.startsWith('@');
    }

    isDirective(attrName) {
        return attrName.startsWith('v-');
    }

    node2Fragment(el) {
        const f = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            f.appendChild(firstChild)
        }
        return f
    }

    // 判断是不是元素节点
    isElementNode(node) {
        return node.nodeType === 1;
    }
}

class MVue {
    constructor(options) {
        this.$el = options.el; // el可以是id 也可以是dom元素
        this.$data = options.data;
        this.$options = options;

        if (this.$el) {
            new Compiler(this.$el, this)
        }
    }
}