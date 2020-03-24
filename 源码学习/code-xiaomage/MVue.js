const compileUtil = {
    getVal(expr, vm) {
        console.log(vm.$data)
        return expr.split('.').reduce((data,currentVal)=>{
            console.log(currentVal)
            return data[currentVal]
        },vm.$data)
    },
    text(node, expr, vm) {
        const value = this.getVal(expr, vm);// expr:text   <div v-text="person.text"></div>
        // const value = vm.$data[expr]
        this.updater.textUpdater(node, value)
    },
    html(node, expr, vm) {

    },
    model(node, expr, vm) {

    },
    on(node, expr, vm, eventName) {

    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value
        }
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

    compileElement(node) {
        const attributes = node.attributes;
        [...attributes].forEach(attr => {
            const { name, value } = attr;
            if (this.isDirective(name)) {
                const [, dirctive] = name.split('-') // text html model on:click
                const [dirName, eventName] = dirctive.split(':') // text html model click 
                compileUtil[dirName](node, value, this.vm, eventName)
            }
        })
    }

    compileText(node) {

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