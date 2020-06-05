const defaults = {
    root: document,
    mutationObserverOptions: {
        attributes: true,
        childList: true,
        subtree: true
    },
    timeout: 100,
    start: true
};

class LiveSelect{
    constructor(selector, selectCallback, options={}) {
        this.selector = selector;
        this.selectCallback = selectCallback;
        this.options = Object.assign(defaults, options);
        if(this.options.start) {
            this.start();
        }
    }

    start(){
        this.observer = new MutationObserver(mutations => this.processMutations(mutations));
        this.observer.observe(this.options.root, this.options.mutationObserverOptions);
        this.options.root.querySelectorAll(this.selector).forEach(element => this.processElement(element));
    }

    stop(){
        this.observer.disconnect();
        this.observer = null;
    }

    processMutations(mutations){
        mutations.forEach(mutation => {
            if(mutation.type === 'attributes') {
                this.processElement(mutation.target);
            }else if (mutation.type === 'characterData'){
                this.processElement(mutation.target.parentElement);
            }else if (mutation.type === 'childList'){
                Array.from(mutation.addedNodes).forEach(element => this.processElement(element, true));
            }
        });
    }

    processElement(element, recursive = false){
        if(element.matches && element.matches(this.selector)){
            if(element.liveSelectProcessed){
                return;
            }
            element.liveSelectProcessed = true;
            //loop prevention
            setTimeout(() => {delete element.liveSelectProcessed}, this.options.timeout);
            this.selectCallback(element);
        }
        if(recursive){
            Array.from(element.children).forEach(child => this.processElement(child, true));
        }
    }
}

export default LiveSelect;