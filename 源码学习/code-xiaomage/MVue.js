class Compile {
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

    compile(fragment){
    	// 1.获取子节点
    	const childNodes = fragment.childNodes;
    	[...childNodes].forEach(child=>{
    		// console.log(child)
    		if(this.isElementNode(child)){
    			// 元素节点
    			// 编译文本节点
    			console.log('元素节点',child)
    		}else{
    			// 文本节点
    			// 编译文本节点
    			console.log('文本节点',child)
    		}

    		if(child.childNodes && child.childNodes.legnth){
    			this.compile(child)
    		}
    	})
    }

    node2Fragment(el){
    	const f = document.createDocumentFragment();
    	let firstChild;
    	while(firstChild = el.firstChild){
    		f.appendChild(firstChild)
    	}
    	return f
    }

    // 判断是不是元素节点
    isElementNode(node){
    	return node.nodeType === 1;
    }
}

class MVue {
    constructor(options) {
        this.$el = options.el; // el可以是id 也可以是dom元素
        this.$data = options.data;
        this.$options = options;

        if (this.$el) {
            new Compile(this.$el, this)
        }
    }
}