
class Marquee {
    constructor(element = "") {
        if (typeof element === "string" || element instanceof String) element = document.getElementById(element);
        this.element = element;
        this.position = 0;
        this.direction = 1;
        this.idleTime = 0;
        this.animating = true;
        this.speed = 15;
        this.lastStep = performance.now();
        this.stepInterval = setInterval(_=>{this.step()}, 50);
    }

    step() {
        const currentStep = performance.now();
        const startPos = this.element.scrollLeft;
        this.position += this.speed * ((currentStep - this.lastStep) / 1000) * this.direction;

        this.position = Math.min(this.element.scrollWidth, Math.max(0, this.position));

        this.element.scrollLeft = this.position;
        // console.log((startPos - this.element.scrollLeft));
        // console.log(this.position)


        if (Math.abs(startPos - this.element.scrollLeft) <= 0.1) {
            this.idleTime += currentStep - this.lastStep;
        } else {
            this.idleTime = 0;
        }

        if (this.idleTime >= 1000) {
            this.direction *= -1;
            this.idleTime = 0;
        }

        this.lastStep = currentStep;
    }
}

export default Marquee;
